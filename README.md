# ~/balaji

Terminal-flavoured personal site. Astro, static output, almost no JavaScript.

## Develop

```sh
npm install
npm run dev        # http://localhost:4321
npm run ci         # tests + type check + both builds + verify (run before deploying)
```

## Edit content

| What | Where |
|---|---|
| name, tagline, "now", bio, contact links | `src/data/profile.yaml` |
| career log | `src/data/experience.yaml` |
| achievements / extracurriculars / skills | `src/data/*.yaml` |
| toys | `src/data/toys.yaml` |
| projects | `src/content/projects/<slug>.md` |

A project file looks like:

```md
---
title: CDCL SAT solver
thread: compilers          # compilers | systems | graphics | security | ml
period: Aug–Sep 2024       # quote bare years: "2024"
context: self project
tech: [C++]
repo: https://github.com/balaji1029/SAT-Solving   # optional
featured: true             # shows on the home page (keep it to 4)
order: 4                   # position within its thread
---
- bullet one
- bullet two
```

### Privacy guard

`npm run verify` fails the build on any email address (including encoded ones), `mailto:`,
PDFs, broken internal links, a short private list of phrases (stored only as SHA-256 hashes
in `scripts/verify.mjs`; add one with `hashTerm("some phrase")`), or any change to the
career-log entry text beyond what is approved. If it trips, fix the content — don't loosen the check.

## Deploy

### GitHub Pages

Repo: `github.com/balaji1029/portfolio` → served at `https://balaji1029.github.io/portfolio/`.

1. Repo → Settings → Pages → Source: **GitHub Actions**.
2. Every push to `main` runs `.github/workflows/deploy.yml`, which builds with
   `SITE_BASE=/portfolio/` (set in the workflow) and verifies before deploying.

Moving to a `balaji1029.github.io` repo later? Delete the `SITE_BASE` line in the workflow.

### CSE homepage (`cse.iitb.ac.in/~balaji/`)

```sh
npm run build:cse && node scripts/verify.mjs dist-cse /~balaji/
rsync -av --delete dist-cse/ <user>@<cse-host>:~/public_html/
```

This **replaces** the current `public_html` (the old `index.html` and `images/excited.gif`).
Back it up first if you want to keep anything. To get the custom 404 page there, add
`ErrorDocument 404 /~balaji/404.html` to `~/public_html/.htaccess` (if the server allows it).
