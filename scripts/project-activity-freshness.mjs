export const MAX_ACTIVITY_AGE_DAYS = 14

export function activityAgeProblem(activity, now = new Date(), maxAgeDays = MAX_ACTIVITY_AGE_DAYS) {
  const generatedAt = Date.parse(activity?.generatedAt ?? '')
  if (Number.isNaN(generatedAt)) return 'src/lib/project-activity.json has no valid generatedAt timestamp'
  if (generatedAt > now.getTime()) return 'src/lib/project-activity.json is dated in the future'
  const ageDays = (now.getTime() - generatedAt) / 86_400_000
  if (ageDays > maxAgeDays) {
    return `src/lib/project-activity.json is ${Math.floor(ageDays)} days old; run npm run activity:refresh before a release (limit ${maxAgeDays} days)`
  }
  const repositories = activity.repositories
  if (!Array.isArray(repositories) || repositories.length === 0) return 'src/lib/project-activity.json lists no repositories'
  for (const entry of repositories) {
    if (!Number.isInteger(entry?.recentCommits) || entry.recentCommits < 0) return `${entry?.name ?? 'a repository'} has no valid commit count`
    if (Number.isNaN(Date.parse(entry?.pushedAt ?? ''))) return `${entry?.name ?? 'a repository'} has no valid push date`
  }
  return ''
}
