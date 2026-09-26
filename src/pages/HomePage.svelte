<script lang="ts">
  import { onMount } from 'svelte'
  import ProductScreenshot from '../ProductScreenshot.svelte'
  import { IMPORT_FORMAT_COUNT, productFacts } from '../lib/product-facts'
  import { loadStatus, productState } from '../lib/product-state.svelte'
  import { accountUrl } from '../lib/runtime-config'
  import { repositories, sourceOrg } from '../lib/source-links'

  const facts = $derived(productFacts(productState.status))
  const betaAccessUrl = accountUrl('/support?category=general#new-request')

  onMount(() => {
    void loadStatus()
  })
</script>

<section class="hero">
  <div class="hero-copy enter">
    <h1>A password manager that works without an account.</h1>
    <p class="intro">Keep your passwords in a vault on your computer. Import existing logins and make your own backups.</p>
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
    <ProductScreenshot eager src="/screenshots/vault-overview.png" darkSrc="/screenshots/vault-overview-dark.png" alt="Sesame vault showing a fictional login with password, 2FA, and recovery details" title="Sesame vault" caption="Fictional test data." />
  </div>
</section>

<section id="product" class="home-section home-section-product">
  <div class="section home-section-inner">
    <div class="section-title">
      <h2>How Sesame works</h2>
      <p class="lede">Logins, 2FA codes, security checks, and backups in one desktop app.</p>
    </div>

    <div class="product-workflows">
      <div class="workflow-row">
        <div class="workflow-copy">
          <h3>Import from other managers</h3>
          <p>Import {IMPORT_FORMAT_COUNT} formats, check the preview, and choose what to save.</p>
        </div>
        <div class="workflow-shot"><ProductScreenshot src="/screenshots/import-modal.png" darkSrc="/screenshots/import-modal-dark.png" alt="Sesame import dialog with a password-manager export selected" /></div>
      </div>
      <div class="workflow-row">
        <div class="workflow-copy">
          <h3>Find a saved login</h3>
          <p>Search your vault and open a login to copy the details you need.</p>
          <p class="workflow-limitation">The browser extension ships a Chrome package first, with an experimental Firefox package. It is not in the store yet.</p>
        </div>
        <div class="workflow-shot"><ProductScreenshot src="/screenshots/vault-search.png" darkSrc="/screenshots/vault-search-dark.png" alt="Sesame search results with a saved login open" /></div>
      </div>
    </div>

    <dl class="release-facts">
      <div><dt>Available to test</dt><dd>Local vault, imports, 2FA, security checks, PIN unlock, Windows Hello on Windows, backup, and export.</dd></div>
      <div><dt>Not shipped</dt><dd>{facts.syncAvailable ? 'Mobile apps, passkeys, sharing, and emergency access.' : 'Sync, mobile apps, passkeys, sharing, and emergency access.'}</dd></div>
      <div><dt>Platforms</dt><dd>Windows and Linux.</dd></div>
    </dl>
  </div>
</section>

<section id="source" class="home-section home-section-source">
  <div class="section home-section-inner">
    <div class="section-title">
      <h2>Read the source</h2>
      <p class="lede">The desktop app, browser extension, website, and optional server are licensed under AGPL-3.0-or-later.</p>
    </div>

    <ul class="source-links">
      {#each repositories as repo (repo.name)}
        <li><a href={`${sourceOrg}/${repo.name}`} rel="noreferrer"><strong>{repo.name}</strong><span>{repo.what}</span></a></li>
      {/each}
    </ul>

    <div class="source-notes">
      <article>
        <h3>Use the desktop app on its own</h3>
        <p>You can create and use a vault without running a server or creating a website account.</p>
      </article>
      <article>
        <h3>What self-hosting covers</h3>
        <p>{facts.syncAvailable ? 'You can run the server, account portal, and admin interface yourself. Hosted Sync is an optional paid service.' : 'You can run the server, account portal, and admin interface yourself. Hosted Sync is planned as an optional paid service. Sync is not available yet.'}</p>
      </article>
    </div>
  </div>
</section>

<section id="security" class="home-section home-section-security">
  <div class="section home-section-inner">
    <div class="section-title">
      <h2>Where your data lives</h2>
    </div>

    <div class="security-stack">
      <div class="card boundary-card">
        <ul class="boundary-list">
          <li><span>Vault file</span><strong class="on-device">Your device</strong></li>
          <li><span>Master password or unlock secret</span><strong class="on-device">Your device</strong></li>
          <li><span>Imported password-manager export</span><strong class="on-device">Your device</strong></li>
          <li><span>Website account email and password hash</span><strong class="on-server">Sesame website</strong></li>
          <li><span>Product and release information</span><strong class="on-server">Sesame website</strong></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section id="status" class="home-section home-section-status">
  <div class="section home-section-inner">
    <div class="status-card card">
      <div class="status-head">
        <h2><span class="dot"></span>{facts.statusHeadline}</h2>
      </div>
      <div class="status-copy">
        {#if facts.publicDownload}
          <p>Anyone can <a href="/releases">download Sesame</a>. Keep a separate backup of anything you cannot afford to lose.</p>
        {:else}
          <p>Invited testers are using the beta now.</p>
        {/if}
        {#if facts.accountPurposes.length}
          <p class="status-purposes">A website account covers {facts.accountPurposes.join(', ')}.</p>
        {/if}
      </div>
    </div>
  </div>
</section>
