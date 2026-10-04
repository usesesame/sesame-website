export type RepositoryActivity = { name: string; recentCommits: number; pushedAt: string }

export type ProjectActivity = { generatedAt: string; windowDays: number; repositories: RepositoryActivity[] }

const MAX_REPOSITORIES = 20
const MAX_COMMITS = 1_000_000

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 40 && !Number.isNaN(Date.parse(value))
}

function parseRepository(value: unknown): RepositoryActivity | null {
  if (!isRecord(value)) return null
  const { name, recentCommits, pushedAt } = value
  if (typeof name !== 'string' || !/^[a-z0-9-]{1,100}$/.test(name)) return null
  if (!Number.isInteger(recentCommits) || (recentCommits as number) < 0 || (recentCommits as number) > MAX_COMMITS) return null
  if (!isTimestamp(pushedAt)) return null
  return { name, recentCommits: recentCommits as number, pushedAt }
}

export function parseProjectActivity(value: unknown): ProjectActivity | null {
  if (!isRecord(value)) return null
  const { generatedAt, windowDays, repositories } = value
  if (!isTimestamp(generatedAt)) return null
  if (!Number.isInteger(windowDays) || (windowDays as number) < 1 || (windowDays as number) > 365) return null
  if (!Array.isArray(repositories) || repositories.length === 0 || repositories.length > MAX_REPOSITORIES) return null
  const parsed = repositories.map(parseRepository)
  if (parsed.some((entry) => entry === null)) return null
  return { generatedAt, windowDays: windowDays as number, repositories: parsed as RepositoryActivity[] }
}
