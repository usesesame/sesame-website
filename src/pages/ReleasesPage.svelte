<script lang="ts">
  import { onMount, tick } from 'svelte'
  import history from '../lib/release-history.json'
  import type { ProductRelease } from '../lib/product'
  import PlatformIcon from '../PlatformIcon.svelte'
  import { chromeExtensionNeeds, extensionState } from '../lib/extension.svelte'
  import { isDownloadable } from '../lib/product-parse'
  import { loadExtensions, loadLatestRelease, productState } from '../lib/product-state.svelte'
  import { formatReleaseDate, summarizeRelease } from '../lib/release-summary'
  import { extensionSourceUrl, releasesUrl } from '../lib/source-links'

  type FileRow = { key: string; label: string; detail: string; name: string; url: string; sha256: string }
  type Group = { platform: 'windows' | 'linux'; title: string; version: string; files: FileRow[] }

  const extension = $derived(extensionState())
  const windows = $derived(productState.release)
  const linux = $derived(productState.linuxRelease)
  const anyAvailable = $derived([windows, linux].some((release) => isDownloadable(release)))
  const latest = $derived(summarizeRelease({ release: windows, live: productState.releaseLive.windows }, 'Windows') ?? summarizeRelease({ release: linux, live: productState.releaseLive.linux }, 'Linux'))
  const releaseNotesUrl = $derived(latest?.releaseNotesUrl)
  let dialog: HTMLDialogElement | undefined = $state()
  let trigger: HTMLElement | null = null
  let cancelButton: HTMLButtonElement | undefined = $state()
  let pending = $state<{ platform: Group['platform']; file: FileRow } | null>(null)

  async function askBeforeDownload(event: MouseEvent, platform: Group['platform'], file: FileRow) {
    event.preventDefault()
    trigger = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
    pending = { platform, file }
    if (!dialog?.open) dialog?.showModal()
    await tick()
    cancelButton?.focus()
  }

  function closeDialog() {
    dialog?.close()
  }

  function closeFromBackdrop(event: MouseEvent) {
    if (event.target === dialog) closeDialog()
  }

  function restoreTrigger() {
    trigger?.focus()
  }

  const linuxPackageOrder = ['deb', 'rpm', 'appimage'] as const

  function fileName(url: string): string {
    return decodeURIComponent(url.split('/').pop() ?? url)
  }

  function linuxPackageDetail(format: string): string {
    switch (format) {
      case 'deb':
        return 'Debian 13 and newer, Ubuntu 24.04 and newer, and derivatives'
      case 'rpm':
        return 'Fedora 40 and newer, RHEL 9 with EPEL, Rocky, AlmaLinux, and derivatives'
      case 'appimage':
        return 'Any current distribution. Mark it executable and run it.'
      default:
        return format.toUpperCase()
    }
  }

  function orderLinuxArtifacts(artifacts: NonNullable<ProductRelease['artifacts']>): NonNullable<ProductRelease['artifacts']> {
    return [...artifacts].sort((first, second) => linuxPackageOrder.indexOf(first.format as 'deb') - linuxPackageOrder.indexOf(second.format as 'deb'))
  }

  const groups = $derived.by((): Group[] => {
    const result: Group[] = []
    if (windows && isDownloadable(windows) && windows.url) {
      result.push({
        platform: 'windows',
        title: 'Windows',
        version: windows.version ?? '',
        files: [{ key: 'windows', label: 'Installer', detail: 'Windows 10 and 11, 64-bit', name: fileName(windows.url), url: windows.url, sha256: windows.sha256 ?? '' }],
      })
    }
    if (linux && isDownloadable(linux) && linux.artifacts?.length) {
      result.push({
        platform: 'linux',
        title: 'Linux',
        version: linux.version ?? '',
        files: orderLinuxArtifacts(linux.artifacts).map((artifact) => ({
          key: artifact.name,
          label: artifact.format === 'appimage' ? 'AppImage' : artifact.format.toUpperCase(),
          detail: linuxPackageDetail(artifact.format),
          name: artifact.name,
          url: artifact.url,
          sha256: artifact.sha256,
        })),
      })
    }
    else if (linux && isDownloadable(linux) && linux.url) {
      result.push({
        platform: 'linux',
        title: 'Linux',
        version: linux.version ?? '',
        files: [{ key: 'linux', label: 'Package', detail: 'Linux, x86_64', name: fileName(linux.url), url: linux.url, sha256: linux.sha256 ?? '' }],
      })
    }
    return result
  })

  const earlier = $derived(history.filter((entry) => entry.version !== latest?.version))

  onMount(() => {
    void loadLatestRelease()
    void loadExtensions()
  })
