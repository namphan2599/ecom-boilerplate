---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
feature: admin-dashboard
---

# Requirements & Problem Understanding — Admin Dashboard

## Problem Statement
**What problem are we solving?**

- The ecom-boilerplate currently has a `storefront` (customer-facing Next.js app) and a `backend` (NestJS API) but **no admin interface**. Store operators must manage products, users, discounts, and orders via raw API calls or Prisma Studio.
- **Who is affected?** Internal store admins / operators who need day-to-day control over the catalog, customer base, and promotions.
- **Current workaround:** Direct database queries or curl commands against the REST API — error-prone and inaccessible to non-technical staff.

## Goals & Objectives
**What do we want to achieve?**

### Primary Goals
- Scaffold a standalone `apps/admin` React (Vite) application within the Turborepo workspace.
- Implement full CRUD management for:
  - **Products** (variants, pricing per currency, publish/unpublish, media uploads)
  - **Users** (list, view, role management, ban/activate)
  - **Discounts / Coupons** (create, edit, delete, view usage stats)
  - **Orders** (list, view detail, status transitions: fulfillment / cancel)
  - **Categories & Tags** (list, create, edit, delete)
- Authentication: JWT login using existing backend `/auth/login` endpoint, persistent token stored in `localStorage`/context, role guard (`ADMIN` only).
- A sidebar navigation layout with primary sections: Dashboard (overview metrics), Products, Categories, Users, Discounts, Orders, Settings.

### Secondary Goals
- Responsive layout (desktop-first, tablet-usable).
- Overview Dashboard page with KPI cards (total revenue, total orders, new users, active products).
- Data tables with pagination, search, and filter support.
- Image upload for product media via the backend `/storage` endpoint.

### Non-Goals
- Mobile-first or native mobile support (out of scope for v1).
- Customer-facing features (belongs to `apps/storefront`).
- Real-time WebSocket notifications (deferred to later).
- Multi-tenancy or multi-store support.

## User Stories & Use Cases
**How will users interact with the solution?**

| # | As a...        | I want to...                                                         | So that...                                                      |
|---|----------------|----------------------------------------------------------------------|-----------------------------------------------------------------|
| 1 | Admin          | Log in with my email & password                                      | I can access the admin panel securely                           |
| 2 | Admin          | View a dashboard with KPI cards                                      | I get a quick overview of business health                       |
| 3 | Admin          | Create, edit, and delete products with variants & prices             | The catalog stays up to date                                    |
| 4 | Admin          | Upload product images                                                | Products display visuals on the storefront                      |
| 5 | Admin          | List and search users, change their role or ban status               | I can manage the customer base                                  |
| 6 | Admin          | Create and configure coupons (type, amount, expiry, usage limit)     | Marketing promotions can be run quickly                         |
| 7 | Admin          | View orders, filter by status, and transition order states           | Fulfillment team can process shipments                          |
| 8 | Admin          | Manage product categories (create, nest, edit, delete)               | The storefront navigation stays organized                       |
| 9 | Admin          | See and manage tags assigned to products                             | Products can be cross-categorized for discovery                 |
| 10 | Admin          | Log out and have my session invalidated                              | Security is maintained on shared machines                       |

## Success Criteria
**How will we know when we're done?**

- [ ] Admin can log in and is redirected to Dashboard; unauthenticated users are redirected to `/login`.
- [ ] All CRUD operations for Products, Users, Coupons, Orders, Categories, and Tags work end-to-end against the real backend.
- [ ] Data tables paginate correctly; search filters update results without page reload.
- [ ] Product image upload works and the uploaded URL is saved to the product record.
- [ ] Role guard prevents non-admin JWTs from accessing any admin route.
- [ ] App builds without type errors and passes ESLint.
- [ ] Application is registered in the Turborepo workspace (`pnpm-workspace.yaml`) and `turbo dev` starts it alongside other apps.

## Constraints & Assumptions
**What limitations do we need to work within?**

- **Technical:** Must reside in `apps/admin` following the Turborepo monorepo pattern; uses `pnpm` package manager.
- **Stack:** React (Vite), TypeScript, Tailwind CSS v3, shadcn/ui component library, React Router v6, React Query (TanStack Query) for data fetching, React Hook Form + Zod for forms.
- **Backend API:** Consumes existing NestJS REST API at `http://localhost:3000/api/v1`; no backend changes required for v1.
- **Auth:** JWT stored in memory/localStorage; no refresh token rotation in v1 (simple expiry).
- **Assumption:** Backend already exposes all necessary admin endpoints (guarded by `ADMIN` role). Admin user must be seeded or manually created in DB before first login.

## Questions & Open Items
**What do we still need to clarify?**

- [ ] **Port**: What port should `apps/admin` dev server run on? (Proposed: `5174` to avoid conflict with storefront on `3001`.)
- [ ] **Image storage**: Does the backend's S3-compatible endpoint require signed URLs or direct upload? (Assumption: multipart POST to `/storage/upload`.)
- [ ] **Pagination**: Does the backend return `{ data, total, page, limit }` shaped responses? (Assumption: yes, based on NestJS common patterns.)
- [ ] **Dashboard metrics**: Is there a dedicated `/metrics` or `/analytics` endpoint, or should we compute from existing endpoints?
