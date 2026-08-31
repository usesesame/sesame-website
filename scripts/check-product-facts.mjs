import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { IMPORT_FORMAT_COUNT } from '../src/lib/product-facts.ts'
import { parseProductRelease, parseProductStatus } from '../src/lib/product-parse.ts'
import { notFoundRoute, routes } from '../src/lib/routes.ts'

const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputRoot = resolve(websiteRoot, 'dist')
const errors = []

const status = parseProductStatus(JSON.parse(await readFile(resolve(websiteRoot, 'src', 'lib', 'product-status.json'), 'utf8')))
if (!status) errors.push('src/lib/product-status.json does not satisfy the canonical status contract')

const release = parseProductRelease(JSON.parse(await readFile(resolve(websiteRoot, 'src', 'lib', 'latest-release.json'), 'utf8')))
if (!release) errors.push('src/lib/latest-release.json does not satisfy the canonical release contract')

const linuxRelease = parseProductRelease(JSON.parse(await readFile(resolve(websiteRoot, 'src', 'lib', 'latest-release-linux.json'), 'utf8')))
if (!linuxRelease) errors.push('src/lib/latest-release-linux.json does not satisfy the canonical release contract')

const paths = routes.map((route) => route.path)
if (new Set(paths).size !== paths.length) errors.push('route paths are not unique')
if (!routes.some((route) => route.path === '/')) errors.push('route table has no home route')

const publicDownload = status?.publicDownload === true

for (const [file, channel] of [['latest-release.json', release], ['latest-release-linux.json', linuxRelease]]) {
  if (channel?.available && channel.url && !publicDownload) {
    errors.push(`${file} offers a download while product-status.json closes the public download`)
  }
}
if (!publicDownload && routes.some((route) => route.description.includes('Free download'))) {
  errors.push('route descriptions promise a free download while the public download is closed')
}

const checked = [...routes, notFoundRoute]
for (const route of checked) {
  const file = route.path === '/' ? resolve(outputRoot, 'index.html') : route.path === '/404' ? resolve(outputRoot, '404.html') : resolve(outputRoot, route.path.slice(1), 'index.html')
  let html
  try {
    html = await readFile(file, 'utf8')
  } catch {
    errors.push(`${route.path}: no built page`)
    continue
  }
  for (const claim of html.match(/\b\d+\s+(?:import|supported)\s+formats\b/g) ?? []) {
    if (!claim.startsWith(`${IMPORT_FORMAT_COUNT} `)) errors.push(`${route.path}: format claim "${claim}" disagrees with IMPORT_FORMAT_COUNT`)
  }
  if (publicDownload && /invite-only/i.test(html)) errors.push(`${route.path}: invite-only claim while the public download is open`)
  if (publicDownload && html.includes('Private beta')) errors.push(`${route.path}: private beta claim while the public download is open`)
  if (!publicDownload && (html.includes('Public beta') || html.includes('Public download available'))) {
    errors.push(`${route.path}: public availability claim while the download is closed`)
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`Product facts checked: ${checked.length} routes against the canonical status.`)
