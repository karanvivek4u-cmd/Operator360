
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('ADMIN','CUSTOMER','INSURANCE','OPERATOR');
CREATE TYPE public.active_status AS ENUM ('ACTIVE','INACTIVE');
CREATE TYPE public.customer_category AS ENUM ('SMALL','MEDIUM','LARGE','ENTERPRISE');
CREATE TYPE public.machine_status AS ENUM ('UNASSIGNED','ASSIGNED','MAINTENANCE','RETIRED');
CREATE TYPE public.assignment_status AS ENUM ('ACTIVE','COMPLETED','TERMINATED');
CREATE TYPE public.request_status AS ENUM ('PENDING','APPROVED','REJECTED','COMPLETED');

-- CUSTOMERS
CREATE TABLE public.customers (
  customer_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_code varchar NOT NULL UNIQUE,
  company_name varchar NOT NULL,
  contact_person varchar NOT NULL,
  email varchar NOT NULL UNIQUE,
  phone varchar,
  address text,
  city varchar,
  state varchar,
  pincode varchar,
  gst_number varchar,
  category public.customer_category NOT NULL DEFAULT 'MEDIUM',
  status public.active_status NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- OPERATORS
CREATE TABLE public.operators (
  operator_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(customer_id) ON DELETE CASCADE,
  operator_code varchar NOT NULL UNIQUE,
  first_name varchar NOT NULL,
  last_name varchar,
  mobile varchar,
  email varchar,
  aadhaar_number varchar,
  dob date,
  gender varchar,
  joining_date date,
  address text,
  emergency_contact varchar,
  status public.active_status NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.operators TO authenticated;
GRANT ALL ON public.operators TO service_role;
ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;

-- USERS (app-level user mapping)
CREATE TABLE public.users (
  user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customers(customer_id) ON DELETE SET NULL,
  operator_id uuid REFERENCES public.operators(operator_id) ON DELETE SET NULL,
  full_name varchar NOT NULL,
  email varchar NOT NULL UNIQUE,
  phone varchar,
  role public.app_role NOT NULL,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- USER ROLES (separate table to prevent privilege escalation)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT user_id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1 $$;

CREATE OR REPLACE FUNCTION public.current_customer_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT customer_id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1 $$;

CREATE OR REPLACE FUNCTION public.current_operator_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT operator_id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1 $$;

-- CATEGORY MASTER
create table public.category_master (
  category_code public.customer_category not null,
  category_name character varying(100) not null,
  loyalty_points integer not null default 0,
  description text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint category_master_pkey primary key (category_code)
) TABLESPACE pg_default;
GRANT SELECT ON public.category_master TO authenticated;
GRANT ALL ON public.category_master TO service_role;
ALTER TABLE public.category_master ENABLE ROW LEVEL SECURITY;

-- MACHINES
CREATE TABLE public.machines (
  machine_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(customer_id) ON DELETE CASCADE,
  serial_number varchar NOT NULL UNIQUE,
  model_number varchar,
  engine_number varchar,
  purchase_date date,
  warranty_end_date date,
  status public.machine_status NOT NULL DEFAULT 'UNASSIGNED',
  remarks text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.machines TO authenticated;
GRANT ALL ON public.machines TO service_role;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;

-- ASSIGNMENTS
CREATE TABLE public.operator_assignments (
  assignment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid NOT NULL REFERENCES public.machines(machine_id) ON DELETE CASCADE,
  operator_id uuid NOT NULL REFERENCES public.operators(operator_id) ON DELETE CASCADE,
  assignment_start_date date NOT NULL DEFAULT CURRENT_DATE,
  assignment_end_date date,
  status public.assignment_status NOT NULL DEFAULT 'ACTIVE',
  assignment_reason text,
  remarks text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.operator_assignments TO authenticated;
GRANT ALL ON public.operator_assignments TO service_role;
ALTER TABLE public.operator_assignments ENABLE ROW LEVEL SECURITY;

-- BENEFITS MASTER & CATEGORY BENEFITS
create table public.benefits_master (
  benefit_id uuid not null default gen_random_uuid (),
  benefit_name character varying(150) not null,
  description text null,
  coverage_amount numeric default 0,
  created_at timestamp with time zone null default now(),
  constraint benefits_master_pkey primary key (benefit_id),
  constraint benefits_master_benefit_name_key unique (benefit_name)
) TABLESPACE pg_default;
GRANT SELECT ON public.benefits_master TO authenticated;
GRANT ALL ON public.benefits_master TO service_role;
ALTER TABLE public.benefits_master ENABLE ROW LEVEL SECURITY;

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
GRANT SELECT ON public.category_benefits TO authenticated;
GRANT ALL ON public.category_benefits TO service_role;
ALTER TABLE public.category_benefits ENABLE ROW LEVEL SECURITY;

-- SERVICE REQUESTS
CREATE TABLE public.service_requests (
  request_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number varchar NOT NULL UNIQUE,
  request_type varchar NOT NULL DEFAULT 'OPERATOR_REPLACEMENT',
  customer_id uuid NOT NULL REFERENCES public.customers(customer_id) ON DELETE CASCADE,
  machine_id uuid NOT NULL REFERENCES public.machines(machine_id) ON DELETE CASCADE,
  old_operator_id uuid REFERENCES public.operators(operator_id) ON DELETE SET NULL,
  new_operator_id uuid REFERENCES public.operators(operator_id) ON DELETE SET NULL,
  requested_by uuid NOT NULL REFERENCES public.users(user_id),
  customer_comments text,
  insurance_status public.request_status NOT NULL DEFAULT 'PENDING',
  insurance_approved_by uuid REFERENCES public.users(user_id),
  insurance_approved_at timestamptz,
  admin_status public.request_status NOT NULL DEFAULT 'PENDING',
  admin_approved_by uuid REFERENCES public.users(user_id),
  admin_approved_at timestamptz,
  overall_status public.request_status NOT NULL DEFAULT 'PENDING',
  rejection_reason text,
  closed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_requests TO authenticated;
GRANT ALL ON public.service_requests TO service_role;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  notification_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  title varchar NOT NULL,
  message text NOT NULL,
  notification_type varchar,
  is_read boolean DEFAULT false,
  sent_email boolean DEFAULT false,
  sent_sms boolean DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- POLICIES
-- user_roles: user can read their own
CREATE POLICY "own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- users: admin sees all; anyone can see own row
CREATE POLICY "admin all users" ON public.users FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'ADMIN')) WITH CHECK (public.has_role(auth.uid(),'ADMIN'));
CREATE POLICY "own user row" ON public.users FOR SELECT TO authenticated USING (auth_user_id = auth.uid());

-- customers: admin all; customer sees own; insurance sees all (needs to view request context)
CREATE POLICY "admin customers" ON public.customers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'ADMIN')) WITH CHECK (public.has_role(auth.uid(),'ADMIN'));
CREATE POLICY "customer sees self" ON public.customers FOR SELECT TO authenticated
  USING (customer_id = public.current_customer_id());
CREATE POLICY "insurance reads customers" ON public.customers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'INSURANCE'));

