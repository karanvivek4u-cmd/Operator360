## Table `customers`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `customer_id` | `uuid` | Primary |
| `customer_code` | `varchar` |  Unique |
| `company_name` | `varchar` |  |
| `contact_person` | `varchar` |  |
| `email` | `varchar` |  Unique |
| `phone` | `varchar` |  Nullable |
| `address` | `text` |  Nullable |
| `city` | `varchar` |  Nullable |
| `state` | `varchar` |  Nullable |
| `pincode` | `varchar` |  Nullable |
| `gst_number` | `varchar` |  Nullable |
| `category` | `customer_category` |  |
| `status` | `active_status` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` | Primary |
| `auth_user_id` | `uuid` |  Nullable Unique |
| `customer_id` | `uuid` |  Nullable |
| `operator_id` | `uuid` |  Nullable |
| `full_name` | `varchar` |  |
| `email` | `varchar` |  Unique |
| `phone` | `varchar` |  Nullable |
| `role` | `user_role` |  |
| `is_active` | `bool` |  Nullable |
| `last_login` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `machines`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `machine_id` | `uuid` | Primary |
| `customer_id` | `uuid` |  |
| `serial_number` | `varchar` |  Unique |
| `model_number` | `varchar` |  Nullable |
| `engine_number` | `varchar` |  Nullable |
| `purchase_date` | `date` |  Nullable |
| `warranty_end_date` | `date` |  Nullable |
| `status` | `machine_status` |  |
| `remarks` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `operators`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `operator_id` | `uuid` | Primary |
| `customer_id` | `uuid` |  |
| `operator_code` | `varchar` |  Unique |
| `first_name` | `varchar` |  |
| `last_name` | `varchar` |  Nullable |
| `mobile` | `varchar` |  Nullable |
| `email` | `varchar` |  Nullable |
| `aadhaar_number` | `varchar` |  Nullable |
| `dob` | `date` |  Nullable |
| `gender` | `varchar` |  Nullable |
| `joining_date` | `date` |  Nullable |
| `address` | `text` |  Nullable |
| `emergency_contact` | `varchar` |  Nullable |
| `status` | `active_status` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `operator_assignments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `assignment_id` | `uuid` | Primary |
| `machine_id` | `uuid` |  |
| `operator_id` | `uuid` |  |
| `assignment_start_date` | `date` |  |
| `assignment_end_date` | `date` |  Nullable |
| `status` | `assignment_status` |  |
| `assignment_reason` | `text` |  Nullable |
| `remarks` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `service_requests`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `request_id` | `uuid` | Primary |
| `request_number` | `varchar` |  Unique |
| `request_type` | `varchar` |  |
| `customer_id` | `uuid` |  |
| `machine_id` | `uuid` |  |
| `old_operator_id` | `uuid` |  Nullable |
| `new_operator_id` | `uuid` |  Nullable |
| `requested_by` | `uuid` |  |
| `customer_comments` | `text` |  Nullable |
| `insurance_status` | `request_status` |  |
| `insurance_approved_by` | `uuid` |  Nullable |
| `insurance_approved_at` | `timestamptz` |  Nullable |
| `admin_status` | `request_status` |  |
| `admin_approved_by` | `uuid` |  Nullable |
| `admin_approved_at` | `timestamptz` |  Nullable |
| `overall_status` | `request_status` |  |
| `rejection_reason` | `text` |  Nullable |
| `closed_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `notifications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `notification_id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `title` | `varchar` |  |
| `message` | `text` |  |
| `notification_type` | `varchar` |  Nullable |
| `is_read` | `bool` |  Nullable |
| `sent_email` | `bool` |  Nullable |
| `sent_sms` | `bool` |  Nullable |
| `link` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `category_master`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `category_code` | `customer_category` | Primary |
| `category_name` | `varchar` |  |
| `loyalty_points` | `int4` |  |
| `description` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `benefits_master`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `benefit_id` | `uuid` | Primary |
| `benefit_name` | `varchar` |  Unique |
| `description` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `coverage_amount` | `numeric` |  Nullable |

## Table `category_benefits`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `category_code` | `customer_category` |  |
| `benefit_id` | `uuid` |  |
| `created_at` | `timestamptz` |  Nullable |

## Custom Types / Enums

### `user_role`

`ADMIN` | `CUSTOMER` | `OPERATOR` | `INSURANCE`

### `customer_category`

`A` | `B` | `C` | `D`

### `machine_status`

`ACTIVE` | `MAINTENANCE` | `UNASSIGNED` | `INACTIVE`

### `assignment_status`

`ACTIVE` | `ENDED` | `PENDING_APPROVAL`

### `request_status`

`PENDING` | `APPROVED` | `REJECTED` | `COMPLETED`

### `active_status`

`ACTIVE` | `INACTIVE`

## RLS Policies

### `benefits_master`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `benefits_master_admin` | ALL | authenticated | PERMISSIVE | `(current_user_role() = 'ADMIN'::user_role)` | `(current_user_role() = 'ADMIN'::user_role)` |
| `benefits_master_select` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `customers`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin_all_customers` | ALL | public | PERMISSIVE | `(current_user_role() = 'ADMIN'::user_role)` | `(current_user_role() = 'ADMIN'::user_role)` |
| `customer_view_own_company` | SELECT | public | PERMISSIVE | `(customer_id = current_customer_id())` | — |

