import { copyFile, mkdir, readdir, readFile, readlink, stat, symlink, writeFile, rename, lstat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'

export const REQUIRED_SITE_FILES = ['index.html', '404.html', 'robots.txt', 'sitemap.xml', '_headers', '_redirects', 'site.webmanifest', 'favicon.svg', 'indexnow-key.txt', 'a7f3c1e94b2d48a6b5e0c9d7f8a1b3c2.txt']
const sha256Pattern = /^[0-9a-f]{64}$/

export const fileSha256 = async (file) => createHash('sha256').update(await readFile(file)).digest('hex')

export function parseHeadersPolicy(text) {
  const directives = new Map()
  const rules = []
  let current = ''
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\s+$/, '')
    if (!line.trim() || line.trim().startsWith('#')) continue
    if (/^\s/.test(line)) {
      const index = line.indexOf(':')
      if (index < 0) throw new Error(`_headers carries a directive without a colon: ${line.trim()}`)
      const name = line.slice(0, index).trim().toLowerCase()
      const value = line.slice(index + 1).trim()
      if (!current) directives.set(name, value)
      else rules.push({ path: current, name, value })
    } else {
      current = line.trim()
      if (current === '/*') current = ''
    }
  }
  return { directives, rules, text }
}

export function apiOriginFromPolicy(policy) {
  const sources = (policy.directives.get('content-security-policy') ?? '')
    .split(';')
    .map((part) => part.trim().split(/\s+/))
    .filter(([name]) => name === 'connect-src')
    .flatMap(([, ...sources]) => sources)
  const origins = sources.filter((source) => source.startsWith('https://'))
  if (origins.length > 1) throw new Error('The built policy names more than one connect-src origin.')
  return origins[0] ?? ''
}

export function collectInlineScriptHashes(htmlText) {
  const hashes = new Set()
  for (const match of htmlText.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\ssrc=/.test(match[1])) continue
    hashes.add(`'sha256-${createHash('sha256').update(match[2]).digest('base64')}'`)
  }
  return hashes
}

export function assertHeaderPolicy(policy, { inlineScriptHashes }) {
  if (/__SESAME_/.test(policy.text)) throw new Error('The built _headers still carries an unresolved placeholder.')
  const csp = policy.directives.get('content-security-policy')
  if (!csp) throw new Error('The built _headers carries no Content-Security-Policy.')
  const sections = new Map(csp.split(';').map((part) => part.trim().split(/\s+/)).filter((parts) => parts[0]).map((parts) => [parts[0], parts.slice(1)]))
  const requireSources = (name, expected) => {
    const sources = sections.get(name)
    if (!sources) throw new Error(`The built Content-Security-Policy omits ${name}.`)
    const present = sources.join(' ')
    for (const required of expected) {
      if (!present.includes(required)) throw new Error(`The built Content-Security-Policy ${name} omits ${required}.`)
    }
  }
  for (const forbidden of ["'unsafe-inline'", "'unsafe-eval'", 'data:', '*']) {
    const sources = [...(sections.get('script-src') ?? []), ...(sections.get('default-src') ?? [])]
    if (sources.includes(forbidden)) throw new Error(`The built Content-Security-Policy ${forbidden === 'data:' ? 'allows data: scripts' : `allows ${forbidden}`} scripts.`)
  }
  requireSources("default-src", ["'self'"])
  requireSources('object-src', ["'none'"])
  requireSources('base-uri', ["'self'"])
  requireSources('form-action', ["'self'"])
  requireSources('frame-ancestors', ["'none'"])
  const scriptSources = sections.get('script-src')
  if (!scriptSources || scriptSources[0] !== "'self'") throw new Error("The built Content-Security-Policy script-src must start with 'self'.")
  const declared = scriptSources.filter((source) => source.startsWith("'sha256-")).sort()
  const computed = [...inlineScriptHashes].sort()
  if (declared.join(' ') !== computed.join(' ')) {
    throw new Error(`The built script-src hashes do not match the rendered pages: policy has ${declared.length || 'no'} hashes, pages need ${computed.length || 'no'}.`)
  }
  const apiOrigin = apiOriginFromPolicy(policy)
  const connectSources = sections.get('connect-src') ?? []
  const remote = connectSources.filter((source) => source.startsWith('https://'))
  if (apiOrigin && (remote.join(' ') !== apiOrigin || !connectSources.includes("'self'"))) {
    throw new Error(`The built connect-src (${connectSources.join(' ')}) does not name exactly 'self' and ${apiOrigin}.`)
  }
  if (!apiOrigin && remote.length > 0) {
    throw new Error(`The built site reads no API, so connect-src must stay 'self' instead of naming ${remote.join(' ')}.`)
  }
  const hsts = policy.directives.get('strict-transport-security')
  if (!hsts || !hsts.includes('includeSubDomains') || !/max-age=\d+/.test(hsts)) {
    throw new Error('The built _headers carries no usable Strict-Transport-Security.')
  }
  const assetsRule = policy.rules.find((rule) => rule.path === '/assets/*' && rule.name === 'cache-control')
  if (!assetsRule || !assetsRule.value.includes('immutable') || !assetsRule.value.includes('max-age=31536000')) {
    throw new Error('The built _headers does not give /assets/* a long immutable cache.')
  }
  return { apiOrigin }
}

