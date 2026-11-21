# CivicFlow AI — permitting workspace for Pakistan

A working prototype of an AI-assisted municipal permitting workspace. An applicant enters plot
and project details, sees which authority and which bylaws apply, gets a compliance report where
every flag cites its clause, and estimates fees and a timeline before filing.

**Live demo:** https://civicflow-ai-i4vnn3ckt63.qoder.website/
**Team:** Team Naqsha · Lahore, Pakistan
**Contact:** civicflow.ai@gmail.com

## Screens

| Route | What it does |
| --- | --- |
| `#/dashboard` | Applications overview with status, open flags and clause count |
| `#/new` | Guided application wizard — plot, land use, covered area, floors, documents |
| `#/app/:id` | Application detail, status timeline and documents |
| `#/app/:id/report` | Compliance report with cited clauses and a printable view |
| `#/library` | Regulation library — clauses with version and verification date |
| `#/fees` | Fee and timeline estimator built on the sample fee table |
| `#/assistant` | Corpus-only question assistant — cites clauses, does not invent answers |

## Run locally

The site is plain static files with no build step.

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

Files: `index.html`, `styles.css`, `app.js`, `data.js`.

## How it is built

- Vanilla JavaScript, hash routing, no framework and no build tooling
- Demo state in `localStorage` (`civicflow.apps.v1`); "Reset demo data" clears it
- No login: the demo is open, and no real user data is stored or sent anywhere

## Important notes

- All project data and by-law text in this repository are **sample content** written for the
  prototype. They are not the text of any real by-law and are not an authority decision.
- Fee rates come from a sample schedule; the timeline is a planning estimate — the authority's
  queue decides the real date.
- The assistant answers only from the included sample corpus and shows its sources.

## Deploy (GitHub Pages)

1. Repository → **Settings** → **Pages**
2. Source: **Deploy from a branch** → branch `main`, folder `/(root)`
3. The site is served at `https://<username>.github.io/<repository>/`
