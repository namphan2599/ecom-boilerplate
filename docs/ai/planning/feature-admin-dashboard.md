---
phase: planning
title: Project Planning & Task Breakdown
description: Break down work into actionable tasks and estimate timeline for the Admin Dashboard
feature: admin-dashboard
---

# Project Planning & Task Breakdown — Admin Dashboard

## Milestones
**What are the major checkpoints?**

- [x] Milestone 1: Foundation Setup (Vite, Tailwind, shadcn/ui, Routing)
- [x] Milestone 2: Authentication & Layout (Login, Sidebar, Auth Guard)
- [x] Milestone 3: Core Management CRUDs (Products, Categories, Users)
- [x] Milestone 4: Marketing & Sales (Discounts, Orders)
- [x] Milestone 5: Polish & Final Integration (Dashboard KPI, Polish UI/UX)

## Task Breakdown
**What specific work needs to be done?**

### Phase 1: Foundation
- [x] Task 1.1: Initialize `apps/admin` Vite React TS project
- [x] Task 1.2: Configure Tailwind CSS and PostCSS
- [x] Task 1.3: Initialize and configure shadcn/ui
- [x] Task 1.4: Set up React Router and basic routes
- [x] Task 1.5: Configure TanStack Query and a custom fetch client

### Phase 2: Auth & Layout
- [x] Task 2.1: Create `AuthContext` and `ProtectedRoute`
- [x] Task 2.2: Implement Login page and authentication flow
- [x] Task 2.3: Build Sidebar and Topbar components
- [x] Task 2.4: Create recursive Category tree component for sidebar

### Phase 3: Product Management
- [x] Task 3.1: Build Products list page with `DataTable`
- [x] Task 3.2: Implement Product Create/Edit form with Zod validation
- [x] Task 3.3: Implement Product Variant management (arrays in forms)
- [x] Task 3.4: Integrate Image upload component

### Phase 4: User & Discount Management
- [x] Task 4.1: Build Users list page with role management
- [x] Task 4.2: Build Categories and Tags management pages
- [x] Task 4.3: Build Coupons/Discounts list and creation pages

### Phase 5: Orders & Dashboard
- [x] Task 5.1: Build Orders list and detail pages
- [x] Task 5.2: Create Dashboard with KPI cards and sample charts
- [x] Task 5.3: Final linting, typechecking, and build validation

## Dependencies
**What needs to happen in what order?**

- **Backend API**: The backend must have the required endpoints exposed (assumed ready).
- **Environment**: Node.js and `pnpm` workspace setup (ready).
- **Auth**: Login must work before any other page can be developed/tested easily.

## Timeline & Estimates
**When will things be done?**

- **Phase 1**: 2-3 hours
- **Phase 2**: 2-3 hours
- **Phase 3**: 4-6 hours
- **Phase 4**: 3-4 hours
- **Phase 5**: 3 hours
- **Total Estimate**: ~14-19 hours of development time.

## Risks & Mitigation
**What could go wrong?**

- **Complex Forms**: Product variants can be tricky with nested fields. *Mitigation: Use React Hook Form `useFieldArray`.*
- **API Mismatch**: Backend endpoints might not perfectly match UI needs. *Mitigation: Clear communication and early API exploration.*
- **Auth Expiry**: JWT handling needs to be robust for long admin sessions. *Mitigation: Implement clear error states and auto-logout.*

## Resources Needed
**What do we need to succeed?**

- **Documentation**: shadcn/ui, TanStack Query, and React Hook Form docs.
- **Backend Access**: A running instance of the backend API for testing.
- **Test Account**: An `ADMIN` role user email/password.
