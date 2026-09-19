import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const read = (...parts) => readFileSync(join(root, ...parts), 'utf8')

test('the public site never sends credentials and owns no account session', () => {
  const client = read('src', 'lib', 'api.ts')
  assert.match(client, /credentials: 'omit'/, 'the public site must not send credentials to the API')
  assert.doesNotMatch(client, /X-Sesame-CSRF/, 'the public site performs no unsafe request')

  const modules = new Set(readdirSync(join(root, 'src', 'lib')))
  for (const owned of ['auth.ts', 'passkey.ts', 'capabilities.ts']) {
    assert.ok(!modules.has(owned), `${owned} belongs to the account portal, not the public site`)
  }
})
