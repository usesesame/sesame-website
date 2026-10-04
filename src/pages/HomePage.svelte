<script lang="ts">
  import { onMount } from 'svelte'
  import FeatureTour from '../FeatureTour.svelte'
  import PlatformIcon from '../PlatformIcon.svelte'
  import ProductScreenshot from '../ProductScreenshot.svelte'
  import { IMPORT_FORMAT_COUNT, productFacts } from '../lib/product-facts'
  import { loadStatus, productState } from '../lib/product-state.svelte'
  import { countedLabel, lastPushLabel, loadProjectActivity, projectActivity } from '../lib/project-activity.svelte'
  import { accountUrl } from '../lib/runtime-config'
  import { repositories, sourceOrg } from '../lib/source-links'

  const facts = $derived(productFacts(productState.status))
  const release = $derived(productState.release)
  const releaseDate = $derived(release?.publishedAt ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(release.publishedAt)) : '')

  const features = [
    {
      key: 'import',
      title: 'Bring your logins',
      summary: `Sesame reads ${IMPORT_FORMAT_COUNT} export formats on your computer.`,
      detail: 'Choose the export from your old password manager. Sesame reads it on your computer, shows a preview, and saves only what you choose. Nothing is uploaded.',
      shot: 'stage-import',
      alt: 'The Sesame import dialog over the vault, with Bitwarden CSV selected',
    },
    {
      key: 'search',
      title: 'Find and copy',
      summary: 'Search everything you saved and copy the field you need.',
      detail: 'Search matches titles, sites, usernames, email addresses, notes, tags, and folders. It never matches a password, so typing a guess cannot confirm one. A copied password clears from the clipboard after 30 seconds by default.',
      shot: 'stage-search',
      alt: 'A search for git in Sesame, with the fictional GitHub login open and flagged for a missing 2FA code',
    },
    {
      key: 'check',
      title: 'Fix weak passwords',
      summary: 'The security check tells you which passwords to change.',
      detail: 'The security check finds weak, reused, and old passwords, logins without a 2FA code, and recovery details you have not reviewed. It runs on your computer, and for each finding it offers the next step.',
      shot: 'stage-weak',
      alt: 'A weak password finding for a fictional Notion login, with a password score and a button to change it on the site',
    },
    {
      key: 'backups',
      title: 'Keep your own backups',
      summary: 'Make encrypted backups and keep them wherever you like.',
      detail: 'Export an encrypted backup to any folder or drive. A recovery drill opens a backup without changing your vault, and a restore keeps a safety copy of the current vault first.',
      shot: 'stage-backups',
      alt: 'The Sesame backups screen with export, recovery drill, and restore actions',
    },
  ]

  const windowsVersions = $derived(release?.supportedWindows?.length ? release.supportedWindows.join(' and ').replace('Windows 10 and Windows 11', 'Windows 10 and 11') : 'Windows 10 and 11')
  const availableFeatures = ['Local vault', 'Imports from other managers', '2FA codes', 'Security checks', 'PIN unlock', 'Windows Hello on Windows', 'Encrypted backup and export']
  const laterFeatures = $derived([...(facts.syncAvailable ? [] : ['Sync']), 'Mobile apps', 'Passkeys', 'Sharing', 'Emergency access'])

  const importGroups = [
    { key: 'managers', title: 'Password managers', names: ['Bitwarden CSV and JSON', '1Password', 'LastPass', 'Dashlane', 'KeePass', 'Keeper', 'NordPass', 'Proton Pass'] },
    { key: 'browsers', title: 'Browsers', names: ['Google Chrome', 'Microsoft Edge', 'Brave', 'Firefox', 'Google Password Manager', 'Apple Passwords'] },
    { key: 'authenticators', title: '2FA apps', names: ['Aegis', '2FAS', 'otpauth link lists'] },
  ]
  const listFormat = new Intl.ListFormat('en', { type: 'conjunction' })
  const betaAccessUrl = accountUrl('/support?category=general#new-request')

  const activityByRepository = $derived(new Map(projectActivity.current.repositories.map((entry) => [entry.name, entry])))

  onMount(() => {
    void loadStatus()
    void loadProjectActivity()
  })
</script>

