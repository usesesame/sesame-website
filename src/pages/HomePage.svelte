<script lang="ts">
  import { onMount } from 'svelte'
  import PlatformIcon from '../PlatformIcon.svelte'
  import ProductPicture from '../ProductPicture.svelte'
  import SourceExcerpt from '../SourceExcerpt.svelte'
  import { buildIn } from '../lib/build-in'
  import { chromeExtensionNeeds, extensionState } from '../lib/extension.svelte'
  import { glideTo, stopGlideOnInput } from '../lib/glide'
  import { principles } from '../lib/principles'
  import { productFacts } from '../lib/product-facts'
  import { loadExtensions, loadLatestRelease, loadStatus, productState } from '../lib/product-state.svelte'
  import { countedLabel, loadProjectActivity, projectActivity } from '../lib/project-activity.svelte'
  import history from '../lib/release-history.json'
  import { formatReleaseDate, releaseSentence, summarizeRelease } from '../lib/release-summary'
  import { accountUrl } from '../lib/runtime-config'
  import { excerptCommit, excerptCommitUrl } from '../lib/source-excerpts'
  import { extensionSourceUrl, licenceUrl, releasesUrl, sourceOrg } from '../lib/source-links'

  const facts = $derived(productFacts(productState.status))
  const release = $derived(productState.release)
  const summaries = $derived([
    summarizeRelease({ release: productState.release, live: productState.releaseLive.windows }, 'Windows'),
    summarizeRelease({ release: productState.linuxRelease, live: productState.releaseLive.linux }, 'Linux'),
  ].filter((summary) => summary !== null))
  const releaseLine = $derived(releaseSentence(summaries))
  const releaseNotesUrl = $derived(summaries.find((summary) => summary.releaseNotesUrl)?.releaseNotesUrl)

  type Plate = { key: string; size: 'wide' | 'half'; title: string; detail: string; shot: string; width: number; height: number; alt: string; frame: 'pane' | 'dialog' }

  const plates: Plate[] = [
    {
      key: 'search',
      size: 'wide',
      title: 'Find and copy',
      detail: 'Search matches titles, sites, usernames, email addresses, notes, tags, and folders. It never matches a password, so typing a guess cannot confirm one. A copied password clears from the clipboard after 30 seconds by default.',
      shot: 'shot-search',
      width: 888,
      height: 618,
      alt: 'A search for git in Sesame, with the fictional GitHub login open and flagged for a missing 2FA code',
      frame: 'pane',
    },
    {
      key: 'check',
      size: 'half',
      title: 'Fix weak passwords',
      detail: 'The security check finds weak, reused, and old passwords, logins without a 2FA code, and recovery details you have not reviewed. It runs on your computer, and for each finding it offers the next step.',
      shot: 'shot-weak',
      width: 540,
      height: 618,
      alt: 'A weak password finding for a fictional Notion login, with a password score and a button to change it on the site',
      frame: 'pane',
    },
    {
      key: 'fields',
      size: 'half',
      title: 'Add your own fields',
      detail: 'A login can hold its own named fields, such as an account number or a security answer. A hidden field is only shown or copied after Sesame checks your master password.',
      shot: 'shot-fields',
      width: 540,
      height: 406,
      alt: 'Custom fields on a fictional login, with an account ID in view and two hidden answers, above a list of what was recently done with the login',
      frame: 'pane',
    },
    {
      key: 'fill',
      size: 'half',
      title: 'Approve every fill',
      detail: 'The browser extension stores no passwords. It asks the desktop app each time, and nothing is filled until you approve it in the Sesame window.',
      shot: 'shot-fill',
      width: 540,
      height: 642,
      alt: 'Sesame asking whether to fill a login on a fictional page, with the requesting address and three matching logins',
      frame: 'dialog',
    },
    {
      key: 'terminal',
      size: 'half',
      title: 'Get passwords in a terminal',
      detail: 'The sesame list, sesame get, and sesame totp commands let a terminal ask the running app for an item. Nothing leaves until you allow it in the Sesame window.',
      shot: 'shot-terminal',
      width: 540,
      height: 524,
      alt: 'Sesame asking whether a terminal may read the password of a fictional login, naming the item, the field, the terminal, and the program',
      frame: 'dialog',
    },
    {
      key: 'backups',
      size: 'wide',
      title: 'Keep your own backups',
      detail: 'Export an encrypted backup to any folder or drive. A recovery drill opens a backup without changing your vault, and a restore keeps a safety copy of the current vault first.',
      shot: 'shot-backups',
      width: 936,
      height: 560,
      alt: 'The Sesame backups screen with export, snapshot, recovery drill, and restore actions',
      frame: 'pane',
    },
  ]

  let shown = $state(0)
  const principleTabs: HTMLButtonElement[] = $state([])

  function showPrinciple(index: number, focus = false) {
    shown = (index + principles.length) % principles.length
    if (focus) principleTabs[shown]?.focus()
  }

  function onPrincipleKey(event: KeyboardEvent) {
    const moves: Record<string, number> = { ArrowDown: shown + 1, ArrowRight: shown + 1, ArrowUp: shown - 1, ArrowLeft: shown - 1, Home: 0, End: principles.length - 1 }
    if (!(event.key in moves)) return
    event.preventDefault()
    showPrinciple(moves[event.key], true)
  }

  const windowsVersions = $derived(release?.supportedWindows?.length ? release.supportedWindows.join(' and ').replace('Windows 10 and Windows 11', 'Windows 10 and 11') : 'Windows 10 and 11')

  const notShipped = $derived(new Intl.ListFormat('en', { type: 'disjunction' }).format([...(facts.syncAvailable ? [] : ['hosted Sync']), 'mobile apps', 'passkeys', 'sharing', 'emergency access']))
  const importGroups = [
    { key: 'managers', title: 'Password managers', names: ['Bitwarden CSV and JSON', '1Password', 'LastPass', 'Dashlane', 'KeePass', 'Keeper', 'NordPass', 'Proton Pass'] },
    { key: 'browsers', title: 'Browsers', names: ['Google Chrome', 'Microsoft Edge', 'Brave', 'Firefox', 'Google Password Manager', 'Apple Passwords'] },
    { key: 'authenticators', title: '2FA apps', names: ['Aegis', '2FAS', 'otpauth link lists'] },
  ]
  const betaAccessUrl = accountUrl('/support?category=general#new-request')

  const recentCommits = $derived(projectActivity.current.repositories.reduce((total, entry) => total + entry.recentCommits, 0))
  const recentReleases = history.slice(0, 3)

  const extension = $derived(extensionState())

  function glideToSection(event: MouseEvent, id: string) {
    const target = document.getElementById(id)
    if (!target) return
    event.preventDefault()
    window.history.replaceState(null, '', `#${id}`)
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
    return stopGlideOnInput()
  })
