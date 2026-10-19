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

test('the feature tour never selects a feature outside its list', async () => {
  const tour = await read('FeatureTour.svelte')
  assert.match(tour, /if \(!\(range > 0\)\) return/)
  assert.match(tour, /Math\.min\(features\.length - 1, Math\.floor\(progress \* features\.length\)\)/)
})
