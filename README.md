# Sesame website

This is the public site for Sesame: product pages, pricing, the roadmap,
release notes, legal pages and support. It is fully static and holds no
accounts or vault data, and anything that needs a sign-in lives in the account
portal on its own origin.

## Build

```bash
npm ci
VITE_SESAME_SITE_ORIGIN=https://example.com VITE_SESAME_PRIVACY_EMAIL=privacy@example.com npm run build
```

The build needs those two settings, because the site origin goes into canonical
URLs and the sitemap and the privacy policy publishes the email. Two more are
optional. `VITE_SESAME_API_URL` lets the site refresh product, plan, release
and commit information from the API, and without it every page renders from
the local copies. `VITE_SESAME_ACCOUNT_URL` adds links into the account portal,
and without it the site leaves them out.

## Test

```bash
npm run ci
```

That runs everything a pull request needs, including a build with no API or
account portal that fails if the Content-Security-Policy names a host the site
doesn't use. There is no browser test suite yet.

Run `npm run activity:refresh` before a release. The home page falls back to
the commit counts in `src/lib/project-activity.json` when the API is
unavailable, and a release won't stage when that file is more than 14 days old.

## Deploy

Each deploy stages the built site as its own release folder, checks it, and
then switches the `current` link to it in one step. The live site is never
half updated, and the previous release stays on disk for a rollback.

```bash
npm run site:release:prepare dist /srv/website-releases
npm run site:release:deploy /srv/website-releases switch b<revision>
npm run site:release:deploy /srv/website-releases status
npm run site:release:deploy /srv/website-releases rollback
npm run site:release:deploy /srv/website-releases caddy-check b<revision> /etc/caddy/Caddyfile
```

The check re-hashes every file and makes sure the headers and every page
reference only what the release contains. `_headers` is the one source of the
header policy, and `caddy-check` fails the deploy until the proxy config
matches it, so change `_headers` rather than editing the proxy around it.

To set up a new host, create `/srv/website-releases` on the same filesystem as
the old site and point the proxy root at `/srv/website-releases/current`. If
the host has no Node, stage the release elsewhere and switch it there with
`ln -s releases/<revision> current.tmp && mv -Tf current.tmp current`, then run
`switch <revision>` from a machine that can reach the release folder so the
history records it.
