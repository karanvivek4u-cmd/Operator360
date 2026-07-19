# Operator360 --- Frontend Master Prompt for Lovable

This document is the frontend specification for Operator360.

## Roles

-   Admin
-   Customer
-   Insurance
-   Operator

Authentication: Supabase Auth (email/password).

Redirect after login based on role stored in users table.

ADMIN → Admin Portal CUSTOMER → Customer Portal INSURANCE → Insurance
Portal OPERATOR → Operator Portal

## UI

Responsive, professional, interactive, enterprise SaaS. Avoid generic
statistic cards. Use rich dashboards, timelines, layered widgets,
progress indicators, hover effects, smooth animations, loading
skeletons, empty states, toast notifications, search, filters,
pagination and reusable components.

## Admin

Dashboard with KPIs, charts, timelines. Customers module: - list all
customers - search/filter/sort - clicking customer opens detail
workspace Customer workspace contains: - company information - loyalty
wallet - purchased machines - operators - assignments - replacement
requests - statistics

Machines: serial, model, engine, warranty, assigned operators, status.

Operators: profile, benefits, assignments, replacement history.

Assignments: never allow UI to assign more than 3 active operators.

Service Requests: ONLY for operator replacement.

Workflow: Customer → Insurance → Admin → Completed.

Insurance: Pending/Approved/Rejected queues.

Operator: Assigned machine, benefits, notifications, profile.

Notifications: Role-specific notification center.

Use existing PostgreSQL schema exactly. Respect RLS. Never invent
additional tables or workflows. Reserve placeholders for future AI
assistant and insights.
