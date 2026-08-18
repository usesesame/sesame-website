import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pages } from './seo-pages.mjs'

const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputRoot = resolve(websiteRoot, 'dist')
const errors = []
const siteOrigin = process.env.VITE_SESAME_SITE_ORIGIN?.replace(/\/$/, '')
if (!siteOrigin) throw new Error('VITE_SESAME_SITE_ORIGIN is required for the SEO check.')

for (const [path, title, description, index] of pages) {
  const file = path === '/' ? resolve(outputRoot, 'index.html') : resolve(outputRoot, path.slice(1), 'index.html')
  const html = await readFile(file, 'utf8')
  const canonical = `${siteOrigin}${path}`
  if (!html.includes(`<title>${title.replaceAll('&', '&amp;')}</title>`) && !html.includes(`<title>${title}</title>`)) errors.push(`${path}: title mismatch`)
  if (!html.includes(`content="${description}"`)) errors.push(`${path}: description mismatch`)
  if (!html.includes(`href="${canonical}"`)) errors.push(`${path}: canonical mismatch`)
  if (!html.includes(`content="${index ? 'index,follow' : 'noindex,nofollow'}"`)) errors.push(`${path}: robots mismatch`)
  if (!html.includes(`property="og:image" content="${siteOrigin}/`)) errors.push(`${path}: og:image is missing or not an absolute site URL`)
  // The home graph describes the organisation and the application, so it must
  // not appear anywhere else. /pricing carries its own FAQPage instead.
  if (path !== '/' && html.includes('SoftwareApplication')) errors.push(`${path}: home structured data leaked`)
  if (path === '/pricing' && !html.includes('"@type":"FAQPage"')) errors.push('/pricing: FAQ structured data is missing')
  if (path !== '/' && path !== '/pricing' && html.includes('sesame-structured-data')) errors.push(`${path}: unexpected structured data`)
  if (!html.includes('class="site-header"') || !html.includes('class="site-footer"')) errors.push(`${path}: full page was not prerendered`)
  if (html.includes('class="static-page"') || /<div id="app">\s*<\/div>/.test(html)) errors.push(`${path}: static shim or empty app shell found`)
}

const sitemap = await readFile(resolve(outputRoot, 'sitemap.xml'), 'utf8')
for (const [path, , , index] of pages) {
  const present = sitemap.includes(`<loc>${siteOrigin}${path}</loc>`)
  if (index && !present) errors.push(`${path}: missing from sitemap`)
  if (!index && present) errors.push(`${path}: private route present in sitemap`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`SEO output checked: ${pages.length} routes, sitemap, and robots directives.`)
