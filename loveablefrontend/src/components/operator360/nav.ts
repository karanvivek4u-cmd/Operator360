import {
  LayoutDashboard,
  Users,
  Wrench,
  HardHat,
  ClipboardList,
  FileWarning,
  Shield,
  Award,
  Bell,
  User,
  Settings,
  Wallet,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Gift,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AppRole } from "@/lib/operator360/types";

export interface NavItem {
  title: string;
  to: string;
  icon: LucideIcon;
}

export const NAV_BY_ROLE: Record<AppRole, NavItem[]> = {
  ADMIN: [
    { title: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Customers", to: "/admin/customers", icon: Users },
    { title: "Machines", to: "/admin/machines", icon: Truck },
    { title: "Operators", to: "/admin/operators", icon: HardHat },
    { title: "Assignments", to: "/admin/assignments", icon: ClipboardList },
    { title: "Service Requests", to: "/admin/service-requests", icon: FileWarning },
    { title: "Benefits", to: "/admin/benefits", icon: Shield },
    { title: "Loyalty", to: "/admin/loyalty", icon: Award },
    { title: "Notifications", to: "/admin/notifications", icon: Bell },
    { title: "Settings", to: "/admin/settings", icon: Settings },
  ],
  CUSTOMER: [
    { title: "Dashboard", to: "/customer/dashboard", icon: LayoutDashboard },
    { title: "My Machines", to: "/customer/machines", icon: Truck },
    { title: "My Operators", to: "/customer/operators", icon: HardHat },
    { title: "Assignments", to: "/customer/assignments", icon: ClipboardList },
    { title: "Service Requests", to: "/customer/requests", icon: FileWarning },
    { title: "Loyalty Wallet", to: "/customer/loyalty", icon: Wallet },
    { title: "Benefits", to: "/customer/benefits", icon: Shield },
    { title: "Notifications", to: "/customer/notifications", icon: Bell },
    { title: "Profile", to: "/customer/profile", icon: User },
  ],
  INSURANCE: [
    { title: "Dashboard", to: "/insurance/dashboard", icon: LayoutDashboard },
    { title: "Pending", to: "/insurance/pending", icon: Clock },
    { title: "Approved", to: "/insurance/approved", icon: CheckCircle2 },
    { title: "Rejected", to: "/insurance/rejected", icon: XCircle },
    { title: "Notifications", to: "/insurance/notifications", icon: Bell },
    { title: "Profile", to: "/insurance/profile", icon: User },
  ],
  OPERATOR: [
    { title: "My Machine", to: "/operator/dashboard", icon: Wrench },
    { title: "My Benefits", to: "/operator/benefits", icon: Gift },
    { title: "Notifications", to: "/operator/notifications", icon: Bell },
    { title: "Profile", to: "/operator/profile", icon: User },
  ],
};

export const ROLE_LABEL: Record<AppRole, string> = {
  ADMIN: "Admin Portal",
  CUSTOMER: "Customer Portal",
  INSURANCE: "Insurance Portal",
  OPERATOR: "Operator Portal",
};