# Operator360 PRD - Additional Enterprise Standards
## Volume 5 (Final Improvements)

**Purpose**

This document extends the existing Product Requirements Document and provides additional implementation standards to eliminate ambiguity during frontend generation. These chapters should be treated as mandatory implementation requirements.

---

# Chapter 35: Complete Application Page Inventory

This chapter serves as the master checklist for every page that must exist in the application.

No pages should be omitted unless explicitly marked as Future Scope.

---

## Authentication

- Login
- Forgot Password

---

## Admin Portal

### Dashboard

Executive dashboard containing analytics, AI insights, notifications, quick actions and overall platform metrics.

### Customers

Customer listing page.

### Customer 360 Workspace

Dedicated workspace for a single customer.

Contains:

- Company Details
- Loyalty Wallet
- Purchased Machines
- Operators
- Assignments
- Replacement Requests
- Statistics

---

### Machines

Machine listing.

---

### Machine Digital Twin

Detailed workspace.

Contains

- Machine Information
- Current Operators
- Assignment Timeline
- Warranty
- History

---

### Operators

Operator listing.

---

### Operator Workspace

Contains

- Personal Information
- Assignment History
- Benefits
- Replacement History

---

### Assignments

Current assignments.

Assignment overview.

Assignment management.

---

### Benefits

Benefits listing.

Benefit management.

---

### Service Requests

Request listing.

Pending Insurance

Pending Admin

Completed

Rejected

Request Detail Workspace

---

### Notifications

Notification Center

---

### Profile

---

### Settings

---

## Customer Portal

### Dashboard

### My Machines

### Machine Details

### My Operators

### Operator Details

### Assignments

### Loyalty Wallet

### Benefits

### Service Requests

### Notifications

### Profile

---

## Insurance Portal

### Dashboard

### Pending Requests

### Approved Requests

### Rejected Requests

### Notifications

### Profile

---

## Operator Portal

### Dashboard

### Assigned Machine

### Benefits

### Notifications

### Profile

---

# Chapter 36: Navigation Standards

Navigation should remain predictable across every module.

Users should never lose their place inside the application.

---

## Sidebar

The sidebar is the primary navigation mechanism.

It should:

• Highlight the active page.

• Remember collapsed state.

• Support nested menus if future modules are added.

• Collapse into a drawer on tablets and mobile.

---

## Breadcrumbs

Every page except Login must display breadcrumbs.

Examples:

Dashboard

↓

Customers

↓

ABC Infrastructure

↓

Machines

↓

CAT EX200

Another example:

Dashboard

↓

Service Requests

↓

Pending

↓

REQ-00125

Breadcrumbs should always represent the user's navigation path.

---

## Navigation Behaviour

After every successful action:

Stay within the current workflow.

Examples:

Editing a customer should not redirect to Dashboard.

Approving a request should return to the Request List.

Updating an operator should remain inside Operator Workspace.

Creating an operator should return to the Operator List.

---

## Browser Behaviour

Browser Back

Browser Forward

Refresh

Deep Links

Bookmarks

All should work naturally.

---

## Context Preservation

Whenever users return to a listing page, preserve:

Current page

Sorting

Filters

Search keyword

Expanded rows

Selected tabs

Users should never lose context after opening detail pages.

---

# Chapter 37: Dashboard Refresh Behaviour

Dashboards should automatically update after important operations.

Users should never need to manually refresh.

Examples:

Customer Created

Customer Updated

Machine Added

Machine Status Changed

Operator Added

Operator Updated

Operator Assigned

Benefit Updated

Service Request Approved

Service Request Rejected

Notification Received

Wallet Updated

Dashboard widgets should immediately reflect the latest backend data.

---

# Chapter 38: Complete Role Permission Matrix

The frontend must strictly enforce permissions.

| Module | Admin | Customer | Insurance | Operator |
|---------|--------|------------|------------|------------|
| Dashboard | Full | Own | Own | Own |
| Customers | Full | Own Company Only | No Access | No Access |
| Machines | Full | Own Machines Only | Request View Only | Assigned Machine Only |
| Operators | Full | Own Operators Only | Request View Only | Own Profile Only |
| Assignments | Full | Own Assignments | View During Approval | Own Assignment Only |
| Benefits | Full | Own Operators | No Access | Own Benefits |
| Loyalty | Full | Own Wallet | No Access | No Access |
| Service Requests | Full | Own Requests | Approval Only | View Related Requests Only |
| Notifications | Own Notifications | Own Notifications | Own Notifications | Own Notifications |
| Profile | Own | Own | Own | Own |
| Settings | Full | No Access | No Access | No Access |

Never expose UI controls beyond these permissions.

Backend RLS remains the source of truth.

