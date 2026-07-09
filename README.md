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
| `npm test` | Run the engine + catalog test suites (via `tsx`) |
| `npm run hash-password -- "<pw>"` | Print a scrypt hash for `AUTH_PASSWORD_HASH` |
| `npm run clean` | Remove `dist/` and stale build output |

## Deploy to Fly.io

This repo includes a `Dockerfile`, `.dockerignore`, and `fly.toml` for deploying
to [Fly.io](https://fly.io). The image builds the client and server, runs in
`NODE_ENV=production` (serving the built `dist/` bundle — no Vite at runtime), and
binds `0.0.0.0`. `fly.toml` exposes a public HTTPS service.

> 🔐 **The app has no built-in login, so protect it with the HTTP Basic Auth
> gate before exposing it publicly** (see "Password-protect it" below). When
> `AUTH_PASSWORD_HASH` is set, every request must present valid credentials;
> if it is unset in production, the server logs a loud warning and serves openly.

### Prerequisites
- A Fly.io account and [`flyctl`](https://fly.io/docs/flyctl/install/) installed.
- Log in: `fly auth login`.

### One-time setup
1. **Name the app and pick a region.** Edit `app` (must be globally unique) and
   `primary_region` in `fly.toml`, or let Fly fill them in while keeping the
   included config: `fly launch --no-deploy --copy-config` (decline if it offers
   to overwrite `fly.toml`).
2. **Password-protect it.** Generate a scrypt hash of your chosen password and
   store it as a Fly secret; set the username in `fly.toml`'s `[env]`
   (`AUTH_USER`):
   ```bash
   npm run hash-password -- "your-password"        # prints saltHex:keyHex
   fly secrets set AUTH_PASSWORD_HASH="<that-output>" -a <your-app>
   ```
   The plaintext password and the hash never live in the repo. Rotate anytime by
   re-running both commands.
3. **Allocate public IPs** (first deploy only):
   ```bash
   fly ips allocate-v4 --shared -a <your-app>
   fly ips allocate-v6 -a <your-app>
   ```

### Deploy
```bash
fly deploy --depot=false    # remote build, no local Docker needed
```
`--depot=false` uses Fly's classic remote builder; the newer Depot builder has
been prone to hanging at "Waiting for depot builder...".

The app is then live at `https://<your-app>.fly.dev`, prompting for the
`AUTH_USER` / password you configured.

### Notes
- **Config is already wired:** `fly.toml` sets `NODE_ENV=production`,
  `HOST=0.0.0.0`, `PORT=8080`, and `AUTH_USER`, matching the Dockerfile.
- **Data is ephemeral** by default (no volume): recipes/inventory reset to the
  seeded defaults on each deploy. To persist them, add the `[[mounts]]` block and
  create a volume (both shown in `fly.toml`'s comments).
- **Want it fully private instead of public?** Remove `[http_service]` from
  `fly.toml`, release the IPs (`fly ips release …`), and reach it with
  `fly proxy 8080:8080 -a <your-app>` over Fly's WireGuard network.
- **Handy commands:** `fly logs`, `fly status`, `fly machine stop` (to pause billing).
- **Changing the port:** update `PORT` in `fly.toml` and `ENV PORT`/`EXPOSE` in
  the `Dockerfile` together.

### Automatic deploys (optional)

`.github/workflows/fly-deploy.yml` deploys to Fly on every push to `main`, after
lint, tests, and the build pass. It authenticates with a Fly deploy token stored
as the `FLY_API_TOKEN` GitHub Actions secret. If you need to (re)create it:

```bash
fly tokens create deploy --app <your-app-name> | grep -Eo 'FlyV1 .*' \
  | gh secret set FLY_API_TOKEN --repo <owner>/<repo>
```

With the secret in place, **any push to `main` triggers a deploy** — which, with
the private `fly.toml`, brings up the app on Fly's private network (not the public
internet). Delete the workflow file if you'd rather deploy only by hand with
`fly deploy`.

## Configuration

Copy `.env.example` to `.env` to override defaults. The app needs **no API keys**;
the settings are the network binding and the optional auth gate:

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `127.0.0.1` | Interface to bind. Change only if you understand the exposure. |
| `PORT` | `3000` | Listening port |
| `AUTH_PASSWORD_HASH` | _(unset)_ | scrypt `saltHex:keyHex` from `npm run hash-password`. When set, HTTP Basic Auth is enforced on every request. Store as a secret, never in the repo. |
| `AUTH_USER` | _(empty)_ | Basic Auth username. If empty, any username is accepted (password still required). |

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
