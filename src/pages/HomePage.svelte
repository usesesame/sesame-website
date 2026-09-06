<script lang="ts">
  import { onMount } from 'svelte'
  import ProductScreenshot from '../ProductScreenshot.svelte'
  import { reveal } from '../lib/motion'
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
    <h1>A vault that works without an account.</h1>
    <p class="intro">Create, edit, import, back up, and export a vault on your computer. The hosted service never receives it.</p>
    <p class="hero-caveat">Sesame is early beta software. Its independent security review is not finished, so use test data for now.</p>
    <div class="hero-actions">
      {#if facts.publicDownload || !betaAccessUrl}
        <a class="button" href="/releases">Download for Windows and Linux</a>
      {:else}
        <a class="button" href={betaAccessUrl}>Request beta access</a>
      {/if}
      <a class="text-link hero-text-link" href="#product">See how it works</a>
    </div>
  </div>

  <div class="hero-product-shot enter" style="--enter-delay: 180ms">
    <ProductScreenshot eager src="/screenshots/vault-overview.png" alt="Sesame vault showing a fictional login with password, 2FA, and recovery details" title="Sesame vault" caption="Fictional test data." />
  </div>
</section>

<section id="product" class="home-section home-section-product">
  <div class="section home-section-inner">
    <div class="section-title" use:reveal>
      <h2>How Sesame works.</h2>
      <p class="lede">Logins, 2FA codes, security checks, and backups in one desktop app.</p>
    </div>

    <div class="product-workflows">
      <div class="workflow-copy" use:reveal>
        <h3>Import from other managers</h3>
        <p>Import {IMPORT_FORMAT_COUNT} formats, check the preview, and choose what to save.</p>
      </div>
      <div class="workflow-shot" use:reveal><ProductScreenshot src="/screenshots/vault-overview.png" alt="Sesame desktop vault with a login selected" /></div>
      <div class="workflow-copy" use:reveal>
        <h3>Search, open, copy.</h3>
        <p>Find the login, open it, and copy the username, password, or 2FA code.</p>
        <p class="workflow-limitation"><strong>Browser extension:</strong> packaged for Chrome, Edge, and Firefox. Not in the stores yet.</p>
      </div>
    </div>

    <dl class="release-facts" use:reveal>
      <div><dt>Available to test</dt><dd>Local vault, imports, 2FA, security checks, PIN unlock, Windows Hello on Windows, backup, and export.</dd></div>
      <div><dt>Not shipped</dt><dd>Sync, mobile apps, passkeys, sharing, and emergency access.</dd></div>
      <div><dt>Platforms</dt><dd>Windows and Linux.</dd></div>
    </dl>
  </div>
</section>

<section id="source" class="home-section home-section-source">
  <div class="section home-section-inner">
    <div class="section-title" use:reveal>
      <h2>Read the source.</h2>
      <p class="lede">The desktop app, browser extension, website, and optional server are licensed under AGPL-3.0-or-later.</p>
    </div>

    <ul class="source-links" use:reveal>
      {#each repositories as repo (repo.name)}
        <li><a href={`${sourceOrg}/${repo.name}`} rel="noreferrer"><strong>{repo.name}</strong><span>{repo.what}</span></a></li>
      {/each}
    </ul>

    <div class="source-notes" use:reveal>
      <article>
        <h3>Why another password manager?</h3>
        <p>KeePassXC and Bitwarden are more mature, and Sesame does not pretend otherwise. It exists for a gap they leave: a current desktop experience.</p>
      </article>
      <article>
        <h3>What self-hosting covers</h3>
        <p>The server, account portal, and admin interface are open source and free to run yourself. Paying will only cover us hosting Sync for you.</p>
      </article>
    </div>
  </div>
</section>

<section id="security" class="home-section home-section-security">
  <div class="section home-section-inner">
    <div class="section-title" use:reveal>
      <h2>Where your data lives.</h2>
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
