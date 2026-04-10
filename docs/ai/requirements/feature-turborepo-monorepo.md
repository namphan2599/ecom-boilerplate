---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
---

# Requirements & Problem Understanding

## Problem Statement
**What problem are we solving?**

Aura currently behaves like a hybrid repository: the NestJS backend still owns the repo root, while the shopper UI lives under `apps/storefront`. That works for local progress, but it is not yet a clean monorepo foundation for long-term product development.

This causes friction for:

- **Backend contributors**, because the repo root is still tightly coupled to NestJS-specific scripts and build assumptions
- **Frontend contributors**, because the storefront is already app-scoped but the backend is not yet separated into its own app folder
- **Future expansion work**, because adding an admin site later would increase path/config duplication without a shared build system
- **CI/release workflows**, because there is no first-class task graph and caching layer coordinating backend + frontend work together

The feature should convert the repo into a **Turborepo-managed monorepo** where backend and frontend remain in separate folders and the workspace is ready for a future admin app.

## Goals & Objectives
**What do we want to achieve?**

### Primary goals
- Adopt **Turborepo** as the root build/task orchestration system
- Keep application boundaries explicit with separate folders such as:
  - `apps/backend`
  - `apps/storefront`
  - `apps/admin` (reserved for later or added as a placeholder)
- Preserve the current Aura backend behavior and storefront integration while improving repo structure
- Standardize top-level commands for `build`, `dev`, `lint`, `test`, and future `typecheck` workflows
- Prepare the workspace for shared packages/config without forcing premature over-abstraction

### Secondary goals
- Improve developer onboarding by making app ownership and folder layout obvious
- Enable incremental/cached task execution in local development and CI
- Keep Docker, Prisma, and local env workflows working after the migration
- Make future frontend expansion (such as admin tools) cheaper and lower risk

### Non-goals
- Redesigning the Aura backend API or changing `/api/v1` contracts
- Rebuilding the storefront UX as part of the repo-structure migration
- Shipping the full admin site in this phase
- Replacing `pnpm` as the package manager

## User Stories & Use Cases
**How will users interact with the solution?**

- As a **developer**, I want the backend and storefront to live in separate app folders so that responsibilities are clear and app-specific commands are easier to manage.
- As a **team lead**, I want a Turborepo task graph so that builds/tests/linting can be cached and run consistently across apps.
- As a **future admin-site contributor**, I want a reserved monorepo structure so that a new app can be added without reworking the repo again.
- As a **CI maintainer**, I want root-level commands to orchestrate only the affected apps/packages so that pipelines remain fast and predictable.

### Key workflows and edge cases
- Local development should still support running the backend and storefront together.
- The existing storefront on port `3001` must continue consuming the backend at `http://localhost:3000/api/v1`.
- Docker and Prisma workflows must still work even after the backend moves under `apps/backend`.
- Existing test/build coverage should remain green after the path migration.
- The admin site should remain explicitly deferred if only a placeholder is created in v1.

## Success Criteria
**How will we know when we're done?**

- A documented monorepo structure exists with backend and frontend in clearly separate folders.
- The workspace is orchestrated by **Turborepo** through root commands such as:
  - `pnpm build`
  - `pnpm dev`
  - `pnpm lint`
  - `pnpm test`
- The backend and storefront can still be built and tested independently.
- Root documentation explains how to run app-specific and repo-wide workflows.
- The plan is ready to implement without re-discovering architecture choices.

### Acceptance criteria
- Feature-specific docs exist under:
  - `docs/ai/requirements/feature-turborepo-monorepo.md`
  - `docs/ai/design/feature-turborepo-monorepo.md`
  - `docs/ai/planning/feature-turborepo-monorepo.md`
  - `docs/ai/implementation/feature-turborepo-monorepo.md`
  - `docs/ai/testing/feature-turborepo-monorepo.md`
- The target repo layout explicitly separates backend and frontend apps.
- Turborepo is chosen as the build system and `pnpm` remains the package manager.
- The future admin app is accounted for in the structure, even if its implementation is deferred.

## Constraints & Assumptions
**What limitations do we need to work within?**

- The repo already contains a working NestJS backend and a working Next.js storefront.
- Local development is Windows-friendly and should remain so.
- Next.js `16.x` requires Node `>=20.9.0`, so the monorepo tooling must remain compatible with that environment.
- Existing Docker, Prisma, Redis, RustFS, and Stripe-related workflows should continue to be supported.
- The migration should prefer structure and orchestration changes over product-behavior changes.
- Shared packages should be introduced only where they provide clear value (config, types, utilities).

## Questions & Open Items
**What do we still need to clarify?**

No blocking questions remain for implementation readiness.

Items to confirm during execution:
- Should `apps/admin` be created now as a placeholder, or simply reserved in the documented target structure?
- Which shared packages should exist immediately in v1 (for example `packages/eslint-config` and `packages/typescript-config`) versus later?
- Should the backend Dockerfile move into `apps/backend`, or should a root-level production Dockerfile be retained for deployment convenience?