</script>

<section class="page-hero compact-page-hero">
  <h1>Releases</h1>
</section>

<section class="section release-section">
  {#if anyAvailable && latest}
    <div class="release-latest">
      <p class="release-latest-label">Latest release</p>
      <h2 class="release-version">Sesame {latest.version}</h2>
      <p class="release-date">Released {latest.publishedOn}. {#if releaseNotesUrl}<a href={releaseNotesUrl} rel="noreferrer">Read the release notes</a>.{/if}</p>

      {#each groups as group (group.platform)}
        <div class="release-group">
          <div class="release-group-head">
            <PlatformIcon name={group.platform} size={34} />
            <h3>{group.title}{#if group.version && group.version !== latest?.version} {group.version}{/if}</h3>
          </div>
          <ul class="release-files">
            {#each group.files as file (file.key)}
              <li>
                <div class="release-file-main">
                  <strong>{file.label}</strong>
                  <span>{file.detail}</span>
                </div>
                <div class="release-file-hash">
                  <span>{file.name}</span>
                  <code>{file.sha256}</code>
                </div>
                <a class="button button-sm button-soft" href={file.url} onclick={(event) => askBeforeDownload(event, group.platform, file)}>Download</a>
              </li>
            {/each}
          </ul>
        </div>
      {/each}

      <div class="release-group">
        <div class="release-group-head">
          <h3>Browser extension</h3>
        </div>
        <ul class="release-files">
          <li>
            <div class="release-file-main">
              <strong>Chrome</strong>
              <span>{chromeExtensionNeeds}</span>
            </div>
            <div class="release-file-hash">
              <span>{extension.status === 'published' ? 'Chrome Web Store' : extension.status === 'approved' ? 'Accepted by the Chrome Web Store' : 'Not in a browser store yet'}</span>
              <small>{extension.status === 'published' ? 'Install it from the store listing.' : extension.status === 'approved' ? 'The listing goes live soon.' : 'You can build it from source.'} The source is on <a href={extensionSourceUrl} rel="noreferrer">GitHub</a>.</small>
            </div>
            {#if extension.status === 'published'}<a class="button button-sm button-soft" href={extension.listingUrl} rel="noreferrer">Open the store</a>{:else}<span class="release-soon">{extension.status === 'approved' ? 'Coming soon' : 'Not yet'}</span>{/if}
          </li>
        </ul>
      </div>

      <p class="release-note">Each file is built in public and carries Sigstore evidence. Windows on Arm is not supported.</p>
    </div>
  {:else}
    <div class="release-latest">
      <h2 class="release-version">Nothing to download yet</h2>
      <p class="release-date">No desktop build has cleared the release gate yet.</p>
    </div>
  {/if}

  <div class="release-history">
    <h2>Earlier releases</h2>
    <ol>
      {#each earlier as entry (entry.version)}
        <li>
          <time datetime={entry.publishedAt}>{formatReleaseDate(entry.publishedAt)}</time>
          <div>
            <strong>Sesame {entry.version}</strong>
            <p>{entry.summary}</p>
          </div>
          <a href={`${releasesUrl}/tag/v${entry.version}`} rel="noreferrer">Release notes</a>
        </li>
      {/each}
    </ol>
  </div>
</section>

<dialog class="download-dialog" bind:this={dialog} aria-labelledby="download-dialog-title" onclick={closeFromBackdrop} onclose={restoreTrigger}>
  {#if pending}
    <div class="download-dialog-panel">
      <h2 id="download-dialog-title">Back up your vault first</h2>
      <p>An older build may refuse a vault this release has resealed, so keep a backup before you install. {#if pending.platform === 'windows'}The beta installer is not Authenticode signed, so Windows shows an unknown-publisher warning. {/if}Check the SHA-256 after you download.</p>
      <div class="download-dialog-actions">
        <button class="button button-soft" type="button" bind:this={cancelButton} onclick={closeDialog}>Cancel</button>
        <a class="button" href={pending.file.url} onclick={closeDialog}>Download</a>
      </div>
    </div>
  {/if}
</dialog>
