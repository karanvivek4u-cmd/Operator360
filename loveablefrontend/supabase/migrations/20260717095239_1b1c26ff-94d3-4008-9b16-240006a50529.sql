
DO $$
DECLARE
  v_admin uuid := gen_random_uuid();
  v_customer uuid := gen_random_uuid();
  v_insurance uuid := gen_random_uuid();
  v_operator uuid := gen_random_uuid();
  pw text := crypt('Operator360!Demo', gen_salt('bf'));
  v_demo_customer uuid := 'bbbd086b-b5f7-47f6-bde4-ec0885cbd65f';
  v_demo_operator uuid := '99aa7b88-3f48-4676-9451-c161421cbc36';
BEGIN
  DELETE FROM auth.users WHERE email IN (
    'admin@operator360.demo','customer@operator360.demo',
    'insurance@operator360.demo','operator@operator360.demo'
  );

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token
  ) VALUES
    ('00000000-0000-0000-0000-000000000000', v_admin, 'authenticated','authenticated',
     'admin@operator360.demo', pw, now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"role":"ADMIN","full_name":"Demo Admin"}'::jsonb,
     now(), now(),'','','',''),
    ('00000000-0000-0000-0000-000000000000', v_customer,'authenticated','authenticated',
     'customer@operator360.demo', pw, now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"role":"CUSTOMER","full_name":"Demo Customer"}'::jsonb,
     now(), now(),'','','',''),
    ('00000000-0000-0000-0000-000000000000', v_insurance,'authenticated','authenticated',
     'insurance@operator360.demo', pw, now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"role":"INSURANCE","full_name":"Demo Insurance"}'::jsonb,
     now(), now(),'','','',''),
    ('00000000-0000-0000-0000-000000000000', v_operator,'authenticated','authenticated',
     'operator@operator360.demo', pw, now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"role":"OPERATOR","full_name":"Demo Operator"}'::jsonb,
     now(), now(),'','','','');

  UPDATE public.users u SET customer_id = v_demo_customer WHERE u.auth_user_id = v_customer;
  UPDATE public.users u SET operator_id = v_demo_operator WHERE u.auth_user_id = v_operator;
END $$;
