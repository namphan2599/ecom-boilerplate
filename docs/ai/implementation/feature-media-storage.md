---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup
**How do we get started?**

1. Start local infra and ensure the API can reach the object store.
2. Reuse the existing S3-style configuration contract so the app stays provider-agnostic:
   - `S3_ENDPOINT`
   - `S3_REGION`
   - `S3_BUCKET=product-images`
   - `S3_ACCESS_KEY`
   - `S3_SECRET_KEY`
   - `S3_FORCE_PATH_STYLE=true` (recommended for local/self-hosted endpoints)
   - `S3_PUBLIC_BASE_URL` (optional override for public URL generation)
   - `PRODUCT_MEDIA_MAX_BYTES=5242880`
3. Add the required S3-compatible client dependency if it is not already installed.
4. Run the Prisma migration/client generation once `imageKey` is added to `Product`.
5. Verify the bucket exists and is readable for public product-image access in the target environment.

## Code Structure
**How is the code organized?**

```text
src/
  catalog/
    catalog.controller.ts      # add upload/delete endpoints
    catalog.service.ts         # add media orchestration methods
    dto/
  storage/
    storage.module.ts
    rustfs-storage.service.ts
    storage.types.ts
prisma/
  schema.prisma                # add Product.imageKey
docs/ai/
  requirements/
  design/
  planning/
  implementation/
  testing/
```

### Naming conventions
- Keep the feature name domain-oriented: **`media-storage`**
- Use product-scoped object keys such as `products/{productId}/hero.<ext>`
- Keep low-level storage code in `storage/`; `catalog/` should only own product-specific orchestration

## Implementation Notes
**Key technical details to remember:**

### Core Features
- **Upload**: use NestJS multipart handling (for example `FileInterceptor('file')`) with explicit size/type validation and reject uploads for archived products.
- **Replace**: if a product already has `imageKey`, upload the new object first and then delete the old object after the metadata update succeeds.
- **Delete**: remove the object from RustFS and clear both `imageKey` and `imageUrl` on `Product`.
- **Read**: do not fetch from RustFS during catalog reads; just return the persisted `imageUrl`.
- **Future reuse**: keep the storage API generic so other media features can build on it later.

### Suggested service flow
1. Validate admin auth and incoming file constraints.
2. Load product by id and capture any existing `imageKey`.
3. Generate a product-scoped **versioned** object key such as `products/{productId}/hero-{timestamp}-{suffix}.png`.
4. Upload the new object to the `product-images` bucket.
5. Build and persist the public `imageUrl` from the configured endpoint/base URL at write time.
6. Persist the updated product metadata via Prisma.
7. If metadata persistence fails, delete the newly uploaded object as compensation.
8. If replace succeeds, remove the previous object if it was stored under a different key.

### Patterns & Best Practices
- Keep controllers thin; put storage orchestration and cleanup logic in services.
- Never trust the original client filename for path generation.
- Prefer centralized helper methods for MIME checks, extension mapping, and public URL generation.
- Avoid leaking bucket credentials or raw provider errors in API responses.

## Integration Points
**How do pieces connect?**

- `prisma/schema.prisma`
  - add `imageKey String?` to `Product`
- `src/catalog/catalog.controller.ts`
  - add admin multipart upload and delete routes
- `src/catalog/catalog.service.ts`
  - call into the storage service and persist product metadata
- `src/storage/*`
  - own the S3-compatible client, bucket/key operations, and URL creation
- `docker-compose.yml` / deployment config
  - ensure the chosen local/prod object store endpoint is reachable from the API

## Error Handling
**How do we handle failures?**

- Return `400` for invalid MIME types or malformed multipart payloads
- Return `413` for payloads above the max file size
- Return `404` when the product id is unknown
- Map object-storage connectivity errors to `502`/`503` or a sanitized `500`, with details kept in structured logs only
- Make delete operations idempotent so repeated cleanup requests are safe

## Performance Considerations
**How do we keep it fast?**

- Cap uploads at **5 MB** to keep request processing predictable
- Store only metadata in PostgreSQL; do not persist binary blobs in the DB
- Compute public URLs once at write time so catalog reads remain fast
- Use a stable key prefix to make object cleanup and future lifecycle rules straightforward

## Security Notes
**What security measures are in place?**

- Protect write routes with existing JWT + `ADMIN` role enforcement
- Validate MIME type and file size at the API boundary
- Sanitize file naming and avoid directly using untrusted client path segments
- Keep RustFS/S3 credentials in environment variables or secret management, never in source control
- Ensure the product-media bucket policy only exposes intended public reads while keeping writes server-side only
