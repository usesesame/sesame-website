import { render } from 'svelte/server'
import Site from './Site.svelte'

export function renderPage(path: string): { head: string; body: string } {
  const result = render(Site, { props: { initialPath: path } })
  return { head: result.head, body: result.body }
}
