import saved from './source-excerpts.json'

export type SourceExcerpt = { key: string; path: string; start: number; lines: string[]; marked: number[]; url: string }

export const excerptCommit = saved.commit
export const excerptCommitUrl = `https://github.com/${saved.repository}/commit/${saved.commit}`

export function sourceExcerpt(key: string): SourceExcerpt {
  const found = saved.excerpts.find((excerpt) => excerpt.key === key)
  if (!found) throw new Error(`No source excerpt is saved as ${key}`)
  return {
    key: found.key,
    path: found.path,
    start: found.start,
    lines: found.lines,
    marked: found.marked,
    url: `https://github.com/${saved.repository}/blob/${saved.commit}/${found.path}#L${found.start}-L${found.end}`,
  }
}
