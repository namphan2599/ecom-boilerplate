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
- [ ] Uploads an object to the configured bucket with the expected key and content type
- [ ] Builds a stable public URL from config and bucket/key inputs
- [ ] Deletes objects cleanly and treats repeated deletes safely when appropriate

### Catalog media orchestration
- [ ] Uploads a new hero image and persists `imageKey` + `imageUrl` on the product
- [ ] Replaces an existing hero image and cleans up the previous object
- [ ] Rolls back/cleans up the newly uploaded object if the DB update fails
- [ ] Rejects unknown product ids with `404`

### Validation / controller behavior
- [ ] Rejects unsupported MIME types (`gif`, `svg`, etc.)
- [ ] Rejects payloads larger than **5 MB**
- [ ] Rejects non-admin or unauthenticated requests

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
- Track any uncovered edge cases in PR notes before merging

> No new execution evidence is recorded yet for this feature; the commands above are the required verification gates once implementation lands.

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
