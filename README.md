# ReachBy public Human Proof landing page

This directory is the only public-site artifact authorized for the current
Gate B milestone. It is a static marketing page for the free, invite-only,
human-researched UK-to-Germany pilot.

The site deliberately has:

- one small, dependency-free local script used only to prepare an email draft;
- one locality-first journey form with no email, name, age or exact-address
  field;
- no account, payment, analytics, cookie, website-side storage or tracking;
- no live journey, price, availability, supplier, or booking behavior;
- no reference to the private operator workbench; and
- no claim of a supplier integration, commercial relationship, ticket sale, or
  risk-transfer product.

The visual and verbal source of truth is
`Brand/ReachBy_Brand_Guidelines.pdf`. The deployed surface uses the approved
primary horizontal lock-up, Route Ink, Wayfinder Cobalt, Arrival Lime, Journey
Fog, Signal Coral, Slate, Inter hierarchy, 24px card language, continuous route
graphics, and the approved question/promise/proof messaging hierarchy. The
versioned logo copy must retain SHA-256
`294c9b643014d13b3f110bc724fcc7036653ac0d0e293d7564a3293886c02485`.

The `Send your journey` calls to action lead to the on-page form. Its `Continue
in email` action validates and minimises values in page memory, then opens a
prefilled draft in the visitor's own email client. The website makes no network
request and stores nothing; ReachBy receives the journey only if the visitor
chooses to send the email. Once sent, the message is handled as pilot email
under the existing access and deletion process. Before deployment, record the
chosen static host, its technical-log behavior, the custom-domain
configuration, and any external cost. Do not upload or publish the sibling
`human-proof/` directory.

## Temporary Gate B deployment record

- Host: GitHub Pages from the dedicated public repository
  `dwerner95/reachby-site`.
- Published source: only the files in this directory, copied to the root of the
  deployment repository. The private Human Proof workbench, repository plans,
  and customer records are excluded.
- Custom domain: `reachby.app`, with `www.reachby.app` redirected to the apex
  domain after DNS is configured. The checked-in `CNAME` file records the apex
  domain expected by GitHub Pages.
- Host-side technical data: GitHub may log visitor IP addresses and other
  ordinary request/security data. ReachBy adds no analytics, cookies, tracking,
  JavaScript, remote fonts, or remote assets. GitHub's exact technical-log
  retention is not controlled by ReachBy and must remain disclosed on the
  pilot privacy page.
- External hosting cost: GBP 0. The separately purchased domain cost has not
  yet been supplied by the founder and is not included in the recorded spend.
- Email safety: Squarespace DNS remains authoritative for the domain. Existing
  Google Workspace MX, SPF, DKIM, and verification records must not be removed
  or replaced during the website configuration.
- Architecture status: this is a reversible Gate B static host, not the Gate C
  or production web architecture. The planned application remains Next.js on
  Google Cloud Run in Frankfurt when its capability gate is approved.

Deployment is complete only after the repository publishing source, custom
domain, DNS records, TLS certificate, apex and `www` behavior, and live page
content have been verified. Domain ownership verification remains enabled.

Run the full repository verification before publishing:

```text
bash scripts/verify-scaffold.sh
```

The deployment itself is a separate external write. It must use the exact
reviewed `landing/` directory and must not introduce tracking or remote assets.
