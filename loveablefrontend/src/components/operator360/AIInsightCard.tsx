import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

export function AIInsightCard({
  title = "AI Copilot",
  children,
  onRegenerate,
}: {
  title?: string;
  children: ReactNode;
  onRegenerate?: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1628] to-[#040812] p-6 shadow-xl border border-white/10">
      {/* Decorative gradient overlay */}
      <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#1e5fd6]/30 blur-[60px]" />
      <div className="absolute bottom-0 left-1/4 h-1/2 w-3/4 rounded-[100%] bg-[#1e5fd6]/10 blur-2xl" />
      <div className="absolute top-0 right-0 h-[2px] w-1/3 bg-gradient-to-l from-transparent via-[#1e5fd6]/50 to-transparent" />
      
      <div className="relative z-10 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-blue-500/20 text-white shadow-[0_0_15px_rgba(30,95,214,0.3)]">
            <Sparkles className="size-4" strokeWidth={2} />
          </span>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        {onRegenerate ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRegenerate}
            className="h-8 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className="mr-1.5 size-3" /> Regenerate
          </Button>
        ) : null}
      </div>
      <div className="relative z-10 flex flex-col gap-5 text-[13px] leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export function AIInsightBullet({
  severity = "Insight",
  children,
  delay = 0,
}: {
  severity?: "Opportunity" | "Risk" | "Alert" | "Insight";
  children: ReactNode;
  delay?: number;
}) {
  const badgeStyle =
    severity === "Risk"
      ? "bg-[#ff9d4d]/10 text-[#ff9d4d] border border-[#ff9d4d]/20"
      : severity === "Alert"
        ? "bg-[#ff4d6d]/10 text-[#ff4d6d] border border-[#ff4d6d]/20"
        : severity === "Opportunity"
          ? "bg-[#22d3c5]/10 text-[#22d3c5] border border-[#22d3c5]/20"
          : "bg-[#1e5fd6]/10 text-[#1e5fd6] border border-[#1e5fd6]/20";
          
  return (
    <div className="fade-in-up flex items-start gap-4" style={{ animationDelay: `${delay}ms` }}>
      <span
        className={`mt-0.5 flex h-6 min-w-[80px] shrink-0 items-center justify-center rounded-full px-2 text-[10px] font-bold tracking-wide ${badgeStyle}`}
      >
        {severity}
      </span>
      <span className="text-slate-300 font-medium">{children}</span>
    </div>
  );
}