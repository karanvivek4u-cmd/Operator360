Operator360 Frontend Master PRD — Volume 2

Instruction for Lovable / AI Developer:
This is Volume 2 of the Frontend Product Requirements Document. It covers the Customer, Insurance, and Operator portals, plus global UI guidelines. Build the application exactly according to these specifications. Do not invent tables, workflows, or roles. Use the existing PostgreSQL/Supabase schema provided.

CRITICAL RULE: All queries in the Customer, Insurance, and Operator portals MUST be filtered by the logged-in user's respective ID to ensure strict data isolation.

Chapter 9: Customer Portal — Dashboard & Fleet Management

9.1 Customer Dashboard (/customer/dashboard)

Purpose: The central hub for a construction equipment customer to manage their purchased machines and workforce.

Context: Data must be filtered where customer_id matches the logged-in user's linked customer record.

Top KPI Cards:

Total Owned Machines

Total Active Operators

Active Service Requests (Pending Replacements)

Loyalty Wallet Balance (Points)

AI Insight Widget: "AI Workforce Intelligence". Hardcoded placeholder text for MVP: "Operator retention is up 12% this quarter. Machine EX-220 requires a new operator assignment."

Recent Activity: A timeline widget showing the latest operator assignments and request updates.

9.2 My Machines Page (/customer/machines)

Data Source: public.machines where customer_id = current_user.customer_id.

View: Table or Card grid view.

Columns/Data Points: Serial Number, Model, Purchase Date, Warranty End, Status Badge, Current Assigned Operators (up to 3).

Action: Clicking a machine opens a detailed digital twin view showing specs and operator assignment history.

Chapter 10: Customer Portal — Operator & Replacement Workflow

10.1 My Operators Page (/customer/operators)

Data Source: public.operators where customer_id = current_user.customer_id.

Table Columns: Operator Code, Name, Phone, Current Machine, Status.

Actions: Add New Operator, View Profile, Request Replacement.

Add Operator Modal: Standard form mapped to public.operators (Name, Phone, Aadhaar, DOB, Emergency Contact).

10.2 Service Requests (Replacement Workflow) (/customer/requests)

Purpose: This is the ONLY way an operator can be replaced on a machine.

Workflow UI: A multi-step wizard or clean form modal:

Select Machine: Dropdown of customer's machines.

Select Old Operator: Dropdown of operators currently assigned to that machine.

Select New Operator: Dropdown of customer's available operators.

Reason/Comments: Text area for customer_comments.

Submission Logic: Creates a record in public.service_requests with insurance_status = 'PENDING' and admin_status = 'PENDING'.

Tracking View: Amazon-style tracking timeline showing the status of the request (Submitted -> Pending Insurance -> Pending Admin -> Approved/Completed).

Chapter 11: Customer Portal — Loyalty & Engagement

11.1 Loyalty Wallet (/customer/loyalty)

Data Source: public.loyalty_wallet (wallet_amount).

Visuals: A prominent "Digital Wallet" card displaying the current point balance.

Reward Milestones (UI Placeholder): A progress bar or "Next Reward" card showing how close they are to a milestone (e.g., "120 points until Mobile Voucher").

History Table: A mock table showing recent point additions (e.g., "+300 Safety Campaign", "+500 Active Assignment"). Note: Mock this history data for the MVP as a transaction table doesn't exist in the current core schema, just rely on the wallet_amount.

Chapter 12: Insurance Portal — Approval Workflow

12.1 Insurance Dashboard (/insurance/dashboard)

Purpose: A hyper-focused, minimal workspace. Insurance users do not care about machines or operators directly; they only care about approving/rejecting coverage for replacements.

KPIs: Pending Approvals, Approved Today, Rejected Today.

12.2 Pending Requests (/insurance/pending)

Data Source: public.service_requests where insurance_status = 'PENDING'.

View: List or Kanban board of pending tickets.

Action Modal: Clicking a ticket shows:

Machine details.

Old Operator details.

New Operator details.

Approve Button: Updates insurance_status to 'APPROVED', insurance_approved_by to user_id, sets timestamp.

Reject Button: Updates insurance_status to 'REJECTED' and requires a rejection_reason.

Chapter 13: Operator Portal — Self-Service & Benefits

13.1 Operator Dashboard (Mobile-First) (/operator/dashboard)

Purpose: Operators will likely access this on mobile. The UI must be highly responsive, utilizing large touch targets and simplified navigation (bottom tab bar on mobile).

Context: Strictly filtered to operator_id = current_user.operator_id.

Assigned Machine Card: Prominently displays the current machine they are operating (fetched via active operator_assignments).

13.2 My Benefits (/operator/benefits)

Data Source: public.benefits.

Visuals: Netflix-style benefit cards (e.g., "Health Insurance - ₹2,00,000 - Active", "Life Insurance - ₹5,00,000 - Active").

Indicators: Clear green/red badges indicating if the benefit is Active, Expiring, or Expired.

13.3 Training & AI Assistant (UI Placeholders)

Training Hub: A card linking to dummy safety courses ("Safe Excavator Operation - 75% Complete").

AI Chat Toggle: A floating action button (FAB) opening a chat interface where the operator can "ask" about their benefits or points.

Chapter 14: Global Components & Notifications

14.1 Notification Center

Trigger: Bell icon in the top header.

Data Source: public.notifications filtered by user_id.

UI: A slide-out panel (drawer) or dropdown.

Features: Read/Unread styling, "Mark all as read" button. Clicking a notification should navigate to the relevant link (e.g., routing to a specific Service Request).

14.2 AI Assistant / Copilot UI

Presence: Available in Admin and Customer portals as a sidebar widget or a persistent bottom-right chat widget.

Function (Frontend only for MVP): An interface that looks like ChatGPT/Copilot. Pre-populate it with "Suggested Questions" based on the role (e.g., Admin: "Show customers with highest operator churn", Operator: "What benefits am I eligible for?").

Chapter 15: Strict Lovable Directives & UI/UX Standards

15.1 Design System & Theming

Theme: Enterprise SaaS, Microsoft Copilot / ServiceNow inspired.

Styling: Use Tailwind CSS. Utilize Glassmorphism effects (backdrop-blur, subtle borders, translucent white/black backgrounds) for panels and modal backgrounds.

Colors: Primary: Professional Blue (#005BAC), Secondary/Accent: Orange (#FF6B00), Background: Off-white/gray (#F8F9FB), Success: Green (#16A34A).

Typography: Clean, sans-serif, highly legible data tables.

15.2 Mandatory UI States

Loading States: Use skeleton loaders for all tables, dashboards, and profile views while Supabase data is fetching. Avoid generic spinners.

Empty States: If a table has no data, show a beautiful empty state with an illustration/icon and a call-to-action (e.g., "No machines found. Add your first machine.").

Error States: Use toast notifications (e.g., via sonner or similar library) to handle API/database errors gracefully.

15.3 The "DO NOT BREAK" Rules

Never invent new tables. Map everything to the provided PostgreSQL schema.

Respect RLS via Frontend Routing: Ensure an Operator navigating to /admin/dashboard is violently redirected to /operator/dashboard or /unauthorized.

Maximum 3 Operators Rule: The UI must disable assignment buttons if operator_assignments for a specific machine already has 3 active entries.

No Direct Deletions: Use status = 'INACTIVE' or equivalent. Enterprise data is rarely hard-deleted.