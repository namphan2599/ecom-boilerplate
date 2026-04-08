---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
---

# Requirements & Problem Understanding

## Problem Statement
**What problem are we solving?**

The catalog currently allows a product `imageUrl` to be set manually, but it does not provide a managed upload/save workflow. That means admins must host images elsewhere and paste raw URLs, which creates broken-link risk, inconsistent naming, and no clean way to replace or delete product media.

This feature solves that gap by introducing **RustFS-backed media storage** for product assets through an S3-compatible API. The main users are:

- **Admins / merchandisers** who need to upload, replace, and remove product hero images safely
- **Customers / storefront consumers** who need reliable public product image URLs for browsing
- **Developers / operators** who need a reusable media-storage foundation for future file use cases beyond products

## Goals & Objectives
**What do we want to achieve?**

### Primary goals
- Add **admin-only** upload, replace, and delete support for product hero media
- Use **RustFS** as the object store behind an **S3-compatible** integration layer
- Persist both `imageUrl` and `imageKey` on each `Product`
- Expose a **public object URL** for storefront reads
- Restrict uploads to **JPEG, PNG, and WebP** files up to **5 MB**
- Use a dedicated bucket named **`product-images`** in v1

### Secondary goals
- Keep the storage layer generic enough to support “and more” later (categories, brand assets, user uploads, downloadable files)
- Preserve local-development parity with containerized object storage configuration
- Ensure **overwrite-on-replace** behavior so outdated product media does not accumulate unnecessarily

### Non-goals
- Supporting multi-image galleries or product videos in v1
- Building a storefront UI or admin media library UI in this phase
- Performing image resizing, watermarking, or CDN transformations in the initial release
- Introducing signed/private URLs for product hero images in v1

## User Stories & Use Cases
**How will users interact with the solution?**

- As an **admin**, I want to upload a hero image for a product so that the storefront can display it without manual URL entry.
- As an **admin**, I want to replace an existing product image so that merchandising updates stay current.
- As an **admin**, I want to delete a product image so that discontinued or incorrect media is removed cleanly.
- As a **customer**, I want product images to load consistently from public URLs so that I can browse the catalog confidently.
- As a **developer**, I want a reusable storage abstraction so that future features can save media without coupling the app to one storage vendor.

### Edge cases to consider
- Admin uploads an unsupported file type (`gif`, `svg`, `pdf`, etc.)
- Admin uploads a file larger than **5 MB**
- Product does not exist or is archived when the upload request is made
- Replacing an image changes file type (`.png` to `.webp`) and the old object must be cleaned up
- Storage upload succeeds but database metadata update fails, requiring compensating cleanup

## Success Criteria
**How will we know when we're done?**

- Admins can upload, replace, and delete a product hero image through documented API endpoints
- Uploaded objects are saved to the **`product-images`** bucket in RustFS
- Product reads expose a valid public `imageUrl` while internal persistence also stores `imageKey`
- Unsupported file types and payloads over **5 MB** are rejected with clear API errors
- Replacing an image updates product metadata and removes or overwrites the old object as designed
- Customer/public catalog responses continue to work without requiring auth for image reads
- Swagger docs and test coverage cover the new media endpoints and failure paths

### Acceptance criteria
- `prisma/schema.prisma` includes persistent support for `Product.imageKey` alongside the existing `imageUrl`
- A storage service/module exists to talk to RustFS through an S3-compatible client
- Catalog admin APIs include multipart upload and delete routes for product media
- Local and deployment configuration document the required storage env vars and bucket policy expectations

## Constraints & Assumptions
**What limitations do we need to work within?**

- Backend framework remains **NestJS** in the current modular monolith structure
- Persistence remains **PostgreSQL + Prisma** for product metadata; binary media stays out of the database
- RustFS is consumed through a standard **S3-compatible API contract** so the app stays provider-agnostic
- The v1 scope supports **one public hero image per product**
- Existing public catalog responses already include `imageUrl`; this feature extends that path rather than replacing catalog APIs
- Upload and management routes must stay **admin-only** behind JWT + RBAC protection
- No browser-based frontend implementation is required for this phase; Swagger/manual API use is sufficient

## Questions & Open Items
**What do we still need to clarify?**

No blocking gaps remain for implementation readiness.

Items intentionally deferred:
- Whether later phases should support multiple images per product, alt text, or media ordering
- Whether product media should move behind a CDN or signed URL strategy in production
- Whether the same storage abstraction should next be extended to categories, brand assets, or user-generated uploads
