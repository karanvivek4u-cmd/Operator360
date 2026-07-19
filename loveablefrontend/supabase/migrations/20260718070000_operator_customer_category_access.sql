-- Let operator portal users read the customer row they belong to.
-- Loyalty/category screens need customers.category for the operator's owning customer.
CREATE POLICY "operator reads own customer" ON public.customers FOR SELECT TO authenticated
  USING (public.operator_belongs_to_customer(public.current_operator_id(), customer_id));