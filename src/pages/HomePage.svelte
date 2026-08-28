<script lang="ts">
  import { onMount } from 'svelte'
  import ProductScreenshot from '../ProductScreenshot.svelte'
  import { reveal } from '../lib/motion'
  import { IMPORT_FORMAT_COUNT, productFacts } from '../lib/product-facts'
  import { loadStatus, productState } from '../lib/product-state.svelte'
  import { accountUrl } from '../lib/runtime-config'
  import { repositories, sourceOrg } from '../lib/source-links'
  import projectActivity from '../lib/project-activity.json'

  const facts = $derived(productFacts(productState.status))
  const betaAccessUrl = accountUrl('/support?category=general#new-request')
  const activityByName = new Map(projectActivity.repositories.map((entry) => [entry.name, entry]))
  const totalRecentCommits = projectActivity.repositories.reduce((total, entry) => total + entry.recentCommits, 0)
  const activityAsOf = new Date(projectActivity.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  onMount(() => {
    void loadStatus()
  })
</script>

<section class="hero">
  <div class="hero-copy enter">
    <h1>Your passwords.<br />Your computer.</h1>
    <p class="intro">Import your vault and keep passwords, 2FA codes, and recovery details together. Sesame never sees your vault, and the whole app is open source.</p>
    <div class="hero-actions">
      {#if facts.publicDownload || !betaAccessUrl}
        <a class="button" href="/releases">Download for Windows</a>
      {:else}
        <a class="button" href={betaAccessUrl}>Request beta access</a>
      {/if}
      <a class="text-link hero-text-link" href="#product">See the product</a>
    </div>
  </div>

  <div class="hero-product-shot enter" style="--enter-delay: 120ms">
    <ProductScreenshot eager src="/screenshots/vault-overview.png" alt="Sesame vault showing a fictional login with password, 2FA, and recovery details" title="Sesame vault" caption="Fictional test data." />
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
        <p>Import {IMPORT_FORMAT_COUNT} formats. Review every change before saving.</p>
      </div>
      <div class="workflow-shot" use:reveal={90}><ProductScreenshot src="/screenshots/security-checkup.png" alt="Sesame security checkup showing actionable account results" title="Security checkup" caption="Each result links back to the affected login. Test data shown." /></div>
      <div class="workflow-shot" use:reveal><ProductScreenshot src="/screenshots/vault-overview.png" alt="Sesame desktop vault with a login selected" title="One login, all the sign-in details" caption="Username, password, 2FA, website and optional recovery details stay together." /></div>
      <div class="workflow-copy" use:reveal={90}>
        <h3>Sign in from one view.</h3>
        <p>Copy passwords, read 2FA codes, and find recovery details.</p>
        <p class="workflow-limitation"><strong>Browser extension:</strong> packaged for Chrome, Edge, and Firefox, not submitted to the stores yet.</p>
      </div>
    </div>

    <div class="availability-grid" use:reveal>
      <article><span class="state-badge available">Beta</span><h3>Ready to test</h3><p>Vault, imports, 2FA, checks, Windows Hello and PIN unlock, document attachments, backup, and export.</p></article>
      <article><span class="state-badge gated">Gated</span><h3>Built, not yet shipped</h3><p>Browser extension, in-app updates, and Sync.</p></article>
      <article><span class="state-badge planned">Planned</span><h3>Coming later</h3><p>Mobile, passkeys, sharing, and emergency access.</p></article>
    </div>
  </div>
</section>

<section id="source" class="home-section home-section-source">
  <div class="section home-section-inner">
    <div class="section-title" use:reveal>
      <h2>Read it, build it, run it yourself.</h2>
      <p class="lede">All of it is AGPL-3.0-or-later. A password manager asks for real trust, so you get all of the code.</p>
      <p class="source-activity">{totalRecentCommits.toLocaleString('en-GB')} commits in the last {projectActivity.windowDays} days, as of {activityAsOf}.</p>
    </div>

    <div class="repo-grid">
      {#each repositories as repo, repoIndex (repo.name)}
        <a class="repo-card" href={`${sourceOrg}/${repo.name}`} rel="noreferrer" use:reveal={repoIndex * 70}>
          <strong>{repo.name}</strong>
          <span>{repo.what}</span>
          {#if activityByName.get(repo.name)}
            {@const activity = activityByName.get(repo.name)}
            <span class="repo-activity">
              {activity?.language}
              <span aria-hidden="true">&middot;</span>
              {activity?.recentCommits} {activity?.recentCommits === 1 ? 'commit' : 'commits'}
            </span>
          {/if}
        </a>
      {/each}
    </div>

    <div class="source-notes" use:reveal>
      <article>
        <h3>Build the app yourself</h3>
        <p>The desktop app builds from source with Node, Rust, and the Windows WebView2 runtime. A vault from your own build opens like any other.</p>
      </article>
      <article>
        <h3>Host the server yourself</h3>
        <p>The API, account portal, and admin interface come from one repository with PostgreSQL. The desktop app works fine without them.</p>
      </article>
      <article>
        <h3>Nothing to opt out of</h3>
        <p>No analytics, no ads, and no third-party scripts. The Content-Security-Policy is in the source too.</p>
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

    <div class="security-stack">
      <div class="card boundary-card" use:reveal>
        <ul class="boundary-list">
          <li><span>Vault file</span><strong class="on-device">Your device</strong></li>
          <li><span>Master password or unlock secret</span><strong class="on-device">Your device</strong></li>
          <li><span>Imported password-manager export</span><strong class="on-device">Your device</strong></li>
          <li><span>Website account email and password hash</span><strong class="on-server">Sesame website</strong></li>
          <li><span>Product and release information</span><strong class="on-server">Sesame website</strong></li>
        </ul>
      </div>

      <aside class="caveat-note" use:reveal={90}>
        <span class="caveat-badge">Current limitation</span>
        <p>Until the first independent review finishes, use test data rather than real secrets.</p>
      </aside>
    </div>
  </div>
</section>

<section id="status" class="home-section home-section-status">
  <div class="section home-section-inner">
    <div class="status-card card" use:reveal>
      <div class="status-head">
        <h2><span class="dot"></span>{facts.statusHeadline}</h2>
      </div>
      <div class="status-copy">
        {#if facts.publicDownload}
          <p>Anyone can <a href="/releases">download Sesame for Windows</a>. The independent review is still pending, so keep a separate backup of anything you cannot afford to lose. It is free during the beta.</p>
        {:else}
          <p>Invited testers are trying the Windows app now.{#if betaAccessUrl} <a href={betaAccessUrl}>Request beta access</a>.{/if} It is free during the beta.</p>
        {/if}
        <dl>
          <div><dt>Public download</dt><dd>{facts.downloadState}</dd></div>
          <div><dt>Supported platform</dt><dd>{facts.platformSummary}</dd></div>
          <div><dt>Website account</dt><dd>{facts.webSignIn}</dd></div>
          <div><dt>Sesame Sync</dt><dd>{facts.sync}</dd></div>
          {#if facts.registration}
            <div><dt>Account registration</dt><dd>{facts.registration}</dd></div>
          {/if}
          <div><dt>Browser extension</dt><dd>Packaged, not submitted</dd></div>
        </dl>
        {#if facts.accountPurposes.length}
          <p class="status-purposes">A website account covers {facts.accountPurposes.join(', ')}. It never holds a vault.</p>
        {/if}
      </div>
    </div>
  </div>
</section>
