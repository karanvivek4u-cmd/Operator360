import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AppUser } from "./types";

type QueryRow = Record<string, any>;

async function getCurrentAppUser(): Promise<AppUser | null> {
  const { data: sess } = await supabase.auth.getUser();
  const authUser = sess.user;
  if (!authUser) return null;

  const { data, error } = await supabase
    .from("users")
    .select("user_id,auth_user_id,full_name,email,role,customer_id,operator_id")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();

  if (error) throw error;
  return data as AppUser | null;
}

export const myMachinesQuery = queryOptions({
  queryKey: ["me", "machines"],
  queryFn: async () => {
    const user = await getCurrentAppUser();
    let query = supabase.from("machines").select("*").order("serial_number");
    if (user?.role === "CUSTOMER") query = query.eq("customer_id", user.customer_id ?? "");
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as QueryRow[];
  },
});

export const myOperatorsQuery = queryOptions({
  queryKey: ["me", "operators"],
  queryFn: async () => {
    const user = await getCurrentAppUser();
    let query = supabase.from("operators").select("*").order("first_name");
    if (user?.role === "CUSTOMER") query = query.eq("customer_id", user.customer_id ?? "");
    if (user?.role === "OPERATOR") query = query.eq("operator_id", user.operator_id ?? "");
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as QueryRow[];
  },
});

export const myAssignmentsQuery = queryOptions({
  queryKey: ["me", "assignments"],
  queryFn: async () => {
    const user = await getCurrentAppUser();
    let query = supabase
      .from("operator_assignments")
      .select("*, machines(serial_number), operators(first_name,last_name)")
      .order("assignment_start_date", { ascending: false });
    if (user?.role === "OPERATOR") query = query.eq("operator_id", user.operator_id ?? "");
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as QueryRow[];
  },
});

export const myOperatorProfileQuery = queryOptions({
  queryKey: ["me", "operator_profile"],
  queryFn: async () => {
    const user = await getCurrentAppUser();
    if (!user?.operator_id) return null;

    const { data: operator, error: operatorError } = await supabase
      .from("operators")
      .select("*")
      .eq("operator_id", user.operator_id)
      .maybeSingle();
    if (operatorError) throw operatorError;
    if (!operator) return null;

    const [customerResult, assignmentsResult] = await Promise.all([
      supabase
        .from("customers")
        .select("company_name, email, phone")
        .eq("customer_id", operator.customer_id)
        .maybeSingle(),
      supabase
        .from("operator_assignments")
        .select("*")
        .eq("operator_id", user.operator_id)
        .order("assignment_start_date", { ascending: false }),
    ]);

    if (customerResult.error) throw customerResult.error;
    if (assignmentsResult.error) throw assignmentsResult.error;

    const assignments = assignmentsResult.data ?? [];
    const machineIds = [...new Set(assignments.map((assignment) => assignment.machine_id))];
    const machinesResult = machineIds.length
      ? await supabase
          .from("machines")
          .select("machine_id, serial_number, model_number, customer_id")
          .in("machine_id", machineIds)
      : { data: [], error: null };

    if (machinesResult.error) throw machinesResult.error;

    const machinesById = new Map(
      (machinesResult.data ?? []).map((machine) => [machine.machine_id, machine]),
    );

    return {
      ...operator,
      customers: customerResult.data,
      operator_assignments: assignments.map((assignment) => ({
        ...assignment,
        machines: machinesById.get(assignment.machine_id) ?? null,
      })),
    } as QueryRow;
  },
});

export const myRequestsQuery = queryOptions({
  queryKey: ["me", "requests"],
  queryFn: async () => {
    const user = await getCurrentAppUser();
    let query = supabase
      .from("service_requests")
      .select("*, machines(serial_number)")
      .order("created_at", { ascending: false });
    if (user?.role === "CUSTOMER") query = query.eq("customer_id", user.customer_id ?? "");
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as QueryRow[];
  },
});



export const myCategoryQuery = queryOptions({
  queryKey: ["me", "category"],
  queryFn: async () => {
    const user = await getCurrentAppUser();
    let customerId = user?.customer_id;

    if (user?.role === "OPERATOR" && user.operator_id) {
      const { data: opData, error: opError } = await supabase
        .from("operators")
        .select("customer_id")
        .eq("operator_id", user.operator_id)
        .maybeSingle();
      if (opError) throw opError;
      customerId = opData?.customer_id;
    }

    if (!customerId) return null;

    const { data: custData, error: custError } = await supabase
      .from("customers")
      .select("category")
      .eq("customer_id", customerId)
      .maybeSingle();
    if (custError) throw custError;
    if (!custData?.category) return null;

    const { data, error } = await supabase
      .from("category_master")
      .select("*")
      .eq("category_code", custData.category)
      .maybeSingle();
    if (error) throw error;
    return data as QueryRow | null;
  },
});

export const myCategoryBenefitsQuery = queryOptions({
  queryKey: ["me", "category_benefits"],
  queryFn: async () => {
    const user = await getCurrentAppUser();
    let customerId = user?.customer_id;

    if (user?.role === "OPERATOR" && user.operator_id) {
      const { data: opData, error: opError } = await supabase
        .from("operators")
        .select("customer_id")
        .eq("operator_id", user.operator_id)
        .maybeSingle();
      if (opError) throw opError;
      customerId = opData?.customer_id;
    }

    if (!customerId) return [];

    const { data: custData, error: custError } = await supabase
      .from("customers")
      .select("category")
      .eq("customer_id", customerId)
      .maybeSingle();
    if (custError) throw custError;
    if (!custData?.category) return [];

    const { data, error } = await supabase
      .from("category_benefits")
      .select("*, benefits_master(*)")
      .eq("category_code", custData.category);

    if (error) throw error;
    return (data ?? []) as QueryRow[];
  },
});

// Insurance queues
export const insuranceQueueQuery = (status: "PENDING" | "APPROVED" | "REJECTED") =>
  queryOptions({
    queryKey: ["insurance", status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select(
          "*, customers(company_name), machines(serial_number), old_op:old_operator_id(first_name,last_name), new_op:new_operator_id(first_name,last_name)",
        )
        .eq("insurance_status", status)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as QueryRow[];
    },
  });

export const myCustomerProfileQuery = queryOptions({
  queryKey: ["me", "customer_profile"],
  queryFn: async () => {
    const user = await getCurrentAppUser();
    if (user?.role !== "CUSTOMER" || !user?.customer_id) return null;

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("customer_id", user.customer_id)
      .maybeSingle();

    if (error) throw error;
    return data as QueryRow | null;
  },
});
