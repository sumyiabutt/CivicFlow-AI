# CivicFlow AI — AI-assisted municipal permitting workspace

CivicFlow AI is a working prototype of a permitting workspace for Pakistan. An applicant enters
plot and project details, sees which authority and which by-laws apply, gets a document check and
a compliance report where every flag cites its clause, and estimates fees and a timeline before
filing. It guides the applicant — it never approves the project.

| | |
| --- | --- |
| **Live demo** | https://civicflow-ai-i4vnn3ckt63.qoder.website/ |
| **Source** | https://github.com/sumyiabutt/CivicFlow-AI |
| **Team** | Team Naqsha — Sumyia Butt, Wardah Khan · BS Computer Science · Lahore, Pakistan |
| **Contact** | civicflow.ai@gmail.com |

> This is a prototype. Every application, by-law clause, fee figure and document field inside it
> is sample content written for the demo.

## What the demo covers

The first market is residential and small commercial building plans in Lahore, starting with
LDA-notified schemes. The demo follows one applicant journey end to end:

1. **Describe the project** — plot size, land use, covered area, floors, society.
2. **Resolve the authority and the rules** — the applicable authority and the clause set for
   that plot type.
3. **Check the documents** — the three documents a filing needs, with the fields read from each.
4. **Read the compliance report** — pass/fail checks, each opening its cited clause.
5. **Estimate fees and timeline** — a sample fee schedule and a planning timeline.
6. **Print** — a printable version of the report for the applicant's file.

## Screens

| Route | Screen | What it shows |
| --- | --- | --- |
| `#/dashboard` | Overview | KPI tiles (active applications, need fixes, ready to submit, clauses indexed) and the application list with status and check counts |
| `#/new` | New application | Four-step wizard: Project → Authority & rules → Documents → Report |
| `#/app/:id` | Application | Status, summary, check list and filing timeline for one application |
| `#/app/:id/report` | Compliance report | Printable report with cited clauses and pass/fail checks |
| `#/library` | Regulation library | 12 sample clauses with requirement, version, verification note and Urdu glossary, searchable |
| `#/fees` | Fees & timeline | Fee and timeline estimator built on the sample fee table |
| `#/assistant` | Assistant | Corpus-only question assistant in English or Urdu that cites clauses and does not invent answers |

### Overview

Applications are listed with a status chip — **Ready to submit**, **Needs fixes**, **In review**
or **Submitted** — plus "x / y checks passed" and the last update. "New application" opens the
wizard; "Reset demo data" in the sidebar returns everything to the seeded sample state.

### New application wizard

| Step | Inputs |
| --- | --- |
| 1 · Project | Project type, plot size, land use, covered area, floors, society |
| 2 · Authority & rules | Resolved authority and the clauses that apply to the case |
| 3 · Documents | Architectural drawings, ownership documents, site plan — with sample extracted fields |
| 4 · Report | Generated compliance report and filing timeline, with a link to the application |

### Compliance report

- Every check is pass or flag, with a clause chip that opens the clause reference, its quoted
  requirement, version and verification note.
- A timeline shows documents submitted, objection window and decision target.
- **Print compliance report** produces a clean printable view (the browser print dialog handles
  paper or PDF).

### Regulation library

Twelve sample clauses (jurisdiction, setbacks, coverage, height, parking, access, fire access,
fees and more). Each entry carries a reference such as `By-law 4.3`, a requirement, a plain-language
summary, a version label, a "Sample clause" verification note and an Urdu summary. Search works in
English and Urdu.

### Fees & timeline

- Base rate by plot size, a land-use multiplier and a floors loading, from **Schedule C**.
- Timeline: Day 0 documents submitted, Day 7 objections (if any), decision target.
- Both are planning estimates on sample rates — the authority's queue decides the real date.

### Assistant

The assistant answers only from the 12 included sample clauses: it matches the question to
clauses, shows the cited source and returns the sample Urdu gloss when Urdu is selected. If nothing
in the corpus matches, it says so instead of guessing. English and Urdu answers can also be spoken
where the browser provides voices. It is a keyword/corpus demo, not an LLM backend.

## Project structure

```text
.
├── index.html   page shell, navigation, footer, modal and toast containers
├── styles.css   design tokens and layout (desktop sidebar, mobile layout)
├── app.js       hash router, screens, wizard, report logic, assistant, storage
├── data.js      sample content: contact, authority, 12 clauses, doc types, fee schedule, seed apps
└── README.md
```

No framework, no build step, no dependencies. `index.html` loads `data.js` and `app.js` directly.

## How it works

- **Routing:** hash routes (`#/dashboard`, `#/new`, `#/app/:id`, `#/app/:id/report`, `#/library`,
  `#/fees`, `#/assistant`), rendered by a small router in `app.js`.
- **State:** applications are saved in `localStorage` under `civicflow.apps.v1`. Four applications
  are seeded on first load; "Reset demo data" clears the key and re-seeds.
- **Checks:** the report is computed from the project inputs, the document fields and the clause
  set — no network calls are made.
- **Data:** all copy and sample rules live in `data.js`, so content can be updated without touching
  the UI code.
- **Privacy:** there is no login, no backend, no analytics and no external request. Nothing leaves
  the browser.

## Run locally

Any static file server works; no tooling is required.

```bash
python -m http.server 8000
```

Open <http://localhost:8000>. Opening `index.html` directly also works in most browsers.

## Deploy on Vercel

The repository is a plain static site at its root, so Vercel needs no build configuration.

1. Push the files to GitHub (this repository).
2. In Vercel, go to **Add New… → Project** and import the `CivicFlow-AI` repository.
3. Keep the defaults and confirm:
   - **Framework Preset:** Other
   - **Root Directory:** `./`
   - **Build Command:** empty (Override off)
   - **Output Directory:** empty
   - **Install Command:** empty
4. Click **Deploy**. Vercel publishes the files as-is and shows the assigned URL on the project
   page (a `*.vercel.app` address).
5. Every later push to `main` redeploys the site automatically.
6. Optional: add a custom domain under **Settings → Domains**.

No environment variables, server functions, database or storage are required. The same files can
be served by any static host.

## Updating the site

| Change | File |
| --- | --- |
| Wording, clauses, fee table, sample applications, contact details | `data.js` |
| Screens, routing, wizard logic, report and assistant behavior | `app.js` |
| Colors, layout, spacing | `styles.css` |
| Page title, meta description, footer links | `index.html` |

`index.html` references the assets with a version query (`styles.css?v=19`, `data.js?v=19`,
`app.js?v=19`). After editing one of those files, bump the number on all three tags so returning
visitors get the new version. Then commit and push — Vercel redeploys on its own.

## Sample data and limits

- By-law text, fee rates and timeline are **sample content**, not an official notification and not
  an authority decision.
- Document fields are fixed sample values; this build does not run OCR or vision extraction.
- Nothing is submitted to an authority. The report is a preview of what a filing would need.
- The assistant is corpus-only and should not be read as legal advice.
- No login and no server: data is device-local, and clearing browser storage removes it.
- Urdu glosses are samples; speech input/output depends on the browser and installed voices.

## Team

**Team Naqsha** — Sumyia Butt and Wardah Khan, BS Computer Science, Lahore, Pakistan.
Questions, a demo or a pilot: [civicflow.ai@gmail.com](mailto:civicflow.ai@gmail.com).
