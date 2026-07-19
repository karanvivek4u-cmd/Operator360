export type AppRole = "ADMIN" | "CUSTOMER" | "INSURANCE" | "OPERATOR";

export interface AppUser {
  user_id: string;
  auth_user_id: string | null;
  full_name: string;
  email: string;
  role: AppRole;
  customer_id: string | null;
  operator_id: string | null;
}

export const ROLE_HOME: Record<AppRole, string> = {
  ADMIN: "/admin/dashboard",
  CUSTOMER: "/customer/dashboard",
  INSURANCE: "/insurance/dashboard",
  OPERATOR: "/operator/dashboard",
};