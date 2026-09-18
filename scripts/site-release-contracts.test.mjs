import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'

import {
  applySwitch,
  collectInlineScriptHashes,
  compareCaddyfileWithPolicy,
  parseCaddyfileHeaders,
  parseHeadersPolicy,
  readDeployedState,
  resolveSwitchTarget,
  stageSiteRelease,
  validateRevision,
} from './site-release-lib.mjs'

const inlineScript = '<script id="sesame-structured-data" type="application/ld+json">{"name":"fictional"}</script>'
const inlineHash = `'sha256-${createHash('sha256').update('{"name":"fictional"}').digest('base64')}'`

const headersText = (hash = inlineHash, api = '') => `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=63072000; includeSubDomains
  Content-Security-Policy: default-src 'self'; script-src 'self'${hash ? ` ${hash}` : ''}; style-src 'self'; img-src 'self' data:; connect-src 'self'${api ? ` ${api}` : ''}; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'

/assets/*
  Cache-Control: public, max-age=31536000, immutable
`

async function siteFixture(root, overrides = {}) {
  const files = {
    'index.html': `<!doctype html><html><body><a href="/pricing">Pricing</a><a href="/pricing">Pricing</a>${inlineScript}<img src="/assets/logo.png"><link rel="stylesheet" href="/assets/site.css"></body></html>`,
    'pricing/index.html': `<!doctype html><html><body><a href="/">Home</a></body></html>`,
    '404.html': '<!doctype html><html><body>Not found</body></html>',
    'robots.txt': 'User-agent: *\nAllow: /\n',
    'sitemap.xml': '<urlset></urlset>\n',
    '_headers': headersText(overrides.headersHash !== undefined ? overrides.headersHash : inlineHash, overrides.api ?? ''),
    '_redirects': '# no rewrites\n',
    'site.webmanifest': '{"name":"Sesame"}\n',
    'favicon.svg': '<svg></svg>\n',
    'indexnow-key.txt': 'key\n',
    'a7f3c1e94b2d48a6b5e0c9d7f8a1b3c2.txt': 'key\n',
    'assets/site.css': 'body { background: url("/assets/logo.png"); }\n',
    'assets/logo.png': 'png-bytes',
  }
  for (const [name, content] of Object.entries({ ...files, ...overrides.files })) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true })
    await writeFile(path.join(root, name), content)
  }
}

