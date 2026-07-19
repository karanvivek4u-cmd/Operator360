# Operator360 — Design Theme & UI/UX Specification

> This document is the single source of truth for all visual design, layout, interaction, and aesthetic decisions for the Operator360 frontend. Every developer, designer, or AI tool building this application must follow these guidelines exactly.

---

## 1. Design Philosophy

Operator360 is **enterprise workforce management software built for the heavy equipment industry**. The design must reflect this identity at every level.

**The interface should feel like:**
- A premium command center for managing machines and operators
- Specialized industrial software — not a generic SaaS template
- Sturdy, confident, and precise — like the equipment it manages
- Modern and alive — not a static spreadsheet with a sidebar

**The interface must NOT feel like:**
- A Bootstrap admin template
- A generic CRUD application
- An AI-generated default layout
- A college project or hackathon prototype
- An ERP system from 2010

---

## 2. Color System

### 2.1 Primary Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#00A3A1` | Primary buttons, active nav items, brand accents, links, focused inputs |
| `--color-primary-dark` | `#008C8A` | Hover states on primary elements, pressed buttons |
| `--color-primary-light` | `#B2DFDB` | Light tinted backgrounds for selected rows, active card borders, tag backgrounds |
| `--color-primary-surface` | `#E0F2F1` | Very light teal wash for highlighted sections, notification badges |

### 2.2 Neutral Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg-page` | `#F8F9FB` | Page background, content area |
| `--color-bg-card` | `#FFFFFF` | Cards, panels, modals |
| `--color-bg-sidebar` | `#111827` | Sidebar background (dark) |
| `--color-text-primary` | `#111827` | Headings, primary body text |
| `--color-text-secondary` | `#6B7280` | Descriptions, secondary labels, timestamps |
| `--color-text-muted` | `#9CA3AF` | Placeholder text, disabled labels |
| `--color-border` | `#E5E7EB` | Card borders, dividers, table lines |
| `--color-border-focus` | `#00A3A1` | Focused input borders |

### 2.3 Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#16A34A` | Active status, approved badges, success toasts |
| `--color-error` | `#DC2626` | Error states, rejected badges, destructive actions |
| `--color-warning` | `#D97706` | Pending states, expiring items, caution alerts |
| `--color-info` | `#0284C7` | Informational badges, helper text |

### 2.4 Color Rules

- **DO NOT** introduce random accent colors (purple, pink, neon, bright orange)
- **DO NOT** use the primary teal for error/warning states — keep semantic colors strict
- All status chips must use semantic colors only
- The sidebar uses a dark theme (`#111827`) with teal highlights for active items
- Cards and panels always sit on white (`#FFFFFF`) against the off-white page background

---

## 3. Typography

### 3.1 Font Family

Use **Inter** (Google Fonts) as the primary typeface. Fallback: `system-ui, -apple-system, sans-serif`.

Do NOT use default browser fonts. Do NOT use serif fonts. Do NOT use decorative or display fonts anywhere in the data-heavy interface.

### 3.2 Type Scale

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page Title (H1) | 24px | 700 (Bold) | `--color-text-primary` |
| Section Title (H2) | 20px | 600 (Semibold) | `--color-text-primary` |
| Card Title (H3) | 16px | 600 | `--color-text-primary` |
| Body Text | 14px | 400 | `--color-text-primary` |
| Secondary Text | 13px | 400 | `--color-text-secondary` |
| Table Cell | 14px | 400 | `--color-text-primary` |
| Table Header | 12px | 600 (Uppercase) | `--color-text-secondary` |
| Button Text | 14px | 500 | White (on primary bg) |
| Caption / Timestamp | 12px | 400 | `--color-text-muted` |

### 3.3 Typography Rules

- All table headers should be **uppercase, letter-spaced (0.05em)**, and muted color
- KPI numbers (dashboard metrics) should be **28–36px, Bold** to create strong hierarchy
- Never use more than 3 font weights on a single page
- Line height for body text: 1.5. For headings: 1.2

---

## 4. Layout System

### 4.1 Application Shell

The app uses a standard enterprise layout:

```
+------------------+----------------------------------------+
|                  |  [Top Bar / Header]                    |
|    Sidebar       +----------------------------------------+
|    (Left)        |                                        |
|                  |  [Main Content Area]                   |
|                  |                                        |
|                  |                                        |
+------------------+----------------------------------------+
```

