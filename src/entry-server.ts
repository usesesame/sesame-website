import { render } from 'svelte/server'
import Site from './Site.svelte'
import { homeGraph, ldJson, pricingFaqPage } from './lib/structured-data'
import { productFacts } from './lib/product-facts'
import { routeForPath } from './lib/routes'
import { productState } from './lib/product-state.svelte'
import { privacyEmail, siteOrigin } from './lib/runtime-config'

function structuredDataScript(path: string): string {
  const route = routeForPath(path)
  if (route.key === 'home') {
    return `<script id="sesame-structured-data" type="application/ld+json">${ldJson(homeGraph(siteOrigin, privacyEmail))}</script>`
  }
  if (route.key === 'pricing') {
    return `<script id="sesame-structured-data" type="application/ld+json">${ldJson(pricingFaqPage(productFacts(productState.status)))}</script>`
  }
  return ''
}

export function renderPage(path: string): { head: string; body: string } {
  const result = render(Site, { props: { initialPath: path } })
  return { head: result.head + structuredDataScript(path), body: result.body }
}
