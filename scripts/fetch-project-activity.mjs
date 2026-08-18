import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const target = resolve(websiteRoot, 'src', 'lib', 'project-activity.json')
const org = 'usesesame'
const repositories = ['sesame-desktop', 'sesame-server', 'sesame-website', 'sesame-browser-extension']

// Popularity counts are deliberately absent. Stars and forks say nothing true
// about a project this young, and GitHub's open_issues_count includes pull
// requests, so it reads as a backlog when it is mostly dependency updates.
const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

async function github(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: { accept: 'application/vnd.github+json', 'user-agent': 'sesame-website-activity' },
  })
  if (!response.ok) throw new Error(`GitHub returned ${response.status} for ${path}`)
  return response.json()
}

const entries = []
for (const name of repositories) {
  const [repo, commits] = await Promise.all([
    github(`/repos/${org}/${name}`),
    github(`/repos/${org}/${name}/commits?since=${since}&per_page=100`),
  ])
  entries.push({
    name,
    language: repo.language ?? '',
    pushedAt: repo.pushed_at,
    recentCommits: commits.length,
  })
}

const payload = { generatedAt: new Date().toISOString(), windowDays: 30, repositories: entries }
await writeFile(target, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
console.log(`Wrote ${entries.length} repositories, ${entries.reduce((total, entry) => total + entry.recentCommits, 0)} commits in the window.`)
