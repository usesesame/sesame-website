<script lang="ts">
  import { onMount } from 'svelte'
  import FeatureTour from '../FeatureTour.svelte'
  import PlatformIcon from '../PlatformIcon.svelte'
  import ProductPicture from '../ProductPicture.svelte'
  import { chromeExtensionNeeds, extensionState } from '../lib/extension.svelte'
  import { glideTo, stopGlideOnInput } from '../lib/glide'
  import { productFacts } from '../lib/product-facts'
  import { loadExtensions, loadLatestRelease, loadStatus, productState } from '../lib/product-state.svelte'
  import { countedLabel, loadProjectActivity, projectActivity } from '../lib/project-activity.svelte'
  import { releaseSentence, summarizeRelease } from '../lib/release-summary'
  import { accountUrl } from '../lib/runtime-config'
  import { licenceUrl, sourceOrg } from '../lib/source-links'

  const facts = $derived(productFacts(productState.status))
  const release = $derived(productState.release)
  const summaries = $derived([
    summarizeRelease({ release: productState.release, live: productState.releaseLive.windows }, 'Windows'),
    summarizeRelease({ release: productState.linuxRelease, live: productState.releaseLive.linux }, 'Linux'),
  ].filter((summary) => summary !== null))
  const releaseLine = $derived(releaseSentence(summaries))
  const releaseNotesUrl = $derived(summaries.find((summary) => summary.releaseNotesUrl)?.releaseNotesUrl)

  const features = [
    {
      key: 'import',
      title: 'Bring your logins',
      detail: 'Choose the export from your old password manager. Sesame reads it on your computer, shows a preview, and saves only what you choose. Nothing is uploaded.',
      shot: 'stage-import',
      alt: 'The Sesame import dialog over the vault, with Bitwarden CSV selected',
    },
    {
      key: 'search',
      title: 'Find and copy',
      detail: 'Search matches titles, sites, usernames, email addresses, notes, tags, and folders. It never matches a password, so typing a guess cannot confirm one. A copied password clears from the clipboard after 30 seconds by default.',
      shot: 'stage-search',
      alt: 'A search for git in Sesame, with the fictional GitHub login open and flagged for a missing 2FA code',
    },
    {
      key: 'check',
      title: 'Fix weak passwords',
      detail: 'The security check finds weak, reused, and old passwords, logins without a 2FA code, and recovery details you have not reviewed. It runs on your computer, and for each finding it offers the next step.',
      shot: 'stage-weak',
      alt: 'A weak password finding for a fictional Notion login, with a password score and a button to change it on the site',
    },
    {
      key: 'backups',
      title: 'Keep your own backups',
      detail: 'Export an encrypted backup to any folder or drive. A recovery drill opens a backup without changing your vault, and a restore keeps a safety copy of the current vault first.',
      shot: 'stage-backups',
      alt: 'The Sesame backups screen with export, recovery drill, and restore actions',
    },
  ]

  const windowsVersions = $derived(release?.supportedWindows?.length ? release.supportedWindows.join(' and ').replace('Windows 10 and Windows 11', 'Windows 10 and 11') : 'Windows 10 and 11')

  const notShipped = $derived(new Intl.ListFormat('en', { type: 'disjunction' }).format([...(facts.syncAvailable ? [] : ['hosted Sync']), 'mobile apps', 'passkeys', 'sharing', 'emergency access']))
  const importGroups = [
    { key: 'managers', title: 'Password managers', names: ['Bitwarden CSV and JSON', '1Password', 'LastPass', 'Dashlane', 'KeePass', 'Keeper', 'NordPass', 'Proton Pass'] },
    { key: 'browsers', title: 'Browsers', names: ['Google Chrome', 'Microsoft Edge', 'Brave', 'Firefox', 'Google Password Manager', 'Apple Passwords'] },
    { key: 'authenticators', title: '2FA apps', names: ['Aegis', '2FAS', 'otpauth link lists'] },
  ]
  const betaAccessUrl = accountUrl('/support?category=general#new-request')

  const recentCommits = $derived(projectActivity.current.repositories.reduce((total, entry) => total + entry.recentCommits, 0))

  const extension = $derived(extensionState())

  const slides = [
    { id: 'intro', label: 'Introduction' },
    { id: 'product', label: 'How Sesame works' },
    { id: 'switch', label: 'Imports' },
    { id: 'security', label: 'Where your data lives' },
    { id: 'download', label: 'Download' },
  ]
  let activeSlide = $state('intro')
  function glideToSlide(event: MouseEvent, id: string) {
    const target = document.getElementById(id)
    if (!target) return
    event.preventDefault()
    history.replaceState(null, '', `#${id}`)
    glideTo(Math.max(0, target.getBoundingClientRect().top + window.scrollY - 68))
    if (event.detail === 0) {
      target.tabIndex = -1
      target.focus({ preventScroll: true })
    }
  }

  onMount(() => {
    void loadStatus()
    void loadLatestRelease()
    void loadProjectActivity()
    void loadExtensions()
  })

  onMount(() => {
    let queued = false
    const update = () => {
      queued = false
      const line = window.innerHeight * 0.4
      let current = slides[0].id
      for (const slide of slides) {
        const element = document.getElementById(slide.id)
        if (element && element.getBoundingClientRect().top - 68 <= line) current = slide.id
      }
      activeSlide = current
    }
    const onScroll = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    const stopInput = stopGlideOnInput()
    return () => {
      window.removeEventListener('scroll', onScroll)
      stopInput()
    }
  })
</script>