- **Sidebar (Left):** 260px wide on desktop, collapsible to 72px (icon-only). On tablet/mobile: hidden behind a hamburger drawer
- **Top Bar:** Sticky. Contains global search, notification bell, user avatar dropdown
- **Main Content:** Scrollable. All page content renders here. Max content width: 1400px, centered with auto margins on ultra-wide screens

### 4.2 Dashboard Layout — Bento Grid

**CRITICAL:** Do NOT use a typical row of 4–6 identical stat cards. Use a **Bento Box** layout with varying widget sizes.

Example Admin Dashboard grid (desktop):

```
+-------------+-------------+---------------------------+
|  KPI Card   |  KPI Card   |                           |
|  (1x1)      |  (1x1)      |   AI Insights Panel       |
+-------------+-------------+   (1x2 tall)              |
|  KPI Card   |  KPI Card   |                           |
|  (1x1)      |  (1x1)      |                           |
+-------------+-------------+---------------------------+
|  Line Chart — Operator Growth (2x1 wide)  | Donut     |
|                                            | Chart     |
|                                            | (1x1)     |
+--------------------------------------------+-----------+
|  Recent Activity Timeline (2x1 wide)      | Quick     |
|                                            | Actions   |
|                                            | (1x1)     |
+--------------------------------------------+-----------+
```

- Widgets must have **varying heights and spans** — never a flat grid of same-sized boxes
- Use CSS Grid with `grid-template-columns` and `grid-row` spans
- On tablet: collapse to 2 columns. On mobile: stack to single column
- Every widget gets a subtle entrance animation (staggered fade-in + slide-up)

### 4.3 Spacing System

Use an 8px base grid:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 4px | Tight padding inside chips/badges |
| `--space-sm` | 8px | Gap between inline elements |
| `--space-md` | 16px | Card internal padding, form field gaps |
| `--space-lg` | 24px | Section gaps, card-to-card gaps |
| `--space-xl` | 32px | Page-level padding, major section dividers |
| `--space-2xl` | 48px | Dashboard top padding |

---

## 5. Component Design Standards

### 5.1 Cards

Cards are the primary container for content. Three card types:

**KPI Metric Card:**
- White background, subtle border (`1px solid var(--color-border)`)
- Left color accent stripe (4px wide, teal) OR a tinted icon circle at top-left
- Large metric number (28–36px bold), label below (13px muted)
- Optional trend indicator (arrow up/down with percentage, green/red)
- Subtle hover: lift shadow (`box-shadow` transition), slight scale (`1.01`)

**Entity Card (Machine, Operator, Customer):**
- White bg, rounded corners (12px)
- Avatar or icon placeholder at top
- Title (bold), subtitle (muted), status badge
- Bottom row: 2–3 quick-glance stats in pill format
- Click navigates to detail workspace

**Action Card (Quick Actions, AI Insights):**
- Glassmorphic effect: `backdrop-filter: blur(12px)`, semi-transparent background
- Subtle gradient border (teal-to-transparent, animated rotation for AI cards)
- Icon + title + short description
- Clear CTA button

### 5.2 Status Badges / Chips

| Status | Background | Text | Border |
|--------|------------|------|--------|
| Active | `#DCFCE7` | `#166534` | none |
| Inactive | `#FEE2E2` | `#991B1B` | none |
| Pending | `#FEF3C7` | `#92400E` | none |
| Approved | `#DCFCE7` | `#166534` | none |
| Rejected | `#FEE2E2` | `#991B1B` | none |
| Assigned | `#E0F2F1` | `#00695C` | none |
| Unassigned | `#F3F4F6` | `#6B7280` | none |
| Expired | `#FEE2E2` | `#991B1B` | none |

- Chips are pill-shaped (border-radius: 9999px), padding: 4px 12px
- Font size: 12px, font-weight: 500
- Never use emojis inside status badges

### 5.3 Tables

