# Sesame website

This is the public site for Sesame: product pages, pricing, the roadmap,
release notes, legal pages and support. It is fully static and holds no
accounts or vault data, and anything that needs a sign-in lives in the account
portal on its own origin.

## Build

```bash
npm ci
cp .env.example .env.local
npm run build
```

The build needs `VITE_SESAME_SITE_ORIGIN` and `VITE_SESAME_PRIVACY_EMAIL`,
because the origin goes into canonical URLs and the sitemap and the privacy
policy publishes the email. `.env.local` holds them for every later command,
and a deployment sets them in its own environment. Two more are optional.
`VITE_SESAME_API_URL` lets the site refresh product, plan, release and commit
information from the API, and without it every page renders from the local
copies. `VITE_SESAME_ACCOUNT_URL` adds links into the account portal, and
without it the site leaves them out.

## Test

```bash
npm run ci
```

That runs everything a pull request needs except the `static-only` job in
GitHub CI, which builds with no API or account portal, refuses a
Content-Security-Policy that names a host the site doesn't use, and stages and
validates the result as a release. There is no browser test suite yet.

## Deploy

A release goes out in four steps. Refresh the commit counts, because the home
page falls back to `src/lib/project-activity.json` when the API is unavailable
and a release won't stage when that file is more than 14 days old. Then build
and stage the release, check the proxy config, and switch to it.

```bash
npm run activity:refresh
npm run build
npm run site:release:prepare dist /srv/website-releases
npm run site:release:deploy /srv/website-releases caddy-check b<revision> /etc/caddy/Caddyfile
npm run site:release:deploy /srv/website-releases switch b<revision>
```

`switch` re-hashes every file and checks the headers before it moves the
`current` link, and the move itself is a single rename. A page that was
already loading can still ask for a file the new release no longer has. The
previous release stays on disk, and `status` shows what is live.

`_headers` is the one source of the header policy, so change it rather than
editing the proxy around it. `caddy-check` fails until the proxy config
matches, which is why it runs before the switch.

To go back to the previous release:

```bash
npm run site:release:deploy /srv/website-releases rollback
```

To set up a new host, create `/srv/website-releases` on the same filesystem as
the old site and point the proxy root at `/srv/website-releases/current`. If
the host has no Node, stage the release elsewhere, then run
`ln -s releases/<revision> current.tmp && mv -Tf current.tmp current` from
`/srv/website-releases` on the host. Afterwards run `switch <revision>` from a
machine that can reach the release folder so the history records it.
