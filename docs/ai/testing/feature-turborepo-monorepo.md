---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy

## Test Coverage Goals
**What level of testing do we aim for?**

- **Unit test target:** keep 100% coverage expectations for new/changed migration helpers where practical
- **Integration test scope:** repo-level build/lint/test orchestration, app path correctness, Docker/Prisma path alignment
- **End-to-end scope:** backend + storefront still run together after the migration and core shopper flows still work
- All verification should align with the acceptance criteria in `feature-turborepo-monorepo.md`

## Unit Tests
**What individual components need testing?**

### Workspace/task configuration
- [ ] `turbo.json` and root scripts route tasks to the correct apps/packages
- [ ] Shared config packages resolve correctly from consumer apps
- [ ] Any migration-specific helper scripts handle path assumptions safely

### Existing app-local test suites
- [ ] Backend unit tests still run from the new `apps/backend` location
- [ ] Storefront unit/integration tests still run from `apps/storefront`
- [ ] Any updated import/path alias behavior remains covered

## Integration Tests
**How do we test component interactions?**

- [ ] `pnpm build` delegates to Turborepo and completes successfully for affected apps
- [ ] `pnpm lint` runs against both backend and storefront in the new structure
- [ ] `pnpm test` still executes app-local test suites correctly
- [ ] Docker/local-stack startup still works with the backend moved into `apps/backend`
- [ ] Prisma generate/seed flows still resolve from the new backend path

## End-to-End Tests
**What user flows need validation?**

- [ ] Developer clones the repo, installs deps, and runs repo-wide commands successfully
- [ ] Backend starts and serves Aura at `http://localhost:3000/api/v1`
- [ ] Storefront starts and serves at `http://localhost:3001`
- [ ] Guest browse → login → cart → checkout → order history still behaves as before
- [ ] Regression check: future admin path can be added without breaking backend/storefront commands

## Test Data
**What data do we use for testing?**

- Existing Aura seeded demo data from `pnpm seed`
- Current local Docker services (`postgres`, `redis`, `rustfs`)
- Existing storefront fallback/catalog fixtures where appropriate
- Canonical demo credentials:
  - `customer@aura.local` / `Customer123!`
  - `admin@aura.local` / `Admin123!`

## Test Reporting & Coverage
**How do we verify and communicate test results?**

Recommended verification commands after migration:

```bash
pnpm build
pnpm lint
pnpm test
pnpm --filter backend test:e2e
pnpm --filter storefront test
```

Additional migration-specific checks:
- record whether Turborepo cache hits are working as expected
- note any commands that intentionally remain app-local rather than repo-wide
- update README examples once the final commands are verified

## Manual Testing
**What requires human validation?**

- Confirm the new folder layout is intuitive and matches the documented target structure
- Confirm both backend and storefront can be developed independently from their app folders
- Run a smoke walkthrough of the shopper experience after the migration
- Validate Windows-friendly command behavior since the current workspace is being used on Windows

## Performance Testing
**How do we validate performance?**

- Compare repo-wide task times before and after Turborepo adoption
- Validate that unaffected apps are skipped or cached where expected
- Ensure the migration does not make local dev startup noticeably worse

## Bug Tracking
**How do we manage issues?**

- Log migration regressions by area: `backend-paths`, `storefront-paths`, `turbo-config`, `docker-prisma`, `ci-cache`
- Prioritize breakages that stop local development or CI over cosmetic cleanup
- Add regression checks for every path-related issue discovered during the migration
