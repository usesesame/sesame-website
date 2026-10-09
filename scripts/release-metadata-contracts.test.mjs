import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

import { isDownloadable, parseProductRelease } from '../src/lib/product-parse.ts'
import { refreshChannel, releaseSentence, summarizeRelease } from '../src/lib/release-summary.ts'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const read = (...parts) => readFileSync(join(root, ...parts), 'utf8')

const digest = (label) => createHash('sha256').update(label).digest('hex')
const now = new Date('2026-10-08T12:00:00Z')
const base = 'https://github.com/usesesame/example-app/releases'

const artifact = (overrides = {}) => ({
  name: 'Example_1.2.3_amd64.deb',
  format: 'deb',
  url: `${base}/download/v1.2.3/Example_1.2.3_amd64.deb`,
  sha256: digest('example deb'),
  signed: false,
  ...overrides,
})

const available = (overrides = {}) => ({
  channel: 'beta',
  platform: 'linux',
  available: true,
  version: '1.2.3',
  url: `${base}/download/v1.2.3/Example_1.2.3_amd64.AppImage`,
  sha256: digest('example appimage'),
  signed: false,
  message: 'This is a fictional build.',
  publishedAt: '2026-10-01T09:30:00.123456Z',
  releaseNotesUrl: `${base}/tag/v1.2.3`,
  artifacts: [artifact()],
  ...overrides,
})

const unavailable = (overrides = {}) => ({
  channel: 'beta',
  platform: 'linux',
  available: false,
  signed: false,
  message: 'No build has cleared the release gate.',
  ...overrides,
})

const without = (value, ...keys) => Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)))
const parse = (value) => parseProductRelease(value, now)

test('a complete available release is accepted', () => {
  const release = parse(available())
  assert.ok(release)
  assert.equal(release.version, '1.2.3')
  assert.equal(isDownloadable(release), true)
})

test('an unavailable release with no files is accepted', () => {
  const release = parse(unavailable())
  assert.ok(release)
  assert.equal(isDownloadable(release), false)
})

for (const [label, publishedAt] of [
  ['text that is not a date', 'last Tuesday'],
  ['a date with no time', '2026-10-01'],
  ['a time with no zone', '2026-10-01T09:30:00'],
  ['a month that does not exist', '2026-13-01T09:30:00Z'],
  ['a day that does not exist', '2026-02-31T09:30:00Z'],
  ['an hour that does not exist', '2026-10-01T24:30:00Z'],
  ['a date more than a day in the future', '2026-12-01T09:30:00Z'],
  ['an empty string', ''],
]) {
  test(`a publication date that is ${label} is rejected`, () => {
    assert.equal(parse(available({ publishedAt })), null)
    assert.equal(parse(unavailable({ publishedAt })), null)
  })
}

test('a publication date with a zone offset is accepted', () => {
  assert.ok(parse(available({ publishedAt: '2026-10-01T11:30:00+02:00' })))
})

for (const [label, sha256] of [
  ['text that is not a digest', 'not-a-digest'],
  ['a digest that is too short', digest('short').slice(0, 63)],
  ['a digest that is too long', `${digest('long')}0`],
  ['a digest with upper case letters', digest('upper').toUpperCase()],
  ['a digest with non-hex letters', `g${digest('letters').slice(1)}`],
  ['an empty string', ''],
]) {
  test(`an artifact hash that is ${label} is rejected`, () => {
    assert.equal(parse(available({ artifacts: [artifact({ sha256 })] })), null)
  })
  test(`a release hash that is ${label} is rejected`, () => {
    assert.equal(parse(available({ sha256 })), null)
  })
}

test('an available release without a hash is rejected', () => {
  assert.equal(parse(available({ sha256: undefined })), null)
  assert.equal(parse(without(available(), 'sha256')), null)
})

test('an available release with only artifact hashes is rejected', () => {
  assert.equal(parse(without(available(), 'sha256')), null)
})

for (const field of ['version', 'url', 'publishedAt']) {
  test(`an available release without ${field} is rejected`, () => {
    assert.equal(parse(without(available(), field)), null)
  })
}

test('an available release with a blank version is rejected', () => {
  assert.equal(parse(available({ version: '   ' })), null)
})

test('an unavailable release that carries a hash is rejected', () => {
  assert.equal(parse(unavailable({ sha256: digest('example appimage') })), null)
})

test('an unavailable release that carries a download address or artifacts is rejected', () => {
  assert.equal(parse(unavailable({ url: `${base}/download/v1.2.3/Example.AppImage` })), null)
  assert.equal(parse(unavailable({ artifacts: [artifact()] })), null)
})

test('a release from a host other than GitHub is rejected', () => {
  assert.equal(parse(available({ url: 'https://downloads.example.invalid/Example.AppImage' })), null)
  assert.equal(parse(available({ releaseNotesUrl: 'https://downloads.example.invalid/notes' })), null)
  assert.equal(parse(available({ artifacts: [artifact({ url: 'https://downloads.example.invalid/Example.deb' })] })), null)
})

test('a release from another GitHub organisation or with embedded credentials is rejected', () => {
  assert.equal(parse(available({ url: 'https://github.com/someone-else/example-app/releases/download/v1/a.AppImage' })), null)
  assert.equal(parse(available({ url: 'https://user:pass@github.com/usesesame/example-app/releases/download/v1/a.AppImage' })), null)
  assert.equal(parse(available({ url: 'http://github.com/usesesame/example-app/releases/download/v1/a.AppImage' })), null)
})

