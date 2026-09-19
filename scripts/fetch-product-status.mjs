import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import { parseProductRelease, parseProductStatus } from '../src/lib/product-parse.ts'

// The site is prerendered, so whatever this writes is what a crawler and the
// first paint see. Without it the static HTML kept saying "request beta
// access" long after downloads opened, and only corrected once JavaScript ran.
const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const target = resolve(websiteRoot, 'src', 'lib', 'product-status.json')
const fileEnv = loadEnv('production', websiteRoot, '')
const configured = (process.env.VITE_SESAME_API_URL ?? fileEnv.VITE_SESAME_API_URL)?.trim()
if (!configured) throw new Error('VITE_SESAME_API_URL is required to refresh the product status.')

function validatedApiOrigin(value) {
  const url = new URL(value)
  const loopback = url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  if ((url.protocol !== 'https:' && !loopback) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('VITE_SESAME_API_URL must be an HTTPS origin, except for a loopback development origin.')
  }
  return url.origin
}

const api = validatedApiOrigin(configured)

const response = await fetch(`${api}/v1/product/status`, { signal: AbortSignal.timeout(30_000) })
if (!response.ok) throw new Error(`${api}/v1/product/status returned ${response.status}`)
const status = parseProductStatus(await response.json())
if (!status) throw new Error(`${api}/v1/product/status returned a payload outside the canonical status contract.`)

await writeFile(target, `${JSON.stringify(status, null, 2)}\n`, 'utf8')
console.log(`Product status refreshed: publicDownload=${status.publicDownload}, registration=${status.registrationMode}`)

// The releases page has the same problem: without this it renders "nothing to
// download yet" into static HTML while an installer is published.
const releaseTarget = resolve(websiteRoot, 'src', 'lib', 'latest-release.json')
const releaseResponse = await fetch(`${api}/v1/releases/latest?platform=windows`, { signal: AbortSignal.timeout(30_000) })
if (!releaseResponse.ok) throw new Error(`${api}/v1/releases/latest returned ${releaseResponse.status}`)
const release = parseProductRelease(await releaseResponse.json())
if (!release) throw new Error(`${api}/v1/releases/latest returned a payload outside the canonical release contract.`)
await writeFile(releaseTarget, `${JSON.stringify(release, null, 2)}\n`, 'utf8')
console.log(`Latest Windows release: ${release.version ?? 'none'}, available=${release.available}`)

const linuxTarget = resolve(websiteRoot, 'src', 'lib', 'latest-release-linux.json')
const linuxResponse = await fetch(`${api}/v1/releases/latest?platform=linux`, { signal: AbortSignal.timeout(30_000) })
if (!linuxResponse.ok) throw new Error(`${api}/v1/releases/latest returned ${linuxResponse.status}`)
const linuxRelease = parseProductRelease(await linuxResponse.json())
if (!linuxRelease) throw new Error(`${api}/v1/releases/latest returned a payload outside the canonical release contract.`)
await writeFile(linuxTarget, `${JSON.stringify(linuxRelease, null, 2)}\n`, 'utf8')
console.log(`Latest Linux release: ${linuxRelease.version ?? 'none'}, available=${linuxRelease.available}`)
