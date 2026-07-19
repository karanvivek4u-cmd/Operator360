# Operator360

Full-stack monorepo for the Operator360 platform — a fleet and workforce management system for heavy machinery operators.

## Structure

```
Operator360/
├── backend/          # Express.js API server (privileged Supabase operations + AI chat)
└── loveablefrontend/ # React + TanStack Router frontend (Supabase direct queries)
```

## Quick Start

**Backend:**
```bash
cd backend
npm install
# create .env with SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY, PORT=4000
node server.js
```

**Frontend:**
```bash
cd loveablefrontend
npm install
# create .env with VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_API_BASE_URL
npm run dev
```
