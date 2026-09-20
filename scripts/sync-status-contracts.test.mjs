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
    /facts\.syncAvailabilitySentence/,
    'the Sync section states a fixed availability instead of the shared product fact',
  )
  const facts = await read('src', 'lib', 'product-facts.ts')
  assert.match(
    facts,
    /cloudSyncAvailable === true/,
    'the shared Sync fact no longer comes from the product status endpoint',
  )
  assert.match(
    facts,
    /syncAvailabilitySentence = syncAvailable\s*\?\s*'([^']+)'\s*:\s*'([^']+)'/,
    'the shared Sync sentence no longer chooses between two pieces of wording from the published field',
  )
  const branch = facts.match(/syncAvailabilitySentence = syncAvailable\s*\?\s*'([^']+)'\s*:\s*'([^']+)'/)
  assert.notEqual(branch[1], branch[2], 'the shared Sync sentence renders the same wording for available and unavailable states')
  assert.match(branch[2], /not available|disabled/i, 'the unavailable branch must say Sync is unavailable, not available')
})

test('every page that states Sync availability reads the shared fact', async () => {
  for (const page of ['HomePage', 'SupportPage', 'PricingPage', 'SecurityPage', 'RoadmapPage']) {
    const source = await read('src', 'pages', `${page}.svelte`)
    assert.match(
      source,
      /facts\.syncAvailable|facts\.syncAvailabilitySentence/,
      `${page} states Sync availability independently of the published status`,
    )
  }
})

test('the roadmap loads the published status before showing it', async () => {
  const page = await read('src', 'pages', 'RoadmapPage.svelte')
  assert.match(
    page,
    /onMount\(\(\) => \{\s*void loadStatus\(\)\s*\}\)/,
    'the roadmap no longer loads the product status the Sync section reports',
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
