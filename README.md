# ReachBy public marketing site

This repository is the single source of truth for the public ReachBy website
hosted at `reachby.app` through GitHub Pages. It presents the intended
UK-to-Germany complete-journey product without claiming that public journey
search, live supplier data, booking, ticketing, payment, monitoring, or
protection is already available.

The page is intentionally dependency-free and informational only:

- no form, journey intake, account, analytics, cookie, tracking, storage, API,
  or JavaScript;
- no external font, image, script, provider, or data request;
- one general `mailto:` contact action; and
- a discreet coming-soon and no-ticket-sales boundary.

The displayed Birmingham-to-Erlangen journey is an illustrative future
experience, not a live result or recommendation.

## Local verification

Run from this repository root:

```sh
python3 scripts/verify-site.py
```

To preview the page, serve the repository root from a loopback-only static
HTTP server. No build or package installation is required.

## Deployment

GitHub Pages publishes the root of `main`. The checked-in `CNAME` preserves
`reachby.app`; Squarespace remains the DNS manager and Google Workspace mail
records must remain untouched. A deployment is complete only after the live
HTTPS page is checked for the new content.

The private Sites experiment and the main `dwerner95/ReachBy` product
repository are not website deployment sources.
