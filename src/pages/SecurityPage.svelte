<script lang="ts">
  import { IMPORT_FORMAT_COUNT, productFacts } from '../lib/product-facts'
  import { productState } from '../lib/product-state.svelte'
  import { licenceUrl } from '../lib/source-links'

  const facts = $derived(productFacts(productState.status))
</script>

<section class="page-hero">
  <h1>What Sesame handles, and what it does not</h1>
  <p class="intro">The desktop application is the only Sesame product that handles vault contents. The website and API publish product information and release metadata.</p>
</section>

<section class="section document-section">
  <nav class="document-nav" aria-label="On this page">
    <strong>On this page</strong>
    <a href="#boundary">Product boundary</a>
    <a href="#path">The path of a secret</a>
    <a href="#protection">Vault protection</a>
    <a href="#browser">Browser extension</a>
    <a href="#updates">Updates and downloads</a>
    <a href="#local">Local vault</a>
    <a href="#service">Website and API</a>
    <a href="#source">Open source</a>
    <a href="#limitations">Current limitations</a>
  </nav>
  <article class="document-copy">
    <div id="boundary">
      <h2>The vault stays with the desktop app</h2>
      <p>Creating, unlocking, importing, checking, backing up, restoring, exporting, and deleting a local vault does not depend on a Sesame account or service.</p>
      <div class="security-map">
        <div class="map-outer">
          <p><strong>Website and API</strong><span>Release metadata and an optional account. No vault contents.</span></p>
          <p><strong>Browser extension</strong><span>Stores no credentials.</span></p>
        </div>
        <div class="card map-app">
          <strong>Sesame desktop app</strong>
          <div class="map-flow">
            <div class="map-node">
              <strong>Interface</strong>
              <span>No secrets inside.</span>
            </div>
            <p class="map-arrow"><svg viewBox="0 0 24 24" width="30" height="12" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></svg><span>Tauri IPC</span></p>
            <div class="map-node">
              <strong>Rust host</strong>
              <span>Holds the vault key and decides what leaves.</span>
            </div>
            <p class="map-arrow"><svg viewBox="0 0 24 24" width="30" height="12" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></svg><span>reads and writes</span></p>
            <div class="map-node">
              <strong>Vault file on disk</strong>
              <span>Argon2id and XChaCha20-Poly1305.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="path">
      <h2>What must happen before a secret moves</h2>
      <p>Every path that writes a vault copy or reveals a stored password passes one gate inside the Rust host.</p>
      <ol class="gate-flow">
        <li class="gate-step"><strong>You ask</strong><span>Export, backup, recovery kit, or reveal a password.</span></li>
        <li class="gate-step gate-step-gate"><strong>The host verifies you</strong><span>Your master password, checked in the Rust process.</span></li>
        <li class="gate-step"><strong>A short grant opens</strong><span>Two minutes, this session. Locking ends it.</span></li>
        <li class="gate-step"><strong>Sesame acts</strong><span>The host writes the file or reveals the one secret.</span></li>
      </ol>
      <p class="gate-refusal"><strong>Without the master password,</strong> the command is refused. Failed attempts wait five seconds, then longer, up to five minutes.</p>
    </div>
    <div id="protection">
      <h2>What protects your vault</h2>
      <dl class="hardening-facts">
        <div><dt>Vault file</dt><dd>Argon2id key derivation, XChaCha20-Poly1305 encryption</dd></div>
        <div><dt>Opening</dt><dd>Authenticated first; relabelled, tampered, and newer formats refuse to open</dd></div>
        <div><dt>Saving</dt><dd>Staged, validated, then swapped in by rename; the current file is never truncated</dd></div>
        <div><dt>Storage limit</dt><dd>A save above the 64 MiB limit is refused while the vault is encoded, and the existing vault stays unchanged</dd></div>
      </dl>
      <p>A failed or interrupted save leaves the previous vault in place. A link planted into the vault file's path is removed rather than written through. Before publication, the release pipeline installs the packaged app and proves it opens, restores, restarts, and backs up every supported historical backup on Windows and Linux.</p>
      <p>The unlocked vault key does not sit in ordinary memory. On Windows it is locked out of the page file, re-encrypted when idle, and reachable only through one guarded call. On Linux the kernel locks it against swap and crash dumps, and Sesame wipes it when the kernel refuses that protection. On other systems it is wiped after use. Decrypted payloads, key wrappers, and sealed records are wiped when their buffers are dropped.</p>
    </div>
    <div id="browser">
      <h2>The browser extension</h2>
      <p>The extension stores no credentials and never submits a form. It speaks a closed protocol to the desktop app through the native messaging host, and the desktop app approves every fill for the exact tab and origin. A page cannot start a fill.</p>
      <p>A new or changed password is read only when you choose Save this login in the popup after a fill, and the save goes to the same desktop approval.</p>
    </div>
    <div id="updates">
      <h2>Updates and downloads</h2>
      <p>Every installer is built in public CI and signed with Sigstore, which binds each file to this repository and the exact commit. The releases page lists checksums for each download, and every release attaches a verification script.</p>
      <p>An in-app update verifies a signed receipt against the exact installer before it runs. The Windows installer is not Authenticode signed yet, so SmartScreen warns on first run. Linux packages carry no updater signature; download a new Linux release by hand from the releases page.</p>
    </div>
    <div id="local"><h2>Data kept on your device</h2><p>The desktop app keeps vault files encrypted and opens them with the unlock method you configure:</p><ul><li>Vault items and document attachments</li><li>Master passwords, derived keys, and recovery material</li><li>Imports from {IMPORT_FORMAT_COUNT} supported formats</li><li>2FA seeds, backup codes, and recovery notes</li></ul></div>
    <div id="service"><h2>Data handled by the website and API</h2><p>The service publishes product and release information. If you create a website account, it stores the account email, password hash, and revocable sessions separately from any vault.</p><p>Sync {facts.syncAvailable ? 'is available for accounts that have it enabled' : 'is disabled in the current release'}. The packaged browser extension stores no credentials, never submits a form, and requires approval from the unlocked desktop app for each fill.</p></div>
    <div id="source"><h2>Read the implementation</h2><p>The desktop app, vault core, optional server, portals, website, and browser extension are published under the <a href={licenceUrl} rel="noreferrer">GNU Affero General Public License v3.0 or later</a>. Release pages link source and build evidence to the shipped version.</p></div>
    <div id="limitations"><h2>Current limitations</h2><p>The independent security review is not complete, and the browser extension is not published in browser stores.</p></div>
  </article>
</section>
