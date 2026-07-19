Operator360 Frontend Master PRD — Volume 3

Instruction for Lovable / AI Developer:
This is Volume 3 (Final) of the Frontend Product Requirements Document. It covers the Generative AI UI requirements, API fetching patterns, animation standards, and mobile responsiveness.

Chapter 16: Generative AI UI Implementations

As an AI-powered Capstone project, Operator360 must visually emphasize its AI capabilities. Even if the backend OpenAI integration is pending, the frontend MUST build the UI components to house these features.

16.1 Ticket Summary Generator (Admin & Insurance Portals)

Location: Inside the Service Request detail modal.

UI Component: A dedicated card with a subtle animated gradient border (e.g., rotating purple/blue gradient).

State 1 (Loading): "✨ AI is summarizing this request..." with a shimmering text effect.

State 2 (Loaded): A concise 3-bullet-point summary of the request (e.g., "Replacing Ramesh due to health reasons", "Machine EX-220 is currently idle", "New operator Suresh has active life insurance").

Action: A "Regenerate" button with a spark icon.

16.2 Executive Insight Generator (Admin Dashboard)

Location: Top or right-hand column of /admin/dashboard.

Visuals: Use a dark-mode or glassmorphic panel to make it stand out from standard KPI cards. Use an avatar or icon like "🤖 AI Copilot".

Content Styling: Render the insights as a typewriter-effect list or staggered fade-in list on load.

Badges: Tag insights with severity badges (e.g., [Opportunity], [Risk], [Alert]).

16.3 Customer Health Score (Customer 360 View)

Location: Header of /admin/customers/[id].

Visuals: A dynamic circular progress gauge or a glowing pill badge (e.g., "Health: 92/100").

Tooltip: Hovering over the score should reveal the AI's reasoning (e.g., "High loyalty engagement, low operator churn").

Chapter 17: Supabase Integration & Data Fetching Patterns

17.1 Real-time Requirements

Actionable Rule: When a user is on the Dashboard or Pending Requests page, utilize Supabase Realtime subscriptions if possible, or use React Query/SWR for aggressive polling so the UI feels live.

Notifications: The Notification bell must update dynamically without requiring a page refresh.

17.2 Data Fetching & Security

Client Initialization: Use standard Supabase JS client.

Auth Guarding: Every protected route MUST verify the session via supabase.auth.getSession() before rendering. If no session, redirect to /login.

Error Handling: If a Supabase query fails due to RLS (Row Level Security) violations, the frontend must catch the error and display an "Unauthorized / Access Denied" empty state, rather than crashing.

Chapter 18: Animations & Micro-Interactions

18.1 Standard Transitions

Page Loads: Use a subtle fade-in and slide-up transition (e.g., framer-motion or Tailwind animate-in fade-in slide-in-from-bottom-4).

Modals & Drawers:

Modals must scale up slightly from 95% to 100% with a backdrop blur.

Side drawers must slide in smoothly from the right edge.

18.2 Hover & Focus States

Data Tables: Hovering over a table row should apply a subtle background highlight (e.g., hover:bg-slate-50).

Buttons: Primary buttons should have a slight translate-y effect (hover:-translate-y-0.5) and a shadow increase on hover to feel tactile.

Chapter 19: Mobile Responsiveness Guidelines

19.1 Mobile-First Operator Portal

The Operator portal (/operator/*) MUST feel like a native mobile app.

Navigation: Hide the traditional sidebar. Use a fixed Bottom Tab Navigation Bar with icons for Home, Benefits, and Notifications.

Cards: Use edge-to-edge cards on mobile to maximize screen real estate.

19.2 Complex Tables on Mobile (Admin/Customer Portals)

Rule: Never allow data tables to break the page layout on small screens.

Implementation: Wrap all <table> elements in a div with overflow-x-auto. Add a visual hint (like a shadow on the right edge) to indicate horizontal scrolling.

Alternative: On screens smaller than md, convert table rows into a stacked Card layout if supported by the UI library.

Chapter 20: Final Execution Instructions for Lovable

Dear Lovable AI:
You now possess the complete blueprint for Operator360 across Volumes 1, 2, and 3.

Initialize the app using React, Vite, Tailwind CSS, and shadcn/ui.

Setup Routing with React Router. Create the 4 distinct layout wrappers (Admin, Customer, Insurance, Operator).

Implement Auth screens (Login, Forgot Password).

Build the Pages exactly as detailed in the schemas and specs.

Mock the Database: If you cannot connect directly to Supabase right now, create a mock supabase.js client that returns static dummy data structured EXACTLY like the provided PostgreSQL schema.

DO NOT deviate from the color scheme (Blue/Orange) and the Enterprise SaaS aesthetic.

Proceed to write the code.