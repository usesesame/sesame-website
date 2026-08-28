import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { routes } from '../src/lib/routes.ts'

const siteOrigin = process.env.VITE_SESAME_SITE_ORIGIN?.replace(/\/$/, '')
if (!siteOrigin) throw new Error('VITE_SESAME_SITE_ORIGIN is required to submit URLs.')
const host = new URL(siteOrigin).host

const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const key = (await readFile(resolve(websiteRoot, 'dist', 'indexnow-key.txt'), 'utf8')).trim()

const urlList = routes.filter((route) => route.index).map((route) => `${siteOrigin}${route.path}`)

const response = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `${siteOrigin}/${key}.txt`, urlList }),
})

// 200 and 202 both mean accepted. Anything else is worth seeing, but a failed
// submission must never fail a deployment: the pages are already published.
if (response.status === 200 || response.status === 202) {
  console.log(`IndexNow accepted ${urlList.length} URLs for ${host}.`)
} else {
  console.warn(`IndexNow returned ${response.status}. The site is published regardless.`)
}
