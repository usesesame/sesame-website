import type { ProductRelease } from './product'
import { isDownloadable } from './product-parse.ts'

export type ReleaseChannel = { release: ProductRelease | null; live: boolean }

export type ReleaseSummary = {
  platform: string
  version: string
  publishedOn: string
  releaseNotesUrl?: string
  live: boolean
}

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

export async function refreshChannel(current: ReleaseChannel, load: () => Promise<ProductRelease | null>): Promise<ReleaseChannel> {
  try {
    const release = await load()
    return release ? { release, live: true } : current
  } catch {
    return current
  }
}

export function summarizeRelease(channel: ReleaseChannel, platform: string): ReleaseSummary | null {
  const { release } = channel
  if (!release || !isDownloadable(release) || !release.version || !release.publishedAt) return null
  const publishedAt = new Date(release.publishedAt)
  if (Number.isNaN(publishedAt.getTime())) return null
  return {
    platform,
    version: release.version,
    publishedOn: dateFormat.format(publishedAt),
    releaseNotesUrl: release.releaseNotesUrl,
    live: channel.live,
  }
}

export function releaseSentence(summaries: ReleaseSummary[]): string {
  if (summaries.length === 0) return ''
  const groups = new Map<string, { version: string; publishedOn: string; platforms: string[] }>()
  for (const summary of summaries) {
    const key = `${summary.version}|${summary.publishedOn}`
    const group = groups.get(key) ?? { version: summary.version, publishedOn: summary.publishedOn, platforms: [] }
    group.platforms.push(summary.platform)
    groups.set(key, group)
  }
  const clauses = [...groups.values()].map((group) => `version ${group.version} was released on ${group.publishedOn} for ${group.platforms.join(' and ')}`)
  const joined = clauses.join(', and ')
  if (summaries.every((summary) => summary.live)) return `${joined.charAt(0).toUpperCase()}${joined.slice(1)}.`
  return `The release list saved with this site shows that ${joined}.`
}
