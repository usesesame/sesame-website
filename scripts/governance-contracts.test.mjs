import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const read = (...parts) => readFileSync(join(root, ...parts), 'utf8')

const workflows = readdirSync(join(root, '.github', 'workflows'))
  .filter((name) => /\.(ya?ml)$/.test(name))
  .map((name) => join('.github', 'workflows', name))
  .sort()

const repository = 'usesesame/sesame-website'

const topLevelPermissions = (body) => {
  const start = body.match(/^permissions:\s*$/m)
  assert.ok(start, 'the workflow declares no top-level permissions block')
  const rest = body.slice(start.index + start[0].length)
  const end = rest.search(/^[^\s#]/m)
  return end >= 0 ? rest.slice(0, end) : rest
}

test('every workflow declares permissions and pins every third-party action', () => {
  assert.ok(workflows.length >= 1, `expected this repository's workflows, found ${workflows.length}`)

  const missingPermissions = []
  const unpinned = []
  for (const workflow of workflows) {
    const body = read(workflow)
    if (!/^permissions:\s*$/m.test(body)) missingPermissions.push(workflow)
    for (const [, action] of body.matchAll(/uses:\s*([^\s#]+)/g)) {
      if (action.startsWith('./')) continue
      if (action.startsWith(`${repository}/`) && action.length > repository.length + 1 && !action.includes('@')) continue
      if (!/@[0-9a-f]{40}$/.test(action)) unpinned.push(`${workflow}: ${action}`)
    }
  }
  assert.deepEqual(missingPermissions, [], `these workflows inherit their permissions:\n  ${missingPermissions.join('\n  ')}`)
  assert.deepEqual(unpinned, [], `a moved tag would change what these runs execute:\n  ${unpinned.join('\n  ')}`)
})

test('a workflow defaults to read access and widens per job', () => {
  for (const workflow of workflows) {
    const body = read(workflow)
    const block = topLevelPermissions(body)
    const entries = [...block.matchAll(/^\s+([a-z-]+):\s*([a-z-]+)\s*$/gm)].map(([, key, value]) => `${key}: ${value}`)
    assert.deepEqual(
      entries,
      ['contents: read'],
      `${workflow} should default to exactly contents: read at the top and widen per job`,
    )
  }
})

test('every job a workflow depends on exists in that workflow', () => {
  for (const workflow of workflows) {
    const body = read(workflow)
    const names = new Set([...body.matchAll(/^ {2}([a-z0-9_-]+):$/gm)].map(([, name]) => name))
    for (const [, list] of body.matchAll(/^\s+needs:\s*(.+)$/gm)) {
      for (const name of list.replaceAll('[', ' ').replaceAll(']', ' ').split(',')) {
        const job = name.trim()
        if (!job) continue
        assert.ok(names.has(job), `${workflow} requires job ${job}, which the workflow does not define`)
      }
    }
  }
})

test('review routing names paths that exist in this repository', () => {
  const owners = read('.github', 'CODEOWNERS')
  assert.match(owners, /^\*\s+@/m, 'the repository has no default owner')
  for (const control of ['/.github/', '/package.json', '/package-lock.json']) {
    assert.ok(owners.includes(control), `the repository does not route ${control}`)
  }
  for (const [, routed] of owners.matchAll(/^(\/[^\s#]+)/gm)) {
    assert.ok(
      existsSync(join(root, routed.slice(1))),
      `CODEOWNERS routes ${routed}, which does not exist in this repository`,
    )
  }
})

test('every dependency ecosystem this repository uses is updated', () => {
  const body = read('.github', 'dependabot.yml')
  const uncommented = body
    .split('\n')
    .filter((line) => !/^\s*#/.test(line))
    .join('\n')
  const active = new Set(
    [...uncommented.matchAll(/^[ \t]*-?[ \t]*package-ecosystem:[ \t]*([a-z-]+)/gm)].map((match) => match[1]),
  )
  for (const ecosystem of ['npm', 'github-actions']) {
    assert.ok(active.has(ecosystem), `dependabot does not update ${ecosystem}`)
  }
})

test('CI audits the npm lockfile for high advisories with the dependencies installed from it', () => {
  const body = read('.github', 'workflows', 'ci.yml')
  assert.match(body, /^ {2}audit:$/m, 'the website CI has no audit job')
  const job = body.slice(body.search(/^ {2}audit:$/m)).split(/^ {2}[a-z0-9_-]+:$/m)[1]
  assert.match(job, /run: npm ci\b/, 'the audit job does not install from the lockfile')
  assert.match(job, /run: npm audit --audit-level=high\s*$/m, 'the audit job does not fail on high advisories')
  assert.doesNotMatch(job, /--omit=dev|--production/, 'the audit job skips development dependencies')
})

test('a new package version waits seven days before npm or Dependabot takes it', () => {
  assert.match(read('.npmrc'), /^min-release-age=7$/m, 'npm does not wait for a release to age')
  const dependabot = read('.github', 'dependabot.yml')
  const cooldowns = [...dependabot.matchAll(/^[ \t]*default-days:[ \t]*(\d+)/gm)].map((match) => Number(match[1]))
  assert.deepEqual(cooldowns, [7, 7], 'each Dependabot ecosystem should wait seven days')
})

test('the security policy tells a reporter where to send a vulnerability', () => {
  assert.ok(statSync(join(root, 'SECURITY.md')).isFile())
  const body = read('SECURITY.md')
  assert.match(body, /Do not open a public issue/i, 'the policy does not say to report privately')
  assert.match(body, /Report a vulnerability/, 'the policy does not name the private reporting route')
  assert.match(body, /## Scope/, 'the policy has no scope, so a reporter cannot tell what counts')
  assert.match(body, /static/i, 'the policy is not scoped to this product')
})
