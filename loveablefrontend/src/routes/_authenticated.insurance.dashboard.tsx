import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { insuranceQueueQuery } from "@/lib/operator360/portal-queries";
import { KpiCard } from "@/components/operator360/KpiCard";
import { Card } from "@/components/ui/card";
import { Clock, CheckCircle2, XCircle, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import dashboardBg from "@/assets/dashboardb.png";
import excavatorImg from "@/assets/excavator.png";

export const Route = createFileRoute("/_authenticated/insurance/dashboard")({
  head: () => ({ meta: [{ title: "Insurance Dashboard · Operator360" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(insuranceQueueQuery("PENDING"));
    context.queryClient.ensureQueryData(insuranceQueueQuery("APPROVED"));
    context.queryClient.ensureQueryData(insuranceQueueQuery("REJECTED"));
  },
  component: InsuranceDash,
});

function InsuranceDash() {
  const pending = useSuspenseQuery(insuranceQueueQuery("PENDING")).data;
  const approved = useSuspenseQuery(insuranceQueueQuery("APPROVED")).data;
  const rejected = useSuspenseQuery(insuranceQueueQuery("REJECTED")).data;
  
  return (
    <div>
      {/* Hero Section */}
      <div className="relative mb-8 rounded-3xl border border-slate-200/60 shadow-sm flex items-center bg-[#f7f9fc] min-h-[340px] md:aspect-[3/1]">
        {/* Full Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl">
          <img src={excavatorImg} alt="Insurance Background" className="h-full w-full object-cover object-right" />
        </div>
        
        {/* Content */}
        <div className="relative z-20 max-w-2xl px-8 py-10 md:px-12 lg:px-16 w-full">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-[2px] w-8 bg-[#1e5fd6]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#1e5fd6]">
              INSURANCE PORTAL
            </span>
          </div>
          <h1 className="mb-4 flex flex-col font-black uppercase tracking-tight text-[#0a1628] leading-[0.95] text-5xl md:text-6xl lg:text-[5.5rem]" style={{ fontFamily: '"Archivo Black", "Inter", sans-serif' }}>
            <span>Insurance</span>
            <span className="text-[#1e5fd6]">approvals</span>
          </h1>
          <p className="text-lg md:text-xl font-semibold text-slate-500 max-w-md">
            Review and act on operator replacement requests.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/insurance/pending" className="block h-full outline-none rounded-2xl transition-transform duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#1e5fd6]">
          <KpiCard className="border-l-4 border-l-[#1e5fd6]" label="Pending review" value={pending.length} icon={Clock} />
        </Link>
        <Link to="/insurance/approved" className="block h-full outline-none rounded-2xl transition-transform duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#1e5fd6]">
          <KpiCard className="border-l-4 border-l-[#1e5fd6]" label="Approved" value={approved.length} icon={CheckCircle2} />
        </Link>
        <Link to="/insurance/rejected" className="block h-full outline-none rounded-2xl transition-transform duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#1e5fd6]">
          <KpiCard className="border-l-4 border-l-[#1e5fd6]" label="Rejected" value={rejected.length} icon={XCircle} />
        </Link>
      </div>

      <div className="mt-4">
        {/* Custom Light Theme AI Advisor Card */}
        <Card className="p-6 md:p-8 border-slate-200/60 shadow-sm rounded-2xl">
          <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-[#1e5fd6]">
                <Sparkles className="size-4" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-bold text-[#0a1628]">AI Advisor</h3>
            </div>
            <a href="#" className="text-[11px] font-bold text-[#1e5fd6] hover:underline flex items-center">
              View all insights <span className="ml-1">→</span>
            </a>
          </div>

          <div className="flex flex-col gap-4">
            {/* Insight Row */}
            <div className="flex items-center justify-between group cursor-pointer rounded-xl p-4 transition-colors hover:bg-slate-50">
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1e5fd6]">
                  <TrendingUp className="size-5" strokeWidth={2.5} />
                </div>
                <div>
                  <span className="inline-block rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#1e5fd6] mb-1.5">Insight</span>
                  <p className="text-[14px] font-bold text-[#0a1628] leading-snug mb-1">{pending.length} request(s) waiting for insurance decision.</p>
                  <p className="text-[12px] font-medium text-slate-500">Review pending requests to keep operations on track.</p>
                </div>
              </div>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1e5fd6] transition-transform group-hover:translate-x-1 group-hover:bg-[#1e5fd6] group-hover:text-white">
                <ArrowRight className="size-4" strokeWidth={2} />
              </div>
            </div>
            
            {/* Opportunity Row */}
            <div className="flex items-center justify-between group cursor-pointer rounded-xl p-4 transition-colors hover:bg-slate-50">
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                  <TrendingUp className="size-5" strokeWidth={2.5} />
                </div>
                <div>
                  <span className="inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600 mb-1.5">Opportunity</span>
                  <p className="text-[14px] font-bold text-[#0a1628] leading-snug mb-1">Approval velocity improved 8% week-over-week.</p>
                  <p className="text-[12px] font-medium text-slate-500">Great progress! Keep up the momentum.</p>
                </div>
              </div>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1e5fd6] transition-transform group-hover:translate-x-1 group-hover:bg-[#1e5fd6] group-hover:text-white">
                <ArrowRight className="size-4" strokeWidth={2} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
