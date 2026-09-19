import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

import { routes } from '../src/lib/routes.ts'

const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (...parts) => readFile(resolve(websiteRoot, ...parts), 'utf8')

const SYNC_PAGE = '/roadmap'
const SYNC_FRAGMENT = 'sync'

test('the Sync section reports the availability the service publishes', async () => {
  const page = await read('src', 'pages', 'RoadmapPage.svelte')
  const section = page.match(/<div id="sync"[\s\S]*?<\/div>/)
  assert.ok(section, 'the roadmap page has no #sync section')
  assert.match(
    section[0],
    /productState\.status\??\.cloudSyncAvailable/,
    'the Sync section states a fixed availability instead of the one the product status endpoint publishes',
  )
  assert.match(
    section[0],
    /cloudSyncAvailable\s*\?\s*'[^']+' : '[^']+'/,
    'the Sync section no longer chooses between two pieces of wording from the published field',
  )
})

test('the desktop Settings link target exists on the site', async () => {
  assert.ok(
    routes.some((route) => route.path === SYNC_PAGE),
    `the site has no ${SYNC_PAGE} page for the desktop Settings link`,
  )
  const page = await read('src', 'pages', 'RoadmapPage.svelte')
  assert.match(
    page,
    new RegExp(`id="${SYNC_FRAGMENT}"`),
    `the ${SYNC_PAGE} page has no #${SYNC_FRAGMENT} section for the link to land on`,
  )
})
