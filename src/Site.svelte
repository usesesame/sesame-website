<script lang="ts">
  import { onMount } from 'svelte'
  import ProductScreenshot from './ProductScreenshot.svelte'
  import SupportPage from './SupportPage.svelte'
  import { LEGAL_UPDATED, LEGAL_VERSION } from './lib/legal'
  import { reveal, watchScroll } from './lib/motion'
  import { getLatestWindowsRelease, getPlans, getProductStatus, REGISTRATION_MODE_LABELS, WINDOWS_BETA_SUPPORT, type ProductPlan, type ProductStatus, type WindowsRelease } from './lib/product'
  import { accountUrl, privacyEmail, siteOrigin } from './lib/runtime-config'
  import rawSitePages from './lib/site-pages.json'

  export let initialPath = '/'

  const sitePages = rawSitePages as Array<[string, string, string, boolean]>
  const routes = sitePages.map(([path]) => path.slice(1)).filter(Boolean)
  const route = initialPath.replace(/\/+$/, '') || '/'
  const page = route === '/' ? 'home' : routes.includes(route.slice(1)) ? route.slice(1) : 'not-found'
  const seo: Record<string, { title: string; description: string; index: boolean }> = Object.fromEntries(
    sitePages.map(([path, title, description, index]) => [path === '/' ? 'home' : path.slice(1), { title, description, index }]),
  )
  seo['not-found'] = { title: 'Page not found | Sesame', description: 'The requested Sesame page could not be found.', index: false }
  const pageSeo = seo[page]
  const canonicalUrl = `${siteOrigin}${page === 'home' ? '/' : route}`
  const siteHost = new URL(siteOrigin).host

  const signInUrl = accountUrl('/login')
  const accountHomeUrl = accountUrl('/account')
  const betaAccessUrl = accountUrl('/support?category=general#new-request')
  const syncInterestUrl = accountUrl('/support?category=billing&intent=sync#new-request')
  let headerScrolled: boolean | null = null

  const sourceOrg = 'https://github.com/usesesame'
  const licenceUrl = `${sourceOrg}/sesame-desktop/blob/main/LICENSE`
  const repositories = [
    { name: 'sesame-desktop', what: 'The Windows app and the Rust vault core that owns every secret.' },
    { name: 'sesame-server', what: 'The vault-blind Go API, the account portal, and the admin interface.' },
    { name: 'sesame-website', what: 'This site. Static, and it reads nothing you cannot see here.' },
    { name: 'sesame-browser-extension', what: 'The Chrome and Edge extension, packaged reproducibly.' },
  ]

  let productStatus: ProductStatus | null = null
  let latestRelease: WindowsRelease | null = null
  const fallbackPlans: ProductPlan[] = [
    { id: 'free', name: 'Sesame', price: '0', billing: 'none', available: true, description: 'The whole app, free and open source under the AGPL.', includes: ['Encrypted vault', '15 import formats', 'Nine record types', '2FA and recovery details', 'Windows Hello and PIN unlock', 'Backup, restore, and export'] },
    { id: 'sync', name: 'Sesame Sync', price: '1.00', annualPrice: '10.00', billing: 'monthly', available: false, description: 'Optional hosted sync between your own approved devices. Not available until its security review passes.', includes: ['Approved devices', 'End-to-end encryption', 'Conflict review', 'Local access if Sync ends', 'Self-host it instead if you prefer'] },
  ]
  let plans = fallbackPlans

  onMount(async () => {
    watchScroll((scrolled) => { headerScrolled = scrolled })

    if (page === 'home') {
      void getProductStatus().then((value) => { productStatus = value })
    }
    if (page === 'home' || page === 'pricing') {
      void getPlans().then((value) => {
        if (value && value.length > 0) plans = value
      })
    }
    if (page === 'releases') {
      void getLatestWindowsRelease().then((value) => { latestRelease = value })
    }
  })

  function priceLabel(plan: ProductPlan) {
    const amount = Number(plan.price)
    return `€${Number.isInteger(amount) ? amount : amount.toFixed(2)}`
  }

  function annualSaving(plan: ProductPlan) {
    return Number(plan.price) * 12 - Number(plan.annualPrice)
  }

</script>