- **Header:** Sticky, uppercase, letter-spaced, muted color, light gray bg (`#F9FAFB`)
- **Rows:** Alternate subtle striping OR clean white with border-bottom
- **Hover:** Row highlight `bg-slate-50` with smooth transition
- **Actions Column:** Use an ellipsis icon (`...`) menu for secondary actions (Edit, View, Deactivate). Primary action (View/Open) should be the row click itself
- **Pagination:** Bottom of table. Show page numbers, prev/next, rows-per-page selector
- **Search:** Positioned above the table with a clear search icon input
- **Filters:** Dropdown pills or a filter bar next to search — not a separate page
- **Mobile:** Wrap in `overflow-x-auto` container with a right-edge shadow hint. Alternatively convert to stacked cards below `md` breakpoint
- **Empty State:** Centered icon + friendly message + CTA button (if applicable)
- **Loading:** Skeleton rows (5 rows of shimmering bars matching column widths)

### 5.4 Buttons

| Type | Style |
|------|-------|
| Primary | Solid teal bg, white text, rounded (8px), shadow-sm |
| Secondary | White bg, teal border, teal text |
| Destructive | Red bg, white text (only for reject/delete) |
| Ghost | No bg, teal text, hover: light teal bg |
| Icon Button | 36x36px circle, icon centered, ghost style |

- Hover: lift `-translate-y-0.5`, shadow increase
- Active/pressed: scale `0.98`
- Loading state: spinner replaces text, button disabled
- Disabled: 50% opacity, cursor not-allowed

### 5.5 Modals & Drawers

- **Modals:** Centered, max-width 560px (forms) or 720px (detail views). Backdrop blur. Scale-up entrance animation (95% → 100%)
- **Drawers:** Slide from right edge (notification panel, AI assistant). Width: 400px desktop, full-width on mobile
- Always include a clear close button (X icon, top-right)
- Header: title + optional subtitle. Footer: action buttons (Cancel left, Primary right)

### 5.6 Forms

- Input fields: 40px height, 12px border-radius, 1px border, 16px horizontal padding
- Focus: teal border color + subtle teal shadow ring
- Labels: above the input, 13px semibold
- Required indicator: teal asterisk (*) after label text
- Validation errors: red text below input, input border turns red
- Submit button disabled until all required validations pass
- Show loading spinner on submit button during API call

### 5.7 Sidebar Navigation

- Dark background (`#111827`)
- Logo/brand mark at top (compact, not full text on collapsed)
- Nav items: icon + label, 44px height, 8px border-radius
- Active item: teal left border accent (3px) + teal-tinted background + white text
- Inactive items: gray text (`#9CA3AF`), hover: lighter bg
- Collapse toggle at bottom or top — switches to icon-only (72px wide)
- Section dividers between nav groups (thin line, 8px margin)
- On mobile/tablet: slide-out drawer triggered by hamburger icon in top bar

### 5.8 Top Bar / Header

- Sticky, white bg, border-bottom, height: 64px
- Left: Hamburger menu (mobile only) + Page title or Breadcrumb
- Right: Global search input (expandable) + Notification bell (with unread dot) + User avatar dropdown
- Breadcrumbs: `Dashboard / Customers / ABC Infrastructure / Machines`

---

## 6. Iconography

### 6.1 Icon Library

Use **Lucide React** as the sole icon library. It provides consistent stroke-width, clean geometry, and a professional appearance.

### 6.2 Icon Rules

- **NEVER use emojis.** Not in cards, not in badges, not in AI widgets, not in notifications, not anywhere. Emojis make the interface look unprofessional and AI-generated.
- Use icons at consistent sizes: 16px (inline), 20px (buttons/nav), 24px (card headers), 32px (empty states)
- Stroke width: 1.5px–2px (consistent across the app)
- Color: inherit from parent text color, or use teal for interactive/accent icons
- For AI-related widgets, use a subtle sparkle/wand icon — not a robot emoji

---

## 7. Data Visualization & Charts

- Use a charting library like **Recharts** or **Chart.js**
- Chart colors should pull from the teal palette: `#00A3A1`, `#4DB6AC`, `#80CBC4`, `#B2DFDB` — plus semantic colors where needed
- **Donut Charts:** For status distributions (machine status, assignment status). Show total count in the center
- **Line Charts:** For trends over time (operator growth, request volume). Smooth curves, filled area with low opacity
- **Progress Rings:** For completion metrics (benefits coverage, loyalty milestones). Thick stroke, animated fill on load
- **Bar Charts:** For comparisons (customers by category). Rounded top corners
- All charts must have: title, legend, tooltips on hover, smooth entrance animation
- No 3D effects. No gradients on chart bars. Keep it flat and clean

