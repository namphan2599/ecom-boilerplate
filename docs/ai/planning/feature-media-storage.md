---
phase: planning
title: Project Planning & Task Breakdown
description: Break down work into actionable tasks and estimate timeline
---

# Project Planning & Task Breakdown

## Milestones
**What are the major checkpoints?**

- [x] Milestone 1: Requirements, design, and implementation notes prepared for `media-storage`
- [x] Milestone 2: RustFS storage abstraction and catalog media endpoints implemented
- [x] Milestone 3: Test coverage, Swagger docs, and local/deployment validation completed

## Task Breakdown
**What specific work needs to be done?**

### Phase 1: Foundation
- [x] Task 1.1: Add/update storage configuration and dependencies for S3-compatible RustFS access
- [x] Task 1.2: Extend `prisma/schema.prisma` with `Product.imageKey` and generate the migration/client updates
- [x] Task 1.3: Scaffold `StorageModule` and a reusable RustFS-backed storage service

### Phase 2: Core Features
- [x] Task 2.1: Add admin-only upload/replace endpoint for product hero images using multipart form-data
- [x] Task 2.2: Add admin-only delete endpoint to remove product hero images and clear DB metadata
- [x] Task 2.3: Implement replace logic that overwrites or cleans up the previous object safely
- [x] Task 2.4: Return updated `imageUrl` (and internal `imageKey` where appropriate) in catalog/admin responses

### Phase 3: Integration & Polish
- [x] Task 3.1: Add unit tests for validation, storage-service behavior, and failure cleanup
- [x] Task 3.2: Add integration/e2e coverage for admin upload, replace, delete, and public catalog reads
- [x] Task 3.3: Update Swagger examples, `.env` docs, and local object-storage setup notes

## Dependencies
**What needs to happen in what order?**

- Storage environment variables and bucket access must be defined before upload code can be verified locally
- Prisma schema updates should land before catalog responses and service methods are finalized
- The storage abstraction should be implemented before wiring controller endpoints so error handling stays centralized
- Test fixtures (sample images and invalid payloads) are needed before the e2e and regression suite can be completed
- If RustFS replaces LocalStack for this workflow locally, `docker-compose.yml` or deployment instructions must be updated accordingly

## Timeline & Estimates
**How long should this take?**

| Phase | Scope | Estimate |
| --- | --- | --- |
| Phase 1 | Config, schema, storage service scaffold | 0.5-1 day |
| Phase 2 | Upload/replace/delete API and catalog integration | 1-2 days |
| Phase 3 | Tests, docs, and local deployment validation | 0.5-1 day |

**Total estimate:** ~2-4 working days for implementation and verification.

## Risks & Mitigation
**What could go wrong?**

- **Orphaned objects after partial failure** → add compensating cleanup if DB persistence fails after upload
- **Unsupported or malicious files** → enforce strict MIME/size validation and avoid trusting original filenames
- **Local/prod URL differences** → centralize public URL generation in the storage service and document env usage clearly
- **Replace race conditions** → serialize per-request product updates and make delete operations idempotent
- **Scope creep into galleries or transformations** → keep v1 limited to one public hero image per product

## Resources Needed
**What do we need to succeed?**

- RustFS endpoint/credentials (or a locally running compatible service)
- Dedicated bucket: `product-images`
- Sample image fixtures (`.jpg`, `.png`, `.webp`) plus invalid/oversized test assets
- Time for Swagger/manual API smoke tests after implementation