### `users`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin_all_users` | ALL | public | PERMISSIVE | `(current_user_role() = 'ADMIN'::user_role)` | `(current_user_role() = 'ADMIN'::user_role)` |
| `users_view_self` | SELECT | public | PERMISSIVE | `(auth_user_id = auth.uid())` | — |

### `category_benefits`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `category_benefits_admin` | ALL | authenticated | PERMISSIVE | `(current_user_role() = 'ADMIN'::user_role)` | `(current_user_role() = 'ADMIN'::user_role)` |
| `category_benefits_select` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `machines`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin_all_machines` | ALL | public | PERMISSIVE | `(current_user_role() = 'ADMIN'::user_role)` | `(current_user_role() = 'ADMIN'::user_role)` |
| `customer_machines` | SELECT | public | PERMISSIVE | `(customer_id = current_customer_id())` | — |

### `operators`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin_all_operators` | ALL | public | PERMISSIVE | `(current_user_role() = 'ADMIN'::user_role)` | `(current_user_role() = 'ADMIN'::user_role)` |
| `customer_operators` | ALL | public | PERMISSIVE | `(customer_id = current_customer_id())` | `(customer_id = current_customer_id())` |
| `operator_self` | SELECT | public | PERMISSIVE | `(operator_id = current_operator_id())` | — |

### `operator_assignments`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin_all_assignments` | ALL | public | PERMISSIVE | `(current_user_role() = 'ADMIN'::user_role)` | `(current_user_role() = 'ADMIN'::user_role)` |
| `customer_assignments` | ALL | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM operators o   WHERE ((o.operator_id = operator_assignments.operator_id) AND (o.customer_id = current_customer_id()))))` | `(EXISTS ( SELECT 1    FROM operators o   WHERE ((o.operator_id = operator_assignments.operator_id) AND (o.customer_id = current_customer_id()))))` |
| `operator_assignment` | SELECT | public | PERMISSIVE | `(operator_id = current_operator_id())` | — |

### `service_requests`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin_all_requests` | ALL | public | PERMISSIVE | `(current_user_role() = 'ADMIN'::user_role)` | `(current_user_role() = 'ADMIN'::user_role)` |
| `customer_requests` | ALL | public | PERMISSIVE | `(customer_id = current_customer_id())` | `(customer_id = current_customer_id())` |
| `insurance_requests` | ALL | public | PERMISSIVE | `(current_user_role() = 'INSURANCE'::user_role)` | `(current_user_role() = 'INSURANCE'::user_role)` |

### `notifications`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin_all_notifications` | ALL | public | PERMISSIVE | `(current_user_role() = 'ADMIN'::user_role)` | `(current_user_role() = 'ADMIN'::user_role)` |
| `user_notifications` | SELECT | public | PERMISSIVE | `(user_id = ( SELECT users.user_id    FROM users   WHERE (users.auth_user_id = auth.uid())))` | — |
| `user_update_notifications` | UPDATE | authenticated | PERMISSIVE | `(user_id = ( SELECT users.user_id    FROM users   WHERE (users.auth_user_id = auth.uid())))` | `(user_id = ( SELECT users.user_id    FROM users   WHERE (users.auth_user_id = auth.uid())))` |

### `category_master`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `category_master_admin` | ALL | authenticated | PERMISSIVE | `(current_user_role() = 'ADMIN'::user_role)` | `(current_user_role() = 'ADMIN'::user_role)` |
| `category_master_select` | SELECT | authenticated | PERMISSIVE | `true` | — |

