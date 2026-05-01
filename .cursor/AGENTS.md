# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Snapshot

- Framework: Next.js 15 (App Router) + React 19 + TypeScript (strict mode)
- Styling: Tailwind CSS v4
- Package manager: npm (`package-lock.json` is committed)
- Path alias: `@/*` maps to `src/*`
- Main app code lives in `src/`:
  - `src/app/` pages and layouts
  - `src/components/` UI and feature components
  - `src/lib/` domain/business logic helpers

## Local Commands

- Install: `npm install`
- Dev server: `npm run dev` (port 3000)
- Build: `npm run build`
- Start prod build: `npm run start`
- Lint: `npm run lint`

## Core Working Rules

- Keep changes focused and minimal for the requested task.
- Follow existing code style in touched files (imports, naming, formatting, quote style).
- Do not refactor unrelated areas unless explicitly requested.
- Prefer updating existing modules over introducing new abstractions.
- Avoid adding dependencies unless necessary; use existing utilities first.

## API Architecture Rule (Important)

- This project is **client-side API only**.
- Do not add new files under `src/app/api/**`.
- Do not make frontend features call `/api/*` routes from Next.js.
- Backend integration must be done via direct backend API calls from client-safe modules/components.
- Treat any existing `src/app/api/**` code as legacy; do not expand it unless explicitly requested.

## TypeScript and React Conventions

- Preserve strict typing; avoid `any` unless absolutely unavoidable.
- Keep shared/domain types in `src/lib/**` when reused across features.
- For App Router files, match current patterns (`page.tsx`, `layout.tsx`, `route.ts`).
- Use functional components and keep props explicitly typed.
- Reuse existing UI primitives in `src/components/ui/` before creating new ones.

## Backend Call Conventions

- Prefer shared request helpers in `src/lib/**` when multiple screens use the same backend endpoint.
- Keep request/response typing explicit at call sites.
- Handle loading, error, and empty states in UI flows that consume backend data.
- Use `NEXT_PUBLIC_*` environment variables for values needed by browser-side requests.
- Never expose sensitive secrets in client-exposed environment variables.

## Validation Checklist Before Finishing

- Run `npm run lint` after substantive edits.
- If a flow is runtime-sensitive, verify with `npm run dev` and manual smoke checks.
- Ensure no obvious TypeScript issues in edited files.
- Confirm imports resolve with `@/` alias usage where appropriate.

## Safety and Change Hygiene

- Do not commit secrets or `.env` values.
- Do not perform destructive git operations (`reset --hard`, force push) unless explicitly requested.
- If repository state appears unexpectedly modified, pause and ask for guidance.

## Preferred Response Style for Agents

- Explain what changed, where, and why in concise bullets.
- Mention verification steps performed (lint/build/manual checks).
- Call out any assumptions or follow-up items clearly.
