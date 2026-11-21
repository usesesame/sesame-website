import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (...parts) => readFile(new URL(`../src/${parts.join('/')}`, import.meta.url), 'utf8')

test('a keydown that a control already handled does not cancel a glide', async () => {
  const glide = await read('lib', 'glide.ts')
  assert.match(glide, /if \(!event\.defaultPrevented\) stopGlide\(\)/)
  assert.doesNotMatch(glide, /addEventListener\('keydown', stopGlide\)/)
})

test('a keyboard section jump moves focus to the section', async () => {
  const home = await read('pages', 'HomePage.svelte')
  assert.match(home, /event\.detail === 0[\s\S]{0,120}target\.focus\(\{ preventScroll: true \}\)/)
})

test('the privacy page does not promise that Sesame never receives a synced vault or that no mail service sees email', async () => {
  const privacy = await read('pages', 'PrivacyPage.svelte')
  assert.doesNotMatch(privacy, /Sesame never receives it/)
  assert.doesNotMatch(privacy, /no outside mail service sees/)
  assert.match(privacy, /hosted Sync is not available yet/)
})

test('the releases page labels a platform whose version differs and keeps a Linux download without package artifacts', async () => {
  const releases = await read('pages', 'ReleasesPage.svelte')
  assert.match(releases, /group\.version !== latest\?\.version/)
  assert.match(releases, /else if \(linux && isDownloadable\(linux\) && linux\.url\)/)
})

test('no page markup carries an inline style, because the site policy allows styles from its own origin only', async () => {
  const { readdir } = await import('node:fs/promises')
  const walk = async (dir) => (await readdir(new URL(`../src/${dir}`, import.meta.url), { withFileTypes: true })).flatMap((entry) => entry.isDirectory() ? [] : [`${dir}/${entry.name}`])
  const files = [...(await walk('.')), ...(await walk('pages'))].filter((file) => file.endsWith('.svelte'))
  assert.ok(files.length > 5)
  for (const file of files) {
    const source = await read(...file.split('/'))
    assert.doesNotMatch(source, /\sstyle=[{"']/, `${file} sets an inline style attribute`)
  }
})

test('every saved source excerpt is pinned to one commit and holds the lines it names', async () => {
  const saved = JSON.parse(await read('lib', 'source-excerpts.json'))
  assert.match(saved.commit, /^[0-9a-f]{40}$/)
  assert.match(saved.repository, /^usesesame\/[a-z-]+$/)
  const keys = new Set()
  for (const excerpt of saved.excerpts) {
    assert.ok(!keys.has(excerpt.key), `${excerpt.key} is saved twice`)
    keys.add(excerpt.key)
    assert.equal(excerpt.lines.length, excerpt.end - excerpt.start + 1, `${excerpt.key} does not hold lines ${excerpt.start} to ${excerpt.end}`)
    assert.ok(excerpt.lines.some((line) => line.trim() !== ''), `${excerpt.key} is empty`)
    for (const line of excerpt.marked) assert.ok(line >= excerpt.start && line <= excerpt.end, `${excerpt.key} marks line ${line} outside its range`)
  }
  const principles = await read('lib', 'principles.ts')
  const named = [...principles.matchAll(/sourceExcerpt\('([a-z-]+)'\)/g)].map((match) => match[1])
  assert.ok(named.length >= 5)
  for (const key of named) assert.ok(keys.has(key), `principles.ts names the excerpt ${key}, which is not saved`)
})

test('each number a rule states is in the source lines shown beside it', async () => {
  const saved = JSON.parse(await read('lib', 'source-excerpts.json'))
  const principles = await read('lib', 'principles.ts')
  const code = (key) => saved.excerpts.find((excerpt) => excerpt.key === key).lines.join('\n')
  assert.match(principles, /128 MiB of memory and 3 passes/)
  assert.match(code('kdf-memory'), /MASTER_PASSWORD_KDF_MEMORY_KIB: u32 = 131_072;/)
  assert.match(code('kdf-passes'), /MIN_KDF_ITERATIONS: u32 = 3;/)
  assert.match(code('key-derivation'), /kdf_params_with_memory\(MASTER_PASSWORD_KDF_MEMORY_KIB\)/)
  assert.match(code('key-derivation'), /iterations: MIN_KDF_ITERATIONS,/)
  assert.match(code('key-derivation'), /algorithm: "argon2id"/)
  assert.match(principles, /first 750 milliseconds/)
  assert.match(code('approval-delay'), /APPROVAL_SETTLE_MS = 750\b/)
  assert.match(code('approval-settle'), /APPROVAL_SETTLE_MS/)
  assert.match(principles, /first 5 characters/)
  assert.match(code('breach-prefix'), /SHA1_PREFIX_CHARS: usize = 5;/)
  assert.match(code('breach-range'), /split_at\(SHA1_PREFIX_CHARS\)/)
  assert.match(principles, /after 30 seconds unless you choose 10 or 60/)
  assert.match(code('clipboard-clear'), /clipboardClearOptions = \[10, 30, 60\]/)
  assert.match(code('clipboard-clear'), /DEFAULT_CLIPBOARD_CLEAR_SECONDS = 30\b/)
  assert.doesNotMatch(code('search-fields').split('TaggedItem::Identity')[0], /password/i)
})

test('every support guide has its own address, a summary and at least two steps', async () => {
  const source = await read('lib', 'support-guides.ts')
  const keys = [...source.matchAll(/^ {8}key: '([a-z-]+)',$/gm)].map((match) => match[1])
  assert.ok(keys.length >= 10)
  assert.equal(new Set(keys).size, keys.length, 'two support guides share a key')
  const guides = source.split(/^ {6}\{$/m).slice(1)
  assert.equal(guides.length, keys.length)
  for (const guide of guides) {
    assert.match(guide, /summary: '[^']{20,}'/)
    const steps = /steps: \[([\s\S]*?)\n {8}\],/.exec(guide)
    assert.ok(steps && steps[1].split('\n').filter((line) => line.trim().startsWith("'")).length >= 2, guide.slice(0, 80))
  }
})

test('the support page keeps the warning about private details and the two other routes for a report', async () => {
  const support = await read('pages', 'SupportPage.svelte')
  assert.match(support, /Never send passwords, security codes, vault files, exports, recovery kits, or keys\./)
  assert.match(support, /href=\{securityPolicyUrl\}/)
  assert.match(support, /use made-up data/)
})

test('plans sent by the server keep the wording written for the site', async () => {
  const state = await read('lib', 'product-state.svelte.ts')
  assert.match(state, /productState\.plans = value\.map\(withSiteWording\)/)
  const facts = await read('lib', 'product-facts.ts')
  assert.match(facts, /return \{ \.\.\.plan, description, includes: features\.map\(\(feature\) => feature\.label\) \}/)
  assert.doesNotMatch(facts, /security review/)
})

test('the pricing page offers a download only while downloads are open and says payments are closed beside the Sync action', async () => {
  const pricing = await read('pages', 'PricingPage.svelte')
  assert.match(pricing, /\{#if facts\.publicDownload\}\s*<a class="button button-xl" href="\/releases">Download for Windows and Linux<\/a>/)
  assert.match(pricing, /Tell us you want Sync<\/a>\s*<p>You cannot pay for Sync yet, and telling us does not start a subscription\.<\/p>/)
})