---

## 8. Animation & Motion Standards

### 8.1 Page Transitions

- Every page/route change: fade-in (opacity 0 → 1) + slide-up (translateY 8px → 0)
- Duration: 300ms, easing: `ease-out`

### 8.2 Dashboard Widget Entrance

- Staggered animation: each widget fades in with a 50–80ms delay after the previous
- Creates a "cascade" loading effect that feels premium

### 8.3 Hover & Focus

- All transitions: 150–200ms duration
- Buttons: translateY + shadow on hover
- Cards: subtle shadow increase + optional scale (1.01)
- Table rows: background color transition

### 8.4 Modals & Drawers

- Modal: scale 0.95 → 1.0, opacity 0 → 1, duration 200ms
- Drawer: translateX(100%) → translateX(0), duration 250ms
- Backdrop: opacity 0 → 0.5, duration 200ms

### 8.5 Loading & Skeleton

- Skeleton elements: shimmering gradient animation (left to right), infinite loop
- Match the shape and position of real content (rectangular for text, circular for avatars)
- Duration: 1.5s per shimmer cycle

### 8.6 What NOT to Animate

- Do not animate every single element — it becomes distracting
- Do not use bounce/elastic easing — it feels toyish for enterprise software
- Do not use rotation animations except on loading spinners
- Do not animate background colors on page scroll

---

## 9. Responsive Design

### 9.1 Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Desktop | >= 1280px | Full sidebar + Bento grid + side panels |
| Laptop | >= 1024px | Sidebar may collapse, 2–3 col grid |
| Tablet | >= 768px | Sidebar as drawer, 2-col grid, horizontal scroll tables |
| Mobile | < 768px | Bottom nav (Operator), hamburger drawer (others), single column, stacked cards |

### 9.2 Operator Portal (Mobile-First)

The Operator portal is specifically designed for field workers on phones:

- Use a **fixed bottom tab bar** (Home, Benefits, Notifications, Profile) — 4 icons max
- No traditional sidebar on mobile
- Large touch targets (min 44x44px)
- Edge-to-edge cards
- Simplified data display (no complex tables)

### 9.3 Admin/Customer Portals (Desktop-First)

- Complex data tables with horizontal scroll on smaller screens
- Right-edge shadow hint to indicate scrollable content
- Sidebar collapses to icon-only on tablet, drawer on mobile
- Modals become full-screen bottom sheets on mobile

---

## 10. Glassmorphism & Depth

Use glassmorphism **selectively** to create premium depth:

- **Where to use:** AI insight panels, modal backdrops, sticky headers, notification drawer overlay, floating action buttons
- **How:** `backdrop-filter: blur(12px)`, `background: rgba(255,255,255,0.8)`, `border: 1px solid rgba(255,255,255,0.3)`
- **Where NOT to use:** Regular data cards, table cells, form inputs, status badges — these must remain crisp and fully opaque for readability

---

## 11. AI Widget Styling

AI-powered components must be visually distinct from standard UI elements:

- Use a **subtle animated gradient border** (teal → cyan, slow rotation) to indicate "AI-powered"
- Background: slightly different from standard cards — use a very faint teal wash or glassmorphic effect
- Header: use a sparkle/wand icon (from Lucide) + label like "AI Insights" — **NOT a robot emoji**
- Loading state: shimmer text effect ("Generating insights...") — not a spinner
- Content should render with a typewriter or staggered fade-in effect
- Include a "Regenerate" button with a refresh icon
- Severity badges on insights: `[Opportunity]` in teal, `[Risk]` in amber, `[Alert]` in red

---

## 12. Empty States

Every module must handle zero-data scenarios gracefully:

- Centered layout: large icon (48px, muted color) + headline + short description + CTA button
- Tone: friendly and helpful, not technical
- Examples:
  - Machines: Wrench icon + "No machines registered yet" + "Add your first machine"
  - Operators: User icon + "No operators found" + "Register an operator to get started"
  - Notifications: Bell icon + "All caught up!" + "No new notifications"
- Do NOT show an empty table with headers and no rows — always replace with the empty state component

---

## 13. Loading States

