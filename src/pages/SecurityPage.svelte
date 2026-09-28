<script lang="ts">
  import { productFacts } from '../lib/product-facts'
  import { productState } from '../lib/product-state.svelte'
  import { licenceUrl } from '../lib/source-links'

  const facts = $derived(productFacts(productState.status))
</script>

<section class="page-hero">
  <h1>Your vault stays on your computer</h1>
  <p class="intro">Only the desktop app can open it. {facts.syncAvailable ? 'Sync sends the server encrypted data it cannot open.' : 'The website and the server never receive it.'} This page explains how the parts fit together, and what is still unfinished.</p>
</section>

<section class="section document-section">
  <nav class="document-nav" aria-label="On this page">
    <strong>On this page</strong>
    <a href="#boundary">The three parts</a>
    <a href="#path">Before a secret moves</a>
    <a href="#protection">The vault file</a>
    <a href="#memory">While it is unlocked</a>
    <a href="#browser">Browser extension</a>
    <a href="#updates">Downloads and updates</a>
    <a href="#stored">What each side stores</a>
    <a href="#source">Check it yourself</a>
    <a href="#limitations">Not done yet</a>
  </nav>
  <article class="document-copy">
    <div id="boundary">
      <h2>Three parts, one vault</h2>
      <p>Sesame has three parts. The desktop app holds your vault. The browser extension asks the app to fill a login. The website publishes releases and runs optional accounts.</p>
      <p>Only the desktop app reads your vault. You can create, unlock, import, back up, and restore it without an account or a network connection.</p>
      <div class="security-map">
        <div class="map-outer">
          <p><strong>Website and API</strong><span>Releases and an optional account. Never your vault.</span></p>
          <p><strong>Browser extension</strong><span>Stores no passwords. Asks the app for each fill.</span></p>
        </div>
        <div class="card map-app">
          <strong>Sesame desktop app</strong>
          <div class="map-flow">
            <div class="map-node">
              <strong>Interface</strong>
              <span>Shows what you ask for.</span>
            </div>
            <p class="map-arrow"><svg viewBox="0 0 24 24" width="30" height="12" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></svg><span>Tauri IPC</span></p>
            <div class="map-node">
              <strong>Rust core</strong>
              <span>Holds the key and decides what leaves.</span>
            </div>
            <p class="map-arrow"><svg viewBox="0 0 24 24" width="30" height="12" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></svg><span>reads and writes</span></p>
            <div class="map-node">
              <strong>Vault file</strong>
              <span>Encrypted on your disk.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="path">
      <h2>Nothing leaves without your master password</h2>
      <p>Exporting, backing up, saving a recovery kit, and showing or copying a password all pass one check in the Rust core.</p>
      <ol class="gate-flow">
        <li class="gate-step"><strong>You ask</strong><span>Export, back up, or show a password.</span></li>
        <li class="gate-step gate-step-gate"><strong>You confirm</strong><span>Type your master password. The Rust core checks it.</span></li>
        <li class="gate-step"><strong>A short window opens</strong><span>Two minutes. Locking the vault closes it.</span></li>
        <li class="gate-step"><strong>Sesame acts</strong><span>It writes the file, or shows or copies the one password.</span></li>
      </ol>
      <p class="gate-refusal"><strong>A wrong password is refused.</strong> After three wrong tries, Sesame makes you wait five seconds, and the wait grows to at most five minutes.</p>
    </div>
    <div id="protection">
      <h2>How the vault file is protected</h2>
      <dl class="hardening-facts">
        <div><dt>Encryption</dt><dd>XChaCha20-Poly1305</dd></div>
        <div><dt>Master password to key</dt><dd>Argon2id, slow and memory-hard on purpose</dd></div>
        <div><dt>Opening</dt><dd>Checked as genuine first. Tampered, relabelled, and newer files are refused.</dd></div>
        <div><dt>Saving</dt><dd>Written to a new file, checked, then swapped in</dd></div>
      </dl>
      <p>If a save fails or stops halfway, your previous vault stays as it was. A vault larger than 64 MiB is refused before anything is written.</p>
      <p>Before each release, the pipeline installs the real package on Windows and Linux. It then opens, restores, restarts, and backs up every supported older backup.</p>
    </div>
    <div id="memory">
      <h2>While the vault is unlocked</h2>
      <p>The key that opens your vault is kept out of ordinary memory. On Windows it is locked out of the page file and encrypted again when idle. On Linux the kernel keeps it out of swap and crash dumps.</p>
      <p>Decrypted data is wiped from memory as soon as Sesame is done with it. Locking the vault throws the key away.</p>
    </div>
    <div id="browser">
      <h2>The extension cannot fill on its own</h2>
      <p>The extension stores no passwords and never submits a form. Every fill needs your approval in the desktop app, for that exact tab and site. A web page cannot start a fill.</p>
      <p>Saving works the same way. You choose Save this login after a fill, and the desktop app asks you to approve it.</p>
    </div>
    <div id="updates">
      <h2>Where downloads come from</h2>
      <p>Every installer is built in public CI. Sigstore ties each file to the source repository and the exact commit. The releases page lists a checksum for every file.</p>
      <p>An in-app update checks a signed receipt against the installer before it runs. Two gaps remain. The Windows installer is not Authenticode signed yet, so SmartScreen warns on first run. Linux packages do not update themselves, so download new versions from the releases page.</p>
    </div>
    <div id="stored">
      <h2>What each side stores</h2>
      <p><strong>On your computer:</strong> your vault items and attachments, your master password and derived keys, recovery material, 2FA secrets, and backup codes. All of it is encrypted in the vault file.</p>
      <p><strong>On the website, only if you make an account:</strong> your email, a password hash, and sessions you can revoke. None of it can open a vault.</p>
      <p>Sync {facts.syncAvailable ? 'is available for accounts that turn it on' : 'is turned off in the current release'}.</p>
    </div>
    <div id="source"><h2>Check it yourself</h2><p>Every part of Sesame is open source under the <a href={licenceUrl} rel="noreferrer">GNU Affero General Public License v3.0 or later</a>: the desktop app, the vault core, the server, the portals, the website, and the extension. Each release links to the source and build evidence behind it.</p></div>
    <div id="limitations"><h2>Not done yet</h2><p>No independent security audit has happened yet. The browser extension is not in the browser stores yet. Until both are done, use test data.</p></div>
  </article>
</section>
