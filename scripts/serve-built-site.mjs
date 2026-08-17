import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, extname, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const port = Number(process.env.PORT || 4173)
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
}

function fileFor(pathname) {
  const decoded = decodeURIComponent(pathname).replaceAll('\\', '/')
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '')
  const candidates = [relative]
  if (!extname(relative)) candidates.unshift(`${relative.replace(/\/$/, '')}/index.html`)

  for (const candidate of candidates) {
    const absolute = resolve(root, candidate)
    if (!absolute.startsWith(`${root}${sep}`) && absolute !== root) continue
    if (existsSync(absolute) && statSync(absolute).isFile()) return absolute
  }
  return resolve(root, '404.html')
}

export async function startBuiltSite(listenPort = port) {
  const server = createServer((request, response) => {
    try {
      const pathname = new URL(request.url || '/', `http://${request.headers.host || '127.0.0.1'}`).pathname
      const file = fileFor(pathname)
      const notFound = file.endsWith(`${sep}404.html`)
      response.writeHead(notFound ? 404 : 200, {
        'Content-Type': contentTypes[extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      })
      createReadStream(file).pipe(response)
    } catch {
      response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('Bad request')
    }
  })

  await new Promise((resolveListen, reject) => {
    server.once('error', reject)
    server.listen(listenPort, '127.0.0.1', resolveListen)
  })
  return server
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const server = await startBuiltSite()
  process.stdout.write(`Sesame test site listening on http://127.0.0.1:${port}\n`)
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.closeAllConnections?.()
      server.close(() => process.exit(0))
      setTimeout(() => process.exit(0), 1_000).unref()
    })
  }
}
