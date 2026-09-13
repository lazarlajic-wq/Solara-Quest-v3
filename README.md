# Solara Quest

A top-down 2D pixel-art MMORPG built with Phaser 3, TypeScript and Vite.

This repository is early in a multi-phase build — see
[`docs/gameplay/phase-status.md`](docs/gameplay/phase-status.md) for exactly
what is and isn't implemented yet, and
[`docs/architecture/overview.md`](docs/architecture/overview.md) for the
project layout.

## Quick start

```bash
npm install
npm run dev
```

Open the printed `localhost` URL, create a character, and walk around the
Solara Coast start town (WASD/arrows to move, Shift to dash, E to interact).

## Other scripts

```bash
npm run typecheck       # TypeScript across the client
npm run build            # production build
npm run validate:assets  # checks every asset manifest path exists on disk
```

## Documentation

- [`docs/architecture/overview.md`](docs/architecture/overview.md) — project structure, asset/animation/ID systems
- [`docs/art-direction/style-guide.md`](docs/art-direction/style-guide.md) — visual QA gate and current art limitations
- [`docs/gameplay/phase-status.md`](docs/gameplay/phase-status.md) — what's built vs. planned, against the full design spec
