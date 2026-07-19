Honest status: I did not create any real login accounts in the last build. The seed migration only inserted rows into `public.users` (names + emails) — no `auth.users` records exist, so there is nothing you can sign in with today. That's why I can't hand you working credentials.

Here's the plan to fix that, so you get one-click demo logins for every role.

## What I'll create

Four confirmed auth users, each linked to the matching seeded profile row so the existing customer/operator/insurance data lights up immediately.

| Role      | Email                     | Password         |
| --------- | ------------------------- | ---------------- |
| Admin     | admin@operator360.demo    | Operator360!Demo |
| Customer  | customer@operator360.demo | Operator360!Demo |
| Insurance | insurance@operator360.demo| Operator360!Demo |
| Operator  | operator@operator360.demo | Operator360!Demo |

## How

1. New SQL migration that:
   - Inserts 4 rows into `auth.users` with bcrypt-hashed password `Operator360!Demo`, `email_confirmed_at = now()`, and `raw_user_meta_data` carrying `role` + `full_name` so the existing `handle_new_user` trigger populates `public.users` / `public.user_roles` correctly.
   - Updates the seeded customer/operator profile rows to point their `auth_user_id` / `customer_id` / `operator_id` at the new auth users, so the demo dataset is owned by them.
2. Add a small "Demo accounts" helper panel on `/auth` listing the four logins with a one-click "Sign in as …" button (dev convenience, easy to remove before launch).
3. Verify by signing in as each role in the preview and confirming the right portal loads.

## Out of scope

- Changing any RLS/policies or schema.
- Real email delivery — accounts are pre-confirmed.

Approve and I'll ship it.