test('two artifacts with the same name are rejected', () => {
  assert.equal(parse(available({ artifacts: [artifact(), artifact({ sha256: digest('other') })] })), null)
})

test('a non-object, an array and null are rejected', () => {
  for (const value of [null, undefined, 'release', 7, []]) assert.equal(parse(value), null)
})

test('the saved release files satisfy the release contract', () => {
  for (const file of ['latest-release.json', 'latest-release-linux.json']) {
    const release = parseProductRelease(JSON.parse(read('src', 'lib', file)))
    assert.ok(release, `${file} does not satisfy the release contract`)
  }
})

const channel = (release, live = false) => ({ release: release && parse(release), live })

test('a summary needs an available release with a version and a valid date', () => {
  assert.equal(summarizeRelease(channel(unavailable()), 'Linux'), null)
  assert.equal(summarizeRelease({ release: null, live: true }, 'Linux'), null)
  assert.equal(summarizeRelease({ release: { ...available(), publishedAt: 'last Tuesday' }, live: true }, 'Linux'), null)
  assert.equal(summarizeRelease({ release: { ...available(), sha256: undefined }, live: true }, 'Linux'), null)
  const summary = summarizeRelease(channel(available(), true), 'Linux')
  assert.equal(summary.version, '1.2.3')
  assert.equal(summary.publishedOn, '1 October 2026')
  assert.equal(summary.live, true)
})

test('a summary never throws on a release object that bypassed the parser', () => {
  for (const publishedAt of ['', 'last Tuesday', '2026-13-45T00:00:00Z']) {
    assert.doesNotThrow(() => summarizeRelease({ release: { ...available(), publishedAt }, live: true }, 'Linux'))
  }
})

test('the sentence names the version, the date and the platforms', () => {
  const windows = summarizeRelease(channel(available({ platform: 'windows' }), true), 'Windows')
  const linux = summarizeRelease(channel(available(), true), 'Linux')
  assert.equal(releaseSentence([windows, linux]), 'Version 1.2.3 was released on 1 October 2026 for Windows and Linux.')
})

test('the sentence keeps platforms with different versions apart', () => {
  const windows = summarizeRelease(channel(available({ platform: 'windows' }), true), 'Windows')
  const linux = summarizeRelease(channel(available({ version: '1.2.4', publishedAt: '2026-10-03T08:00:00Z' }), true), 'Linux')
  assert.equal(
    releaseSentence([windows, linux]),
    'Version 1.2.3 was released on 1 October 2026 for Windows, and version 1.2.4 was released on 3 October 2026 for Linux.',
  )
})

test('the sentence says it comes from the saved release list when the data is not live', () => {
  const saved = summarizeRelease(channel(available(), false), 'Linux')
  assert.equal(
    releaseSentence([saved]),
    'The release list saved with this site shows that version 1.2.3 was released on 1 October 2026 for Linux.',
  )
})

test('the sentence is empty when no release can be backed', () => {
  assert.equal(releaseSentence([]), '')
})

test('a failed, invalid or throwing update keeps the saved release', async () => {
  const saved = channel(available(), false)
  assert.deepEqual(await refreshChannel(saved, async () => null), saved)
  assert.deepEqual(await refreshChannel(saved, async () => parse(available({ publishedAt: 'last Tuesday' }))), saved)
  assert.deepEqual(await refreshChannel(saved, async () => parse(unavailable({ sha256: digest('x') }))), saved)
  assert.deepEqual(await refreshChannel(saved, async () => { throw new Error('network') }), saved)
})

test('a valid update replaces the saved release and marks it live', async () => {
  const saved = channel(available(), false)
  const update = parse(available({ version: '1.2.4' }))
  const next = await refreshChannel(saved, async () => update)
  assert.equal(next.live, true)
  assert.equal(next.release.version, '1.2.4')
})

test('a valid update that withdraws the release removes the version claim', async () => {
  const saved = channel(available(), false)
  const next = await refreshChannel(saved, async () => parse(unavailable()))
  assert.equal(next.live, true)
  assert.equal(summarizeRelease(next, 'Linux'), null)
})

test('the home page loads the current release and builds its summary from the shared source', () => {
  const page = read('src', 'pages', 'HomePage.svelte')
  assert.match(page, /import \{[^}]*\bloadLatestRelease\b[^}]*\} from '\.\.\/lib\/product-state\.svelte'/)
  assert.match(page, /onMount\(\(\) => \{[^}]*void loadLatestRelease\(\)[^}]*\}\)/)
  assert.match(page, /summarizeRelease\(/)
  assert.match(page, /releaseSentence\(/)
  assert.doesNotMatch(page, /Intl\.DateTimeFormat/, 'the home page formats release dates on its own')
  assert.doesNotMatch(page, /new Date\(release/, 'the home page parses release dates on its own')
})

test('the releases page offers a download only for a downloadable release', () => {
  const page = read('src', 'pages', 'ReleasesPage.svelte')
  assert.match(page, /isDownloadable\(release\)/)
  assert.doesNotMatch(page, /\{#if release\?\.available && release\.url\}/)
})

test('the structured data names no version when the saved release cannot back one', () => {
  const source = read('src', 'lib', 'structured-data.ts')
  assert.doesNotMatch(source, /'0\.0\.0'/)
  assert.match(source, /isDownloadable\(release\)/)
})