<section id="intro" class="hero">
  <div class="hero-copy">
    <h1>A password manager that works without an account.</h1>
    <p class="intro">Your vault is a file on your computer. Sesame unlocks it, searches it, and copies from it with no account and no network connection.</p>
    <div class="hero-actions">
      {#if facts.publicDownload}
        <a class="button" href="/releases">Download for Windows and Linux</a>
      {:else if betaAccessUrl}
        <a class="button" href={betaAccessUrl}>Request beta access</a>
      {:else}
        <a class="button button-soft" href="/releases">See release status</a>
      {/if}
      <a class="text-link hero-text-link" href="#product" onclick={(event) => glideToSlide(event, 'product')}>See how it works</a>
    </div>
    <p class="hero-caveat">Beta software without an independent security audit. Use test data for now.</p>
  </div>

  <div class="hero-product-shot enter">
    <ProductPicture eager name="vault-window" width={1200} height={760} alt="The Sesame vault window with a fictional Gmail login open, showing its username, hidden password, 2FA code, and recovery details" />
  </div>
</section>

<section id="product" class="home-section home-section-product">
  <div class="section home-section-inner">
    <FeatureTour {features} title="How Sesame works" />
  </div>
</section>

<section id="switch" class="home-section home-section-switch">
  <div class="section home-section-inner import-layout">
    <div class="import-intro">
      <h2 class="section-heading">Bring everything with you</h2>
      <p class="lede">Choose the export from your old manager. Sesame shows what it found before anything is saved.</p>
      <dl class="source-list">
        {#each importGroups as group (group.key)}
          <div><dt>{group.title}</dt><dd>{group.names.join(', ')}</dd></div>
        {/each}
      </dl>
      <p class="logo-note">Sesame is not affiliated with these products. Their names belong to their owners.</p>
    </div>
    <div class="import-shot">
      <ProductPicture name="import-card" alt="The Sesame import check for a Bitwarden CSV export, showing three logins found and what happens to each item" width={880} height={1116} />
    </div>
  </div>
</section>

<section id="security" class="home-section band">
  <div class="section home-section-inner">
    <h2 class="section-heading">Where your data lives</h2>
    <p class="lede">Your vault works without the website, and a website account is optional.</p>

    <div class="data-split">
      <section class="data-side" aria-labelledby="data-device-heading">
        <h3 id="data-device-heading">On your computer</h3>
        <ul>
          <li><strong>Vault file</strong><span>Every login, card, note, and 2FA secret, encrypted and unlocked by your master password.</span></li>
          <li><strong>Unlock secrets</strong><span>Your PIN and Windows Hello setup stay on the device that created them.</span></li>
          <li><strong>Imported exports</strong><span>Read on your computer and never uploaded.</span></li>
        </ul>
      </section>
      <section class="data-side" aria-labelledby="data-website-heading">
        <h3 id="data-website-heading">On the Sesame website</h3>
        <ul>
          <li><strong>Account</strong><span>An email and a password hash, only if you create an account. They cannot open a vault.</span></li>
          <li><strong>Support and linked desktops</strong><span>What you send to support and a record of each desktop you link.</span></li>
          <li><strong>Release information</strong><span>Version numbers, download checksums, and the project status.</span></li>
        </ul>
      </section>
    </div>
  </div>
</section>

<section id="download" class="home-section home-section-download">
  <div class="section home-section-inner download-layout">
    <div class="download-copy">
      <h2 class="section-heading">Try Sesame with test data</h2>
      <p class="lede">{#if releaseLine}{releaseLine}{/if} Each release lists its SHA-256 checksums. Sesame does not have {notShipped} yet.</p>
      <div class="hero-actions">
        {#if facts.publicDownload}
          <a class="button" href="/releases">Download for Windows and Linux</a>
        {:else if betaAccessUrl}
          <a class="button" href={betaAccessUrl}>Request beta access</a>
        {:else}
          <a class="button button-soft" href="/releases">See release status</a>
        {/if}
        {#if releaseNotesUrl}<a class="text-link hero-text-link" href={releaseNotesUrl} rel="noreferrer">Read the release notes</a>{/if}
      </div>
    </div>
    <ul class="platform-list">
      <li>
        <a href="/releases">
          <PlatformIcon name="windows" />
          <span><strong>Windows</strong><small>{windowsVersions}, 64-bit installer</small></span>
        </a>
      </li>
      <li>
        <a href="/releases">
          <PlatformIcon name="linux" />
          <span><strong>Linux</strong><small>deb, rpm, and AppImage packages</small></span>
        </a>
      </li>
      <li>
        <a href={extension.status === 'published' ? extension.listingUrl : '/roadmap#browser'} rel={extension.status === 'published' ? 'noreferrer' : undefined} class="platform-plain">
          <span><strong>Chrome extension</strong><small>{extension.status === 'published' ? 'Add it from the Chrome Web Store.' : extension.status === 'approved' ? 'Accepted by the Chrome Web Store and coming soon.' : 'Not in a browser store yet.'} {chromeExtensionNeeds}</small></span>
        </a>
      </li>
    </ul>
  </div>
  <p id="status" class="project-line">Sesame is licensed under <a href={licenceUrl} rel="noreferrer">AGPL-3.0-or-later</a>, and its four repositories had <a href={sourceOrg} rel="noreferrer">{recentCommits.toLocaleString('en-GB')} commits</a> in the last {projectActivity.current.windowDays} days, counted {countedLabel(projectActivity.current, projectActivity.live)}.</p>
</section>

<nav class="slide-dots" aria-label="Sections">
  <span class="slide-thumb" aria-hidden="true" style={`transform: translateY(${Math.max(0, slides.findIndex((slide) => slide.id === activeSlide)) * 24}px)`}></span>
  {#each slides as slide (slide.id)}
    <a href={`#${slide.id}`} aria-label={slide.label} title={slide.label} aria-current={activeSlide === slide.id ? 'true' : undefined} onclick={(event) => glideToSlide(event, slide.id)}></a>
  {/each}
</nav>
