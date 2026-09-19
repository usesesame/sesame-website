import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const read = (...parts) => readFileSync(join(root, ...parts), 'utf8')

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? sourceFiles(path) : [path]
  })
}

test('the public site never sends credentials and owns no account session', () => {
  const client = read('src', 'lib', 'api.ts')
  assert.match(client, /credentials: 'omit'/, 'the public site must not send credentials to the API')

  for (const file of sourceFiles(join(root, 'src'))) {
    const source = readFileSync(file, 'utf8')
    assert.doesNotMatch(source, /credentials:\s*['"]include['"]/, `${file} sends credentials`)
    assert.doesNotMatch(source, /X-Sesame-CSRF/, `${file} sends an account CSRF header`)
  }

  const modules = new Set(readdirSync(join(root, 'src', 'lib')))
  for (const owned of ['auth.ts', 'passkey.ts', 'capabilities.ts']) {
    assert.ok(!modules.has(owned), `${owned} belongs to the account portal, not the public site`)
  }
})
