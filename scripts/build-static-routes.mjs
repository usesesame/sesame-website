import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import { routes } from '../src/lib/routes.ts'

const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputRoot = resolve(websiteRoot, 'dist')
const { renderPage } = await import(new URL('../.ssr/entry-server.js', import.meta.url))

// `vite build` (see the website:build script) runs in the default "production"
// mode and reads its env files from this same root, so this must match or the
// two would silently disagree about `.env.local`.
const fileEnv = loadEnv('production', websiteRoot, '')

function validOrigin(name, value) {
  const url = new URL(value)
  const localHttp = url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  if ((url.protocol !== 'https:' && !localHttp) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`${name} must be an HTTPS origin, except for a loopback development origin.`)
  }
  return url.origin
}

function configuredOrigin(name) {
  const value = (process.env[name] ?? fileEnv[name])?.trim()
  if (!value) throw new Error(`${name} is required for a website build.`)
  return validOrigin(name, value)
}

/**
 * An origin the built site can do without. The API is optional: with none
 * configured the site reads nothing, and its Content-Security-Policy names no
 * remote host at all.
 */
function optionalOrigin(name) {
  const value = (process.env[name] ?? fileEnv[name])?.trim()
  return value ? validOrigin(name, value) : ''
}

const siteOrigin = configuredOrigin('VITE_SESAME_SITE_ORIGIN')
const apiOrigin = optionalOrigin('VITE_SESAME_API_URL')
const privacyEmail = (process.env.VITE_SESAME_PRIVACY_EMAIL ?? fileEnv.VITE_SESAME_PRIVACY_EMAIL)?.trim()
if (!privacyEmail || /[\r\n]/.test(privacyEmail) || !/^[^\s@]+@[^\s@]+$/.test(privacyEmail)) {
  throw new Error('VITE_SESAME_PRIVACY_EMAIL must be a valid contact email address.')
}

const template = await readFile(resolve(outputRoot, 'index.html'), 'utf8')

function renderDocument(path) {
  const { head, body } = renderPage(path)
  const withHead = template.replace(/<head>[\s\S]*?<\/head>/, `<head>${head}</head>`)
  if (withHead === template) throw new Error(`Template head splice failed for ${path}.`)
  const html = withHead.replace('<div id="app"></div>', `<div id="app">${body}</div>`)
  if (html === withHead) throw new Error(`Template app shell missing for ${path}.`)
  return html
}

for (const route of routes) {
  const target = route.path === '/' ? resolve(outputRoot, 'index.html') : resolve(outputRoot, route.path.slice(1), 'index.html')
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, renderDocument(route.path), 'utf8')
}

await writeFile(resolve(outputRoot, '404.html'), renderDocument('/404'), 'utf8')

// A sitemap without lastmod gives a crawler no reason to prefer one page over
// another on a recrawl. The build date is the honest value here: every page is
// rendered from the same source tree in the same run.
const lastmod = new Date().toISOString().slice(0, 10)
const sitemapEntries = routes
  .filter((route) => route.index)
  .map((route) => `  <url><loc>${siteOrigin}${route.path}</loc><lastmod>${lastmod}</lastmod></url>`)
  .join('\n')
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`
await writeFile(resolve(outputRoot, 'sitemap.xml'), sitemap, 'utf8')

// IndexNow lets Bing and Yandex fetch changed pages immediately instead of
// waiting for a crawl. The key file must be reachable at the site root.
const indexNowKey = 'a7f3c1e94b2d48a6b5e0c9d7f8a1b3c2'
await writeFile(resolve(outputRoot, `${indexNowKey}.txt`), indexNowKey, 'utf8')
await writeFile(resolve(outputRoot, 'indexnow-key.txt'), indexNowKey, 'utf8')

const headersPath = resolve(outputRoot, '_headers')
let headers = await readFile(headersPath, 'utf8')
// With no API, connect-src stays 'self' and the placeholder goes away, so the
// shipped policy never names a host the site does not use.
headers = headers.replace(' __SESAME_API_ORIGIN__', apiOrigin ? ` ${apiOrigin}` : '')
await writeFile(headersPath, headers, 'utf8')

for (const file of ['index.html', '404.html', 'robots.txt', '.well-known/security.txt']) {
  const target = resolve(outputRoot, file)
  const content = await readFile(target, 'utf8')
  await writeFile(target, content
    .replaceAll('__SESAME_SITE_ORIGIN__', siteOrigin)
    .replaceAll('__SESAME_PRIVACY_EMAIL__', privacyEmail), 'utf8')
}
