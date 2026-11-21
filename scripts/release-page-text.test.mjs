import assert from 'node:assert/strict'
import test from 'node:test'

import { digestsAsShown } from './release-page-text.mjs'

const digest = '121b61db14a7aa00bb11cc22dd33ee44ff5566778899aabbccddeeff00112233'

test('a digest the page breaks into groups still reads as one digest', () => {
  const groups = digest.match(/.{1,8}/g).map((part) => `<span>${part}</span>`).join('<!----><wbr>')
  assert.ok(!`<code>${groups}</code>`.includes(digest))
  assert.ok(digestsAsShown(`<code>${groups}</code>`).includes(digest))
})

test('a page that shows another digest does not pass', () => {
  const other = digest.replace(/^1/, '2').match(/.{1,8}/g).map((part) => `<span class="a">${part}</span>`).join('<wbr />')
  assert.ok(!digestsAsShown(`<code>${other}</code>`).includes(digest))
})

test('text around the digest is kept apart from it', () => {
  assert.equal(digestsAsShown('<p>ab</p><code><span>cd</span></code>'), '<p>ab</p><code>cd</code>')
})