test('a staged release is content-addressed, complete, and validates against its own pages', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'site-release-ok-'))
  try {
    const dist = path.join(root, 'dist')
    await siteFixture(dist)
    const first = await stageSiteRelease(dist, path.join(root, 'releases'), { commit: 'a'.repeat(40) })
    assert.match(first.revision, /^b[0-9a-f]{16}$/)
    const again = await stageSiteRelease(dist, path.join(root, 'releases'))
    assert.equal(again.revision, first.revision)
    assert.equal(again.staged, false)
    const summary = await validateRevision(first.target)
    assert.equal(summary.fileCount, 13)
    assert.equal(summary.apiOrigin, '')
    const record = JSON.parse(await readFile(path.join(first.target, 'release.json'), 'utf8'))
    assert.equal(record.source.commit, 'a'.repeat(40))
    assert.ok(record.files['index.html'])
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('validation rejects broken links, placeholder residue, stale hashes, and unused connect-src origins', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'site-release-bad-'))
  try {
    const cases = []
    const broken = path.join(root, 'broken')
    await siteFixture(broken, { files: { 'index.html': `<a href="/nowhere">Gone</a>${inlineScript}` } })
    cases.push([await stageSiteRelease(broken, path.join(root, 'releases')), /references pages or assets/])

    const residue = path.join(root, 'residue')
    await siteFixture(residue, { files: { '_headers': headersText(inlineHash).replace('nosniff', 'nosniff __SESAME_SITE_ORIGIN__') } })
    cases.push([await stageSiteRelease(residue, path.join(root, 'releases')), /placeholder/])

    const stale = path.join(root, 'stale')
    await siteFixture(stale, { headersHash: `'sha256-${'A'.repeat(43)}='` })
    cases.push([await stageSiteRelease(stale, path.join(root, 'releases')), /script-src hashes/])

    const hashless = path.join(root, 'hashless')
    await siteFixture(hashless, { headersHash: null })
    cases.push([await stageSiteRelease(hashless, path.join(root, 'releases')), /script-src hashes/])

    const unusedOrigin = path.join(root, 'unused-origin')
    await siteFixture(unusedOrigin, { api: 'https://api.usesesame.app' })
    cases.push([await stageSiteRelease(unusedOrigin, path.join(root, 'releases')), /origin the built site never uses/])

    const tampered = path.join(root, 'tampered')
    await siteFixture(tampered)
    const staged = await stageSiteRelease(tampered, path.join(root, 'releases'))
    await writeFile(path.join(staged.target, 'robots.txt'), 'User-agent: *\nDisallow: /\n')
    cases.push([staged, /recorded digest/])

    for (const [stagedRelease, pattern] of cases) {
      await assert.rejects(validateRevision(stagedRelease.target), pattern)
    }
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('the Caddyfile must serve exactly the built header policy', () => {
  const policy = parseHeadersPolicy(headersText(inlineHash, 'https://api.test.invalid'))
  const caddyfile = `
usesesame.app {
  header {
    X-Content-Type-Options "nosniff"
    Referrer-Policy "strict-origin-when-cross-origin"
    Permissions-Policy "camera=(), microphone=(), geolocation=()"
    Strict-Transport-Security "max-age=63072000; includeSubDomains"
    Content-Security-Policy "default-src 'self'; script-src 'self' ${inlineHash}; style-src 'self'; img-src 'self' data:; connect-src 'self' https://api.test.invalid; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
    -Server
  }
  header /assets/* Cache-Control "public, max-age=31536000, immutable"
}
`
  assert.deepEqual(compareCaddyfileWithPolicy(parseCaddyfileHeaders(caddyfile), policy), [])

  const staleHash = caddyfile.replace(inlineHash, `'sha256-${'B'.repeat(43)}='`)
  const differences = compareCaddyfileWithPolicy(parseCaddyfileHeaders(staleHash), parseHeadersPolicy(headersText(inlineHash)))
  assert.ok(differences.some((line) => /content-security-policy/i.test(line)))

  const droppedOrigin = caddyfile.replace('connect-src \'self\' https://api.test.invalid', 'connect-src \'self\'')
  assert.ok(compareCaddyfileWithPolicy(parseCaddyfileHeaders(droppedOrigin), policy).length > 0)

  assert.throws(() => parseCaddyfileHeaders('site { encode gzip }'), /does not serve the site Content-Security-Policy/)
})

test('switch, rollback, and failed validation preserve the live tree', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'site-release-switch-'))
  try {
    const releasesRoot = path.join(root, 'releases')
    const stage = async (name) => {
      const dist = path.join(root, name)
      await siteFixture(dist, { files: { 'robots.txt': `User-agent: *\nAllow: /\n# ${name}\n` } })
      return (await stageSiteRelease(dist, releasesRoot)).revision
    }
    const a = await stage('a')
    const b = await stage('b')

    let state = await readDeployedState(releasesRoot)
    assert.deepEqual(resolveSwitchTarget(state, { revision: a }), { action: 'bootstrap', target: a })
    state = await applySwitch(releasesRoot, { action: 'bootstrap', target: a })
    assert.match(await readFile(path.join(releasesRoot, 'current'), 'utf8').then(() => 'readable').catch((error) => error.code), /EISDIR/)

    assert.deepEqual(resolveSwitchTarget(state, { revision: a }), { action: 'noop', target: a })
    assert.deepEqual(resolveSwitchTarget(state, { revision: b }), { action: 'deploy', target: b })
    state = await applySwitch(releasesRoot, { action: 'deploy', target: b })
    assert.equal(await readlinkText(path.join(releasesRoot, 'current')), path.join('releases', b))

    const brokenDist = path.join(root, 'broken')
    await siteFixture(brokenDist, { files: { 'index.html': `<a href="/nowhere">Gone</a>${inlineScript}` } })
    const brokenRevision = (await stageSiteRelease(brokenDist, releasesRoot)).revision
    const before = structuredClone(state)
    await assert.rejects(validateRevision(path.join(releasesRoot, 'releases', brokenRevision)), /references pages or assets/)
    assert.deepEqual((await readDeployedState(releasesRoot)).history, before.history)

    assert.deepEqual(resolveSwitchTarget(state, { rollback: true }), { action: 'rollback', target: a })
    state = await applySwitch(releasesRoot, { action: 'rollback', target: a })
    assert.deepEqual(resolveSwitchTarget(state, { rollback: true }), { action: 'rollback', target: b })

    assert.throws(() => resolveSwitchTarget(state, { revision: 'bdeadbeefdeadbeef', rollback: true }), /never deployed here/)
    await assert.rejects(applySwitch(releasesRoot, { action: 'deploy', target: 'bdeadbeefdeadbeef' }))
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('a live root that is not a symlink is never overwritten', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'site-release-guard-'))
  try {
    const releasesRoot = path.join(root, 'releases')
    const dist = path.join(root, 'dist')
    await siteFixture(dist)
    const { revision } = await stageSiteRelease(dist, releasesRoot)
    await mkdir(path.join(releasesRoot, 'current'), { recursive: true })
    await writeFile(path.join(releasesRoot, 'current', 'keep.txt'), 'the old in-place tree\n')
    await assert.rejects(applySwitch(releasesRoot, { action: 'bootstrap', target: revision }), /not a symlink/)
    assert.equal(await readFile(path.join(releasesRoot, 'current', 'keep.txt'), 'utf8'), 'the old in-place tree\n')
    assert.equal((await readdir(path.join(releasesRoot))).filter((name) => name.startsWith('current.staging')).length, 0)
  } finally { await rm(root, { recursive: true, force: true }) }
})

async function readlinkText(link) {
  return readFile(link, 'utf8').then(() => 'not a link', () => {
    return import('node:fs/promises').then((fs) => fs.readlink(link))
  })
}

test('collectInlineScriptHashes skips external scripts and dedupes', async () => {
  const hashes = collectInlineScriptHashes(`<script src="/assets/app.js"></script>${inlineScript}${inlineScript}`)
  assert.deepEqual([...hashes], [inlineHash])
})
