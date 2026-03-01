# Repository Guidelines

## Project Structure & Module Organization
- `app/` holds Next.js routes, layouts, and server actions; start with `app/page.tsx` and keep route-specific logic colocated.
- `components/`, `lib/`, and `types/` hold shared UI, utilities, and typings used across the web app and widget integration.
- `prisma/` owns the data model; generated client output lives in `app/generated/prisma` and must be updated with schema changes.
- `agent/` is a Python LiveKit worker for fallback scenarios (see `agent/README.md`); keep local virtualenv artifacts inside `agent/venv/`.
- `kb/` stores persona and factual markdown consumed by Simli; keep entries concise and first-person.
- Static assets live in `public/` (runtime web assets) and `Assets/` (design/source files). Native packaging lives under `ios/`.

## Product Goals & Platform Targets
- Primary goal: a working experience across web browsers and device surfaces; treat responsive layout and touch input as first-class.
- Store readiness: keep iOS packaging under `ios/` current so App Store submission stays possible.
- Future scope: the app may expand beyond Sasquatch to multiple cryptids; keep content and UI extensible.

## Content & Lore
- Add or update cryptid profiles in `kb/` and keep each entry self-contained.
- If adding new cryptids, mirror naming patterns already in `kb/` and document how the UI should select between them.

## Build, Test, and Development Commands
- `npm run dev` starts the Turbopack dev server on port 3000.
- `npm run build` followed by `npm run start` produces and serves a production build.
- `npm run lint` runs the Next.js ESLint bundle; fix findings before sending reviews.
- `npm run prisma:generate`, `npm run prisma:migrate`, and `npm run prisma:deploy` manage schema changes; pair schema edits with updated generated client.
- `npm run seed` executes `scripts/seed.ts` against the database.
- Simli widget workflows live in `SIMLI_INTEGRATION.md`; use it as the source of truth.
- Optional LiveKit fallback: `python main.py dev` (after activating `agent/venv/`) and `livekit-cli cloud agent deploy`.
- `npm run ios` refreshes the Capacitor shell.

## Coding Style & Naming Conventions
- TypeScript and React components should stay strongly typed and use functional components with hooks.
- Follow ESLint guidance (Next core-web-vitals); match existing two-space indentation and PascalCase component filenames.
- Configuration belongs in Railway variables; `.env.local` is only for local dev and must never be committed.

## Testing Guidelines
- Automated tests are not yet established; manually verify UI flows and agent interactions before review.
- When adding tests, colocate Playwright or Vitest files beside the feature (e.g. `components/HeroScene.test.tsx`) and document how to run them in PRs.
- Confirm database migrations with `npm run prisma:deploy` against a staging database before production rollouts.

## Commit & Pull Request Guidelines
- Follow the repo pattern of short, imperative commit messages (e.g. `Fix mobile overlay tap zone`).
- Every PR should summarize scope, list validation steps (`npm run lint`, manual QA), and note schema or env updates; add screenshots for UI-facing changes and link related tickets.

## Security & Configuration Tips
- Required secrets include `DATABASE_URL`, `SIMLI_API_KEY`, and `SIMLI_AGENT_ID`; store them in Railway.
- LiveKit/OpenAI/Deepgram/ElevenLabs keys are only needed for the fallback path in `agent/`.
- Keep `agent/livekit.toml` and `agent/livekit.yaml` aligned only if you enable LiveKit.
