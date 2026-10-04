import { readPublic } from './api'
import snapshot from './project-activity.json'
import { parseProjectActivity, type ProjectActivity } from './project-activity-parse'

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const timeFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })

const fallback = parseProjectActivity(snapshot) as ProjectActivity

export const projectActivity = $state({ current: fallback, live: false })

export async function loadProjectActivity(): Promise<void> {
  const value = parseProjectActivity(await readPublic('/v1/project/activity'))
  if (value && Date.parse(value.generatedAt) >= Date.parse(projectActivity.current.generatedAt)) {
    projectActivity.current = value
    projectActivity.live = true
  }
}

export function countedLabel(activity: ProjectActivity, live: boolean): string {
  const at = new Date(activity.generatedAt)
  return live ? `${dateFormat.format(at)}, ${timeFormat.format(at)} UTC` : dateFormat.format(at)
}

export function lastPushLabel(pushedAt: string): string {
  return dateFormat.format(new Date(pushedAt))
}
