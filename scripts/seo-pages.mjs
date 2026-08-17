import { readFile } from 'node:fs/promises'

export const pages = JSON.parse(await readFile(new URL('../src/lib/site-pages.json', import.meta.url), 'utf8'))
