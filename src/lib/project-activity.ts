import activity from './project-activity.json'

export type RepositoryActivity = { recentCommits: number; pushedAt: string }

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

export const activityWindowDays = activity.windowDays
export const activityCountedOn = dateFormat.format(new Date(activity.generatedAt))
export const activityByRepository: ReadonlyMap<string, RepositoryActivity> = new Map(
  activity.repositories.map((entry) => [entry.name, { recentCommits: entry.recentCommits, pushedAt: entry.pushedAt }]),
)

export function lastPushLabel(pushedAt: string): string {
  return dateFormat.format(new Date(pushedAt))
}
