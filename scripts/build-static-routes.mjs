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
  html = replaceTag(html, /<meta name="twitter:title" content=".*?"\s*\/>/s, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
  html = replaceTag(html, /<meta name="twitter:description" content=".*?"\s*\/>/s, `<meta name="twitter:description" content="${escapeHtml(description)}" />`)
  if (path === '/pricing') {
    const faq = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        ['What is free?', 'The application, all of it. Vault access, imports, 2FA, security checks, Windows Hello and PIN unlock, backup, restore, export, and recovery. Sesame is AGPL software, so there is no paid edition and no feature held back for one.'],
        ['Then what is the subscription for?', 'Running hosted sync costs money to operate, so Sesame Sync is planned at 1 euro monthly or 10 euros yearly. It syncs ciphertext between your own approved devices. It is not available yet.'],
        ['Can I sync without paying?', 'The sync service is in the server repository under the same licence, so you can run it yourself. It is not enabled for anyone today, hosted or self-hosted, and it stays that way until its security review passes.'],
        ['What happens if I stop paying, or Sesame stops?', 'Your vault is a local file you already have. It opens with your master password, recovery kit, PIN, or Windows Hello, with no account and no server. Losing Sync does not lock a vault.'],
      ].map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    }
    html = html.replace(
      /<script id="sesame-structured-data".*?<\/script>/s,
      `<script id="sesame-structured-data" type="application/ld+json">${JSON.stringify(faq)}</script>`,
    )
  } else if (path !== '/') {
    html = html.replace(/\s*<script id="sesame-structured-data".*?<\/script>/s, '')
  }
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

// A sitemap without lastmod gives a crawler no reason to prefer one page over
// another on a recrawl. The build date is the honest value here: every page is
// rendered from the same source tree in the same run.
const lastmod = new Date().toISOString().slice(0, 10)
const sitemapEntries = pages
  .filter(([, , , index]) => index)
  .map(([path]) => `  <url><loc>${siteOrigin}${path}</loc><lastmod>${lastmod}</lastmod></url>`)
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
