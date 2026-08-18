import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// The site is prerendered, so whatever this writes is what a crawler and the
// first paint see. Without it the static HTML kept saying "request beta
// access" long after downloads opened, and only corrected once JavaScript ran.
const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const target = resolve(websiteRoot, 'src', 'lib', 'product-status.json')
const api = process.env.VITE_SESAME_API_URL?.replace(/\/$/, '')
if (!api) throw new Error('VITE_SESAME_API_URL is required to refresh the product status.')

const response = await fetch(`${api}/v1/product/status`)
if (!response.ok) throw new Error(`${api}/v1/product/status returned ${response.status}`)
const status = await response.json()

await writeFile(target, `${JSON.stringify(status, null, 2)}\n`, 'utf8')
console.log(`Product status refreshed: publicDownload=${status.publicDownload}, registration=${status.registrationMode}`)

// The releases page has the same problem: without this it renders "nothing to
// download yet" into static HTML while an installer is published.
const releaseTarget = resolve(websiteRoot, 'src', 'lib', 'latest-release.json')
const releaseResponse = await fetch(`${api}/v1/releases/latest?platform=windows`)
if (!releaseResponse.ok) throw new Error(`${api}/v1/releases/latest returned ${releaseResponse.status}`)
const release = await releaseResponse.json()
await writeFile(releaseTarget, JSON.stringify(release, null, 2) + String.fromCharCode(10), 'utf8')
console.log(`Latest Windows release: ${release.version ?? 'none'}, available=${release.available}`)
