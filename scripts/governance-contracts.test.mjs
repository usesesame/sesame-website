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
  assert.match(job, /run: node scripts\/audit-dependencies\.mjs\s*$/m, 'the audit job does not fail on high advisories through the reviewed exceptions')
  assert.doesNotMatch(job, /run: npm audit\b/, 'a bare npm audit ignores the reviewed exceptions')
  assert.doesNotMatch(job, /--omit=dev|--production/, 'the audit job skips development dependencies')
})

test('every CI checkout drops its credentials before dependencies install', () => {
  const body = read('.github', 'workflows', 'ci.yml')
  const checkouts = body.split('uses: actions/checkout@').slice(1).map((rest) => rest.split(/\n\s*\n/)[0])
  assert.ok(checkouts.length > 0, 'ci.yml has no checkout step')
  for (const checkout of checkouts) {
    assert.match(checkout, /persist-credentials: false/, checkout)
  }
})

const jobBlock = (body, name) => {
  const start = body.search(new RegExp(`^ {2}${name}:$`, 'm'))
  assert.ok(start >= 0, `the workflow has no ${name} job`)
  return body.slice(start).split(/^ {2}[a-z0-9_-]+:$/m)[1]
}

test('the upkeep workflow runs weekly or on demand and never from a pull request', () => {
  const body = read('.github', 'workflows', 'upkeep.yml')
  const trigger = body.slice(body.search(/^on:/m), body.search(/^permissions:/m))
  assert.match(trigger, /^ {2}schedule:\s*\n\s+- cron: '\d+ \d+ \* \* \d'$/m, 'the upkeep workflow does not run weekly')
  assert.match(trigger, /^ {2}workflow_dispatch:\s*$/m, 'the upkeep workflow cannot be started by hand')
  assert.doesNotMatch(trigger, /pull_request|push:/, 'the upkeep workflow must not run on code a contributor controls')
  assert.match(body, /^concurrency:\n {2}group: upkeep-/m, 'the upkeep workflow has no concurrency group')
  assert.doesNotMatch(body, /secrets\.(?!GITHUB_TOKEN\b)/, 'the upkeep workflow reads a secret other than GITHUB_TOKEN')
  const jobs = [...body.slice(body.search(/^jobs:/m)).matchAll(/^ {2}([a-z0-9_-]+):$/gm)].map(([, name]) => name)
  assert.deepEqual(jobs, ['refresh-activity', 'verify-public'])
  for (const name of jobs) {
    const job = jobBlock(body, name)
    assert.match(job, /^ {4}timeout-minutes: \d+$/m, `${name} has no timeout`)
    assert.match(job, /^ {4}if: github\.repository == 'usesesame\/sesame-website'$/m, `${name} runs in forks`)
    assert.match(job, /persist-credentials: false/, `${name} leaves the checkout credentials on disk`)
  }
})

test('only the activity refresh job can write, and it writes a branch, not main', () => {
  const body = read('.github', 'workflows', 'upkeep.yml')
  const refresh = jobBlock(body, 'refresh-activity')
  assert.match(refresh, /^ {4}permissions:\n {6}contents: write$/m, 'the refresh job does not declare write access on the job')
  assert.equal(body.match(/contents: write/g).length, 1, 'only the refresh job may hold write access')
  assert.doesNotMatch(body, /pull-requests: write|actions: write|id-token/, 'the upkeep workflow holds more than the branch push needs')
  assert.match(refresh, /run: npm run activity:refresh\s*$/m, 'the refresh job does not run the refresh script')
  assert.match(refresh, /^ {10}git push "https:\/\/x-access-token:\$\{GH_TOKEN\}@github\.com\/\$\{GITHUB_REPOSITORY\}\.git" "\$REFRESH_BRANCH"$/m)
  assert.doesNotMatch(refresh, /git push[^\n]*(--force|-f\b|\bmain\b)/, 'the refresh job must not overwrite a branch or push main')
  assert.match(refresh, /git ls-remote --exit-code --heads origin "\$REFRESH_BRANCH"/, 'the refresh job overwrites an open refresh')
  assert.doesNotMatch(refresh, /npm ci|npm install/, 'the refresh job installs packages while it holds write access')
  assert.deepEqual(
    [...refresh.matchAll(/git add (.+)$/gm)].map(([, paths]) => paths),
    ['src/lib/project-activity.json'],
    'the refresh job commits more than the activity file',
  )
})

test('the weekly public release check reads only public pages and needs no write access', () => {
  const verify = jobBlock(read('.github', 'workflows', 'upkeep.yml'), 'verify-public')
  assert.match(verify, /run: npm run release:verify-public\s*$/m, 'the live site is never compared with the published releases')
  assert.doesNotMatch(verify, /permissions:|secrets\.|GH_TOKEN/, 'the public check takes rights or secrets it does not need')
  const script = read('scripts', 'verify-public-release.mjs')
  assert.doesNotMatch(script, /process\.env|authorization/i, 'the public check reads an environment secret')
})

test('the release build still refuses activity older than the freshness limit', () => {
  const prepare = read('scripts', 'prepare-site-release.mjs')
  assert.match(prepare, /activityAgeProblem\(/, 'the release preparation no longer checks the activity age')
  assert.match(prepare, /if \(activityProblem\) throw new Error\(activityProblem\)/)
})

test('Dependabot groups minor and patch updates and leaves major updates alone', () => {
  const body = read('.github', 'dependabot.yml')
    .split('\n')
    .filter((line) => !/^\s*#/.test(line))
    .join('\n')
  const entries = body.split(/^ {2}- package-ecosystem:/m).slice(1)
  assert.equal(entries.length, 2)
  for (const entry of entries) {
    const groups = entry.slice(entry.search(/^ {4}groups:/m))
    assert.match(groups, /^ {4}groups:\n {6}[a-z-]+:\n {8}update-types:\n {10}- minor\n {10}- patch\s*$/, `a Dependabot group must hold exactly minor and patch:\n${entry}`)
    assert.doesNotMatch(groups, /major/, 'a Dependabot group takes major updates')
  }
})

test('npm installs run no package scripts and fetch no git dependencies', () => {
  const policy = read('.npmrc').split(/\r?\n/)
  for (const line of ['ignore-scripts=true', 'allow-git=none']) {
    assert.ok(policy.includes(line), `.npmrc no longer pins ${line}`)
  }
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
