# syntax=docker/dockerfile:1

# ---- Build stage: install all deps and produce dist/ ----
FROM node:22-slim AS build
WORKDIR /app

# Install dependencies against the lockfile (includes dev deps needed to build).
COPY package.json package-lock.json ./
RUN npm ci

# Build the client (Vite) and bundle the server (esbuild -> dist/server.cjs).
COPY . .
RUN npm run build

# ---- Runtime stage: ship dist/ + node_modules and run the server ----
FROM node:22-slim
WORKDIR /app

# Production mode makes the server serve the built dist/ instead of Vite,
# and 0.0.0.0 is required so Fly can reach it. PORT matches fly.toml's internal_port.
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080

# The server bundle keeps npm packages external (and imports `vite` at load time),
# so the runtime needs node_modules from the build stage.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
# (runtime base is node:22-slim — kept in sync with the build stage and CI)

# The app persists recipes/inventory/molds/activity as JSON under ./data,
# created on first run. Mount a Fly volume here to keep data across deploys.
EXPOSE 8080
CMD ["node", "dist/server.cjs"]