- **Dashboard:** Skeleton Bento grid matching widget sizes and positions
- **Tables:** 5 skeleton rows with column-width-matched shimmer bars
- **Detail Pages:** Skeleton avatar circle + skeleton text blocks
- **Modals:** Content area skeleton, buttons remain visible but disabled
- **Charts:** Skeleton rectangle matching chart container size
- Never use a single centered spinner as the only loading indicator — always use shaped skeletons

---

## 14. Notification Design

- **Bell Icon:** Top bar, right side. Red unread dot (8px circle) when unread count > 0
- **Panel:** Slide-out drawer from right, 400px wide
- **Grouping:** Group by date ("Today", "Yesterday", "Earlier")
- **Item:** Icon (based on type) + title + message preview + timestamp + read/unread dot
- **Actions:** "Mark all as read" at top. Click notification to navigate to linked entity
- **Unread styling:** Slightly tinted background (`--color-primary-surface`), bold title
- **Read styling:** White background, normal weight title

---

## 15. Things to Strictly Avoid (Comprehensive)

| # | Avoid | Reason | Instead Do |
|---|-------|--------|------------|
| 1 | Emojis anywhere | Looks unprofessional and AI-generated | Use Lucide icons consistently |
| 2 | Generic 4–6 equal card dashboards | Looks like every template ever | Use Bento Box layouts with varying sizes |
| 3 | Default browser fonts | Looks cheap | Use Inter from Google Fonts |
| 4 | Purple, pink, neon accents | Breaks the industrial theme | Stick to teal + neutrals + semantic colors |
| 5 | Overly rounded bubble UI | Feels like a chat app, not enterprise software | Use moderate border-radius (8–12px) |
| 6 | Static pages with no motion | Feels dead and lifeless | Add subtle page transitions and hover effects |
| 7 | Blank white loading screens | Feels broken | Use content-shaped skeleton loaders |
| 8 | Raw database error messages | Terrifies users | Show friendly error toasts with retry options |
| 9 | Giant centered spinners | Lazy and uninformative | Use inline skeletons and shimmer effects |
| 10 | Cluttered tables with every column visible | Overwhelming | Prioritize columns, hide secondary data behind details |
| 11 | Robot emoji for AI features | Cliché and unprofessional | Use sparkle/wand icon |
| 12 | Bounce/elastic animations | Too playful for enterprise | Use ease-out, subtle and professional |
| 13 | Hard-deleting records | Enterprise data must persist | Use status toggles (Active/Inactive) |
| 14 | Full-page reloads after actions | Kills the experience | Use optimistic updates and data refetching |
| 15 | Placing all filters on a separate page | Adds unnecessary friction | Use inline filter bars and dropdowns above tables |

---

## 16. Engagement & Delight (The "Fun" Factor)

While maintaining professionalism, the app should feel engaging:

- **Loyalty Wallet:** Display as a premium "digital wallet" card with a progress ring showing milestone proximity. Animate the ring fill on page load
- **Machine Digital Twin:** Present machine details as a layered command center — specs on one side, active operators as mini-cards on the other, timeline below
- **Service Request Tracker:** Amazon-style step tracker showing request progress through stages (Submitted → Insurance → Admin → Complete)
- **Dashboard Cascade:** Staggered widget entrance animation makes the dashboard feel like it's "powering up"
- **Tactile Buttons:** Every click provides immediate visual feedback (color shift, scale pulse)
- **Contextual Quick Actions:** Floating action buttons or contextual menus that surface relevant actions without navigating away
- **Achievement Badges:** For operators — visual flair like "Master Operator" badges on profiles (UI placeholder)
- **Health Scores:** Animated circular gauges for customer health scores with tooltip explanations

---

## 17. Accessibility Baseline

- Minimum contrast ratio: 4.5:1 for body text, 3:1 for large text
- All interactive elements must be keyboard navigable
- Focus indicators: visible teal outline ring on focus
- All icons must have `aria-label` or accompanying text
- Touch targets: minimum 44x44px on mobile
- Color should never be the only indicator of status — always pair with text labels or icons

---

## 18. Summary

The Operator360 design must feel like **specialized, premium industrial software** — not a generic template. Every pixel should communicate confidence, precision, and domain expertise. The teal color anchors the identity, the Bento layouts create visual hierarchy, the micro-animations bring the interface to life, and the strict avoidance of AI-looking patterns ensures the product feels handcrafted and intentional.

This document should be referenced alongside the PRD Volumes 1–5 when building any screen in the application.
