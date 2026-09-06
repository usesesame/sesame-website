import path from 'node:path'
import { readFile } from 'node:fs/promises'

import { applySwitch, compareCaddyfileWithPolicy, currentRevision, parseCaddyfileHeaders, parseHeadersPolicy, readDeployedState, resolveSwitchTarget, validateRevision } from './site-release-lib.mjs'

const [releasesInput, command, ...rest] = process.argv.slice(2)
if (!releasesInput || !command) {
  throw new Error('Usage: node scripts/deploy-site-release.mjs <releases-root> <validate|switch|rollback|status|caddy-check> ...')
}
const releasesRoot = path.resolve(releasesInput)

const validate = async (revision) => {
  const summary = await validateRevision(path.join(releasesRoot, 'releases', revision))
  process.stdout.write(`Release ${revision} validated: ${summary.fileCount} files, connect-src ${summary.apiOrigin || "'self'"}.\n`)
}

if (command === 'validate') {
  const [revision] = rest
  if (!revision) throw new Error('Usage: ... validate <revision>')
  await validate(revision)
} else if (command === 'switch') {
  const [revision] = rest
  if (!revision) throw new Error('Usage: ... switch <revision>')
  const plan = resolveSwitchTarget(await readDeployedState(releasesRoot), { revision })
  if (plan.action === 'noop') {
    process.stdout.write(`Release ${plan.target} is already live; nothing changed.\n`)
  } else {
    await validate(plan.target)
    const next = await applySwitch(releasesRoot, plan)
    process.stdout.write(`${plan.action === 'bootstrap' ? 'Bootstrapped' : 'Switched'} to site release ${next.current}.\n`)
  }
} else if (command === 'rollback') {
  const [revision] = rest
  const plan = resolveSwitchTarget(await readDeployedState(releasesRoot), { revision, rollback: true })
  await validate(plan.target)
  const next = await applySwitch(releasesRoot, plan)
  process.stdout.write(`Rolled back to site release ${next.current}; the replaced tree stays in releases/ for the next rollback.\n`)
} else if (command === 'status') {
  const state = await readDeployedState(releasesRoot)
  process.stdout.write(`Live: ${(await currentRevision(releasesRoot)) ?? 'nothing'} (recorded: ${state.current ?? 'nothing'})\n`)
  for (const entry of state.history.slice(-5).reverse()) {
    process.stdout.write(`${entry.at} ${entry.action} ${entry.revision}${entry.from ? ` from ${entry.from}` : ''}\n`)
  }
} else if (command === 'caddy-check') {
  const [revision, caddyfile] = rest
  if (!revision || !caddyfile) throw new Error('Usage: ... caddy-check <revision> <Caddyfile>')
  const policy = parseHeadersPolicy(await readFile(path.join(releasesRoot, 'releases', revision, '_headers'), 'utf8'))
  const differences = compareCaddyfileWithPolicy(parseCaddyfileHeaders(await readFile(caddyfile, 'utf8')), policy)
  if (differences.length > 0) {
    throw new Error(`The Caddyfile disagrees with the built header policy:\n${differences.map((line) => `  ${line}`).join('\n')}`)
  }
  process.stdout.write(`The Caddyfile serves exactly the policy built into release ${revision}.\n`)
} else {
  throw new Error('Usage: node scripts/deploy-site-release.mjs <releases-root> <validate|switch|rollback|status|caddy-check> ...')
}
