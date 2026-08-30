<script lang="ts">
  import { IMPORT_FORMAT_COUNT } from '../lib/product-facts'
  import { licenceUrl } from '../lib/source-links'
</script>

<section class="page-hero">
  <h1>What Sesame handles, and what it does not.</h1>
  <p class="intro">The desktop application is the only Sesame product that handles vault contents. The website and API publish product information and release metadata.</p>
</section>

<section class="section document-section">
  <nav class="document-nav" aria-label="On this page">
    <strong>On this page</strong>
    <a href="#boundary">Product boundary</a>
    <a href="#path">The path of a secret</a>
    <a href="#hardening">What 0.2.0 closes</a>
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
      <p>Since 0.2.0, every path that writes a vault copy or reveals a stored password passes one gate inside the Rust host.</p>
      <ol class="gate-flow">
        <li class="gate-step"><strong>You ask</strong><span>Export, backup, recovery kit, or reveal a password.</span></li>
        <li class="gate-step gate-step-gate"><strong>The host verifies you</strong><span>Your master password, checked in the Rust process.</span></li>
        <li class="gate-step"><strong>A short grant opens</strong><span>Two minutes, this session. Locking ends it.</span></li>
        <li class="gate-step"><strong>Sesame acts</strong><span>The host writes the file or reveals the one secret.</span></li>
      </ol>
      <p class="gate-refusal"><strong>Without the master password,</strong> the command is refused. Failed attempts wait five seconds, then longer, up to five minutes.</p>
    </div>
    <div id="hardening">
      <h2>What 0.2.0 closes that 0.1.1 left open</h2>
      <p>Each row is a path malware on your computer, or a stolen vault file, could take. Left: 0.1.1. Right: 0.2.0.</p>
      <dl class="hardening-facts">
        <div><dt>Master password grant</dt><dd>2 minutes, this session only</dd></div>
        <div><dt>Wait after repeated failures</dt><dd>5 seconds up to 5 minutes</dd></div>
        <div><dt>New attack tests</dt><dd>43 across vault files, PIN lockout, and fill</dd></div>
        <div><dt>Secrets in the window</dt><dd>No password until a gate opens, no seed at all</dd></div>
      </dl>
      <div class="then-now">
        <article class="path-row">
          <h3>Reading a saved password or 2FA seed through the interface</h3>
          <div class="path-lanes">
            <div class="path-lane path-lane-old">
              <span class="path-tag">0.1.1</span>
              <p>A login card carried the stored password and the raw 2FA seed on every detail view, so a compromised window could walk item ids and collect every secret.</p>
              <span class="path-stop path-stop-bad">Reached the interface</span>
            </div>
            <div class="path-lane path-lane-new">
              <span class="path-tag">0.2.0</span>
              <p>The card carries flags only. A password passes the master password gate to show, copy, or breach-check, and the seed never arrives at all.</p>
              <span class="path-stop path-stop-good">Stopped at the gate</span>
            </div>
          </div>
        </article>
        <article class="path-row">
          <h3>Writing a vault copy to disk</h3>
          <div class="path-lanes">
            <div class="path-lane path-lane-old">
              <span class="path-tag">0.1.1</span>
              <p>Export, backup, and recovery-kit commands ran on the unlocked session alone.</p>
              <span class="path-stop path-stop-bad">Reached the file</span>
            </div>
            <div class="path-lane path-lane-new">
              <span class="path-tag">0.2.0</span>
              <p>The three commands refuse without the master password grant. The window can neither read it nor extend it.</p>
              <span class="path-stop path-stop-good">Stopped at the gate</span>
            </div>
          </div>
        </article>
        <article class="path-row">
          <h3>Lifting the vault key out of memory</h3>
          <div class="path-lanes">
            <div class="path-lane path-lane-old">
              <span class="path-tag">0.1.1</span>
              <p>The key sat in a plain field any host code could read, and Windows could spill it to the page file.</p>
              <span class="path-stop path-stop-bad">Reached process memory</span>
            </div>
            <div class="path-lane path-lane-new">
              <span class="path-tag">0.2.0</span>
              <p>On Windows it is locked out of the page file, re-encrypted when idle, and reachable only through one guarded call. Other systems wipe it after use.</p>
              <span class="path-stop path-stop-good">Contained in guarded memory</span>
            </div>
          </div>
        </article>
        <article class="path-row">
          <h3>Opening a stolen or damaged vault file</h3>
          <div class="path-lanes">
            <div class="path-lane path-lane-old">
              <span class="path-tag">0.1.1</span>
              <p>The suites proved what a well-formed vault does. A stolen file met no systematic tests.</p>
              <span class="path-stop path-stop-bad">Largely untested</span>
            </div>
            <div class="path-lane path-lane-new">
              <span class="path-tag">0.2.0</span>
              <p>Relabelled formats, transplanted key wraps, flipped ciphertext, reused nonces, and oversized backups must all fail to open. The suite caught one real fill bug, now fixed.</p>
              <span class="path-stop path-stop-good">Tested, must fail</span>
            </div>
          </div>
        </article>
      </div>
    </div>
    <div id="local"><h2>Data kept on your device</h2><p>The desktop app keeps vault files encrypted and opens them with the unlock method you configure. These values are not sent to the website or API:</p><ul><li>Vault items and document attachments</li><li>Master passwords, derived keys, and recovery material</li><li>Imports from {IMPORT_FORMAT_COUNT} supported formats</li><li>2FA seeds, backup codes, and recovery notes</li></ul></div>
    <div id="service"><h2>Data handled by the website and API</h2><p>The service publishes product and release information. If you create a website account, it stores the account email, password hash, and revocable sessions separately from any vault.</p><p>Sync is disabled in the current release. The packaged browser extension stores no credentials, never submits a form, and requires approval from the unlocked desktop app for each fill.</p></div>
    <div id="source"><h2>Read the implementation</h2><p>The desktop app, vault core, optional server, portals, website, and browser extension are published under the <a href={licenceUrl} rel="noreferrer">GNU Affero General Public License v3.0 or later</a>. Release pages link source and build evidence to the shipped version.</p></div>
    <div id="limitations"><h2>Current limitations</h2><p>The independent security review is not complete. Sync is disabled, and the browser extension is not published in browser stores. Use test data while evaluating this beta.</p></div>
  </article>
</section>
