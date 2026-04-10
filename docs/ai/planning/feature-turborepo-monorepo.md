---
phase: planning
title: Project Planning & Task Breakdown
description: Break down work into actionable tasks and estimate timeline
---

# Project Planning & Task Breakdown

## Milestones
**What are the major checkpoints?**

- [x] **Milestone 1: Monorepo foundation ready** — Turborepo config, workspace scripts, and target folder structure are in place
- [x] **Milestone 2: Existing apps migrated cleanly** — backend lives in `apps/backend`, storefront remains in `apps/storefront`, and all app commands still work
- [x] **Milestone 3: Future expansion path documented** — shared packages, admin-site path, CI/docs, and verification workflow are all ready

### Execution status
- ✅ Verified from the repo root with `pnpm build`, `pnpm lint`, `pnpm test`, and `pnpm typecheck`
- ✅ Confirmed `pnpm dev` starts the backend on `http://localhost:3000` and the storefront on `http://localhost:3001`
- ✅ Docker and README instructions were updated for the `apps/backend` + `apps/storefront` Turborepo layout

## Task Breakdown
**What specific work needs to be done?**

### Phase 1: Foundation
- [x] **Task 1.1:** Audit current root assumptions (`package.json`, `Dockerfile`, `docker-compose.yml`, `nest-cli.json`, `tsconfig*`, Prisma paths, test config)
- [x] **Task 1.2:** Add Turborepo root configuration (`turbo.json`) and standardize repo-wide scripts around `turbo run ...`
- [x] **Task 1.3:** Confirm the target workspace layout and create any required placeholder folders/packages

### Phase 2: Core Features
- [x] **Task 2.1:** Move the existing NestJS backend into `apps/backend` and repair path/config references
- [x] **Task 2.2:** Keep `apps/storefront` working within the same Turbo task graph
- [x] **Task 2.3:** Add shared config packages (recommended: TypeScript + ESLint configs)
- [x] **Task 2.4:** Decide whether `apps/admin` is added now as a placeholder or deferred with docs-only reservation

### Phase 3: Integration & Polish
- [x] **Task 3.1:** Update Docker, Prisma, README, and local development instructions for the new paths
- [x] **Task 3.2:** Verify repo-wide `build`, `lint`, and `test` execution through Turborepo
- [x] **Task 3.3:** Update CI/build pipeline expectations and note cacheable outputs
- [x] **Task 3.4:** Run review gates (`/review-requirements`, `/review-design`) before implementation execution

## Dependencies
**What needs to happen in what order?**

- The current backend and storefront should be stable before moving folders.
- Path-sensitive config must be audited before relocating the backend app.
- Turborepo root scripts should be introduced early so verification has a consistent entry point.
- Docker and Prisma updates depend on the final location of `apps/backend`.
- Shared config packages should be added after the base folder layout is decided.

## Timeline & Estimates
**When will things be done?**

### Estimated effort
- **Phase 1: Foundation** — 0.5 to 1 engineering day
- **Phase 2: App migration and wiring** — 1 to 2 engineering days
- **Phase 3: Verification and polish** — 0.5 to 1 engineering day

### Overall estimate
- **Total:** ~2 to 4 engineering days for a clean repo-structure migration with verification
- Add buffer if deployment/Docker/CI assumptions require deeper changes than expected

## Risks & Mitigation
**What could go wrong?**

- **Risk:** Moving the backend breaks Nest, Prisma, Jest, or Docker paths  
  **Mitigation:** audit path-sensitive config first and migrate in small, verifiable steps

- **Risk:** Root scripts accidentally stop working for the storefront  
  **Mitigation:** introduce Turbo scripts while preserving current app-local commands and verify both layers

- **Risk:** Shared packages are over-designed too early  
  **Mitigation:** start with config packages only and defer broader shared-code extraction until real reuse appears

- **Risk:** The future admin app scope expands into the current migration  
  **Mitigation:** treat `apps/admin` as a reserved path or placeholder, not a full product deliverable in this phase

## Resources Needed
**What do we need to succeed?**

- One engineer comfortable with pnpm workspaces, Turborepo, NestJS, and Next.js
- A working local Aura stack (`api`, `postgres`, `redis`, `rustfs`)
- Existing verification commands for backend and storefront behavior
- Current repo docs and memory context so the migration does not re-discover known decisions
