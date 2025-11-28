# Repository Guidelines

## Project Structure & Module Organization
- `app/` holds Next.js routes, layouts, and server actions; start with `app/page.tsx` and keep route-specific logic colocated.
- `components/`, `lib/`, and `types/` provide reusable UI, utilities, and shared typing for both web and agent services.
- `prisma/` defines the data model and generates a typed client in `app/generated/prisma`; update both when schema changes.
- `kb/` contains persona and factual markdown that the LiveKit agent loads; edit with concise, first-person entries.
- `agent/` is the Python LiveKit worker (see `agent/README.md`); keep virtualenv-only artifacts inside `agent/venv/`.
- Static assets live in `Assets/` and `public/`; use `public/` for files referenced by the Next app at runtime.

## Build, Test, and Development Commands
- `npm run dev` starts the Turbopack dev server on port 3000.
- `npm run build` followed by `npm run start` produces and serves a production build.
- `npm run lint` runs the Next.js ESLint bundle; fix findings before sending reviews.
- `npm run prisma:generate`, `npm run prisma:migrate`, and `npm run prisma:deploy` manage schema changes; pair schema edits with updated generated client.
- `npm run seed` executes `scripts/seed.ts` against the database.
- Agent workflows: `python main.py dev` for local runs (after activating `agent/venv/`), `livekit-cli cloud agent deploy` to ship updates, and `npm run ios` to refresh the Capacitor shell.

## Coding Style & Naming Conventions
- TypeScript and React components should stay strongly typed and use functional components with hooks.
- Follow ESLint guidance (Next core-web-vitals); match existing two-space indentation and PascalCase component filenames.
- Keep environment config in `.env.local` or Railway variables; never commit secrets.

## Testing Guidelines
- Automated tests are not yet established; manually verify UI flows and agent interactions before review.
- When adding tests, colocate Playwright or Vitest files beside the feature (e.g. `components/HeroScene.test.tsx`) and document how to run them in PRs.
- Confirm database migrations with `npm run prisma:deploy` against a staging database before production rollouts.

## Commit & Pull Request Guidelines
- Follow the repo pattern of short, imperative commit messages (e.g. `Fix mobile overlay tap zone`).
- Every PR should summarize scope, list validation steps (`npm run lint`, manual QA), and note schema or env updates; add screenshots for UI-facing changes and link related tickets.

## Security & Configuration Tips
- Required secrets include `DATABASE_URL` for Prisma and LiveKit/OpenAI/Deepgram/ElevenLabs keys for the agent; store them via Railway or local `.env`.
- Check `agent/livekit.toml` and `agent/livekit.yaml` when altering deploy settings so CLI deployments stay in sync.
