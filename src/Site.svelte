<script lang="ts">
  import type { Component } from 'svelte'
  import { watchScroll } from './lib/motion'
  import { routeForPath, type RouteKey } from './lib/routes'
  import { productFacts } from './lib/product-facts'
  import { productState } from './lib/product-state.svelte'
  import { accountUrl, siteHost, siteOrigin } from './lib/runtime-config'
  import { licenceUrl, repositories, sourceOrg } from './lib/source-links'
  import CookiesPage from './pages/CookiesPage.svelte'
  import HomePage from './pages/HomePage.svelte'
  import NotFoundPage from './pages/NotFoundPage.svelte'
  import PricingPage from './pages/PricingPage.svelte'
  import PrivacyPage from './pages/PrivacyPage.svelte'
  import ReleasesPage from './pages/ReleasesPage.svelte'
  import RoadmapPage from './pages/RoadmapPage.svelte'
  import SecurityPage from './pages/SecurityPage.svelte'
  import SupportPage from './pages/SupportPage.svelte'
  import TermsPage from './pages/TermsPage.svelte'

  const { initialPath = '/' } = $props()

  const path = $derived(initialPath.replace(/\/+$/, '') || '/')
  const route = $derived(routeForPath(path))
  const canonicalUrl = $derived(`${siteOrigin}${path === '/' ? '/' : path}`)

  const pages: Record<RouteKey, Component<Record<string, never>, {}, string>> = {
    home: HomePage,
    security: SecurityPage,
    pricing: PricingPage,
    roadmap: RoadmapPage,
    releases: ReleasesPage,
    support: SupportPage,
    privacy: PrivacyPage,
    terms: TermsPage,
    cookies: CookiesPage,
    'not-found': NotFoundPage,
  }
  const Page = $derived(pages[route.key])

  const facts = $derived(productFacts(productState.status))

  const signInUrl = accountUrl('/login')
  const accountHomeUrl = accountUrl('/account')

  let headerScrolled: boolean | null = $state(null)
  $effect(() => watchScroll((scrolled) => { headerScrolled = scrolled }))
</script>

<svelte:head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f6f4ee" />
  <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#16150e" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="manifest" href="/site.webmanifest" />
  <title>{route.title}</title>
  <meta name="description" content={route.description} />
  <meta name="robots" content={route.index ? 'index,follow' : 'noindex,nofollow'} />
  <link rel="canonical" href={canonicalUrl} />
  <meta property="og:site_name" content="Sesame" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={route.title} />
  <meta property="og:description" content={route.description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={`${siteOrigin}/screenshots/vault-overview.png`} />
  <meta property="og:image:alt" content="The Sesame desktop vault showing a login with its sign-in details" />
  <meta property="og:locale" content="en_GB" />
  <meta property="og:image:width" content="1440" />
  <meta property="og:image:height" content="900" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={route.title} />
  <meta name="twitter:description" content={route.description} />
  <meta name="twitter:image" content={`${siteOrigin}/screenshots/vault-overview.png`} />
</svelte:head>

<a class="skip-link" href="#top">Skip to content</a>

<header class="site-header" data-scrolled={headerScrolled === null ? undefined : headerScrolled}>
  <div class="site-header-inner">
    <a class="brand" href="/" aria-label="Sesame home"><img class="brand-mark" src="/favicon.svg" alt="" width="512" height="512" /><strong>Sesame</strong></a>
    <nav aria-label="Main navigation">
      <a href="/" aria-current={route.key === 'home' ? 'page' : undefined}>Product</a>
      <a href="/security" aria-current={route.key === 'security' ? 'page' : undefined}>Security</a>
      <a href="/pricing" aria-current={route.key === 'pricing' ? 'page' : undefined}>Pricing</a>
      <a href="/roadmap" aria-current={route.key === 'roadmap' ? 'page' : undefined}>Roadmap</a>
      <a href="/releases" aria-current={route.key === 'releases' ? 'page' : undefined}>Releases</a>
      <a href="/support" aria-current={route.key === 'support' ? 'page' : undefined}>Support</a>
    </nav>
    <div class="header-account-actions">
      <a class="header-github" href={sourceOrg} rel="noreferrer" aria-label="Sesame source on GitHub" title="Sesame source on GitHub">
        <svg viewBox="0 0 16 16" width="19" height="19" aria-hidden="true" focusable="false" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" /></svg>
      </a>
      {#if signInUrl}<a class="button button-sm" href={signInUrl}>Sign in</a>{/if}
    </div>
  </div>
</header>

<main id="top">
  <Page />
</main>

<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <a class="brand" href="/" aria-label="Sesame home"><img class="brand-mark" src="/favicon.svg" alt="" width="512" height="512" /><strong>Sesame</strong></a>
      <p>Passwords, 2FA, and recovery details for Windows. Open source, and Sesame never receives your vault.</p>
      <p class="footer-status"><span class="dot"></span>{facts.betaLabel} · Windows only</p>
    </div>
    <nav class="footer-col" aria-label="Product">
      <strong>Product</strong>
      <a href="/" aria-current={route.key === 'home' ? 'page' : undefined}>Overview</a>
      <a href="/pricing" aria-current={route.key === 'pricing' ? 'page' : undefined}>Pricing</a>
      <a href="/roadmap" aria-current={route.key === 'roadmap' ? 'page' : undefined}>Roadmap</a>
      <a href="/releases" aria-current={route.key === 'releases' ? 'page' : undefined}>Releases</a>
      <a href="/security" aria-current={route.key === 'security' ? 'page' : undefined}>Security</a>
    </nav>
    <nav class="footer-col" aria-label="Resources">
      <strong>Resources</strong>
      <a href="/support" aria-current={route.key === 'support' ? 'page' : undefined}>Support</a>
      {#if accountHomeUrl}<a href={accountHomeUrl}>Account</a>{/if}
      <a href="/#status">Project status</a>
      <a href="https://status.usesesame.app" rel="noreferrer">Service status</a>
    </nav>
    <nav class="footer-col" aria-label="Source">
      <strong>Source</strong>
      {#each repositories as repo (repo.name)}
        <a href={`${sourceOrg}/${repo.name}`} rel="noreferrer">{repo.name.replace('sesame-', '')}</a>
      {/each}
      <a href={licenceUrl} rel="noreferrer">Licence</a>
    </nav>
    <nav class="footer-col" aria-label="Legal">
      <strong>Legal</strong>
      <a href="/privacy" aria-current={route.key === 'privacy' ? 'page' : undefined}>Privacy</a>
      <a href="/terms" aria-current={route.key === 'terms' ? 'page' : undefined}>Terms</a>
      <a href="/cookies" aria-current={route.key === 'cookies' ? 'page' : undefined}>Cookies</a>
    </nav>
  </div>
  <div class="footer-bottom">
    <span>© 2026 Sesame</span>
    <span class="footer-privacy">AGPL-3.0-or-later · no trackers · no ads</span>
    <span class="footer-domain">{siteHost}</span>
  </div>
</footer>
