
-- Security definer helpers to break RLS recursion between machines and operator_assignments
CREATE OR REPLACE FUNCTION public.machine_belongs_to_customer(_machine_id uuid, _customer_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.machines m WHERE m.machine_id = _machine_id AND m.customer_id = _customer_id)
$$;

CREATE OR REPLACE FUNCTION public.operator_assigned_to_machine(_machine_id uuid, _operator_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.operator_assignments oa
    WHERE oa.machine_id = _machine_id
      AND oa.operator_id = _operator_id
      AND oa.status = 'ACTIVE'
  )
$$;

CREATE OR REPLACE FUNCTION public.operator_belongs_to_customer(_operator_id uuid, _customer_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.operators o WHERE o.operator_id = _operator_id AND o.customer_id = _customer_id)
$$;

-- Replace recursive policies on machines
DROP POLICY IF EXISTS "operator reads assigned machine" ON public.machines;
CREATE POLICY "operator reads assigned machine" ON public.machines FOR SELECT TO authenticated
  USING (public.operator_assigned_to_machine(machine_id, public.current_operator_id()));

-- Replace recursive policies on operator_assignments
DROP POLICY IF EXISTS "customer own assignments" ON public.operator_assignments;
CREATE POLICY "customer own assignments" ON public.operator_assignments FOR ALL TO authenticated
  USING (public.machine_belongs_to_customer(machine_id, public.current_customer_id()))
  WITH CHECK (public.machine_belongs_to_customer(machine_id, public.current_customer_id()));

-- Replace recursive policies on benefits (references operators)
DROP POLICY IF EXISTS "customer benefits" ON public.benefits;
CREATE POLICY "customer benefits" ON public.benefits FOR SELECT TO authenticated
  USING (public.operator_belongs_to_customer(operator_id, public.current_customer_id()));