export async function walkFiles(root, prefix = '') {
  const files = []
  for (const entry of (await readdir(path.join(root, prefix), { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) files.push(...(await walkFiles(root, relative)))
    else if (entry.isFile()) files.push(relative)
  }
  return files
}

export async function readRevisionRecord(revisionDirectory) {
  const record = JSON.parse(await readFile(path.join(revisionDirectory, 'release.json'), 'utf8'))
  if (record?.schemaVersion !== 1 || !/^b[0-9a-f]{16}$/.test(record?.revision ?? '') || !sha256Pattern.test(record?.contentDigest ?? '')) {
    throw new Error('The staged release record is not a complete site release.')
  }
  return record
}

export async function validateRevision(revisionDirectory) {
  const record = await readRevisionRecord(revisionDirectory)
  const files = await walkFiles(revisionDirectory)
  const names = new Set()
  for (const relative of files) {
    if (relative === 'release.json') continue
    names.add(relative)
    const listed = record.files[relative]
    if (!listed) throw new Error(`Staged file ${relative} is not listed in the release record.`)
    const bytes = (await stat(path.join(revisionDirectory, relative))).size
    const digest = await fileSha256(path.join(revisionDirectory, relative))
    if (bytes !== listed.bytes || digest !== listed.sha256) {
      throw new Error(`Staged file ${relative} does not match its recorded digest.`)
    }
  }
  for (const missing of Object.keys(record.files).filter((name) => !names.has(name))) {
    throw new Error(`Release record lists missing file ${missing}.`)
  }
  for (const required of REQUIRED_SITE_FILES) {
    if (!names.has(required)) throw new Error(`The staged release is missing ${required}.`)
  }
  const policy = parseHeadersPolicy(await readFile(path.join(revisionDirectory, '_headers'), 'utf8'))
  const hashes = new Set()
  for (const relative of names) {
    if (!relative.endsWith('.html')) continue
    for (const hash of collectInlineScriptHashes(await readFile(path.join(revisionDirectory, relative), 'utf8'))) hashes.add(hash)
  }
  const { apiOrigin } = assertHeaderPolicy(policy, { inlineScriptHashes: hashes })
  if (apiOrigin) {
    let used = false
    for (const relative of names) {
      if (relative === '_headers') continue
      if ((await readFile(path.join(revisionDirectory, relative), 'utf8')).includes(apiOrigin)) {
        used = true
        break
      }
    }
    if (!used) throw new Error(`The built connect-src names ${apiOrigin}, an origin the built site never uses.`)
  }
  const broken = []
  for (const relative of names) {
    if (relative.endsWith('.html')) broken.push(...(await brokenInternalReferences(revisionDirectory, relative, names)))
    if (relative.startsWith('assets/') && relative.endsWith('.css')) broken.push(...(await brokenInternalReferences(revisionDirectory, relative, names, true)))
  }
  if (broken.length > 0) throw new Error(`The staged release references pages or assets it does not contain: ${broken.slice(0, 5).join(', ')}.`)
  return { record, apiOrigin, fileCount: names.size }
}

function sameOriginTargets(reference) {
  const withoutFragment = reference.split('#')[0].split('?')[0]
  if (!withoutFragment || !withoutFragment.startsWith('/') || withoutFragment.startsWith('//')) return []
  const base = withoutFragment.replace(/\/+$/, '')
  const candidates = []
  if (base === '') candidates.push('index.html')
  else {
    candidates.push(base.replace(/^\/+/, ''))
    candidates.push(`${base.replace(/^\/+/, '')}/index.html`)
    if (base.endsWith('/')) candidates.push(`${base.replace(/^\/+/, '')}index.html`)
  }
  return candidates
}

async function brokenInternalReferences(root, file, names, css = false) {
  const text = await readFile(path.join(root, file), 'utf8')
  const references = new Set()
  const pattern = css ? /url\(\s*(?:'([^']*)'|"([^"]*)"|([^)]*?))\s*\)/g : /(?:\bhref="([^"]*)"|\bsrc="([^"]*)"|\bsrcset="([^"]*)")/g
  for (const match of text.matchAll(pattern)) {
    const value = match[1] ?? match[2] ?? match[3] ?? ''
    for (const part of value.split(',')) {
      const reference = part.trim().split(/\s+/)[0]
      if (reference) references.add(reference)
    }
  }
  const broken = []
  for (const reference of references) {
    const candidates = sameOriginTargets(reference)
    if (candidates.length > 0 && !candidates.some((candidate) => names.has(candidate))) {
      broken.push(`${file}: ${reference}`)
    }
  }
  return broken
}

export async function digestTree(root) {
  const files = await walkFiles(root)
  const record = {}
  const lines = []
  for (const relative of files) {
    const filePath = path.join(root, relative)
    const fileStat = await stat(filePath)
    const digest = await fileSha256(filePath)
    record[relative] = { sha256: digest, bytes: fileStat.size }
    lines.push(`${digest}  ${relative}`)
  }
  return { files: record, contentDigest: createHash('sha256').update(lines.join('\n')).digest('hex') }
}

export async function stageSiteRelease(distDirectory, releasesRoot, { commit = '', builtAt = new Date().toISOString() } = {}) {
  const { files, contentDigest } = await digestTree(distDirectory)
  const revision = `b${contentDigest.slice(0, 16)}`
  const target = path.join(releasesRoot, 'releases', revision)
  let staged = false
  try {
    const existing = await readRevisionRecord(target)
    if (existing.contentDigest !== contentDigest) {
      throw new Error(`Release ${revision} is already staged with different content.`)
    }
  } catch (error) {
    if (error.code === 'ENOENT') staged = true
    else throw error
  }
  if (staged) {
    await mkdir(target, { recursive: true })
    for (const relative of Object.keys(files)) {
      await mkdir(path.dirname(path.join(target, relative)), { recursive: true })
      await copyFile(path.join(distDirectory, relative), path.join(target, relative))
    }
    const record = {
      schemaVersion: 1,
      revision,
      builtAt,
      source: { repository: 'usesesame/sesame-website', commit },
      contentDigest,
      files,
    }
    await writeFile(path.join(target, 'release.json'), `${JSON.stringify(record, null, 2)}\n`, 'utf8')
  }
  return { revision, target, staged }
}

export async function readDeployedState(releasesRoot) {
  try {
    const state = JSON.parse(await readFile(path.join(releasesRoot, 'deployed.json'), 'utf8'))
    if (state?.schemaVersion !== 1 || !Array.isArray(state.history)) throw new Error('bad state')
    return state
  } catch (error) {
    if (error.code === 'ENOENT' || String(error.message) === 'bad state') {
      return { schemaVersion: 1, current: null, history: [] }
    }
    throw error
  }
}

export function resolveSwitchTarget(state, { revision, rollback = false }) {
  if (rollback) {
    const previous = state.history.length > 0 ? state.history[state.history.length - 1].from : null
    const target = revision ?? previous
    if (!target) throw new Error('There is no earlier revision to roll back to.')
    if (!state.history.some((entry) => entry.revision === target)) {
      throw new Error(`Revision ${target} was never deployed here, so it is not a safe rollback target.`)
    }
    if (state.current === target) throw new Error(`Revision ${target} is already live.`)
    return { action: 'rollback', target }
  }
  if (!state.current) return { action: 'bootstrap', target: revision }
  if (state.current === revision) return { action: 'noop', target: revision }
  return { action: 'deploy', target: revision }
}

export async function applySwitch(releasesRoot, { action, target }) {
  const livePath = path.join(releasesRoot, 'current')
  try {
    const kind = await lstat(livePath)
    if (!kind.isSymbolicLink()) {
      throw new Error(`${livePath} exists and is not a symlink. Move the old in-place tree aside deliberately; this tool does not delete the live site.`)
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  await stat(path.join(releasesRoot, 'releases', target, 'release.json'))
  const staged = path.join(releasesRoot, `current.staging-${process.pid}-${Date.now()}`)
  await symlink(path.join('releases', target), staged)
  await rename(staged, livePath)
  const state = await readDeployedState(releasesRoot)
  const from = state.current
  const next = {
    schemaVersion: 1,
    current: target,
    history: [...state.history, { revision: target, action, from, at: new Date().toISOString() }],
  }
  const record = path.join(releasesRoot, 'deployed.json.staging')
  await writeFile(record, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
  await rename(record, path.join(releasesRoot, 'deployed.json'))
  return next
}

export async function currentRevision(releasesRoot) {
  try {
    const target = await readlink(path.join(releasesRoot, 'current'))
    return path.basename(target)
  } catch {
    return null
  }
}

export function parseCaddyfileHeaders(caddyfileText) {
  const directives = new Map()
  const rules = []
  const lines = caddyfileText.split('\n')
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (line === 'header {') {
      for (index += 1; index < lines.length && lines[index].trim() !== '}'; index += 1) {
        const entry = lines[index].trim()
        if (!entry || entry.startsWith('#') || entry.startsWith('-')) continue
        const parts = entry.match(/^(\S+)\s+"?([^"]*)"?$/)
        if (parts) directives.set(parts[1].toLowerCase(), parts[2])
      }
    }
    const matcher = line.match(/^header\s+(\S+)\s+(\S+)\s+"([^"]*)"$/)
    if (matcher) rules.push({ path: matcher[1], name: matcher[2].toLowerCase(), value: matcher[3] })
  }
  if (!directives.has('content-security-policy')) {
    throw new Error('The Caddyfile does not serve the site Content-Security-Policy at all.')
  }
  return { directives, rules }
}

export function compareCaddyfileWithPolicy(caddy, policy) {
  const differences = []
  for (const [name, value] of policy.directives) {
    const served = caddy.directives.get(name)
    if (served === undefined) differences.push(`the Caddyfile does not set ${name}`)
    else if (served !== value) differences.push(`${name} is served as "${served}" but the built policy is "${value}"`)
  }
  for (const rule of policy.rules) {
    const served = caddy.rules.find((candidate) => candidate.path === rule.path && candidate.name === rule.name)
    if (!served) differences.push(`the Caddyfile has no ${rule.name} rule for ${rule.path}`)
    else if (served.value !== rule.value) differences.push(`${rule.name} for ${rule.path} is served as "${served.value}" but the built policy is "${rule.value}"`)
  }
  return differences
}
