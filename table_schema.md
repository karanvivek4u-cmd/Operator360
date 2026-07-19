**Table SCHEMA**

create table public.benefits_master (
  benefit_id uuid not null default gen_random_uuid (),
  benefit_name character varying(150) not null,
  description text null,
  created_at timestamp with time zone null default now(),
  coverage_amount numeric null default 0,
  constraint benefits_master_pkey primary key (benefit_id),
  constraint benefits_master_benefit_name_key unique (benefit_name)
) TABLESPACE pg_default;


create table public.category_benefits (
  id uuid not null default gen_random_uuid (),
  category_code public.customer_category not null,
  benefit_id uuid not null,
  created_at timestamp with time zone null default now(),
  constraint category_benefits_pkey primary key (id),
  constraint unique_category_benefit unique (category_code, benefit_id),
  constraint fk_benefit foreign KEY (benefit_id) references benefits_master (benefit_id) on delete CASCADE,
  constraint fk_category foreign KEY (category_code) references category_master (category_code) on delete CASCADE
) TABLESPACE pg_default;


create table public.category_master (
  category_code public.customer_category not null,
  category_name character varying(100) not null,
  loyalty_points integer not null default 0,
  description text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint category_master_pkey primary key (category_code)
) TABLESPACE pg_default;

create trigger update_category_master_updated_at BEFORE
update on category_master for EACH row
execute FUNCTION update_updated_at_column ();


create table public.customers (
  customer_id uuid not null default gen_random_uuid (),
  customer_code character varying(50) not null,
  company_name character varying(255) not null,
  contact_person character varying(255) not null,
  email character varying(255) not null,
  phone character varying(20) null,
  address text null,
  city character varying(100) null,
  state character varying(100) null,
  pincode character varying(10) null,
  gst_number character varying(20) null,
  category public.customer_category not null,
  status public.active_status not null default 'ACTIVE'::active_status,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint customers_pkey primary key (customer_id),
  constraint customers_customer_code_key unique (customer_code),
  constraint customers_email_key unique (email)
) TABLESPACE pg_default;

create index IF not exists idx_customers_code on public.customers using btree (customer_code) TABLESPACE pg_default;

create index IF not exists idx_customers_email on public.customers using btree (email) TABLESPACE pg_default;

create trigger trg_customers_updated BEFORE
update on customers for EACH row
execute FUNCTION update_updated_at_column ();


