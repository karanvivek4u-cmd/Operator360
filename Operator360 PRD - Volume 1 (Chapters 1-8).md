Operator360 Frontend Master PRD — Volume 1

Instruction for Lovable / AI Developer:
This is Volume 1 of the Frontend Product Requirements Document. Build the application exactly according to these specifications. Do not invent tables, workflows, or roles. Use the existing PostgreSQL/Supabase schema provided.

Chapter 1: Project Overview & Vision (Recap)

Operator360 is an enterprise-grade platform for heavy equipment manufacturers. It digitally manages the lifecycle of equipment operators, their assignments to machines, welfare benefits, loyalty programs, and automated replacement requests.

Tech Stack: React (Lovable), Tailwind CSS, Supabase (PostgreSQL, Auth, RLS).

Roles: Admin, Customer, Insurance, Operator.

UI Theme: Enterprise SaaS, Glassmorphism, AI-Native, Mobile-responsive.

Chapter 2: Application Architecture & Navigation System

2.1 Layout Structure

The application uses a standard enterprise SaaS layout:

Top Bar (Header): Contains the Global Search, Notification Bell, User Profile dropdown (Settings, Logout), and an AI Assistant toggle.

Sidebar (Left): Primary navigation. Collapsible on desktop, converts to a hidden drawer on mobile/tablet (hamburger menu).

Main Content Area (Right): Houses dashboards, data tables, and detail workspaces.

2.2 Role-Based Navigation

Navigation links MUST be conditionally rendered based on the user's role.

Admin Navigation:

Dashboard

Customers

Machines

Operators

Assignments

Service Requests

Benefits

Loyalty

Settings

Customer Navigation:

Dashboard

My Machines

My Operators

Assignments

Service Requests

Loyalty Wallet

Profile

Insurance Navigation:

Dashboard

Pending Approvals

Approved Requests

Rejected Requests

Profile

Operator Navigation:

My Machine (Dashboard)

My Benefits

Notifications

Profile

Chapter 3: Authentication & Role-Based Access Control (RBAC)

3.1 Login Flow

Screen: Clean, centered login card with company branding.

Fields: Email, Password, "Remember Me" checkbox, "Forgot Password" link.

Action: Authenticates via Supabase Auth.

Routing Logic: UPON SUCCESSFUL LOGIN, query the public.users table matching auth_user_id. Read the role column.

If role === 'ADMIN', redirect to /admin/dashboard.

If role === 'CUSTOMER', redirect to /customer/dashboard.

If role === 'INSURANCE', redirect to /insurance/dashboard.

If role === 'OPERATOR', redirect to /operator/dashboard.

Security Strictness: The frontend must heavily enforce role-based routing. An Operator trying to access /admin/dashboard must be blocked and redirected.

Chapter 4: Admin Portal — Dashboard

4.1 Purpose

A high-level command center giving the manufacturer real-time visibility into the entire ecosystem.

4.2 Top KPI Cards (Metrics)

Total Customers: Count of active customers.

Total Machines: Count of registered machines.

Active Operators: Count of operators with status 'ACTIVE'.

Pending Requests: Count of service requests where overall_status = 'PENDING'.

4.3 Charts & Visualizations

Operator Growth (Line Chart): Operators onboarded over the last 6-12 months.

Machine Status Distribution (Donut Chart): Assigned vs. Unassigned machines.

Benefits Coverage (Progress Ring/Pie): Percentage of operators with active benefits.

4.4 AI Executive Insights Widget

A stylized, glassmorphic card titled "🤖 AI Strategic Insights".

For MVP UI Placeholder: Hardcode bullet points like: "South Region engagement increased by 14%", "5 replacement requests require urgent attention."

Chapter 5: Admin Portal — Customer Management

5.1 Customer List Page (/admin/customers)

Data Source: public.customers table.

Top Bar Actions: Global Search input, Filter by Category, "Add New Customer" button.

Table Columns: Customer Code, Company Name, Contact Person, Email, Machines (count), Operators (count), Status (Chip: Green=Active, Red=Inactive), Actions (View, Edit).

Interactivity: Clicking a row opens the Customer 360 Workspace.

5.2 Add/Edit Customer Modal

Fields: Company Name, Contact Person, Email, Phone, Address, City, State, Pincode, GST Number, Category (Dropdown), Status.

5.3 Customer 360 Workspace (/admin/customers/[id])

Header: Company Name, Customer Code, Health Score (AI placeholder).

Stats Row: Loyalty Wallet Balance (from loyalty_wallet), Total Machines, Total Operators.

Tabbed Interface:

Tab 1: Machines. Table of machines owned by this customer.

Tab 2: Operators. Table of operators under this customer.

Tab 3: Assignments. Active mapping of operators to machines.

Tab 4: Service Requests. History of replacement requests for this customer.

Chapter 6: Admin Portal — Machine Management

6.1 Machine List Page (/admin/machines)

Data Source: public.machines joined with public.customers.

Table Columns: Serial Number, Model, Customer (Company Name), Purchase Date, Warranty End, Status (Assigned, Unassigned, Maintenance), Actions.

Features: Search by Serial Number, filter by Status or Customer.

6.2 Machine Detail View (Digital Twin)

Header: Serial Number, Model, Status Badge.

Left Panel (Specs): Engine Number, Warranty Date, Remarks.

Right Panel (Current Operators): Cards showing the currently assigned operators (Max 3). Fetched from operator_assignments where status = 'ACTIVE'.

Timeline Component: Historical timeline of previous operators assigned to this machine.

Chapter 7: Admin Portal — Operator Management

7.1 Operator List Page (/admin/operators)

Data Source: public.operators joined with public.customers.

Table Columns: Operator Code, Name, Phone, Customer, Current Machine (if assigned), Benefits Status, Actions.

7.2 Operator Profile Workspace

Header: Operator Photo (Placeholder avatar), Name, Code, "Master Operator Badge" (UI flair).

Quick Stats: Loyalty Points (placeholder), Engagement Score (placeholder).

Tabbed Interface:

Profile: Aadhaar, DOB, Gender, Address, Emergency Contact.

Assignment History: List of machines they have operated.

Benefits: Cards showing health/life benefits from public.benefits. Status indicator (Active/Expired).

Service Requests: Any tickets where they were the old_operator_id or new_operator_id.

Chapter 8: Admin Portal — Assignments & Service Requests

8.1 Assignment Management (/admin/assignments)

Rule Enforced on Frontend: A single machine can have a maximum of 3 active operators. The UI must disable the "Assign" button if the machine already has 3 active assignments.

View: A Kanban board or grouped table showing Machines and their actively attached operators.

8.2 Service Request (Replacement) Workflow (/admin/requests)

Purpose: The strict workflow for replacing an operator on a machine.

Data Source: public.service_requests.

List View Tabs: All, Pending Insurance, Pending Admin, Completed, Rejected.

Table Columns: Request Number, Machine Serial, Customer, Old Operator, New Operator, Insurance Status, Admin Status, Overall Status.

Admin Action: When clicking a request pending Admin approval:

Opens a detailed modal showing the Machine, the Old Operator leaving, the New Operator replacing them, and the Customer Comments.

Shows the "Insurance Status" (Must be APPROVED before Admin can approve).

Buttons: "Approve Request" (Updates admin_status and overall_status to APPROVED, triggers backend logic to end old assignment and create new one), "Reject Request" (Requires Rejection Reason text).