<svelte:head>
  <title>{pageSeo.title}</title>
  <meta name="description" content={pageSeo.description} />
  <meta name="robots" content={pageSeo.index ? 'index,follow' : 'noindex,nofollow'} />
  <link rel="canonical" href={canonicalUrl} />
  <meta property="og:site_name" content="Sesame" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={pageSeo.title} />
  <meta property="og:description" content={pageSeo.description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={`${siteOrigin}/screenshots/vault-overview.png`} />
  <meta property="og:image:width" content="1440" />
  <meta property="og:image:height" content="900" />
  <meta property="og:image:alt" content="The Sesame desktop vault showing a login with its sign-in details" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content={`${siteOrigin}/screenshots/vault-overview.png`} />
</svelte:head>

<header class="site-header" data-scrolled={headerScrolled === null ? undefined : headerScrolled}>
  <div class="site-header-inner">
    <a class="brand" href="/" aria-label="Sesame home"><img class="brand-mark" src="/favicon.svg" alt="" /><strong>Sesame</strong></a>
    <nav aria-label="Main navigation">
      <a href="/" aria-current={page === 'home' ? 'page' : undefined}>Product</a>
      <a href="/security" aria-current={page === 'security' ? 'page' : undefined}>Security</a>
      <a href="/pricing" aria-current={page === 'pricing' ? 'page' : undefined}>Pricing</a>
      <a href="/roadmap" aria-current={page === 'roadmap' ? 'page' : undefined}>Roadmap</a>
      <a href="/releases" aria-current={page === 'releases' ? 'page' : undefined}>Releases</a>
      <a href="/support" aria-current={page === 'support' ? 'page' : undefined}>Support</a>
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
  {#if page === 'home'}
  <section class="hero">
    <div class="hero-copy enter">
      <h1>Your passwords.<br />Your computer.</h1>
      <p class="intro">Import your vault. Keep passwords, 2FA codes, and recovery details together. Sesame never receives your vault, and every line of it is open source.</p>
      <div class="hero-actions">
        {#if productStatus?.publicDownload || !betaAccessUrl}
          <a class="button" href="/releases">Download for Windows</a>
        {:else}
          <a class="button" href={betaAccessUrl}>Request beta access</a>
        {/if}
        <a class="text-link hero-text-link" href="#product">See the product</a>
      </div>
      <p class="availability">
        <span class="dot"></span>
        {#if productStatus?.publicDownload}
          Public download available · <a href="/releases">get Sesame for Windows</a>
        {:else}
          Private beta · Windows 10 and 11
        {/if}
      </p>
    </div>

    <div class="hero-product-shot enter" style="--enter-delay: 120ms">
      <ProductScreenshot src="/screenshots/vault-overview.png" alt="Sesame vault showing a fictional login with password, 2FA, and recovery details" title="Sesame vault" caption="Fictional test data." />
    </div>
  </section>

  <section id="product" class="home-section home-section-product">
    <div class="section home-section-inner">
    <div class="section-title" use:reveal>
      <h2>Everything important in one place.</h2>
      <p class="lede">Passwords, 2FA codes, recovery details, and backups.</p>
    </div>

    <div class="product-workflows">
      <div class="workflow-copy" use:reveal>
        <h3>Move your vault.</h3>
        <p>Import 15 formats. Review every change before saving.</p>
      </div>
      <div class="workflow-shot" use:reveal={90}><ProductScreenshot src="/screenshots/security-checkup.png" alt="Sesame security checkup showing actionable account results" title="Security checkup" caption="Each result links back to the affected login. The screenshot uses test data." /></div>
      <div class="workflow-shot" use:reveal><ProductScreenshot src="/screenshots/vault-overview.png" alt="Sesame desktop vault with a login selected" title="One login, all the sign-in details" caption="Username, password, 2FA, website and optional recovery details stay together." /></div>
      <div class="workflow-copy" use:reveal={90}>
        <h3>Sign in from one view.</h3>
        <p>Copy passwords, read 2FA codes, and find recovery details.</p>
        <p class="workflow-limitation"><strong>Browser extension:</strong> packaged for Chrome and Edge, not submitted to the stores yet.</p>
      </div>
    </div>

    <div class="availability-grid" use:reveal>
      <article><span class="state-badge available">Beta</span><h3>Ready to test</h3><p>Vault, imports, 2FA, checks, Windows Hello and PIN unlock, document attachments, backup, and export.</p></article>
      <article><span class="state-badge gated">Gated</span><h3>Built, waiting on a gate</h3><p>Browser extension, in-app updates, and Sync.</p></article>
      <article><span class="state-badge planned">Planned</span><h3>Coming later</h3><p>Mobile, passkeys, sharing, and emergency access.</p></article>
    </div>
    </div>
  </section>

  <section id="source" class="home-section home-section-source">
    <div class="section home-section-inner">
    <div class="section-title" use:reveal>
      <h2>Read it, build it, run it yourself.</h2>
      <p class="lede">Every surface is AGPL-3.0-or-later. A password manager asks for more trust than most software, so none of it is hidden.</p>
    </div>

    <div class="repo-grid">
      {#each repositories as repo, repoIndex (repo.name)}
        <a class="repo-card" href={`${sourceOrg}/${repo.name}`} rel="noreferrer" use:reveal={repoIndex * 70}>
          <strong>{repo.name}</strong>
          <span>{repo.what}</span>
        </a>
      {/each}
    </div>

    <div class="source-notes" use:reveal>
      <article>
        <h3>Build the app yourself</h3>
        <p>The desktop app builds from source with Node, Rust, and the Windows WebView2 runtime. A vault made by your own build is the same vault.</p>
      </article>
      <article>
        <h3>Host the server yourself</h3>
        <p>The API, account portal, and admin interface run from one repository with PostgreSQL. The desktop app keeps working when none of them are reachable.</p>
      </article>
      <article>
        <h3>Nothing to opt out of</h3>
        <p>This site has no analytics, no advertising, and no third-party scripts. Its Content-Security-Policy ships with the build and you can read it.</p>
      </article>
    </div>
    </div>
  </section>

  <section id="security" class="home-section home-section-security">
    <div class="section home-section-inner">
    <div class="section-title" use:reveal>
      <h2>Your vault never reaches our servers.</h2>
      <p class="lede">Encryption, checks, 2FA, and backups run in the Windows app.</p>
    </div>

    <div class="security-grid">
      <div class="card boundary-card" use:reveal>
        <ul class="boundary-list">
          <li><span>Vault file</span><strong class="on-device">Your device</strong></li>
          <li><span>Master password or unlock secret</span><strong class="on-device">Your device</strong></li>
          <li><span>Imported password-manager export</span><strong class="on-device">Your device</strong></li>
          <li><span>Website account email and password hash</span><strong class="on-server">Sesame website</strong></li>
          <li><span>Product and release information</span><strong class="on-server">Sesame website</strong></li>
        </ul>
      </div>

      <aside class="card caveat-card" use:reveal={90}>
        <span class="caveat-badge">Current limitation</span>
        <p>Independent review is still pending. Use test data and keep an encrypted backup.</p>
      </aside>
    </div>
    </div>
  </section>

  <section id="status" class="home-section home-section-status">
    <div class="section home-section-inner">
    <div class="status-card card" use:reveal>
      <div class="status-head">
        <h2><span class="dot"></span>Private beta.</h2>
      </div>
      <div class="status-copy">
        <p>Invited testers are checking the Windows app now.{#if betaAccessUrl} <a href={betaAccessUrl}>Request beta access</a>.{/if} No payment is taken.</p>
        <dl>
          <div><dt>Public download</dt><dd>{productStatus?.publicDownload ? 'Available' : 'Not available'}</dd></div>
          <div><dt>Supported platform</dt><dd>{productStatus?.platforms?.join(', ') || 'Windows'}</dd></div>
          <div><dt>Website account</dt><dd>{productStatus?.webSignInAvailable ? 'Optional' : 'Not required'}</dd></div>
          <div><dt>Sesame Sync</dt><dd>{productStatus?.cloudSyncAvailable ? 'Available' : 'Not available'}</dd></div>
          {#if productStatus?.registrationMode}
            <div><dt>Account registration</dt><dd>{REGISTRATION_MODE_LABELS[productStatus.registrationMode]}</dd></div>
          {/if}
          <div><dt>Browser extension</dt><dd>Packaged, not submitted</dd></div>
        </dl>
        {#if productStatus?.accountPurposes?.length}
          <p class="status-purposes">A website account covers {productStatus.accountPurposes.join(', ')}. It never holds a vault.</p>
        {/if}
      </div>
    </div>
    </div>
  </section>
  {:else if page === 'security'}
    <section class="page-hero">
      <h1>What Sesame handles, and what it does not.</h1>
      <p class="intro">The desktop application is the only Sesame product that handles vault contents. The website and API publish product information and release metadata.</p>
    </section>

    <section class="section document-section">
      <div class="document-nav" aria-label="On this page">
        <strong>On this page</strong>
        <a href="#boundary">Product boundary</a>
        <a href="#local">Local vault</a>
        <a href="#service">Website and API</a>
        <a href="#source">Open source</a>
        <a href="#limitations">Current limitations</a>
      </div>
      <article class="document-copy">
        <div id="boundary"><h2>The vault stays with the desktop app.</h2><p>Vault creation, unlocking, encryption, import, TOTP generation, password checks, backups, restore, export, and deletion run locally. Opening a local vault does not depend on a Sesame account or service.</p></div>
        <div id="local"><h2>Data kept on your device</h2><p>Vault content is encrypted and authenticated with XChaCha20-Poly1305. Argon2id derives the wrapping key from your master password, from a separately generated recovery kit, and, if you enable it, from a PIN combined with a random value stored under Windows DPAPI. Each of these unlock methods wraps the same vault key independently, so the vault file itself holds only ciphertext, never a password or a recovery kit. Windows Hello, when you turn it on, adds a further wrap: the vault key is sealed to a device key held in the Windows Passport key store, which releases it only after a fresh Hello gesture. Sesame sees that gesture succeed or fail and never receives biometric data.</p><ul><li>Vault contents, encrypted vault files, and document attachments</li><li>Master passwords, derived keys, and recovery material</li><li>Imported password-manager and browser exports, in 15 supported formats</li><li>TOTP seeds, backup codes, and recovery notes</li></ul></div>
        <div id="service"><h2>Data handled by the website and API</h2><p>The service publishes product information and release metadata. It also holds a separate website account: an email address, a password hash, and a revocable session. It has no vault endpoint and will not accept vault fields, imports, or vault credentials.</p><p>A future Sync service may retain encrypted opaque records and limited routing metadata. It is not enabled in this beta. The browser extension is built and packaged for Chrome and Edge but is not published in either store, and it needs the signed native host that ships with a desktop installer. Filling a form requires a user action in the extension and an approval from the unlocked desktop app; the extension stores no credential and never submits the page.</p></div>
        <div id="source"><h2>You do not have to take our word for this</h2><p>Every claim on this page describes code you can read. Sesame is published under the <a href={licenceUrl} rel="noreferrer">GNU Affero General Public License v3.0 or later</a>: the Windows app and the Rust vault core, the vault-blind API, the account and administration portals, this website, and the browser extension. The encryption and key handling described above live in the vault core, so the design and the shipped behaviour can be compared rather than trusted.</p><p>The browser extension's store archives are reproducible. The same commit and Node version produce the same SHA-256 digests, and those digests are published beside the packages, so an upload can be checked against the source it claims to come from.</p><p>The AGPL also binds a hosted deployment: anyone who runs a modified Sesame service has to offer its corresponding source. The Sesame name and artwork are handled separately by the trademark policy, which is what stops a modified build from presenting itself as official.</p></div>
        <div id="limitations"><h2>Current limitations</h2><p>Sesame has not completed an independent security review. Website accounts are for invited beta access and release management; they do not store vault data. Public artifacts, automatic updates, the browser helper, and Sync remain unavailable.</p></div>
      </article>
    </section>
  {:else if page === 'pricing'}
    <section class="page-hero compact-page-hero">
      <h1>The app is free.</h1>
      <p class="intro">Sesame is open source software and there is no paid version of it. One optional subscription exists, for hosted sync, and you can run that yourself instead.</p>
    </section>
    <section class="section pricing-page">
      <div class="pricing-promise" use:reveal>
        <strong>Private-beta pricing preview</strong>
        <p>Nothing is for sale today. Registering interest does not reserve a charge or create a purchase obligation.</p>
      </div>
      <div class="price-grid">
        {#each plans as plan, planIndex (plan.id ?? plan.name)}
          <article class="card price-card" class:featured={plan.id === 'free'} use:reveal={planIndex * 80}>
            <p class="price-name">{plan.name} <span class="price-tag" class:current={plan.id === 'free'}>{plan.id === 'free' ? 'Free forever' : 'Planned'}</span></p>
            {#if plan.id === 'sync' && plan.annualPrice}
              <div class="sync-price-options">
                <p class="price-value">{priceLabel(plan)} <span>monthly</span></p>
                <p class="price-value annual"><strong>€{Number(plan.annualPrice).toFixed(0)}</strong> <span>yearly</span>{#if annualSaving(plan) > 0}<small>Save €{annualSaving(plan).toFixed(0)}</small>{/if}</p>
              </div>
            {:else}
              <p class="price-value">{priceLabel(plan)} {#if plan.billing === 'one_time'}<span>once</span>{:else if plan.billing === 'monthly'}<span>monthly</span>{:else if plan.billing === 'yearly'}<span>yearly</span>{/if}</p>
            {/if}
            <p class="price-desc">{plan.description}</p>
            {#if plan.includes?.length}
              <ul class="price-includes">{#each plan.includes as item}<li>{item}</li>{/each}</ul>
            {/if}
            {#if plan.id === 'free'}
              <a class="button button-soft price-cta" href="/#product">See what it does</a>
            {:else if syncInterestUrl}
              <a class="button button-soft price-cta" href={syncInterestUrl}>Register Sync interest</a>
            {:else}
              <a class="button button-soft price-cta" href="/roadmap#sync">Read the Sync gate</a>
            {/if}
          </article>
        {/each}
      </div>
      <p class="pricing-note">Nothing is charged today. Final tax, refund, and support terms will appear before checkout opens.</p>

      <div class="faq-block" use:reveal>
        <h2>Before you choose</h2>
        <details><summary>What is free?</summary><p>The application, all of it. Vault access, imports, 2FA, security checks, Windows Hello and PIN unlock, backup, restore, export, and recovery. Sesame is AGPL software, so there is no paid edition and no feature held back for one.</p></details>
        <details><summary>Then what is the subscription for?</summary><p>Running hosted sync costs money to operate, so Sesame Sync is planned at €1 monthly or €10 yearly. It syncs ciphertext between your own approved devices. It is not available yet.</p></details>
        <details><summary>Can I sync without paying?</summary><p>The sync service is in the server repository under the same licence, so you can run it yourself. It is not enabled for anyone today, hosted or self-hosted, and it stays that way until its security review passes.</p></details>
        <details><summary>What happens if I stop paying, or Sesame stops?</summary><p>Your vault is a local file you already have. It opens with your master password, recovery kit, PIN, or Windows Hello, with no account and no server. Losing Sync does not lock a vault.</p></details>
        <details><summary>Can I buy now?</summary><p>No. Sesame is an invite-only Windows beta and nothing is for sale.{#if syncInterestUrl} You can <a href={syncInterestUrl}>register interest in Sync</a> without committing to anything.{/if}</p></details>
      </div>
    </section>
  {:else if page === 'roadmap'}
    <section class="page-hero compact-page-hero">
      <h1>Building the parts around the vault carefully.</h1>
      <p class="intro">The local vault is the product, and it is free software. Website accounts, encrypted Sync, and browser help are separate systems with their own release gates.</p>
    </section>
    <section class="section document-section roadmap-section">
      <div class="document-nav" aria-label="On this page">
        <strong>On this page</strong>
        <a href="#today">Today</a>
        <a href="#sync">Sesame Sync</a>
        <a href="#browser">Browser extension</a>
        <a href="#payment">Payment</a>
      </div>
      <article class="document-copy">
        <div id="today"><h2>The Windows app owns the vault.</h2><p>Vault creation, unlocking, search, TOTP, imports, checks, backups, restore, export, and deletion run in the desktop app. A Sesame account is optional and does not unlock or identify a vault.</p></div>
        <div id="sync"><h2>Sesame Sync</h2><p>The ciphertext-only protocol is built. A new device is approved by an existing one, which seals the vault key to it; encrypted changes are signed by the device that made them; and concurrent edits stop for review rather than silently discarding data.</p><p><strong>Not available:</strong> no desktop vault uploads to Sesame today. None of it is reachable in a released build, and the service will not be opened until an independent review of the protocol, key handling, and recovery paths is complete.</p></div>
        <div id="browser"><h2>Browser extension</h2><p>The extension uses native messaging rather than a local server. It detects supported sign-in fields, handles multi-step and single-page sign-in flows, and fills only after a user action and desktop approval. It never submits the page and never writes a credential to extension storage. The inline field control is optional, stays off until you grant host permission, and can be paused per origin or revoked at any time.</p><p>Reproducible Chrome and Edge upload archives build today with recorded digests and a fixed extension identity the native host manifest must match. Before release it still needs store submission, a signed desktop installer that registers, upgrades, and removes the native host, clean-profile install and removal verification, and the automated test suite that is currently being rewritten.</p></div>
        <div id="payment"><h2>Payment</h2><p>Sesame Sync is planned at EUR 1 monthly or EUR 10 yearly, and it is the only thing Sesame intends to charge for. There is no paid edition of the application: it is AGPL software, and a feature will not be moved behind a payment.</p><p>Payment can gate new hosted syncing activity, and nothing else. It can never gate local vault access, unlocking, backup, export, or recovery. Because the sync service is published under the same licence, paying Sesame to host it is a convenience, not the only route to it.</p></div>
      </article>
    </section>
  {:else if page === 'releases'}
    <section class="page-hero compact-page-hero">
      <h1>Windows builds.</h1>
      <p class="intro">Only releases listed here are official. Every downloadable installer must have a signature, SHA-256 hash, compatibility note, and release record.</p>
    </section>

    <section class="section release-section">
      <div class="release-status card">
        <div><span class="dot"></span><div><strong>{latestRelease?.version ? `Sesame ${latestRelease.version}` : 'Private beta'}</strong><small>{latestRelease?.message || 'Internal verification in progress'}</small></div></div>
        {#if latestRelease?.available && latestRelease.url && latestRelease.signed}
          <a class="button button-sm" href={latestRelease.url}>Download for Windows</a>
        {:else}
          <span class="release-unavailable">No public artifact</span>
        {/if}
      </div>
      {#if latestRelease?.available}
        <div class="release-detail-grid">
          <section class="release-detail"><h2>Installers and hashes</h2>
            {#if latestRelease.artifacts?.length}
              <div class="artifact-list">{#each latestRelease.artifacts as artifact (artifact.name)}<article><div><strong>{artifact.name}</strong><span>{artifact.format.toUpperCase()} · {artifact.signed ? 'Tauri updater signature verified' : 'Do not install: updater signature unavailable'}</span><code>{artifact.sha256}</code></div>{#if artifact.signed}<a class="button button-sm" href={artifact.url}>Download</a>{/if}</article>{/each}</div>
            {:else if latestRelease.sha256}
              <div class="release-checksum"><span>SHA-256</span><code>{latestRelease.sha256}</code></div>
            {:else}<p>Artifact metadata is incomplete. Download is withheld.</p>{/if}
          </section>
          <section class="release-detail"><h2>Release notes</h2>{#if latestRelease.releaseNotes?.length}<ul>{#each latestRelease.releaseNotes as note (note)}<li>{note}</li>{/each}</ul>{:else if latestRelease.releaseNotesUrl}<p><a class="text-link" href={latestRelease.releaseNotesUrl}>Read the release notes</a></p>{:else}<p>No release notes were published for this build.</p>{/if}</section>
        </div>
        <aside class="rollback-notice"><strong>Rollback notice</strong><p>{latestRelease.rollbackNotice || 'No rollback notice is active for this release.'}</p></aside>
      {:else}
        <div class="release-requirements"><h2>Nothing to download yet</h2><p>The distribution gate is still closed. Invited testers see eligible private-beta builds in their account; there is no public artifact.</p></div>
      {/if}
      <div class="release-requirements compatibility-notes">
        <h2>Beta compatibility</h2>
        <dl><div><dt>Supported and tested</dt><dd>{latestRelease?.supportedWindows?.join(', ') || WINDOWS_BETA_SUPPORT.supported.join(', ')}</dd></div><div><dt>Architecture</dt><dd>{WINDOWS_BETA_SUPPORT.testedArchitectures.join(', ')}</dd></div><div><dt>Not supported</dt><dd>{WINDOWS_BETA_SUPPORT.unsupported.join(', ')}</dd></div></dl>
        <p>{WINDOWS_BETA_SUPPORT.note}</p>
      </div>
      <div class="release-requirements"><h2>Release gate</h2><ol><li>The NSIS updater artifact has a valid Tauri signature and Sigstore evidence for Sesame's exact protected tag workflow.</li><li>Published SHA-256 hashes match the tested files. Early-access installers are not Authenticode-signed and can trigger an unknown-publisher warning; production releases require Authenticode.</li><li>A clean supported Windows profile passes install, unlock, import, backup, restore, export, uninstall, and in-app upgrade checks.</li><li>Release-blocking security findings are resolved.</li></ol></div>
      <p class="release-warning">Do not install Sesame builds from an unofficial mirror or attachment. Private-beta installers may be unsigned in Windows; verify the account-gated SHA-256 and updater status instead.</p>
    </section>
  {:else if page === 'support'}
    <SupportPage />
  {:else if page === 'privacy'}
    <section class="page-hero compact-page-hero legal-hero">
      <h1>Privacy policy.</h1>
      <p class="intro">Sesame is designed so your vault never reaches our servers. This policy explains the limited data the website and account service process, and the rights you have under the GDPR, UK GDPR, and similar laws.</p>
      <p class="page-meta">Version {LEGAL_VERSION} · Updated {LEGAL_UPDATED} · Applies to {siteHost} and the Sesame website account</p>
    </section>
    <section class="section document-section">
      <div class="document-nav" aria-label="On this page">
        <strong>On this page</strong>
        <a href="#controller">Who we are</a>
        <a href="#data">Data we process</a>
        <a href="#basis">Purposes &amp; legal bases</a>
        <a href="#retention">Retention &amp; recipients</a>
        <a href="#transfers">International transfers</a>
        <a href="#rights">Your rights</a>
        <a href="#contact">Contact &amp; changes</a>
      </div>
      <article class="document-copy">
        <div id="controller"><h2>Who is responsible</h2><p>Sesame operates the desktop application and the website at {siteHost}. For the optional website account, Sesame is the data controller. Privacy requests can be sent to <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>. The public beta remains invite-only; its operator identity and postal contact must be supplied in every invitation before the service is opened to the public.</p></div>
        <div id="data"><h2>What we process</h2><p>The desktop app keeps vault entries, unlock material, imported exports, TOTP seeds, backup codes, and recovery notes on your device. The website and account API are not built to receive them. If you create an invited website account, the account service processes:</p><ul><li><strong>Account data:</strong> email address, verification state, a salted password hash, and the Terms and Privacy Policy versions recorded when the account was created.</li><li><strong>Access data:</strong> beta eligibility, licence records, private-beta download eligibility, and connected-desktop identifiers.</li><li><strong>Session and security data:</strong> session, CSRF, and temporary passkey-ceremony tokens; session timestamps; and short-lived rate-limit data derived from network information.</li><li><strong>Support data:</strong> text you deliberately submit through the attachment-free support form. The form rejects likely secrets before sending.</li></ul><p>We do not use advertising, behavioural analytics, profiling, session replay, or third-party trackers. We do not sell or rent personal data.</p></div>
        <div id="basis"><h2>Why we process it</h2><p>For EEA and UK users, the account service relies on <strong>contract</strong> to provide the account, beta access, private-beta download eligibility, sessions, desktop connections, and recovery; and <strong>legitimate interests</strong> to prevent abuse, protect the service, and respond to a support request. Agreeing to the Terms is required to create the account; acknowledging this policy is not permission for marketing or tracking. The local desktop vault does not require a website account.</p></div>
        <div id="retention"><h2>Retention and recipients</h2><p>Account records remain until you ask for deletion or the beta is closed. Website sessions last up to 30 days unless revoked or signed out sooner. The CSRF token lasts up to one hour and a passkey ceremony token lasts up to ten minutes. Support reports have no automatic expiry in this beta; do not put sensitive information in them and request deletion by email when it is no longer needed. Sesame does not currently operate analytics or advertising processors. Before any public launch, Sesame will publish the hosting and other processor details that apply to the deployed service.</p></div>
        <div id="transfers"><h2>International transfers</h2><p>The private beta is not offered as a public service. If Sesame later uses a processor outside the EEA or UK, the public policy will name the processor and describe the applicable transfer safeguard before that processing begins.</p></div>
        <div id="rights"><h2>Your rights</h2><p>Subject to applicable law, you may request <strong>access</strong>, <strong>rectification</strong>, <strong>erasure</strong>, <strong>restriction</strong>, and <strong>portability</strong> of your data, and <strong>object</strong> to processing based on legitimate interests. Email <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a> to exercise these rights. You may also complain to your local data-protection authority. Sesame aims to respond within one month where the GDPR applies.</p></div>
        <div id="contact"><h2>Contact and changes</h2><p>Privacy questions and requests: <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a> or the <a href="/support">support page</a>. We will publish a new version and highlight material changes before applying them to existing website accounts.</p><p class="doc-meta">Version {LEGAL_VERSION} · Updated {LEGAL_UPDATED}.</p></div>
      </article>
    </section>
  {:else if page === 'terms'}
    <section class="page-hero compact-page-hero legal-hero">
      <h1>Terms of use.</h1>
      <p class="intro">These terms govern your use of the Sesame website and the private-beta application. By using them, you agree to what follows.</p>
      <p class="page-meta">Version {LEGAL_VERSION} · Updated {LEGAL_UPDATED}</p>
    </section>
    <section class="section document-section">
      <div class="document-nav" aria-label="On this page">
        <strong>On this page</strong>
        <a href="#accept">Acceptance</a>
        <a href="#beta">Beta &amp; warranty</a>
        <a href="#accounts">Accounts &amp; use</a>
        <a href="#licence">Licence &amp; IP</a>
        <a href="#liability">Liability</a>
        <a href="#law">Termination &amp; law</a>
      </div>
      <article class="document-copy">
        <div id="accept"><h2>Acceptance</h2><p>Creating a Sesame website account requires you to agree to these Terms of Use and acknowledge the <a href="/privacy">Privacy Policy</a>. The account service records this document version and the server time of that action. If you do not agree, do not create an account or use an invite-only beta build.</p></div>
        <div id="beta"><h2>Beta and backups</h2><p>Sesame is an invite-only private beta. It has not completed an independent security review and may change, fail, or be withdrawn. Use test or non-critical data until the release gate is open, keep an independent encrypted backup, and do not rely on Sesame as your only recovery path.</p></div>
        <div id="accounts"><h2>Accounts and acceptable use</h2><p>A website account manages beta eligibility, private-beta download access, licence records, sessions, and connected desktop devices. It is not a vault account: do not enter a vault password, recovery kit, backup code, TOTP seed, or vault export on the website. Keep your account credentials secure and use Sesame only lawfully and for accounts you are authorised to use.</p></div>
        <div id="licence"><h2>Licence and intellectual property</h2><p>The Sesame software is free software under the GNU Affero General Public License v3.0 or later. Your rights to use, study, modify, and share it come from that licence, and nothing in these terms reduces them. These terms govern this website and the hosted account service, not your use of the source.</p><p>Two things sit outside the licence. Private beta builds are distributed to invited testers and should not be redistributed while the release gate is closed, because they carry no Authenticode signature and cannot be verified by the people who would receive them. Separately, the Sesame name, logo, and publisher identity are not granted by the AGPL: a modified build or a modified hosted service must use its own product name and identity, which is what keeps "Sesame" meaning this project. Truthful compatibility statements remain fine.</p></div>
        <div id="liability"><h2>Liability</h2><p>To the extent allowed by applicable law, Sesame is not responsible for indirect or consequential loss, or loss caused by using an unfinished beta without an independent backup. Nothing in these Terms excludes rights or liability that cannot lawfully be excluded, including mandatory consumer protections.</p></div>
        <div id="law"><h2>Ending access and applicable law</h2><p>Sesame may suspend beta access where these Terms are breached, a security risk requires it, or the beta closes. The law and court information for any public launch will be supplied with the named operator details. Mandatory protections in your country of residence still apply. Contact <a href="/support">support</a> with questions.</p><p class="doc-meta">Version {LEGAL_VERSION} · Updated {LEGAL_UPDATED}.</p></div>
      </article>
    </section>
  {:else if page === 'cookies'}
    <section class="page-hero compact-page-hero legal-hero">
      <h1>Cookie policy.</h1>
      <p class="intro">Sesame uses security cookies only when you use an account action that needs them. It does not use analytics, advertising, or third-party tracking cookies.</p>
      <p class="page-meta">Version {LEGAL_VERSION} · Updated {LEGAL_UPDATED} · Part of our <a href="/privacy">privacy policy</a></p>
    </section>
    <section class="section document-section">
      <div class="document-nav" aria-label="On this page">
        <strong>On this page</strong>
        <a href="#about">About cookies</a>
        <a href="#used">Cookies we use</a>
        <a href="#consent">Consent &amp; legal basis</a>
        <a href="#manage">Managing cookies</a>
      </div>
      <article class="document-copy">
        <div id="about"><h2>About cookies</h2><p>Cookies are small files a website stores in your browser. Sesame uses only security and sign-in cookies that are necessary for an account action you request. Public product pages do not set them. Because there are no optional cookies, Sesame does not show a consent banner or save a cookie-banner preference.</p></div>
        <div id="used"><h2>Cookies we use</h2>
          <div class="cookie-table" role="table" aria-label="Cookies Sesame uses">
            <div class="cookie-row cookie-head" role="row"><span role="columnheader">Name</span><span role="columnheader">Purpose</span><span role="columnheader">Type</span><span role="columnheader">Duration</span></div>
            <div class="cookie-row" role="row"><span role="cell"><code>sesame_csrf</code></span><span role="cell">Protects a sign-in, registration, recovery, support, or account change request from cross-site request forgery</span><span role="cell">Strictly necessary, first-party, HttpOnly</span><span role="cell">Up to 1 hour</span></div>
            <div class="cookie-row" role="row"><span role="cell"><code>sesame_session</code></span><span role="cell">Keeps you signed in to a website account</span><span role="cell">Strictly necessary, first-party, HttpOnly</span><span role="cell">Up to 30 days; cleared on sign out</span></div>
            <div class="cookie-row" role="row"><span role="cell"><code>sesame_wan</code></span><span role="cell">Binds a temporary passkey ceremony to the browser that started it</span><span role="cell">Strictly necessary, first-party, HttpOnly</span><span role="cell">Up to 10 minutes; cleared after use</span></div>
          </div>
          <p>These are first-party cookies. They are sent with <code>Secure</code> on HTTPS and use a restrictive same-site setting. The account API does not use them for analytics or advertising.</p>
        </div>
        <div id="consent"><h2>Consent and choices</h2><p>These cookies are limited to the account action you requested and are not used for tracking. If Sesame adds a non-essential cookie or similar browser storage, it will request opt-in consent before setting it and provide an equally clear way to withdraw it.</p></div>
        <div id="manage"><h2>Managing cookies</h2><p>You can delete or block these cookies in your browser settings. Doing so can prevent sign-in, passkey use, account changes, or support submissions from working, but it does not affect the desktop app or a local vault.</p><p class="doc-meta">Version {LEGAL_VERSION} · Updated {LEGAL_UPDATED}.</p></div>
      </article>
    </section>
  {:else}
    <section class="page-hero compact-page-hero not-found-page">
      <h1>Page not found.</h1>
      <p class="intro">The address may be old or incomplete.</p>
      <a class="button" href="/">Return to Sesame</a>
    </section>
  {/if}
</main>

<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <a class="brand" href="/" aria-label="Sesame home"><img class="brand-mark" src="/favicon.svg" alt="" /><strong>Sesame</strong></a>
      <p>Passwords, 2FA, and recovery details for Windows. Open source, and Sesame never receives your vault.</p>
      <p class="footer-status"><span class="dot"></span>Private beta · Windows only</p>
    </div>
    <nav class="footer-col" aria-label="Product">
      <strong>Product</strong>
      <a href="/" aria-current={page === 'home' ? 'page' : undefined}>Overview</a>
      <a href="/pricing" aria-current={page === 'pricing' ? 'page' : undefined}>Pricing</a>
      <a href="/roadmap" aria-current={page === 'roadmap' ? 'page' : undefined}>Roadmap</a>
      <a href="/releases" aria-current={page === 'releases' ? 'page' : undefined}>Releases</a>
      <a href="/security" aria-current={page === 'security' ? 'page' : undefined}>Security</a>
    </nav>
    <nav class="footer-col" aria-label="Resources">
      <strong>Resources</strong>
      <a href="/support" aria-current={page === 'support' ? 'page' : undefined}>Support</a>
      {#if accountHomeUrl}<a href={accountHomeUrl}>Account</a>{/if}
      <a href="/#status">Project status</a>
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
      <a href="/privacy" aria-current={page === 'privacy' ? 'page' : undefined}>Privacy</a>
      <a href="/terms" aria-current={page === 'terms' ? 'page' : undefined}>Terms</a>
      <a href="/cookies" aria-current={page === 'cookies' ? 'page' : undefined}>Cookies</a>
    </nav>
  </div>
  <div class="footer-bottom">
    <span>© 2026 Sesame</span>
    <span class="footer-privacy">AGPL-3.0-or-later · no trackers · no ads</span>
    <span class="footer-domain">{siteHost}</span>
  </div>
</footer>
