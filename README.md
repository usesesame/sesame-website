# Sesame website

The public marketing site covers product pages, pricing, roadmap, release
information, legal documents, and where to get support. It holds no account, no session, and no vault. Everything that needs a sign-in lives in the account portal, on its own origin.

The site is static. It renders every page from local content at build time, and a deployment needs no database, no API, and no secret.

## Build

```bash
npm ci
npm run build
```

Two settings are required, and neither is a service or a secret:

| Setting | Why it is required |
| --- | --- |
| `VITE_SESAME_SITE_ORIGIN` | Canonical URLs and the sitemap. A wrong value is an SEO defect that ships silently, so an absent one fails the build |
| `VITE_SESAME_PRIVACY_EMAIL` | The contact address the privacy policy publishes |

Two more are optional, and the site is complete without either:

| Setting | What it adds |
| --- | --- |
| `VITE_SESAME_API_URL` | Refreshes published product, plan, and release information. With none configured the site reads nothing, its `connect-src` stays `'self'`, and the same pages render from local fallbacks |
| `VITE_SESAME_ACCOUNT_URL` | Links into the account portal. With none configured the site stops offering them rather than emitting a link that goes nowhere |

No production origin is compiled into the site. A deployment supplies its own.

## Test

```bash
npm run ci
```

That runs the design-token contract, lint, the type check, the production
build, the SEO check, the product-facts check, and the release, sync-status,
governance, and public-client contract suites against the built output.
The product-facts check validates the generated status and release files
against the canonical parsers, then reads every built page and rejects
availability claims that contradict the canonical status, and any
import-format count other than the canonical one.

No browser suite exists yet. `npm run test` builds the site, runs the
product-facts check, runs the release, sync-status, governance, and
public-client contract suites, and then prints a skip notice, so a build
failure is still caught while the specs are missing. When they land they
should use fictional intercepted API data, and cover the site working with
every request aborted and no public page reading a route that carries a
session.

The `static-only` CI job is the exit gate for a static site: it builds with no
API and no account portal at all, and fails if the shipped
Content-Security-Policy names a host the site does not use. The same job also
stages and validates the built release, so a policy that does not match the
rendered pages fails CI.

## Deploy

A deployment stages the built site as an immutable, content-addressed release,
validates it, and switches a `current` symlink atomically. A failed validation
never touches the live tree, and the replaced revision stays on disk for
rollback.

```bash
VITE_SESAME_SITE_ORIGIN=... VITE_SESAME_PRIVACY_EMAIL=... npm run build
npm run site:release:prepare dist /srv/website-releases
npm run site:release:deploy /srv/website-releases switch b<revision>
npm run site:release:deploy /srv/website-releases status
npm run site:release:deploy /srv/website-releases rollback        # previous revision
npm run site:release:deploy /srv/website-releases caddy-check b<revision> /etc/caddy/Caddyfile
```

Validation re-checks every recorded file digest, the required files, the
header policy (including that the inline script hashes match the rendered
pages), and that every page or stylesheet references only content the release
contains. The switch renames a staging symlink over `current`, so a reader
never sees a half-deployed tree, and `deployed.json` records the live revision
and its history.

One-time host setup: move the old in-place tree aside, create
`/srv/website-releases` on the same filesystem, point the proxy root at
`/srv/website-releases/current`, and bring the proxy header block in step with
the built policy (`caddy-check` names every difference and fails the deploy
while they disagree). `_headers` is the single authority; the proxy must never
be edited around it. When the host has no Node, stage remotely and finish the
switch there with `ln -s releases/<revision> current.tmp && mv -Tf current.tmp
current`; `status` then reports the live-versus-recorded difference, and
running `switch <revision>` from a machine that reaches the release root
records the history entry. The mismatch stays visible until it is recorded;
nothing papered over it.
