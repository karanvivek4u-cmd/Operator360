import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { KpiCard } from "@/components/operator360/KpiCard";
import { Card } from "@/components/ui/card";
import { myMachinesQuery, myOperatorsQuery, myRequestsQuery, myCategoryQuery } from "@/lib/operator360/portal-queries";
import { Truck, HardHat, FileWarning, Sparkles, ClipboardList, TrendingUp, TriangleAlert } from "lucide-react";
import { StatusBadge } from "@/components/operator360/StatusBadge";
import dashboardBg from "@/assets/dashboardb.png";
import craneImg from "@/assets/crane.png";

export const Route = createFileRoute("/_authenticated/customer/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Operator360" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(myMachinesQuery);
    context.queryClient.ensureQueryData(myOperatorsQuery);
    context.queryClient.ensureQueryData(myRequestsQuery);
    context.queryClient.ensureQueryData(myCategoryQuery);
  },
  component: CustomerDash,
});

function CustomerDash() {
  const machines = useSuspenseQuery(myMachinesQuery).data;
  const operators = useSuspenseQuery(myOperatorsQuery).data;
  const requests = useSuspenseQuery(myRequestsQuery).data;
  const category = useSuspenseQuery(myCategoryQuery).data;
  const pending = requests.filter((r) => r.overall_status === "PENDING");

  return (
    <div>
      {/* Hero Section */}
      <div className="relative mb-8 rounded-3xl border border-slate-200/60 shadow-sm flex items-center bg-[#f7f9fc] min-h-[340px] md:aspect-[3/1]">
        {/* Full Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl">
          <img src={dashboardBg} alt="Dashboard Background" className="h-full w-full object-cover object-right" />
        </div>
        
        {/* Floating Crane Image */}
        <div 
          className="absolute z-10 pointer-events-none w-[350px] right-0 bottom-0 md:w-[450px] lg:w-[580px] xl:w-[650px]"
          style={{ right: '8%', bottom: '0px' }}
        >
          <img src={craneImg} alt="Crane" className="h-auto w-full object-contain drop-shadow-2xl mix-blend-multiply" />
        </div>
        
        {/* Content */}
        <div className="relative z-20 max-w-2xl px-8 py-10 md:px-12 lg:px-16 w-full">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-[2px] w-8 bg-[#1e5fd6]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#1e5fd6]">
              WELCOME BACK, DEMO CUSTOMER
            </span>
          </div>
          <h1 className="mb-4 flex flex-col font-black uppercase tracking-tight text-[#0a1628] leading-[0.95] text-5xl md:text-6xl lg:text-[5.5rem]" style={{ fontFamily: '"Archivo Black", "Inter", sans-serif' }}>
            <span>My <span className="text-[#1e5fd6]">workspace</span></span>
          </h1>
          <p className="text-lg md:text-xl font-semibold text-slate-500 max-w-md">
            Machines, operators, and active workflows.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Link to="/customer/machines" className="block h-full outline-none rounded-2xl transition-transform duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#1e5fd6]">
          <KpiCard className="border-l-4 border-l-[#1e5fd6]" label="Owned machines" value={machines.length} icon={Truck} />
        </Link>
        <Link to="/customer/operators" className="block h-full outline-none rounded-2xl transition-transform duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#1e5fd6]">
          <KpiCard className="border-l-4 border-l-[#1e5fd6]" label="Active operators" value={operators.filter((o) => o.status === "ACTIVE").length} icon={HardHat} />
        </Link>
        <Link to="/customer/requests" className="block h-full outline-none rounded-2xl transition-transform duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#1e5fd6]">
          <KpiCard className="border-l-4 border-l-[#1e5fd6]" label="Active requests" value={pending.length} icon={FileWarning} />
        </Link>
        <Link to="/customer/benefits" className="block h-full outline-none rounded-2xl transition-transform duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#1e5fd6] bg-gradient-to-br from-primary/5 to-primary/10 border-none">
          <div className="flex h-full flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Category {category?.category_code}</span>
              <Sparkles className="size-5 text-primary" />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold tracking-tight text-foreground">{Number(category?.loyalty_points ?? 0).toLocaleString()}</span>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{category?.description}</p>
            </div>
          </div>
        </Link>
      </div>
      
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2 border-slate-200/60 shadow-sm rounded-2xl flex flex-col min-h-[300px]">
          <div className="mb-6 flex items-center gap-2">
            <span className="h-[2px] w-4 bg-[#1e5fd6]" />
            <h3 className="text-[13px] font-bold text-[#0a1628]">Recent activity</h3>
          </div>
          
          {requests.slice(0, 6).length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] rounded-xl border border-slate-100">
              <div className="flex size-32 items-center justify-center rounded-full bg-blue-50 text-[#1e5fd6] mb-6 shadow-[inset_0_0_20px_rgba(226,232,240,0.5)]">
                <ClipboardList className="size-16" strokeWidth={1.25} />
              </div>
              <h4 className="text-base font-bold text-[#0a1628] mb-1.5">No recent workflow activity.</h4>
              <p className="text-sm text-slate-500 font-medium max-w-[220px]">You're all caught up! New activities will appear here.</p>
            </div>
          ) : (
            <ul className="space-y-3 text-sm flex-1">
              {requests.slice(0, 6).map((r) => (
                <li key={r.request_id} className="flex items-center justify-between border-b border-border pb-2">
                  <span>{r.request_number} · Machine {(r as any).machines?.serial_number ?? "—"}</span>
                  <StatusBadge status={r.overall_status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
        
        {/* Custom Light Theme Workforce Intelligence Card */}
        <Card className="p-6 border-slate-200/60 shadow-sm rounded-2xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-[2px] w-4 bg-[#1e5fd6]" />
              <h3 className="text-[13px] font-bold text-[#0a1628]">Workforce Intelligence</h3>
            </div>
            <a href="#" className="text-[11px] font-bold text-[#1e5fd6] hover:underline flex items-center">
              View all insights <span className="ml-1">→</span>
            </a>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1e5fd6]">
                <TrendingUp className="size-4" strokeWidth={2.5} />
              </div>
              <div>
                <span className="inline-block rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#1e5fd6] mb-1">Insight</span>
                <p className="text-[13px] font-bold text-[#0a1628] leading-snug mb-0.5">
                  {operators.length > 0 ? `${Math.round((operators.filter(o => o.status === "ACTIVE").length / operators.length) * 100)}% of your operators are active.` : "No operators found."}
                </p>
                <p className="text-[11px] font-medium text-slate-500">
                  {operators.length > 0 ? "Keep maintaining a healthy workforce." : "Add operators to see insights."}
                </p>
              </div>
            </div>
            
            {pending.length > 0 ? (
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                  <TriangleAlert className="size-4" strokeWidth={2.5} />
                </div>
                <div>
                  <span className="inline-block rounded bg-orange-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-orange-600 mb-1">Risk</span>
                  <p className="text-[13px] font-bold text-[#0a1628] leading-snug mb-0.5">{pending.length} pending service request{pending.length > 1 ? "s" : ""} require attention.</p>
                  <p className="text-[11px] font-medium text-slate-500">Consider reviewing to avoid downtime.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                  <Sparkles className="size-4" strokeWidth={2.5} />
                </div>
                <div>
                  <span className="inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Status</span>
                  <p className="text-[13px] font-bold text-[#0a1628] leading-snug mb-0.5">No pending service requests.</p>
                  <p className="text-[11px] font-medium text-slate-500">Your operations are running smoothly.</p>
                </div>
              </div>
            )}
            
            {category && Number(category.loyalty_points ?? 0) > 0 && (
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                  <TrendingUp className="size-4" strokeWidth={2.5} />
                </div>
                <div>
                  <span className="inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Opportunity</span>
                  <p className="text-[13px] font-bold text-[#0a1628] leading-snug mb-0.5">You have {Number(category.loyalty_points).toLocaleString()} loyalty points available.</p>
                  <p className="text-[11px] font-medium text-slate-500">Unlock rewards and benefits for your team.</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
