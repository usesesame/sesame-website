<script lang="ts">
  import { onMount } from 'svelte'
  import { BETA_SUPPORT } from '../lib/product'
  import type { ProductRelease } from '../lib/product'
  import { loadLatestRelease, productState } from '../lib/product-state.svelte'

  const channels = $derived([productState.release, productState.linuxRelease])
  const anyAvailable = $derived(channels.some((release) => release?.available))
  const linuxRelease = $derived(productState.linuxRelease)
  const linuxArtifacts = $derived(linuxRelease?.artifacts?.length ? orderLinuxArtifacts(linuxRelease.artifacts) : [])

  let linuxDialog: HTMLDialogElement | undefined = $state()
  let linuxTrigger: HTMLButtonElement | undefined = $state()

  const linuxPackageOrder = ['deb', 'rpm', 'appimage'] as const

  function orderLinuxArtifacts(artifacts: NonNullable<ProductRelease['artifacts']>): NonNullable<ProductRelease['artifacts']> {
    return [...artifacts].sort((first, second) => linuxPackageOrder.indexOf(first.format as 'deb') - linuxPackageOrder.indexOf(second.format as 'deb'))
  }

  function linuxPackageDetail(format: string): string {
    switch (format) {
      case 'deb':
        return 'Debian 13 and newer, Ubuntu 24.04 and newer, and derivatives'
      case 'rpm':
        return 'Fedora 40 and newer, RHEL 9 with EPEL, Rocky, AlmaLinux, and derivatives'
      case 'appimage':
        return 'Any current distribution; mark executable and run'
      case 'nsis':
        return 'Windows 10 and 11, x64'
      default:
        return format.toUpperCase()
    }
  }

  function openLinuxPicker() {
    if (!linuxDialog?.open) linuxDialog?.showModal()
  }

  function closeLinuxPicker() {
    linuxDialog?.close()
  }

  function closeLinuxPickerFromBackdrop(event: MouseEvent) {
    if (event.target === linuxDialog) closeLinuxPicker()
  }

  function restoreLinuxTrigger() {
    linuxTrigger?.focus()
  }

  function platformLabel(platform: string | undefined): string {
    return platform === 'linux' ? 'Linux' : 'Windows'
  }

  onMount(() => {
    void loadLatestRelease()
  })
</script>

<section class="page-hero compact-page-hero">
  <h1>Desktop builds</h1>
  <p class="intro">Only releases listed here are official. Every installer ships with a published SHA-256 and Sigstore evidence tying it to the exact build, and the Windows installer also carries a Tauri updater signature.</p>
  <p class="intro release-live-status">Live availability is at <a href="https://status.usesesame.app" rel="noreferrer">status.usesesame.app</a>.</p>
</section>

