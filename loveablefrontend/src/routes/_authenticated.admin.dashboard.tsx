import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  adminMetricsQuery,
  serviceRequestsListQuery,
} from "@/lib/operator360/queries";
import { KpiCard } from "@/components/operator360/KpiCard";
import { PageHeader } from "@/components/operator360/PageHeader";
import {
  AIInsightBullet,
  AIInsightCard,
} from "@/components/operator360/AIInsightCard";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/operator360/StatusBadge";
import { Users, Truck, HardHat, FileWarning, Wrench } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "@tanstack/react-router";
import dashboardBg from "@/assets/dashboardb.png";
import craneImg from "@/assets/crane.png";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard · Operator360" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(adminMetricsQuery);
    context.queryClient.ensureQueryData(serviceRequestsListQuery);
  },
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: metrics } = useSuspenseQuery(adminMetricsQuery);
  const { data: requests } = useSuspenseQuery(serviceRequestsListQuery);
  const recent = requests.slice(0, 6);

  const chartData = [
    { label: "Active", value: metrics.activeMachines || 0 },
    { label: "Maintenance", value: metrics.maintenanceMachines || 0 },
    { label: "Unassigned", value: metrics.unassignedMachines || 0 },
  ];
  const colors = ["#10b981", "#f59e0b", "#94a3b8"]; // Emerald (Active), Amber (Maintenance), Slate (Unassigned)

  return (
    <div>
      {/* Hero Section */}
      <div className="relative mb-8 rounded-3xl border border-slate-200/60 shadow-sm flex items-center bg-[#f7f9fc] min-h-[380px] md:aspect-[2.8/1]">
        {/* Full Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl">
          <img src={dashboardBg} alt="Dashboard Background" className="h-full w-full object-cover object-right" />
        </div>
        
        {/* Floating Crane Image */}
        <div 
          className="absolute z-10 pointer-events-none w-[350px] right-0 bottom-0 md:w-[500px] lg:w-[743px]"
          style={{ right: '83px', bottom: '3px' }}
        >
          <img src={craneImg} alt="Crane" className="h-auto w-full object-contain drop-shadow-2xl mix-blend-multiply" />
        </div>
        
        {/* Content */}
        <div className="relative z-20 max-w-2xl px-8 py-10 md:px-12 lg:px-16 w-full">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-[2px] w-8 bg-[#22d3c5]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#22d3c5]">
              WELCOME BACK, DEMO ADMIN
            </span>
          </div>
          <h1 className="mb-4 flex flex-col font-black uppercase tracking-tight text-[#0a1628] leading-[0.95] text-5xl md:text-6xl lg:text-[5.5rem]" style={{ fontFamily: '"Archivo Black", "Inter", sans-serif' }}>
            <span>COMMAND</span>
            <span className="text-[#1e5fd6]">CENTER</span>
          </h1>
          <p className="text-lg md:text-xl font-semibold text-slate-500 max-w-md">
            Fleet, workforce, and workflow health at a glance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Link to="/admin/customers" className="block h-full outline-none rounded-2xl transition-transform duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#1e5fd6]">
          <KpiCard label="Customers" value={metrics.customers} icon={Users} trend={{ value: "+8% this month", direction: "up" }} />
        </Link>
        <Link to="/admin/machines" className="block h-full outline-none rounded-2xl transition-transform duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#1e5fd6]">
          <KpiCard label="Machines" value={metrics.machines} icon={Truck} />
        </Link>
        <Link to="/admin/operators" className="block h-full outline-none rounded-2xl transition-transform duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#1e5fd6]">
          <KpiCard label="Operators" value={metrics.operators} icon={HardHat} trend={{ value: "Retention +12%", direction: "up" }} />
        </Link>
        <Link to="/admin/service-requests" className="block h-full outline-none rounded-2xl transition-transform duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#1e5fd6]">
          <KpiCard label="Pending Requests" value={metrics.pendingRequests} icon={FileWarning} trend={{ value: "Needs review", direction: "flat" }} />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4">
        <div>
          <Card className="border-slate-200/60 p-6 shadow-sm fade-in-up rounded-2xl" style={{ animationDelay: "80ms" }}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0a1628]">Fleet status distribution</h3>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} dy={10} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} dx={-10} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#0a1628"
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={80}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={colors[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-6 border-slate-200/60 shadow-sm fade-in-up" style={{ animationDelay: "240ms" }}>
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-[#1e5fd6]">
              <Wrench className="size-4" />
            </div>
            <h3 className="text-lg font-bold text-[#0a1628]">Recent service requests</h3>
          </div>
          <Link to="/admin/service-requests" className="text-sm font-bold text-[#1e5fd6] hover:text-[#123472] hover:underline">
            View all →
          </Link>
        </div>
        
        {/* Table Header */}
        <div className="grid grid-cols-7 gap-4 bg-slate-50 px-6 py-3 text-xs font-bold text-slate-500">
          <div>Request ID</div>
          <div>Machine</div>
          <div>Customer</div>
          <div className="col-span-2">Comments</div>
          <div>Status</div>
          <div>Created</div>
        </div>
        
        <div className="divide-y divide-slate-100">
          {recent.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No requests yet.
            </div>
          ) : (
            recent.map((r) => (
              <Link
                to="/admin/service-requests/$id"
                params={{ id: r.request_id }}
                key={r.request_id}
                className="grid grid-cols-7 gap-4 items-center px-6 py-4 transition-colors hover:bg-slate-50/50"
              >
                <div>
                  <span className="text-sm font-medium text-slate-700">{r.request_number}</span>
                </div>
                <div className="text-sm font-medium text-slate-700">{(r as any).machines?.serial_number ?? "—"}</div>
                <div className="text-sm font-medium text-slate-700">{(r as any).customers?.company_name ?? "—"}</div>
                <div className="col-span-2 text-sm text-slate-500 truncate pr-4">{r.customer_comments ?? "—"}</div>
                <div>
                  <StatusBadge status={r.overall_status} />
                </div>
                <div className="text-xs text-slate-500 flex items-center justify-between">
                  <span>{r.created_at ? formatDistanceToNow(new Date(r.created_at), { addSuffix: true }) : ""}</span>
                  <span className="text-slate-300">›</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}