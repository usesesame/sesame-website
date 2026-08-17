# Security policy

This repository holds the public Sesame website. It is a static site: it holds
no account, no session, and no vault, and it builds with no database, no API,
and no secret.

## Reporting a vulnerability

**Do not open a public issue, discussion, or pull request for a security
problem.** Use GitHub private vulnerability reporting: open the repository's
**Security** tab and choose **Report a vulnerability**.

### What to include

- What an attacker gains, in one sentence.
- The exact page, and whether the deployment had an API configured.
- The steps to reproduce it, in order.

### What not to include

Never send a real password, vault, export, or account token. This site cannot
receive any of them, and a report does not need one.

### What happens next

- We acknowledge within 5 working days.
- We give an assessment and a rough timeline within 10 working days.

## Scope

In scope:

- Anything that makes this site send, receive, or store credentials. It is
  built not to do that: its API client sends no cookies, no CSRF token, and no
  unsafe method. A way around that is the highest-severity issue here.
- Content injection: markup or script reaching a page from published metadata
  or a URL parameter.
- A Content-Security-Policy or security header that the build emits wrongly,
  including naming a host the site does not use.
- A link that sends a visitor somewhere the deployment did not configure.

Out of scope, and owned elsewhere:

- Anything requiring a sign-in. Sessions live in the account portal, in
  `usesesame/sesame-server`.
- The API this site optionally reads from. Report those against the server.
- The desktop vault, in `usesesame/sesame-desktop`.
- Missing hardening with no demonstrated impact, and denial of service through
  traffic volume.

## Safe harbour

We will not pursue or support legal action against research that stays within
the scope above, avoids degrading the site for others, and gives us reasonable
time to ship a fix before public disclosure.
