# Saponification Bench

A precision cold-process soap formulation tool. Enter your oils, pick a lye and
water setting, and the deterministic engine computes exact lye and water weights,
a fatty-acid quality profile with ideal-band gauges, and chemical safety checks —
with an inventory of your materials and a mold-fill calculator alongside.

Everything is computed locally by a deterministic engine (`src/lib/soapEngine.ts`).
There is no external AI service and no API key required.

## Run locally

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

Then open http://127.0.0.1:3000.

The server binds to `127.0.0.1` by default. It ships **no authentication**, so do
not expose it to an untrusted network. To bind elsewhere deliberately:

```bash
HOST=0.0.0.0 PORT=8080 npm run dev
```

## How it works

- **Formulate** — add oils, choose NaOH (solid bar) or KOH (liquid soap), set the
  superfat, and pick a water setting (lye concentration, water:lye ratio, or a
  manual amount). The water setting drives the solvent weight; the liquid rows
  choose which liquid (water, milk, beer, tea…) and are scaled to hit it.
- **Predict** — quality metrics (hardness, cleansing, conditioning, lather,
  longevity, trace speed) are classified against published ideal bands and shown
  on calibrated gauges, so an in-range value always reads as on-target.
- **Stay safe** — caustic, scorch, and out-of-range concentration checks flag
  hazards, with references to NIOSH / PubChem / NOAA sources.
- **Track** — a materials inventory and an activity log of real compiles and saves.

## Data

Recipes, inventory, molds, and the activity log are stored as JSON files under
`data/` (created and seeded on first run).
