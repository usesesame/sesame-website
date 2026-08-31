<script lang="ts">
  import { onMount } from 'svelte'
  import { BETA_SUPPORT } from '../lib/product'
  import { loadLatestRelease, productState } from '../lib/product-state.svelte'

  const channels = $derived([productState.release, productState.linuxRelease])
  const anyAvailable = $derived(channels.some((release) => release?.available))

  function platformLabel(platform: string | undefined): string {
    return platform === 'linux' ? 'Linux' : 'Windows'
  }

  onMount(() => {
    void loadLatestRelease()
  })
</script>

<section class="page-hero compact-page-hero">
  <h1>Desktop builds.</h1>
  <p class="intro">Only releases listed here are official. Every installer ships with an updater signature, a published SHA-256, and Sigstore evidence tying it to the exact build.</p>
  <p class="intro release-live-status">Live availability is at <a href="https://status.usesesame.app" rel="noreferrer">status.usesesame.app</a>.</p>
</section>

<section class="section release-section">
  {#each channels as release (release?.platform ?? 'windows')}
    <div class="release-status card">
      <div><span class="dot"></span><div><strong>{release?.version ? `Sesame ${release.version} for ${platformLabel(release.platform)}` : `No published build for ${platformLabel(release?.platform)}`}</strong><small>{release?.message || 'Internal verification in progress'}</small></div></div>
      {#if release?.available && release.url && release.signed}
        <a class="button button-sm" href={release.url}>Download for {platformLabel(release.platform)}</a>
      {:else}
        <span class="release-unavailable">No public artifact</span>
      {/if}
    </div>
    {#if release?.available}
      <div class="release-detail-grid">
        <section class="release-detail"><h2>{platformLabel(release.platform)} installers and hashes</h2>
          {#if release.artifacts?.length}
            <div class="artifact-list">{#each release.artifacts as artifact (artifact.name)}<article><div><strong>{artifact.name}</strong><span>{artifact.format.toUpperCase()} · {artifact.signed ? 'Tauri updater signature verified' : 'Do not install: updater signature unavailable'}</span><code>{artifact.sha256}</code></div>{#if artifact.signed}<a class="button button-sm" href={artifact.url}>Download</a>{/if}</article>{/each}</div>
          {:else if release.sha256}
            <div class="release-checksum"><span>SHA-256</span><code>{release.sha256}</code></div>
          {:else}<p>Release metadata is incomplete, so downloads are paused.</p>{/if}
        </section>
        <section class="release-detail"><h2>Release notes</h2>{#if release.releaseNotes?.length}<ul>{#each release.releaseNotes as note (note)}<li>{note}</li>{/each}</ul>{:else if release.releaseNotesUrl}<p><a class="text-link" href={release.releaseNotesUrl}>Read the release notes</a></p>{:else}<p>No release notes were published for this build.</p>{/if}</section>
      </div>
      <aside class="rollback-notice"><strong>Rollback notice</strong><p>{release.rollbackNotice || 'No rollback notice is active for this release.'}</p></aside>
    {/if}
  {/each}
  {#if !anyAvailable}
    <div class="release-requirements"><h2>Nothing to download yet</h2><p>No desktop build has cleared the release gate yet. When one does, it appears here with its checksum and signature, and you will not need an account to get it.</p></div>
  {/if}
  <div class="release-requirements compatibility-notes">
    <h2>Beta compatibility</h2>
    <dl>{#each BETA_SUPPORT.platforms as platform (platform.name)}<div><dt>{platform.name}</dt><dd>{platform.detail}</dd></div>{/each}<div><dt>Architecture</dt><dd>{BETA_SUPPORT.architectures.join(', ')}</dd></div><div><dt>Not supported</dt><dd>{BETA_SUPPORT.unsupported.join(', ')}</dd></div></dl>
    <p>{BETA_SUPPORT.note}</p>
  </div>
  <div class="release-requirements"><h2>Release gate</h2><ol><li>The NSIS or AppImage updater artifact has a valid Tauri signature and Sigstore evidence for Sesame's exact protected tag workflow.</li><li>Published SHA-256 hashes match the tested files. Early-access installers are not Authenticode-signed and can trigger an unknown-publisher warning on Windows; production releases require Authenticode.</li><li>Clean profiles on a supported Windows version and on a current Linux distribution pass install, unlock, import, backup, restore, export, uninstall, and in-app upgrade checks.</li><li>Release-blocking security findings are resolved.</li></ol></div>
  <p class="release-warning">Do not install Sesame builds from an unofficial mirror or attachment. Beta installers carry no Authenticode signature, so Windows shows an unknown-publisher warning; check the SHA-256 and updater signature published above instead.</p>
</section>
