# ReachBy Site Agent Contract

This repository is the sole source of truth for the dependency-free public
marketing site at `reachby.app`.

## Product boundary

The website may describe ReachBy's intended UK-to-Germany complete-journey
planning product and show clearly illustrative future experiences. It must
not imply that public journey search, live provider data, supplier permission,
booking, repricing, ticketing, transport payment, monitoring, Journey Guard,
protection, compensation, membership, or EventFlow is available.

Keep the page informational and zero-storage:

- no forms, journey intake, accounts, analytics, cookies, tracking, APIs,
  client storage, or JavaScript;
- no remote scripts, fonts, images, styles, providers, or other resources;
- no production personal data, credentials, tokens, or provider payloads;
- retain the visible public-search-coming-later and no-ticket-payment
  disclosure; and
- label journey examples as illustrative rather than live recommendations.

## Implementation and verification

Use semantic HTML, local CSS and reviewed local assets. Preserve keyboard
navigation, visible focus, sufficient colour contrast, reduced-motion
behaviour, responsive layouts, and meaningful alternative text.

Keep `CNAME` equal to `reachby.app`. Do not add a package manager, build step,
framework, deployment workflow, or dependency without an explicit owner
decision. Do not alter Squarespace DNS or Google Workspace mail records from
this repository.

For every change, run:

```sh
python3 scripts/verify-site.py
```

Inspect the complete diff and preserve unrelated work. Commit, push, publish,
or change external configuration only when the current goal authorizes it.
