<script lang="ts">
  import { LEGAL_UPDATED, LEGAL_VERSION } from '../lib/legal'
</script>

<section class="page-hero compact-page-hero legal-hero">
  <h1>Cookie policy.</h1>
  <p class="intro">Sesame uses security cookies only when you use an account action that needs them. It does not use analytics, advertising, or third-party tracking cookies.</p>
  <p class="page-meta">Version {LEGAL_VERSION} · Updated {LEGAL_UPDATED} · Part of our <a href="/privacy">privacy policy</a></p>
</section>
<section class="section document-section">
  <nav class="document-nav" aria-label="On this page">
    <strong>On this page</strong>
    <a href="#about">About cookies</a>
    <a href="#used">Cookies we use</a>
    <a href="#consent">Consent &amp; legal basis</a>
    <a href="#manage">Managing cookies</a>
  </nav>
  <article class="document-copy">
    <div id="about"><h2>About cookies</h2><p>Cookies are small files a website stores in your browser. Sesame uses only security and sign-in cookies that are necessary for an account action you request. Public product pages do not set them. Because there are no optional cookies, Sesame does not show a consent banner or save a cookie-banner preference.</p></div>
    <div id="used"><h2>Cookies we use</h2>
      <div class="cookie-table" role="table" aria-label="Cookies Sesame uses">
        <div class="cookie-row cookie-head" role="row"><span role="columnheader">Name</span><span role="columnheader">Purpose</span><span role="columnheader">Type</span><span role="columnheader">Duration</span></div>
        <div class="cookie-row" role="row"><span role="cell"><code>sesame_csrf</code></span><span role="cell">Protects a sign-in, registration, recovery, support, or account change request from cross-site request forgery</span><span role="cell">Strictly necessary, first-party, HttpOnly</span><span role="cell">Up to 1 hour</span></div>
        <div class="cookie-row" role="row"><span role="cell"><code>sesame_session</code></span><span role="cell">Keeps you signed in to a website account</span><span role="cell">Strictly necessary, first-party, HttpOnly</span><span role="cell">Up to 30 days; cleared on sign out</span></div>
        <div class="cookie-row" role="row"><span role="cell"><code>sesame_wan</code></span><span role="cell">Binds a temporary passkey ceremony to the browser that started it</span><span role="cell">Strictly necessary, first-party, HttpOnly</span><span role="cell">Up to 10 minutes; cleared after use</span></div>
      </div>
      <p>These are first-party cookies. They are sent with <code>Secure</code> on HTTPS and use a restrictive same-site setting. The account API does not use them for analytics or advertising.</p>
    </div>
    <div id="consent"><h2>Consent and choices</h2><p>These cookies are limited to the account action you requested and are not used for tracking. If Sesame adds a non-essential cookie or similar browser storage, it will request opt-in consent before setting it and provide an equally clear way to withdraw it.</p></div>
    <div id="manage"><h2>Managing cookies</h2><p>You can delete or block these cookies in your browser settings. Doing so can prevent sign-in, passkey use, account changes, or support submissions from working, but it does not affect the desktop app or a local vault.</p><p class="doc-meta">Version {LEGAL_VERSION} · Updated {LEGAL_UPDATED}.</p></div>
  </article>
</section>
