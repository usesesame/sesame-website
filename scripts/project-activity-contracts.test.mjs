import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { activityAgeProblem } from './project-activity-freshness.mjs'

const now = new Date('2026-09-27T12:00:00Z')
const fresh = {
  generatedAt: '2026-09-27T09:00:00Z',
  windowDays: 30,
  repositories: [{ name: 'sesame-desktop', pushedAt: '2026-09-26T20:00:00Z', recentCommits: 12 }],
}

test('fresh activity passes', () => {
  assert.equal(activityAgeProblem(fresh, now), '')
})

test('activity older than the limit blocks a release', () => {
  const problem = activityAgeProblem({ ...fresh, generatedAt: '2026-09-01T00:00:00Z' }, now)
  assert.match(problem, /26 days old; run npm run activity:refresh/)
})

test('a missing, malformed, or future timestamp is refused', () => {
  assert.match(activityAgeProblem({ ...fresh, generatedAt: undefined }, now), /no valid generatedAt/)
  assert.match(activityAgeProblem({ ...fresh, generatedAt: 'yesterday' }, now), /no valid generatedAt/)
  assert.match(activityAgeProblem({ ...fresh, generatedAt: '2026-10-01T00:00:00Z' }, now), /in the future/)
})

test('a malformed repository entry is refused', () => {
  assert.match(activityAgeProblem({ ...fresh, repositories: [] }, now), /lists no repositories/)
  assert.match(activityAgeProblem({ ...fresh, repositories: [{ name: 'sesame-server', pushedAt: '2026-09-26T00:00:00Z', recentCommits: -1 }] }, now), /sesame-server has no valid commit count/)
  assert.match(activityAgeProblem({ ...fresh, repositories: [{ name: 'sesame-server', pushedAt: 'soon', recentCommits: 3 }] }, now), /sesame-server has no valid push date/)
})

test('the checked-in activity file has the shape the release gate reads', async () => {
  const activity = JSON.parse(await readFile(new URL('../src/lib/project-activity.json', import.meta.url), 'utf8'))
  const problem = activityAgeProblem(activity, new Date(activity.generatedAt))
  assert.equal(problem, '')
})

test('live activity from the API is parsed strictly', async () => {
  const { parseProjectActivity } = await import('../src/lib/project-activity-parse.ts')
  const live = { generatedAt: '2026-10-04T10:00:00Z', windowDays: 30, repositories: [{ name: 'sesame-desktop', pushedAt: '2026-10-04T09:00:00Z', recentCommits: 467 }] }
  assert.deepEqual(parseProjectActivity(live), live)
  const refused = [
    null,
    'text',
    { ...live, generatedAt: 'soon' },
    { ...live, windowDays: 0 },
    { ...live, windowDays: 1.5 },
    { ...live, repositories: [] },
    { ...live, repositories: Array.from({ length: 21 }, () => live.repositories[0]) },
    { ...live, repositories: [{ ...live.repositories[0], recentCommits: -1 }] },
    { ...live, repositories: [{ ...live.repositories[0], recentCommits: '467' }] },
    { ...live, repositories: [{ ...live.repositories[0], recentCommits: 1_000_001 }] },
    { ...live, repositories: [{ ...live.repositories[0], name: '<script>' }] },
    { ...live, repositories: [{ ...live.repositories[0], pushedAt: 'yesterday' }] },
    { ...live, generatedAt: '2026-10-04T10:00:00' },
    { ...live, repositories: [{ ...live.repositories[0], pushedAt: '2026-10-04T09:00:00' }] },
  ]
  for (const value of refused) assert.equal(parseProjectActivity(value), null, JSON.stringify(value))
})

test('the home page asks the API for live activity and keeps the checked-in counts as a fallback', async () => {
  const home = await readFile(new URL('../src/pages/HomePage.svelte', import.meta.url), 'utf8')
  const state = await readFile(new URL('../src/lib/project-activity.svelte.ts', import.meta.url), 'utf8')
  assert.match(home, /void loadProjectActivity\(\)/)
  assert.match(state, /readPublic\('\/v1\/project\/activity'\)/)
  assert.match(state, /import snapshot from '\.\/project-activity\.json'/)
  assert.match(state, /repositories\.every\(\(repository\) => names\.has\(repository\.name\)\)/, 'a partial live response must not replace the fallback counts')
})
