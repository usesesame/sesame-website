<script lang="ts">
  import { productFacts } from '../lib/product-facts'
  import { productState } from '../lib/product-state.svelte'
  import { licenceUrl, securityPolicyUrl } from '../lib/source-links'

  const facts = $derived(productFacts(productState.status))
</script>

<section class="page-hero">
  <h1>Your vault stays on your computer</h1>
  <p class="intro">Sesame keeps your passwords in one encrypted file on your computer. Only the desktop app can open it, and only with your master password. This page explains what that protects, what it cannot protect, and what is still unfinished.</p>
</section>

<section class="section document-section">
  <nav class="document-nav" aria-label="On this page">
    <strong>On this page</strong>
    <a href="#short">The short version</a>
    <a href="#parts">How the parts fit</a>
    <a href="#what-if">What happens if</a>
    <a href="#limits">What Sesame cannot stop</a>
    <a href="#details">Technical details</a>
    <a href="#unfinished">Not done yet</a>
    <a href="#report">Report a problem</a>
  </nav>
  <article class="document-copy">
    <div id="short">
      <h2>The short version</h2>
      <ul class="short-version">
        <li><strong>Your passwords stay on your computer.</strong> <span>{facts.syncAvailable ? 'Sync sends only encrypted data the server cannot open, and you do not need an account.' : 'The website and the server never receive your vault, and you do not need an account.'}</span></li>
        <li><strong>Only you can open the vault.</strong> <span>It opens with your master password or your recovery kit. We cannot open it, and we cannot reset your password for you.</span></li>
        <li><strong>Sensitive actions ask for your password again.</strong> <span>Showing, copying, or exporting a password and making a backup all need your master password, even while the vault is unlocked.</span></li>
        <li><strong>The browser extension cannot fill on its own.</strong> <span>It holds no passwords and waits for you to approve each fill in the desktop app.</span></li>
        <li><strong>You can check the code.</strong> <span>Sesame is open source, and every download can be traced to the source code it was built from.</span></li>
      </ul>
    </div>

    <div id="parts">
      <h2>How the parts fit</h2>
      <p>Sesame has three parts. Only the desktop app reads your vault. You can create, unlock, import, back up, and restore it without an account or an internet connection.</p>
      <div class="security-map">
        <div class="map-outer">
          <p><strong>Website and server</strong><span>They publish releases and run optional accounts, and they never receive your vault.</span></p>
          <p><strong>Browser extension</strong><span>It holds no passwords and asks the app each time it fills one.</span></p>
        </div>
        <div class="card map-app">
          <strong>Sesame desktop app</strong>
          <div class="map-flow">
            <div class="map-node">
              <strong>Window</strong>
              <span>This is what you see and click.</span>
            </div>
            <p class="map-arrow"><svg viewBox="0 0 24 24" width="30" height="12" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></svg><span>asks</span></p>
            <div class="map-node">
              <strong>Vault core</strong>
              <span>It holds the key and decides what leaves the app.</span>
            </div>
            <p class="map-arrow"><svg viewBox="0 0 24 24" width="30" height="12" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></svg><span>reads and writes</span></p>
            <div class="map-node">
              <strong>Vault file</strong>
              <span>It stays encrypted on your disk.</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="what-if">
      <h2>What happens if</h2>
      <div class="what-if">
        <section>
          <h3>Someone steals your laptop</h3>
          <div>
            <p>The vault file is encrypted. To open it, a thief has to guess your master password, and Sesame makes every guess slow on purpose. A long master password is your best protection, so Sesame asks for at least 12 characters.</p>
          </div>
        </section>
        <section>
          <h3>Someone uses your computer while you are away</h3>
          <div>
            <p>By default the vault locks after five minutes without use, and when the computer wakes from a longer sleep. Some Linux desktops do not report idle time, so lock the vault yourself there.</p>
            <p>Even while it is unlocked, showing or copying a password asks for your master password. After three wrong tries Sesame makes them wait, starting at five seconds and growing to five minutes.</p>
          </div>
        </section>
        <section>
          <h3>A website tries to take a password</h3>
          <div>
            <p>A web page cannot start a fill by itself. The desktop app shows you which site is asking and waits for your answer, and it refuses any site whose address imitates one you saved.</p>
          </div>
        </section>
        <section>
          <h3>Our server is broken into</h3>
          <div>
            <p>{facts.syncAvailable ? 'The server holds only encrypted data it cannot open.' : 'The server never has your vault.'} If you made an account, the server holds your email, a password hash, and your sessions, and none of that can open a vault.</p>
          </div>
        </section>
        <section>
          <h3>Someone tampers with a download</h3>
          <div>
            <p>Every installer is built in public on GitHub. Its Sigstore record names the exact source commit, and the releases page lists a checksum for every file. The app installs an update only when it carries Sesame's signature.</p>
          </div>
        </section>
        <section>
          <h3>You forget your master password</h3>
          <div>
            <p>Use your recovery kit to set a new one. If you still know the password but lost the kit, you can ask for a new kit. It is ready after 72 hours, and every unlock warns you until then, so you can cancel a request you did not make.</p>
            <p>If you lose both the password and the kit, nobody can open the vault, including us.</p>
          </div>
        </section>
      </div>
    </div>

    <div id="limits">
      <h2>What Sesame cannot stop</h2>
      <p>No password manager can protect you from everything, and these are the limits we know about.</p>
      <ul>
        <li>Malware running on your computer can read your screen, record your keys, and read the app's memory while the vault is unlocked.</li>
        <li>Malware in your browser can pretend to be the extension, so the approval in the Sesame window is the last check before a fill.</li>
        <li>A PIN is a shortcut for this computer rather than a second lock. Software running as you can try PINs against a copy of the vault file, and each extra digit makes that ten times slower.</li>
        <li>Changing your master password does not change backups, exports, or system backups you made before the change.</li>
        <li>Anyone who can write to the vault folder can put back an older copy of the vault, and Sesame does not notice that yet.</li>
        <li>Whoever learns your master password or recovery kit can open any copy of your vault, so keep the kit offline.</li>
      </ul>
    </div>

    <div id="details">
      <h2>Technical details</h2>
      <p>This part is for readers who want to check the design against the source code.</p>
      <dl class="hardening-facts">
        <div><dt>Encryption</dt><dd>XChaCha20-Poly1305</dd></div>
        <div><dt>Master password to key</dt><dd>Sesame uses Argon2id with at least 64 MiB of memory and 3 passes, and refuses files with weaker settings.</dd></div>
        <div><dt>Opening a file</dt><dd>Sesame checks that a file is genuine before reading it, and refuses files that were tampered with, relabelled, or made by a newer version.</dd></div>
        <div><dt>Saving</dt><dd>Sesame writes a new file, checks it, and then swaps it in, so a failed save leaves the old vault as it was.</dd></div>
        <div><dt>Key in memory on Windows</dt><dd>The key stays out of the page file, and Sesame keeps it encrypted between uses.</dd></div>
        <div><dt>Key in memory on Linux</dt><dd>The key stays out of swap, crash dumps, and child processes.</dd></div>
        <div><dt>Breach check</dt><dd>Sesame sends only the first 5 characters of the password's SHA-1 hash to Have I Been Pwned.</dd></div>
        <div><dt>Website icons</dt><dd>Icons stay off until you turn them on, because fetching an icon tells that site you saved it.</dd></div>
      </dl>
    </div>

    <div id="unfinished">
      <h2>Not done yet</h2>
      <ul>
        <li>Sesame has not had an independent security audit yet, so please use test data for now.</li>
        <li>The browser extension is not in the browser stores yet.</li>
        <li>The Windows installer is not Authenticode signed yet, so SmartScreen warns on first run.</li>
        <li>Linux packages do not update themselves yet, so download new versions from the releases page.</li>
        {#if !facts.syncAvailable}<li>Sync is turned off until it passes its own security review.</li>{/if}
      </ul>
    </div>

    <div id="report">
      <h2>Report a problem</h2>
      <p>If you find a security problem, report it privately with GitHub's Report a vulnerability form. Please do not open a public issue, and use made-up data in your report. The <a href={securityPolicyUrl} rel="noreferrer">security policy</a> says what to include and how fast we reply.</p>
      <p>Every part of Sesame is open source under the <a href={licenceUrl} rel="noreferrer">GNU Affero General Public License v3.0 or later</a>, so you can read the code behind every claim on this page.</p>
    </div>
  </article>
</section>
