import assert from 'node:assert/strict'
import test from 'node:test'

import { chromeExtensionState, parseExtensions } from '../src/lib/extension-parse.ts'

const id = 'abcdefghijklmnopabcdefghijklmnop'
const listing = `https://chromewebstore.google.com/detail/${id}`

test('an approved record parses and reports approved', () => {
  const parsed = parseExtensions({ extensions: [{ store: 'chrome', version: '0.1.0', status: 'approved' }] })
  assert.ok(parsed)
  assert.deepEqual(chromeExtensionState(parsed), { status: 'approved' })
})

test('a published record carries the Chrome Web Store address', () => {
  const parsed = parseExtensions({ extensions: [{ store: 'chrome', version: '0.1.0', status: 'published', listingUrl: listing }] })
  assert.ok(parsed)
  assert.deepEqual(chromeExtensionState(parsed), { status: 'published', listingUrl: listing })
})

test('no record means none', () => {
  const parsed = parseExtensions({ extensions: [] })
  assert.ok(parsed)
  assert.deepEqual(chromeExtensionState(parsed), { status: 'none' })
})

test('a published record with another host, a path trick or no address is rejected', () => {
  for (const listingUrl of [undefined, 'https://evil.example/detail/' + id, `${listing}/extra`, `${listing}?x=1`, `http://chromewebstore.google.com/detail/${id}`, 'https://chromewebstore.google.com/detail/short']) {
    assert.equal(parseExtensions({ extensions: [{ store: 'chrome', version: '0.1.0', status: 'published', listingUrl }] }), null, String(listingUrl))
  }
})

test('an approved record must not carry an address', () => {
  assert.equal(parseExtensions({ extensions: [{ store: 'chrome', version: '0.1.0', status: 'approved', listingUrl: listing }] }), null)
})

test('unknown stores, statuses, versions and shapes are rejected', () => {
  for (const value of [
    { extensions: [{ store: 'safari', version: '0.1.0', status: 'approved' }] },
    { extensions: [{ store: 'chrome', version: '0.1', status: 'approved' }] },
    { extensions: [{ store: 'chrome', version: '0.1.0', status: 'withdrawn' }] },
    { extensions: 'chrome' },
    { extensions: [null] },
    null,
    [],
  ]) {
    assert.equal(parseExtensions(value), null, JSON.stringify(value))
  }
})

test('a published record outside Chrome is rejected until the site knows its store address', () => {
  assert.equal(parseExtensions({ extensions: [{ store: 'firefox', version: '0.1.0', status: 'published', listingUrl: 'https://addons.mozilla.org/x' }] }), null)
})