-- operators
CREATE POLICY "admin operators" ON public.operators FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'ADMIN')) WITH CHECK (public.has_role(auth.uid(),'ADMIN'));
CREATE POLICY "customer manages own operators" ON public.operators FOR ALL TO authenticated
  USING (customer_id = public.current_customer_id())
  WITH CHECK (customer_id = public.current_customer_id());
CREATE POLICY "operator sees self" ON public.operators FOR SELECT TO authenticated
  USING (operator_id = public.current_operator_id());
CREATE POLICY "insurance reads operators" ON public.operators FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'INSURANCE'));

-- machines
CREATE POLICY "admin machines" ON public.machines FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'ADMIN')) WITH CHECK (public.has_role(auth.uid(),'ADMIN'));
CREATE POLICY "customer own machines" ON public.machines FOR ALL TO authenticated
  USING (customer_id = public.current_customer_id())
  WITH CHECK (customer_id = public.current_customer_id());
CREATE POLICY "insurance reads machines" ON public.machines FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'INSURANCE'));
CREATE POLICY "operator reads assigned machine" ON public.machines FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.operator_assignments oa
                 WHERE oa.machine_id = machines.machine_id
                 AND oa.operator_id = public.current_operator_id()
                 AND oa.status = 'ACTIVE'));

-- assignments
CREATE POLICY "admin assignments" ON public.operator_assignments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'ADMIN')) WITH CHECK (public.has_role(auth.uid(),'ADMIN'));
CREATE POLICY "customer own assignments" ON public.operator_assignments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.machines m WHERE m.machine_id = operator_assignments.machine_id AND m.customer_id = public.current_customer_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.machines m WHERE m.machine_id = operator_assignments.machine_id AND m.customer_id = public.current_customer_id()));
CREATE POLICY "operator sees own assignments" ON public.operator_assignments FOR SELECT TO authenticated
  USING (operator_id = public.current_operator_id());
CREATE POLICY "insurance reads assignments" ON public.operator_assignments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'INSURANCE'));

-- category_master
CREATE POLICY "read category_master" ON public.category_master FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin category_master" ON public.category_master FOR ALL TO authenticated USING (public.has_role(auth.uid(),'ADMIN'));

-- benefits_master
CREATE POLICY "read benefits_master" ON public.benefits_master FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin benefits_master" ON public.benefits_master FOR ALL TO authenticated USING (public.has_role(auth.uid(),'ADMIN'));

-- category_benefits
CREATE POLICY "read category_benefits" ON public.category_benefits FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin category_benefits" ON public.category_benefits FOR ALL TO authenticated USING (public.has_role(auth.uid(),'ADMIN'));

-- service requests
CREATE POLICY "admin requests" ON public.service_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'ADMIN')) WITH CHECK (public.has_role(auth.uid(),'ADMIN'));
CREATE POLICY "customer own requests" ON public.service_requests FOR ALL TO authenticated
  USING (customer_id = public.current_customer_id())
  WITH CHECK (customer_id = public.current_customer_id());
CREATE POLICY "insurance manages requests" ON public.service_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'INSURANCE'))
  WITH CHECK (public.has_role(auth.uid(),'INSURANCE'));

-- notifications
CREATE POLICY "own notifications" ON public.notifications FOR ALL TO authenticated
  USING (user_id = public.current_app_user_id())
  WITH CHECK (user_id = public.current_app_user_id());
CREATE POLICY "admin all notifications" ON public.notifications FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'ADMIN')) WITH CHECK (public.has_role(auth.uid(),'ADMIN'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_operators_updated BEFORE UPDATE ON public.operators FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_machines_updated BEFORE UPDATE ON public.machines FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_assignments_updated BEFORE UPDATE ON public.operator_assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_category_master_updated_at BEFORE UPDATE ON public.category_master FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_requests_updated BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Handle new signup: create public.users row with default role CUSTOMER unless metadata specifies
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _role public.app_role;
BEGIN
  _role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'CUSTOMER');
  INSERT INTO public.users(auth_user_id, full_name, email, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), NEW.email, _role)
  ON CONFLICT (email) DO UPDATE SET auth_user_id = NEW.id;
  INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, _role) ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;
