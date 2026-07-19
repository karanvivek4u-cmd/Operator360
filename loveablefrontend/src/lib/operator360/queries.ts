import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AppUser } from "./types";
import type { Database } from "@/integrations/supabase/types";

type CustomerCategory = Database["public"]["Enums"]["customer_category"];

export const currentUserQuery = queryOptions({
  queryKey: ["me"],
  queryFn: async (): Promise<AppUser | null> => {
    const { data: sess } = await supabase.auth.getUser();
    const authUser = sess.user;
    if (!authUser) return null;
    let { data, error } = await supabase
      .from("users")
      .select("user_id,auth_user_id,full_name,email,role,customer_id,operator_id")
      .eq("auth_user_id", authUser.id)
      .maybeSingle();

    if (error) throw error;
    
    // Auto-heal missing profile or unlinked operator
    if (!data || (data.role === 'OPERATOR' && !data.operator_id)) {
      if (authUser.email) {
        const { data: opData } = await supabase
          .from("operators")
          .select("operator_id, customer_id, first_name, last_name")
          .eq("email", authUser.email)
          .maybeSingle();
          
        if (opData) {
          return {
            user_id: data?.user_id || authUser.id,
            auth_user_id: authUser.id,
            email: authUser.email,
            full_name: `${opData.first_name} ${opData.last_name || ''}`.trim(),
            role: "OPERATOR",
            customer_id: opData.customer_id,
            operator_id: opData.operator_id
          } as AppUser;
        }
      }
    }

    return data as AppUser | null;
  },
});

export const notificationsQuery = (userId: string | null) =>
  queryOptions({
    queryKey: ["notifications", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

// Admin
export const adminMetricsQuery = queryOptions({
  queryKey: ["admin", "metrics"],
  queryFn: async () => {
    const [customers, machines, operators, pending] = await Promise.all([
      supabase.from("customers").select("customer_id", { count: "exact", head: true }),
      supabase.from("machines").select("machine_id", { count: "exact", head: true }),
      supabase.from("operators").select("operator_id", { count: "exact", head: true }),
      supabase
        .from("service_requests")
        .select("request_id", { count: "exact", head: true })
        .eq("overall_status", "PENDING"),
    ]);
    return {
      customers: customers.count ?? 0,
      machines: machines.count ?? 0,
      operators: operators.count ?? 0,
      pendingRequests: pending.count ?? 0,
    };
  },
});

export const customersListQuery = queryOptions({
  queryKey: ["customers"],
  queryFn: async () => {
    const { data, error } = await supabase.from("customers").select("*").order("company_name");
    if (error) throw error;
    return data ?? [];
  },
});

export const machinesListQuery = queryOptions({
  queryKey: ["machines"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("machines")
      .select("*, customers(company_name)")
      .order("serial_number");
    if (error) throw error;
    return data ?? [];
  },
});

export const operatorsListQuery = queryOptions({
  queryKey: ["operators"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("operators")
      .select("*, customers(company_name)")
      .order("first_name");
    if (error) throw error;
    return data ?? [];
  },
});

export const assignmentsListQuery = queryOptions({
  queryKey: ["assignments"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("operator_assignments")
      .select(
        "*, machines(serial_number, model_number, customer_id, customers(company_name)), operators(first_name,last_name,operator_code)",
      )
      .order("assignment_start_date", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const serviceRequestsListQuery = queryOptions({
  queryKey: ["service_requests"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("service_requests")
      .select(
        "*, customers(company_name), machines(serial_number), old_op:old_operator_id(first_name,last_name), new_op:new_operator_id(first_name,last_name)",
      )
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const categoryMasterQuery = queryOptions({
  queryKey: ["category_master"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("category_master")
      .select("*")
      .order("category_code");
    if (error) throw error;
    return data ?? [];
  },
});

export const benefitsMasterQuery = queryOptions({
  queryKey: ["benefits_master"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("benefits_master")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const customerCategoryBenefitsQuery = (categoryCode: CustomerCategory | null | undefined) =>
  queryOptions({
    queryKey: ["category_benefits", categoryCode],
    queryFn: async () => {
      if (!categoryCode) return [];
      const { data, error } = await supabase
        .from("category_benefits")
        .select("*, benefits_master(*)")
        .eq("category_code", categoryCode);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!categoryCode,
  });

export const loyaltyListQuery = queryOptions({
  queryKey: ["loyalty"],
  queryFn: async () => {
    const [customersRes, categoriesRes] = await Promise.all([
      supabase.from("customers").select("*").order("created_at", { ascending: false }),
      supabase.from("category_master").select("*")
    ]);
    
    if (customersRes.error) throw customersRes.error;
    if (categoriesRes.error) throw categoriesRes.error;

    const categoriesByCode = new Map(categoriesRes.data.map(c => [c.category_code, c]));
    
    return (customersRes.data ?? []).map(c => {
      const category = categoriesByCode.get(c.category);
      return {
        customer_id: c.customer_id,
        customers: { company_name: c.company_name },
        loyalty_points: category ? category.loyalty_points : 0,
        status: c.status
      };
    });
  },
});

export const benefitsListQuery = queryOptions({
  queryKey: ["benefits_list"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("benefits_master")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});
