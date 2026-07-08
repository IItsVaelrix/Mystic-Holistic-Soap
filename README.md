# Mystic Holistic Soap — Saponification Bench

A precision **cold- and hot-process soap formulation tool**. Enter your oils, pick a
lye and water setting, and a deterministic engine computes exact lye and water
weights, a fatty-acid quality profile with ideal-band gauges, and chemical safety
checks — with a materials inventory and a mold-fill calculator alongside.

Everything is computed **locally** by a deterministic engine
(`src/lib/soapEngine.ts`). There is **no external AI service and no API key
required** — the app runs fully offline.

> ⚠️ **Safety notice:** This tool assists with lye-soap formulation. Sodium
> hydroxide (NaOH) and potassium hydroxide (KOH) are caustic and can cause
> severe burns. Always verify calculations independently, wear appropriate
> protection, and follow established soap-making safety practice. The numbers
> here are an aid, not a substitute for your own judgment.

---

## Features

- **Formulator** — add oils and butters, choose **NaOH** (solid bar) or **KOH**
  (liquid soap), set the superfat percentage, and pick a water setting
  (lye concentration, water-to-lye ratio, or a manual amount). Liquid rows let
  you choose the actual liquid (water, milk, beer, tea…), scaled to hit the
  target solvent weight.
- **Quality prediction** — hardness, cleansing, conditioning, bubbly/creamy
  lather, longevity, and trace speed are derived from the fatty-acid profile,
  classified against published ideal bands, and shown on calibrated gauges so an
  in-range value always reads as on-target.
- **Additive chemistry** — a versioned additive catalog models colorants,
  exfoliants, fragrances, and actives, producing a chemistry report with usage
  notices.
- **Safety checks** — caustic, scorch, and out-of-range concentration rules flag
  hazards with references to NIOSH / PubChem / NOAA sources.
- **Inventory manager** — track your oils, lyes, and additives, with low-stock
  flagging.
- **Mold calculator** — size a batch to fill a given mold volume.
- **Activity log** — a running record of real compiles, recommendations, and
  saves, each tagged with a formulation fingerprint.

## Architecture

| Layer | Tech | Notes |
|-------|------|-------|
| Frontend | **React 19** + TypeScript | Vite dev server & build |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite`) | |
| Icons | **lucide-react** | |
| Backend | **Express** (`server.ts`) | Serves the API and (in dev) proxies Vite |
| Engine | `src/lib/soapEngine.ts` | Deterministic bytecode compiler + executor |
| Storage | JSON files under `data/` | Created and seeded on first run |

### The formulation engine

The engine treats a recipe as a program. A recipe draft is **compiled** into a
sequence of `SoapOpcode` instructions (`compileRecipeDraft`) and then **executed**
(`executeSoapBytecode`) to produce lye/water weights, the fatty-acid quality
profile, safety warnings, and the additive chemistry report. Because the pipeline
is fully deterministic, identical inputs always yield identical output — and each
formulation gets a stable fingerprint hash (`generateFormulationHash`) used
throughout the activity log.

Key constants: `COMPILER_VERSION = 2.0.0`, `CATALOG_VERSION = 2026.2`.

## Getting started

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

Then open **http://127.0.0.1:3000**.

The server binds to `127.0.0.1` by default. It ships **no authentication**, so do
not expose it to an untrusted network. To bind elsewhere deliberately:

```bash
HOST=0.0.0.0 PORT=8080 npm run dev
```

### Build & run production

```bash
npm run build   # vite build + esbuild bundle of the server → dist/
npm run start   # node dist/server.cjs
```

### Other scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start the dev server (Express + Vite, HMR) |
| `npm run build` | Build the client and bundle the server to `dist/` |
| `npm run start` | Run the built production server |
| `npm run preview` | Preview the Vite production build |
| `npm run lint` | Type-check with `tsc --noEmit` |
| `npm run clean` | Remove `dist/` and stale build output |

## Configuration

Copy `.env.example` to `.env` to override defaults. The app needs **no API keys**;
the only settings are the network binding:

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `127.0.0.1` | Interface to bind. Change only if you understand the exposure. |
| `PORT` | `3000` | Listening port |

## API

All endpoints are JSON over HTTP.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/compile` | Compile & execute a recipe draft; returns result + trace |
| `POST` | `/api/recommendations` | Formulation advisor suggestions |
| `GET/POST` | `/api/recipes` | List / create recipes |
| `PUT/DELETE` | `/api/recipes/:id` | Update / delete a recipe |
| `GET/POST` | `/api/inventory` | List / add inventory items |
| `PUT/DELETE` | `/api/inventory/:id` | Update / remove an inventory item |
| `GET/POST` | `/api/molds` | List / add mold profiles |
| `PUT/DELETE` | `/api/molds/:id` | Update / remove a mold |
| `GET` | `/api/activity` | Recent activity feed |

## Data & persistence

Recipes, inventory, molds, and the activity log are stored as JSON files under
`data/`, which is **created and seeded with sensible defaults on first run**. This
directory holds runtime state and is git-ignored — a fresh clone will regenerate
it automatically the first time the server starts.

## Project structure

```
├── server.ts                  # Express server + API routes
├── index.html                 # Vite entry
├── vite.config.ts             # Vite + Tailwind config
├── src/
│   ├── App.tsx                # Tabbed UI shell (formulator / inventory / activity)
│   ├── main.tsx               # React entry
│   ├── types.ts               # Shared domain types
│   ├── components/            # RecipeBuilder, QualityPredictor, InventoryManager,
│   │                          #   MoldCalculator, ThreatTelemetry, NumberField
│   └── lib/
│       ├── soapEngine.ts      # Deterministic compiler + executor
│       ├── additiveCatalog.ts # Versioned additive catalog
│       └── serverDb.ts        # JSON-file persistence + seeding
└── Mystic Holistics Soap Forge Encyclopedia/
                               # Whitepaper, bug reports, and design records
```

## Documentation

The `Mystic Holistics Soap Forge Encyclopedia/` directory contains supplementary
docs — a whitepaper, bug reports, and product design records (PDRs) covering the
formulation model and additive system.

## License

Source files are marked `SPDX-License-Identifier: Apache-2.0`.