<section class="section release-section">
  {#each channels as release (release?.platform ?? 'windows')}
    <article class="card release-panel">
      <header class="release-panel-head">
        <div class="release-panel-title">
          <span class="dot"></span>
          <div>
            <strong>{release?.version ? `Sesame ${release.version} for ${platformLabel(release.platform)}` : `No published build for ${platformLabel(release?.platform)}`}</strong>
            <small>{release?.message || 'Internal verification in progress'}</small>
          </div>
        </div>
        {#if release?.available && release.url}
          {#if release.platform === 'linux' && linuxArtifacts.length > 1}
            <button class="button button-sm" type="button" bind:this={linuxTrigger} onclick={openLinuxPicker}>Download for Linux</button>
          {:else}
            <a class="button button-sm" href={release.url}>Download for {platformLabel(release.platform)}</a>
          {/if}
        {:else}
          <span class="release-unavailable">No public artifact</span>
        {/if}
      </header>
      {#if release?.available}
        <div class="release-panel-grid">
          <section>
            <h2>{platformLabel(release.platform)} installers and hashes</h2>
            {#if release.artifacts?.length}
              <div class="artifact-list">
                {#each release.artifacts as artifact (artifact.name)}
                  <article>
                    <div>
                      <strong>{artifact.name}</strong>
                      <span>{artifact.format.toUpperCase()} · {artifact.signed ? 'Tauri updater signature verified' : 'Sigstore evidence verified; no updater signature'}</span>
                      <code>{artifact.sha256}</code>
                    </div>
                    <a class="button button-sm" href={artifact.url}>Download</a>
                  </article>
                {/each}
              </div>
            {:else if release.sha256}
              <div class="release-checksum"><span>SHA-256</span><code>{release.sha256}</code></div>
            {:else}
              <p>Release metadata is incomplete, so downloads are paused.</p>
            {/if}
          </section>
          <section>
            <h2>Release notes</h2>
            {#if release.releaseNotes?.length}
              <ul>{#each release.releaseNotes as note (note)}<li>{note}</li>{/each}</ul>
            {:else if release.releaseNotesUrl}
              <p><a class="text-link" href={release.releaseNotesUrl}>Read the release notes</a></p>
            {:else}
              <p>No release notes were published for this build.</p>
            {/if}
          </section>
        </div>
        <footer class="rollback-notice"><strong>Rollback notice</strong><p>{release.rollbackNotice || 'No rollback notice is active for this release.'}</p></footer>
      {/if}
    </article>
  {/each}
  {#if linuxArtifacts.length}
    <dialog
      class="linux-picker-dialog"
      bind:this={linuxDialog}
      aria-label="Choose a Linux package"
      onclick={closeLinuxPickerFromBackdrop}
      onclose={restoreLinuxTrigger}
    >
      <div class="linux-picker-panel">
        <div class="linux-picker-head">
          <div>
            <strong>Choose a Linux package</strong>
            <span>Sesame {linuxRelease?.version} for x86_64 (amd64)</span>
          </div>
          <button class="linux-picker-close" type="button" aria-label="Close the Linux package picker" onclick={closeLinuxPicker}>Close</button>
        </div>
        <ul class="linux-picker-list">
          {#each linuxArtifacts as artifact (artifact.name)}
            <li>
              <div>
                <strong>{artifact.name}</strong>
                <span>{linuxPackageDetail(artifact.format)}</span>
                <code>{artifact.sha256}</code>
                <small>{artifact.signed ? 'Tauri updater signature verified' : 'Sigstore evidence verified; no updater signature'}</small>
              </div>
              <a class="button button-sm" href={artifact.url}>Download</a>
            </li>
          {/each}
        </ul>
        <p class="linux-picker-note">Every package was built in public CI from the released tag and carries Sigstore evidence. Verify the SHA-256 after download.</p>
      </div>
    </dialog>
  {/if}
  {#if !anyAvailable}
    <div class="card release-requirements">
      <h2>Nothing to download yet</h2>
      <p>No desktop build has cleared the release gate yet. When one does, it appears here with its checksum and signature.</p>
    </div>
  {/if}
  <div class="release-info-grid">
    <section class="card release-requirements compatibility-notes">
      <h2>Beta compatibility</h2>
      <dl>
        {#each BETA_SUPPORT.platforms as platform (platform.name)}
          <div><dt>{platform.name}</dt><dd>{platform.detail}</dd></div>
        {/each}
        <div><dt>Architecture</dt><dd>{BETA_SUPPORT.architectures.join(', ')}</dd></div>
        <div><dt>Not supported</dt><dd>{BETA_SUPPORT.unsupported.join(', ')}</dd></div>
      </dl>
      <p>{BETA_SUPPORT.note}</p>
    </section>
    <section class="card release-requirements">
      <h2>Release gate</h2>
      <ol>
        <li>The NSIS installer has a valid Tauri updater signature, and every installer carries Sigstore evidence for Sesame's exact protected tag workflow.</li>
        <li>Published SHA-256 hashes match the tested files. Production releases also require Authenticode signing.</li>
        <li>Clean profiles on a supported Windows version and on a current Linux distribution pass install, unlock, import, backup, restore, export, uninstall, and in-app upgrade checks.</li>
        <li>Release-blocking security findings are resolved.</li>
      </ol>
    </section>
  </div>
  <p class="release-warning">Beta installers carry no Authenticode signature, so Windows shows an unknown-publisher warning. Verify the published SHA-256 and Sigstore evidence instead.</p>
</section>
