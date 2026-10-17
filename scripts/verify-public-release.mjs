import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const origin = new URL(process.argv[2] ?? 'https://usesesame.app').origin
const repository = process.argv[3] ?? 'usesesame/sesame-desktop'

const readSnapshot = async (file) => JSON.parse(await readFile(resolve(websiteRoot, 'src', 'lib', file), 'utf8'))
const windows = await readSnapshot('latest-release.json')
const linux = await readSnapshot('latest-release-linux.json')

const github = await fetch(`https://api.github.com/repos/${repository}/releases/latest`, {
  headers: { accept: 'application/vnd.github+json' },
  signal: AbortSignal.timeout(30_000),
})
if (!github.ok) throw new Error(`GitHub returned ${github.status} for the latest release.`)
const release = await github.json()

const errors = []
const version = String(release.tag_name ?? '').replace(/^v/, '')
if (release.draft || release.prerelease) errors.push(`the latest GitHub release ${release.tag_name} is a draft or prerelease`)
if (/unpublished draft/i.test(release.body ?? '') && !release.draft) {
  errors.push(`the body of ${release.tag_name} calls a published release an unpublished draft`)
}
for (const snapshot of [windows, linux]) {
  if (snapshot.version !== version) {
    errors.push(`${snapshot.platform} snapshot is ${snapshot.version} while GitHub's latest release is ${version}`)
  }
}

const assets = new Map(
  (release.assets ?? []).map((asset) => [
    asset.name,
    { url: asset.browser_download_url, sha256: String(asset.digest ?? '').replace(/^sha256:/, '') },
  ]),
)
const published = [
  ...(windows.url ? [{ name: windows.url.split('/').pop(), url: windows.url, sha256: windows.sha256 }] : []),
  ...(linux.artifacts ?? []).map((artifact) => ({ name: artifact.name, url: artifact.url, sha256: artifact.sha256 })),
]
for (const { name, url, sha256 } of published) {
  const asset = assets.get(name)
  if (!asset) errors.push(`${name} is not an asset of ${release.tag_name}`)
  else if (asset.sha256 !== sha256) errors.push(`${name} differs from the digest GitHub reports`)
  else if (asset.url !== url) errors.push(`${name} differs from the download URL GitHub reports`)
}

const page = await fetch(`${origin}/releases`, { signal: AbortSignal.timeout(30_000) })
if (!page.ok) errors.push(`${origin}/releases returned ${page.status}`)
else {
  const html = await page.text()
  if (!html.includes(`v${version}`) && !html.includes(version)) errors.push(`${origin}/releases does not mention ${version}`)
  for (const { name, url, sha256 } of published) {
    if (!html.includes(sha256)) errors.push(`${origin}/releases is missing the digest ${sha256.slice(0, 12)}`)
    if (!html.includes(url)) errors.push(`${origin}/releases does not link ${name} to ${url}`)
  }
}

if (errors.length) {
  for (const error of errors) console.error(error)
  process.exit(1)
}
console.log(`${origin}/releases and ${repository} agree on ${release.tag_name}.`)