</script>

<section id="intro" class="hero">
  <div class="hero-copy">
    <h1>A password manager that works without an account.</h1>
    <p class="intro">Your vault is a file on your computer. Sesame unlocks it, searches it, and copies from it with no account and no network connection.</p>
    <div class="hero-actions">
      {#if facts.publicDownload}
        <a class="button button-xl" href="/releases">Download for Windows and Linux</a>
      {:else if betaAccessUrl}
        <a class="button button-xl" href={betaAccessUrl}>Request beta access</a>
      {:else}
        <a class="button button-xl button-soft" href="/releases">See release status</a>
      {/if}
      <a class="text-link hero-text-link" href="#product" onclick={(event) => glideToSection(event, 'product')}>See how it works</a>
    </div>
    <p class="hero-caveat">Beta software that no independent reviewer has audited. Keep an encrypted backup and start with a few accounts.</p>
  </div>

  <div class="hero-stage">
    <div class="hero-window">
      <ProductPicture eager priority name="vault-window" width={1200} height={760} alt="The Sesame vault window with eight fictional logins and a Gmail login open, showing its username, hidden password, 2FA code, and recovery details" />
    </div>
  </div>
</section>

<section class="statement" aria-label="What happens if Sesame shuts down">
  <p use:buildIn>Your vault is a file on your computer. If Sesame shut down, you could still open it with your master password.</p>
</section>

<section id="product" class="chapter">
  <header class="chapter-head" use:buildIn>
    <h2 class="section-heading">How Sesame works</h2>
    <p class="lede">Everything below happens in the desktop app, on your computer.</p>
  </header>
  <div class="plates">
    {#each plates as plate (plate.key)}
      <article class="plate" data-size={plate.size} data-frame={plate.frame} use:buildIn>
        <div class="plate-copy">
          <h3>{plate.title}</h3>
          <p>{plate.detail}</p>
        </div>
        <div class="plate-figure">
          <ProductPicture name={plate.shot} alt={plate.alt} width={plate.width} height={plate.height} />
        </div>
      </article>
    {/each}
  </div>
</section>

<section id="switch" class="chapter import-layout">
  <div class="import-intro" use:buildIn>
    <h2 class="section-heading">Bring everything with you</h2>
    <p class="lede">Choose the export from your old manager. Sesame reads it on your computer and shows what it found before anything is saved.</p>
    <dl class="source-list">
      {#each importGroups as group (group.key)}
        <div><dt>{group.title}</dt><dd>{group.names.join(', ')}</dd></div>
      {/each}
    </dl>
    <p class="logo-note">Sesame is not affiliated with these products. Their names belong to their owners.</p>
  </div>
  <div class="import-shot" use:buildIn>
    <ProductPicture name="import-card" alt="The Sesame import check for a Bitwarden export, showing three logins found and what happens to each item" width={440} height={680} />
  </div>
</section>

<section id="security" class="band" use:buildIn>
  <div class="band-inner">
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

<section id="principles" class="chapter">
  <header class="chapter-head" use:buildIn>
    <h2 class="section-heading">The code behind each security claim</h2>
    <p class="lede">Pick a claim to see the code that does it. The code is copied from the public repository at commit <a class="mono" href={excerptCommitUrl} rel="noreferrer">{excerptCommit.slice(0, 7)}</a>.</p>
  </header>
  <div class="proof" use:buildIn>
    <div class="proof-list" role="tablist" aria-label="Security claims" aria-orientation="vertical">
      {#each principles as principle, index (principle.key)}
        <button
          bind:this={principleTabs[index]}
          id={`proof-tab-${principle.key}`}
          class="proof-tab"
          class:active={index === shown}
          type="button"
          role="tab"
          aria-selected={index === shown}
          aria-controls="proof-panel"
          tabindex={index === shown ? 0 : -1}
          onclick={() => showPrinciple(index)}
          onkeydown={onPrincipleKey}
        >{principle.title}</button>
      {/each}
    </div>
    <div class="proof-panel" id="proof-panel" role="tabpanel" aria-labelledby={`proof-tab-${principles[shown].key}`}>
      {#key shown}
        <div class="proof-shown">
          <p>{principles[shown].detail}</p>
          <div class="excerpt-set">
            {#each principles[shown].excerpts as excerpt (excerpt.key)}<SourceExcerpt {excerpt} />{/each}
          </div>
        </div>
      {/key}
    </div>
  </div>
  <p class="proof-note">No independent reviewer has audited Sesame yet. The <a href="/security">security page</a> lists what Sesame cannot protect you from.</p>
</section>

<section id="releases" class="chapter ledger-layout">
  <div class="spec-intro" use:buildIn>
    <h2 class="section-heading">Recent releases</h2>
    <p id="status" class="lede">Sesame is licensed under <a href={licenceUrl} rel="noreferrer">AGPL-3.0-or-later</a>, and its four repositories had <a href={sourceOrg} rel="noreferrer"><span class="mono">{recentCommits.toLocaleString('en-GB')}</span> commits</a> in the last {projectActivity.current.windowDays} days, counted {countedLabel(projectActivity.current, projectActivity.live)}.</p>
    <a class="text-link" href="/releases">See every release</a>
  </div>
  <ol class="ledger" use:buildIn>
    {#each recentReleases as entry (entry.version)}
      <li>
        <div class="ledger-meta">
          <a class="mono" href={`${releasesUrl}/tag/v${entry.version}`} rel="noreferrer" aria-label={`Release notes for Sesame ${entry.version}`}>{entry.version}</a>
          <time datetime={entry.publishedAt}>{formatReleaseDate(entry.publishedAt)}</time>
        </div>
        <p>{entry.summary}</p>
      </li>
    {/each}
  </ol>
</section>

<section id="download" class="closing">
  <div class="closing-copy" use:buildIn>
    <h2 class="section-heading">Try Sesame on a few accounts first</h2>
    <p class="lede">{#if releaseLine}{releaseLine}{/if} Each release lists its SHA-256 checksums. Sesame does not have {notShipped} yet.</p>
    <div class="hero-actions">
      {#if facts.publicDownload}
        <a class="button button-xl" href="/releases">Download for Windows and Linux</a>
      {:else if betaAccessUrl}
        <a class="button button-xl" href={betaAccessUrl}>Request beta access</a>
      {:else}
        <a class="button button-xl button-soft" href="/releases">See release status</a>
      {/if}
      {#if releaseNotesUrl}<a class="text-link hero-text-link" href={releaseNotesUrl} rel="noreferrer">Read the release notes</a>{/if}
    </div>
  </div>
  <ul class="platform-list" use:buildIn>
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
    <li class="platform-split">
      <div>
        <span>
          <strong>Chrome extension</strong>
          <small>{extension.status === 'published' ? 'Add it from the Chrome Web Store.' : extension.status === 'approved' ? 'Accepted by the Chrome Web Store and coming soon.' : 'Not in a browser store yet.'} {chromeExtensionNeeds}</small>
          <span class="platform-links">
            {#if extension.status === 'published'}<a href={extension.listingUrl} rel="noreferrer">Chrome Web Store</a>{:else}<a href="/roadmap#browser">See its status</a>{/if}
            <a href={extensionSourceUrl} rel="noreferrer">Source on GitHub</a>
          </span>
        </span>
      </div>
    </li>
  </ul>
</section>