<section class="hero">
  <div class="hero-copy enter">
    <h1>A password manager that works without an account.</h1>
    <p class="intro">Your vault is a file on your computer. Sesame unlocks it, searches it, and copies from it with no account and no network connection.</p>
    <p class="hero-caveat">Sesame is in early beta and has not had an independent security audit. Use test data for now.</p>
    <div class="hero-actions">
      {#if facts.publicDownload}
        <a class="button" href="/releases">Download for Windows and Linux</a>
      {:else if betaAccessUrl}
        <a class="button" href={betaAccessUrl}>Request beta access</a>
      {:else}
        <a class="button button-soft" href="/releases">See release status</a>
      {/if}
      <a class="text-link hero-text-link" href="#product">See how it works</a>
    </div>
  </div>

  <div class="hero-product-shot enter">
    <ProductScreenshot eager name="vault-window" width={1180} height={740} alt="The Sesame vault window with a fictional Gmail login open, showing its username, hidden password, 2FA code, and recovery details" title="Sesame vault" />
  </div>
</section>

<section id="product" class="home-section home-section-product">
  <div class="section home-section-inner">
    <div class="section-title">
      <h2>How Sesame works</h2>
      <p class="lede">Sesame keeps your logins, 2FA codes, security checks, and backups in one desktop app.</p>
    </div>

    <FeatureTour {features} />
  </div>
</section>

<section id="switch" class="home-section home-section-switch">
  <div class="section home-section-inner switch-layout">
    <div class="section-title">
      <h2>Bring everything with you</h2>
      <p class="lede">Sesame reads exports from {IMPORT_FORMAT_COUNT} password manager and browser formats, and 2FA secrets from three authenticator formats. Every import shows a preview before anything is saved.</p>
    </div>
    <div class="import-groups">
      {#each importGroups as group (group.key)}
        <section aria-labelledby={`import-${group.key}`}>
          <h3 id={`import-${group.key}`}>{group.title}</h3>
          <ul>{#each group.names as name (name)}<li>{name}</li>{/each}</ul>
        </section>
      {/each}
    </div>
  </div>
</section>

<section id="security" class="home-section home-section-security">
  <div class="section home-section-inner">
    <div class="section-title">
      <h2>Where your data lives</h2>
      <p class="lede">Your vault works without the website. {#if facts.accountPurposes.length}A website account is optional, and it is only for {listFormat.format(facts.accountPurposes)}.{/if}</p>
    </div>

    <div class="data-split">
      <section class="data-side data-device" aria-labelledby="data-device-heading">
        <h3 id="data-device-heading">On your computer</h3>
        <ul>
          <li><strong>Vault file</strong><span>Every login, card, note, 2FA secret, and backup code is encrypted in it, and your master password unlocks it.</span></li>
          <li><strong>Master password and unlock secrets</strong><span>Your PIN and Windows Hello setup stay on the device that created them.</span></li>
          <li><strong>Imported exports</strong><span>Sesame reads your imports on your computer and never uploads them.</span></li>
        </ul>
      </section>
      <section class="data-side data-website" aria-labelledby="data-website-heading">
        <h3 id="data-website-heading">On the Sesame website</h3>
        <ul>
          <li><strong>Account email and password hash</strong><span>These exist only if you create an account. They let you sign in to the account portal and cannot open a vault.</span></li>
          <li><strong>Support requests and linked desktops</strong><span>The website keeps what you send to support and a record of each desktop you link, and neither contains vault data.</span></li>
          <li><strong>Product and release information</strong><span>The website publishes version numbers, download checksums, and the project status.</span></li>
        </ul>
      </section>
    </div>
  </div>
</section>

<section id="source" class="home-section home-section-source">
  <div class="section home-section-inner source-layout">
    <div class="source-intro">
      <h2>Read the source</h2>
      <p class="lede">The desktop app, browser extension, website, and optional server are licensed under AGPL-3.0-or-later.</p>
      <div class="source-notes">
        <article>
          <h3>Use the desktop app on its own</h3>
          <p>You can create and use a vault without running a server or creating a website account.</p>
        </article>
        <article>
          <h3>What self-hosting covers</h3>
          <p>{facts.syncAvailable ? 'You can run the server, account portal, and admin interface yourself. Hosted Sync is an optional paid service.' : 'You can run the server, account portal, and admin interface yourself. Hosted Sync is planned as an optional paid service, but it is not available yet.'}</p>
        </article>
      </div>
    </div>

    <div class="source-activity">
      <p class="source-activity-head">Commits in the last {projectActivity.current.windowDays} days, counted {countedLabel(projectActivity.current, projectActivity.live)}</p>
      <ul class="repo-tiles">
        {#each repositories as repo (repo.name)}
          {@const activity = activityByRepository.get(repo.name)}
          <li>
            <a href={`${sourceOrg}/${repo.name}`} rel="noreferrer">
              <strong class="repo-name">{repo.name}</strong>
              <span class="repo-what">{repo.what}</span>
              {#if activity}
                <span class="repo-count"><b>{activity.recentCommits}</b> commits</span>
                <span class="repo-push">Last push {lastPushLabel(activity.pushedAt)}</span>
              {/if}
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</section>

<section id="download" class="home-section home-section-download">
  <div class="section home-section-inner download-layout">
    <div class="download-copy">
      <p class="download-status"><span class="dot"></span>{facts.statusHeadline}</p>
      <h2>Try Sesame with test data</h2>
      <p class="lede">{#if release?.version && releaseDate}Version {release.version} was released on {releaseDate}.{/if} Each release lists its SHA-256 checksums. Keep a separate backup of anything you cannot afford to lose.</p>
      <div class="hero-actions">
        {#if facts.publicDownload}
          <a class="button" href="/releases">Download for Windows and Linux</a>
        {:else if betaAccessUrl}
          <a class="button" href={betaAccessUrl}>Request beta access</a>
        {:else}
          <a class="button button-soft" href="/releases">See release status</a>
        {/if}
        {#if release?.releaseNotesUrl}<a class="text-link hero-text-link" href={release.releaseNotesUrl} rel="noreferrer">Read the release notes</a>{/if}
      </div>
    </div>
    <div class="download-panel">
      <ul class="platform-cards">
        <li>
          <a href="/releases">
            <span class="platform-icon"><PlatformIcon name="windows" /></span>
            <span class="platform-text"><strong>Windows</strong><small>{windowsVersions}, 64-bit installer</small></span>
          </a>
        </li>
        <li>
          <a href="/releases">
            <span class="platform-icon"><PlatformIcon name="linux" /></span>
            <span class="platform-text"><strong>Linux</strong><small>deb, rpm, and AppImage packages</small></span>
          </a>
        </li>
      </ul>
      <div class="beta-lists">
        <section aria-labelledby="beta-available">
          <h3 id="beta-available">In this beta</h3>
          <ul class="feature-list feature-list-yes">{#each availableFeatures as feature (feature)}<li>{feature}</li>{/each}</ul>
        </section>
        <section aria-labelledby="beta-later">
          <h3 id="beta-later">Not shipped yet</h3>
          <ul class="feature-list feature-list-later">{#each laterFeatures as feature (feature)}<li>{feature}</li>{/each}</ul>
        </section>
      </div>
    </div>
  </div>
</section>
