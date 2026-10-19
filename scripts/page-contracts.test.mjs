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
