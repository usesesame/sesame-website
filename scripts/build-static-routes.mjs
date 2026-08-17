import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import { pages } from './seo-pages.mjs'

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

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function replaceTag(html, pattern, value) {
  if (!pattern.test(html)) throw new Error(`SEO template tag missing: ${pattern}`)
  return html.replace(pattern, value)
}

function renderRoute(template, [path, title, description, index]) {
  const canonical = `${siteOrigin}${path}`
  const rendered = renderPage(path)
  let html = template
  html = replaceTag(html, /<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)
  html = replaceTag(html, /<meta name="description" content=".*?"\s*\/>/s, `<meta name="description" content="${escapeHtml(description)}" />`)
  html = replaceTag(html, /<meta name="robots" content=".*?"\s*\/>/s, `<meta name="robots" content="${index ? 'index,follow' : 'noindex,nofollow'}" />`)
  html = replaceTag(html, /<link rel="canonical" href=".*?"\s*\/>/s, `<link rel="canonical" href="${canonical}" />`)
  html = replaceTag(html, /<meta property="og:title" content=".*?"\s*\/>/s, `<meta property="og:title" content="${escapeHtml(title)}" />`)
  html = replaceTag(html, /<meta property="og:description" content=".*?"\s*\/>/s, `<meta property="og:description" content="${escapeHtml(description)}" />`)
  html = replaceTag(html, /<meta property="og:url" content=".*?"\s*\/>/s, `<meta property="og:url" content="${canonical}" />`)
  const ogImage = `${siteOrigin}/screenshots/vault-overview.png`
  html = replaceTag(html, /<meta property="og:image" content=".*?"\s*\/>/s, `<meta property="og:image" content="${ogImage}" />`)
  html = replaceTag(html, /<meta name="twitter:image" content=".*?"\s*\/>/s, `<meta name="twitter:image" content="${ogImage}" />`)
  if (path !== '/') html = html.replace(/\s*<script id="sesame-structured-data".*?<\/script>/s, '')
  html = replaceTag(html, /<div id="app"><\/div>/, `<div id="app">${rendered.body}</div>`)
  return html
}

const template = await readFile(resolve(outputRoot, 'index.html'), 'utf8')
for (const page of pages) {
  const path = page[0]
  const target = path === '/' ? resolve(outputRoot, 'index.html') : resolve(outputRoot, path.slice(1), 'index.html')
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, renderRoute(template, page), 'utf8')
}

const notFound = renderRoute(template, ['/404', 'Page not found | Sesame', 'The requested Sesame page could not be found.', false])
  .replace(/\s*<script id="sesame-structured-data".*?<\/script>/s, '')
await writeFile(resolve(outputRoot, '404.html'), notFound, 'utf8')

const headersPath = resolve(outputRoot, '_headers')
let headers = await readFile(headersPath, 'utf8')
// With no API, connect-src stays 'self' and the placeholder goes away, so the
// shipped policy never names a host the site does not use.
headers = headers.replace(' __SESAME_API_ORIGIN__', apiOrigin ? ` ${apiOrigin}` : '')
await writeFile(headersPath, headers, 'utf8')

for (const file of ['index.html', '404.html', 'sitemap.xml', 'robots.txt']) {
  const target = resolve(outputRoot, file)
  const content = await readFile(target, 'utf8')
  await writeFile(target, content
    .replaceAll('__SESAME_SITE_ORIGIN__', siteOrigin)
    .replaceAll('__SESAME_PRIVACY_EMAIL__', privacyEmail), 'utf8')
}
