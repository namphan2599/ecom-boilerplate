---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy

## Test Coverage Goals
**What level of testing do we aim for?**

- **Unit coverage target:** 100% of new storage and media-orchestration branches
- **Integration scope:** product-media upload, replace, delete, and public catalog read behavior
- **End-to-end scope:** admin-authenticated media management through the API plus regression on public product payloads

## Unit Tests
**What individual components need testing?**

### Storage service
- [x] `src/storage/storage.service.spec.ts` covers fallback uploads/deletes and stable public URL building
- [x] `src/storage/storage.service.spec.ts` covers RustFS/S3 bucket creation, bucket-cache reuse, path-style vs virtual-host URL generation, and upload/delete failure handling
- [ ] Add a controller/integration-level repeated-delete scenario if idempotent delete semantics are tightened further

### Catalog media orchestration
- [x] `src/catalog/catalog.service.spec.ts` uploads a new hero image and persists `imageKey` + `imageUrl` in fallback mode
- [x] `src/catalog/catalog.service.spec.ts` replaces an existing hero image and verifies cleanup of the previous object reference
- [ ] Add a Prisma-backed rollback test that proves the newly uploaded object is cleaned up when the DB update fails
- [x] `src/catalog/catalog.service.spec.ts` rejects unknown product ids with `404`

### Validation / controller behavior
- [ ] Add controller tests for unsupported MIME types (`gif`, `svg`, etc.)
- [ ] Add controller tests for payloads larger than **5 MB**
- [ ] Add auth/controller tests for non-admin or unauthenticated requests

## Integration Tests
**How do we test component interactions?**

- [ ] `POST /catalog/admin/products/:id/image` stores the object and returns the updated product payload
- [ ] Re-uploading to the same product performs the expected replace behavior
- [ ] `DELETE /catalog/admin/products/:id/image` clears product metadata and removes the stored object reference
- [ ] Public `GET /catalog/products` / `GET /catalog/products/:slug` still expose the latest `imageUrl`

## End-to-End Tests
**What user flows need validation?**

- [ ] Admin creates a product, uploads a hero image, and sees the URL reflected in the catalog response
- [ ] Admin replaces the image and the public URL remains valid for storefront usage
- [ ] Admin deletes the image and the product no longer reports stale image metadata
- [ ] Customer/public consumers can still browse products without any auth requirement for image reads

## Test Data
**What data do we use for testing?**

- One seeded **admin** user and at least one catalog product
- Small valid fixtures: `.jpg`, `.png`, `.webp`
- Invalid fixtures: wrong MIME type and an oversized file above **5 MB**
- Local or mocked RustFS/S3-compatible endpoint for deterministic storage behavior

## Test Reporting & Coverage
**How do we verify and communicate test results?**

- Run `pnpm build` to verify the feature compiles cleanly
- Run `pnpm test -- --runInBand` for unit/integration coverage
- Run `pnpm test:e2e` for API workflow verification
- Use focused coverage checks while iterating on media behavior:
  - `pnpm exec jest src/storage/storage.service.spec.ts --coverage --runInBand --coverageReporters=text --collectCoverageFrom=storage/storage.service.ts`
  - `pnpm exec jest src/catalog/catalog.service.spec.ts --coverage --runInBand --coverageReporters=text --collectCoverageFrom=catalog/catalog.service.ts`
- Track any uncovered edge cases in PR notes before merging

### Latest execution evidence (2026-04-09)
- `pnpm exec jest src/storage/storage.service.spec.ts --runInBand` ✅ (`10/10` tests)
- `pnpm exec jest src/catalog/catalog.service.spec.ts --runInBand` ✅ (`4/4` tests)
- `pnpm test -- --runInBand` ✅ (`8/8` suites, `32/32` tests)
- Focused coverage result for `src/storage/storage.service.ts` ✅
  - Statements: `100%`
  - Functions: `100%`
  - Lines: `100%`
  - Branches: `88.57%` (remaining branches are mostly defensive `unknown error` paths)
- Focused coverage result for `src/catalog/catalog.service.ts` is still partial (`40.25%` lines) because the file includes many non-media catalog branches outside this storage-focused test slice

## Manual Testing
**What requires human validation?**

- Uploading sample images through Swagger or an API client
- Verifying public product image URLs open correctly in the browser
- Confirming error messages for invalid file type, oversize payload, and unauthorized access
- Checking overwrite/delete behavior against the RustFS bucket contents in a local dev environment

## Performance Testing
**How do we validate performance?**

- Measure upload response time for small images under normal local load
- Confirm product list/read endpoints remain unaffected because they only return stored URLs
- Verify repeated replace/delete operations do not leave orphaned objects or degrade response time significantly

## Bug Tracking
**How do we manage issues?**

- Tag bugs under **`catalog`**, **`storage`**, or **`media-storage`**
- Treat unauthorized upload, broken public URLs, and orphaned object leaks as **high priority**
- Re-run the media upload regression suite whenever storage config or catalog DTOs change
- Deferred follow-up tests should concentrate on controller validation, auth guards, and the Prisma-backed rollback path
