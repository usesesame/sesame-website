import { readFile, writeFile } from 'node:fs/promises'

const file = new URL('../src/lib/source-excerpts.json', import.meta.url)
const check = process.argv.includes('--check')
const saved = JSON.parse(await readFile(file, 'utf8'))
const stale = []

for (const excerpt of saved.excerpts) {
  const address = `https://raw.githubusercontent.com/${saved.repository}/${saved.commit}/${excerpt.path}`
  const response = await fetch(address)
  if (!response.ok) throw new Error(`${address} answered ${response.status}`)
  const lines = (await response.text()).split('\n').slice(excerpt.start - 1, excerpt.end)
  if (lines.length !== excerpt.end - excerpt.start + 1) throw new Error(`${excerpt.path} has no lines ${excerpt.start} to ${excerpt.end} at ${saved.commit}`)
  if (JSON.stringify(lines) !== JSON.stringify(excerpt.lines)) stale.push(excerpt.key)
  excerpt.lines = lines
}

if (check) {
  if (stale.length) {
    console.error(`These excerpts differ from ${saved.repository} at ${saved.commit}: ${stale.join(', ')}`)
    process.exit(1)
  }
  console.log(`All ${saved.excerpts.length} excerpts match ${saved.repository} at ${saved.commit}.`)
} else {
  await writeFile(file, `${JSON.stringify(saved, null, 2)}\n`)
  console.log(`Wrote ${saved.excerpts.length} excerpts from ${saved.repository} at ${saved.commit}.`)
}