create table public.machines (
  machine_id uuid not null default gen_random_uuid (),
  customer_id uuid not null,
  serial_number character varying(100) not null,
  model_number character varying(100) null,
  engine_number character varying(100) null,
  purchase_date date null,
  warranty_end_date date null,
  status public.machine_status not null default 'UNASSIGNED'::machine_status,
  remarks text null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint machines_pkey primary key (machine_id),
  constraint machines_serial_number_key unique (serial_number),
  constraint fk_machine_customer foreign KEY (customer_id) references customers (customer_id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_machine_customer on public.machines using btree (customer_id) TABLESPACE pg_default;

create index IF not exists idx_machine_serial on public.machines using btree (serial_number) TABLESPACE pg_default;

create index IF not exists idx_machine_status on public.machines using btree (status) TABLESPACE pg_default;

create trigger trg_machines_updated BEFORE
update on machines for EACH row
execute FUNCTION update_updated_at_column ();


create table public.notifications (
  notification_id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  title character varying(255) not null,
  message text not null,
  notification_type character varying(100) null,
  is_read boolean null default false,
  sent_email boolean null default false,
  sent_sms boolean null default false,
  link text null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint notifications_pkey primary key (notification_id),
  constraint fk_notification_user foreign KEY (user_id) references users (user_id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_notification_user on public.notifications using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_notification_read on public.notifications using btree (is_read) TABLESPACE pg_default;


create table public.operator_assignments (
  assignment_id uuid not null default gen_random_uuid (),
  machine_id uuid not null,
  operator_id uuid not null,
  assignment_start_date date not null,
  assignment_end_date date null,
  status public.assignment_status not null default 'ACTIVE'::assignment_status,
  assignment_reason text null,
  remarks text null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint operator_assignments_pkey primary key (assignment_id),
  constraint fk_assignment_machine foreign KEY (machine_id) references machines (machine_id) on delete CASCADE,
  constraint fk_assignment_operator foreign KEY (operator_id) references operators (operator_id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_assignment_machine on public.operator_assignments using btree (machine_id) TABLESPACE pg_default;

create index IF not exists idx_assignment_operator on public.operator_assignments using btree (operator_id) TABLESPACE pg_default;

create index IF not exists idx_assignment_status on public.operator_assignments using btree (status) TABLESPACE pg_default;

create trigger trg_assignments_updated BEFORE
update on operator_assignments for EACH row
execute FUNCTION update_updated_at_column ();


create table public.operators (
  operator_id uuid not null default gen_random_uuid (),
  customer_id uuid not null,
  operator_code character varying(50) not null,
  first_name character varying(100) not null,
  last_name character varying(100) null,
  mobile character varying(20) null,
  email character varying(255) null,
  aadhaar_number character varying(20) null,
  dob date null,
  gender character varying(20) null,
  joining_date date null,
  address text null,
  emergency_contact character varying(20) null,
  status public.active_status not null default 'ACTIVE'::active_status,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint operators_pkey primary key (operator_id),
  constraint operators_operator_code_key unique (operator_code),
  constraint fk_operator_customer foreign KEY (customer_id) references customers (customer_id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_operator_customer on public.operators using btree (customer_id) TABLESPACE pg_default;

create index IF not exists idx_operator_code on public.operators using btree (operator_code) TABLESPACE pg_default;

create index IF not exists idx_operator_mobile on public.operators using btree (mobile) TABLESPACE pg_default;

create index IF not exists idx_operator_status on public.operators using btree (status) TABLESPACE pg_default;

create trigger trg_operators_updated BEFORE
update on operators for EACH row
execute FUNCTION update_updated_at_column ();


create table public.service_requests (
  request_id uuid not null default gen_random_uuid (),
  request_number character varying(50) not null,
  request_type character varying(100) not null,
  customer_id uuid not null,
  machine_id uuid not null,
  old_operator_id uuid null,
  new_operator_id uuid null,
  requested_by uuid not null,
  customer_comments text null,
  insurance_status public.request_status not null default 'PENDING'::request_status,
  insurance_approved_by uuid null,
  insurance_approved_at timestamp with time zone null,
  admin_status public.request_status not null default 'PENDING'::request_status,
  admin_approved_by uuid null,
  admin_approved_at timestamp with time zone null,
  overall_status public.request_status not null default 'PENDING'::request_status,
  rejection_reason text null,
  closed_at timestamp with time zone null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint service_requests_pkey primary key (request_id),
  constraint service_requests_request_number_key unique (request_number),
  constraint fk_sr_insurance_user foreign KEY (insurance_approved_by) references users (user_id),
  constraint fk_sr_machine foreign KEY (machine_id) references machines (machine_id),
  constraint fk_sr_admin_user foreign KEY (admin_approved_by) references users (user_id),
  constraint fk_sr_old_operator foreign KEY (old_operator_id) references operators (operator_id),
  constraint fk_sr_requested_by foreign KEY (requested_by) references users (user_id),
  constraint fk_sr_new_operator foreign KEY (new_operator_id) references operators (operator_id),
  constraint fk_sr_customer foreign KEY (customer_id) references customers (customer_id)
) TABLESPACE pg_default;

create index IF not exists idx_request_customer on public.service_requests using btree (customer_id) TABLESPACE pg_default;

create index IF not exists idx_request_machine on public.service_requests using btree (machine_id) TABLESPACE pg_default;

create index IF not exists idx_request_status on public.service_requests using btree (overall_status) TABLESPACE pg_default;

create index IF not exists idx_request_number on public.service_requests using btree (request_number) TABLESPACE pg_default;

create trigger trg_requests_updated BEFORE
update on service_requests for EACH row
execute FUNCTION update_updated_at_column ();


create table public.users (
  user_id uuid not null default gen_random_uuid (),
  auth_user_id uuid null,
  customer_id uuid null,
  operator_id uuid null,
  full_name character varying(255) not null,
  email character varying(255) not null,
  phone character varying(20) null,
  role public.user_role not null,
  is_active boolean null default true,
  last_login timestamp with time zone null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint users_pkey primary key (user_id),
  constraint users_auth_user_id_key unique (auth_user_id),
  constraint users_email_key unique (email),
  constraint fk_user_customer foreign KEY (customer_id) references customers (customer_id) on delete set null,
  constraint fk_user_operator foreign KEY (operator_id) references operators (operator_id) on delete set null,
  constraint fk_users_auth foreign KEY (auth_user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_users_email on public.users using btree (email) TABLESPACE pg_default;

create index IF not exists idx_users_customer on public.users using btree (customer_id) TABLESPACE pg_default;

create index IF not exists idx_users_operator on public.users using btree (operator_id) TABLESPACE pg_default;

create index IF not exists idx_users_role on public.users using btree (role) TABLESPACE pg_default;

create trigger trg_users_updated BEFORE
update on users for EACH row
execute FUNCTION update_updated_at_column ();