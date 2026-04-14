---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance for the Admin Dashboard
feature: admin-dashboard
---

# Testing Strategy — Admin Dashboard

## Test Coverage Goals
**What level of testing do we aim for?**

- **Unit Tests**: Focus on utility functions (e.g., currency formatting) and complex form validation logic with Zod.
- **Component Tests**: Use Vitest and React Testing Library for critical UI components like the `DataTable` and `ProtectedRoute`.
- **End-to-End Tests**: Focus on the core user journey: Login -> Dashboard -> Product Creation -> Logout.

## Unit Tests
**What individual components need testing?**

### Form Validation
- [ ] Test `productSchema` for required fields and value ranges.
- [ ] Test `couponSchema` for valid/invalid dates and positive amounts.

### Auth Logic
- [ ] Test `AuthContext` login function saves token correctly to `localStorage`.
- [ ] Test `AuthContext` logout function clears token correctly.

## Integration Tests
**How do we test component interactions?**

- [ ] Test `ProtectedRoute` renders children when authenticated and redirects when not.
- [ ] Test `DataTable` displays data correctly and calls pagination callbacks.
- [ ] Test `Sidebar` highlights the active route correctly.

## End-to-End Tests
**What user flows need validation?**

- [ ] **Login Flow**: Navigate to `/login`, enter valid credentials, redirected to `/dashboard`.
- [ ] **Product CRUD**: Create a product, see it in the list, edit it, and verify changes persist.
- [ ] **User Management**: Switch a user's role and verify the change is reflected in the UI.

## Test Data
**What data do we use for testing?**

- **Mock Service Worker (MSW)**: Use MSW to mock API responses for component and unit testing.
- **Seed Data**: For E2E testing, ensure the backend is seeded with an `ADMIN` user and sample products.

## Manual Testing
**What requires human validation?**

- **UI/UX**: Check sidebar responsiveness on small screens.
- **Interactions**: Verify all modals and dropdowns close when clicking outside.
- **Visuals**: Check consistency of colors, spacing, and icons across all pages.
- **Accessibility**: Test navigation using only the keyboard.

## Bug Tracking
**How do we manage issues?**

- Use GitHub Issues (or the project's preferred tool) to document bugs found during testing.
- Categorize by severity (Critical, High, Medium, Low).
- Verify fixes through regression testing of the affected user flows.
