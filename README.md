# Sesame website

The public marketing site: product pages, pricing, roadmap, release
information, legal documents, and where to get support. It holds no account,
no session, and no vault. Everything that needs a sign-in lives in the account
portal, on its own origin.

The site is static. It renders every page from local content at build time,
and a deployment needs no database, no API, and no secret.

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
build, and the SEO check against the built output.

No browser suite exists yet. `npm run test` builds the site and then prints a
skip notice, so a build failure is still caught while the specs are missing.
When they land they should use fictional intercepted API data, and cover the
site working with every request aborted and no public page reading a route that
carries a session.

The `static-only` CI job is the exit gate for a static site: it builds with no
API and no account portal at all, and fails if the shipped
Content-Security-Policy names a host the site does not use.
