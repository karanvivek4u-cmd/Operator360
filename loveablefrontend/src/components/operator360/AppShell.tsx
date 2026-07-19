import { type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Bell, LogOut, Search, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsQuery } from "@/lib/operator360/queries";
import { NAV_BY_ROLE, ROLE_LABEL } from "./nav";
import type { AppUser } from "@/lib/operator360/types";
import { cn } from "@/lib/utils";
import logoImg from "@/assets/logo.png";

function getPortalRole(path: string, userRole: AppUser["role"]): AppUser["role"] {
  if (path.startsWith("/customer")) return "CUSTOMER";
  if (path.startsWith("/operator")) return "OPERATOR";
  if (path.startsWith("/insurance")) return "INSURANCE";
  if (path.startsWith("/admin")) return "ADMIN";
  return userRole;
}

function AppSidebar({ user }: { user: AppUser }) {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const portal = getPortalRole(currentPath, user.role);
  const items = NAV_BY_ROLE[portal] || [];
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className={cn("py-4 transition-all duration-200", collapsed ? "px-0 items-center justify-center" : "px-3")}>
        <div className={cn("flex items-center w-full", collapsed ? "justify-center" : "px-1")}>
          {!collapsed ? (
            <div className="flex flex-col items-start min-w-0 w-full pt-1 pb-2">
              <div className="-my-6 w-full overflow-visible">
                <img src={logoImg} alt="Operator360" className="w-[180px] h-auto object-contain object-left drop-shadow-sm scale-[1.1] origin-left" />
              </div>
              <div className="truncate text-[10px] font-bold tracking-widest text-sidebar-foreground/40 uppercase pl-1 mt-2 z-10">
                {ROLE_LABEL[portal]}
              </div>
            </div>
          ) : (
            <div className="grid size-8 shrink-0 place-items-center rounded-md bg-[#1e5fd6] font-bold text-white shadow-sm">
              O
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-foreground/50">
              Workspace
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active =
                  currentPath === item.to ||
                  (item.to !== "/" && currentPath.startsWith(item.to + "/"));
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link
                        to={item.to}
                        className={cn(
                          "relative",
                          active &&
                            "before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-r before:bg-primary"
                        )}
                      >
                        <item.icon className="size-4" strokeWidth={1.75} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className={cn("flex flex-col gap-4 p-3", collapsed ? "items-center" : "")}>
        {!collapsed && portal === "OPERATOR" && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm border border-slate-100">
            <h4 className="text-[13px] font-bold text-[#0a1628] leading-tight mb-2">Stay informed,<br/>Stay rewarded.</h4>
            <p className="text-[11px] font-medium text-slate-500 mb-6 max-w-[140px] leading-snug">Track your assignment and unlock all your benefits.</p>
            <div className="absolute right-4 bottom-4 flex size-7 items-center justify-center rounded-full bg-[#1e5fd6] text-white shadow-sm transition-transform hover:scale-105 cursor-pointer">
              <ArrowRight className="size-4" strokeWidth={2.5} />
            </div>
            {/* Subtle decorative elements for the graphic */}
            <div className="absolute -bottom-4 -left-2 w-16 h-16 bg-blue-100/40 rounded-lg transform rotate-12 blur-[1px]"></div>
            <div className="absolute -bottom-2 left-4 w-12 h-14 bg-blue-200/40 rounded-lg transform -rotate-6 blur-[1px]"></div>
          </div>
        )}
        <div className="text-[11px] text-sidebar-foreground/40 text-center">
          {!collapsed && "v1.0 · Operator360"}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function TopBar({ user }: { user: AppUser }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const portal = getPortalRole(currentPath, user.role);
  const { data: notes = [] } = useQuery(notificationsQuery(user.user_id));
  
  // Calculate unread by checking both DB is_read and our localStorage fallback
  const hiddenIds = JSON.parse(localStorage.getItem('hidden_notifications') || '[]');
  const unread = notes.filter((n) => !n.is_read && !hiddenIds.includes(n.notification_id)).length;

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const initials =
    user.full_name
      ?.split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  const notifPath =
    NAV_BY_ROLE[portal]?.find((n) => n.to.endsWith("/notifications"))?.to ?? "#";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-md">
      <SidebarTrigger />
      <div className="relative hidden md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customers, machines, operators…"
          className="h-9 w-[320px] pl-9"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        {portal === "OPERATOR" && (
          <Button variant="ghost" size="sm" className="gap-1.5 text-primary">
            <Sparkles className="size-4" strokeWidth={2} />
            <span className="hidden sm:inline">AI Assistant</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
          asChild
        >
          <Link to={notifPath as any}>
            <Bell className="size-5" strokeWidth={1.75} />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <Avatar className="size-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm md:inline">{user.full_name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-sm font-medium">{user.full_name}</div>
              <div className="text-xs font-normal text-muted-foreground">{user.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive">
              <LogOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function AppShell({ user, children }: { user: AppUser; children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar user={user} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar user={user} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1400px] fade-in-up">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}