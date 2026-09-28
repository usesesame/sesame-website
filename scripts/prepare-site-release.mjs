import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { activityAgeProblem } from './project-activity-freshness.mjs'
import { stageSiteRelease } from './site-release-lib.mjs'

const [distInput, releasesInput] = process.argv.slice(2)
if (!distInput || !releasesInput) throw new Error('Usage: node scripts/prepare-site-release.mjs <dist-directory> <releases-root>')

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const activityProblem = activityAgeProblem(JSON.parse(await readFile(path.join(workspace, 'src', 'lib', 'project-activity.json'), 'utf8')))
if (activityProblem) throw new Error(activityProblem)
const { revision, target, staged } = await stageSiteRelease(path.resolve(workspace, distInput), path.resolve(releasesInput), {
  commit: process.env.SESAME_SITE_COMMIT?.trim() ?? '',
})
process.stdout.write(`${staged ? 'Staged' : 'Already staged'} site release ${revision} at ${target}\n`)
