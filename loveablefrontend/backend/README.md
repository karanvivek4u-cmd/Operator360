# Operator360 — Backend API

Express.js backend server that handles privileged operations requiring the Supabase Service Role key.

## Setup

```bash
npm install
```

Create a `.env` file:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
PORT=4000
```

## Run

```bash
node server.js
```

## Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/customers` | Bulk create customers with Supabase Auth accounts |
| POST | `/api/operators` | Bulk create operators with Supabase Auth accounts |
| POST | `/api/operator-chat` | AI assistant for operator portal (Gemini) |