---

# Chapter 39: Backend Integration Standards

The frontend should be organized in a scalable manner.

---

## Supabase

Use Supabase as the only backend.

Never bypass Supabase.

Never duplicate backend logic.

---

## Data Fetching

Database access should remain centralized.

Avoid placing queries directly inside page components whenever possible.

Separate:

Authentication

Queries

Mutations

Realtime

into reusable services or hooks.

---

## Loading

Every database request should support:

Loading

Success

Empty

Error

---

## Error Handling

Gracefully handle:

401

403

404

500

Network Failure

Session Expired

Supabase Timeout

Permission Denied

Connection Lost

Show user-friendly messages.

Never expose raw database errors.

---

## Session Management

Verify authentication before loading protected pages.

If session expires:

Redirect to Login.

Display an informative message.

---

## Cache Behaviour

After successful updates:

Refresh affected data.

Examples:

Customer updated

Refresh customer list.

Operator added

Refresh operator table.

Request approved

Refresh dashboard widgets.

---

## Security

Frontend permissions are only for user experience.

Backend RLS always has final authority.

---

# Chapter 40: Data Mocking Rules

During frontend development some backend features may not yet exist.

Follow these rules.

If database data exists:

Always use live Supabase data.

Do not replace it with hardcoded values.

If backend endpoints are incomplete:

Temporary placeholder data may be used.

Immediately replace placeholders when backend becomes available.

Never permanently ship mock data.

Mock data should follow the PostgreSQL schema exactly.

---

# Chapter 41: Future Expansion Modules

These modules are intentionally reserved.

Do not implement functionality now.

Only reserve navigation architecture if required.

Future Modules:

Reports

Audit Logs

Training Center

Knowledge Base

Document Center

Integrations

Machine Health

Operator Performance

Customer Performance

Fleet Analytics

Predictive Maintenance

AI Recommendations

AI Report Generator

AI Chat Assistant

Digital Documents

Compliance

System Health

---

# Chapter 42: Non-Negotiable Frontend Rules

These rules override every other instruction.

---

## Business Logic

Never invent workflows.

Never modify approval flow.

Never simplify approval hierarchy.

Never remove business validations.

Never create shortcuts.

---

## Database

Never invent tables.

Never invent columns.

Never rename existing columns.

Never assume relationships that do not exist.

Always use the existing PostgreSQL schema.

---

## Roles

Never create additional roles.

Never merge permissions.

Never expose unauthorized information.

Never allow role switching.

---

## Customer Isolation

Customers must only access their own data.

Operators

Machines

Wallet

Assignments

Benefits

Requests

Notifications

must always be filtered by the logged-in customer.

---

## Operator Isolation

Operators must only access:

Own Profile

Own Machine

Own Benefits

Own Notifications

Nothing else.

---

## Insurance Isolation

Insurance users should only interact with Service Requests.

Insurance users must never:

Edit Customers

Edit Machines

Edit Operators

Access Loyalty

Access Analytics unrelated to approvals

---

## Admin

Admin has unrestricted access.

However, destructive actions should always require confirmation.

---

## Assignment Rules

Maximum

3 Active Operators

per Machine.

Frontend should disable invalid actions before backend validation.

---

## Request Rules

Replacement Requests are the ONLY workflow for replacing operators.

Never implement direct replacement shortcuts.

Always follow:

Customer

↓

Insurance Approval

↓

Admin Approval

↓

Assignment Updated

---

## Notifications

Always role-specific.

Never broadcast sensitive information.

---

## Responsive Behaviour

Desktop

Laptop

Tablet

Mobile

All layouts must adapt without breaking.

Large tables should scroll horizontally.

Operator Portal should prioritize mobile usability.

---

## User Experience

Always provide:

Loading State

Empty State

Success Feedback

Error Feedback

Confirmation Dialog

Undo where appropriate

Helpful validation messages

---

## Performance

Lazy load large pages.

Avoid unnecessary re-renders.

Optimize dashboard rendering.

Keep navigation smooth.

---

## AI Features

AI widgets should be designed as reusable components.

Backend integration can remain placeholder for MVP.

The UI should appear production-ready.

---

## Final Directive

If any requirement appears ambiguous:

DO NOT GUESS.

DO NOT INVENT NEW FEATURES.

DO NOT CHANGE BUSINESS RULES.

DO NOT MODIFY DATABASE STRUCTURE.

DO NOT CREATE EXTRA TABLES.

DO NOT CHANGE ROLE PERMISSIONS.

DO NOT CHANGE WORKFLOW.

Instead, strictly follow the existing Operator360 Product Requirements Document and PostgreSQL schema.

This document, along with Volumes 1–4, represents the complete frontend specification for Operator360.