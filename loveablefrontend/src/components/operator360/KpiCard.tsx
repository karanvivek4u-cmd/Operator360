import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  className,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: string; direction: "up" | "down" | "flat" };
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-slate-200/60 p-6 shadow-sm fade-in-up bg-white rounded-2xl h-full",
        className
      )}
    >
      <div className="flex gap-4">
        {Icon ? (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1e5fd6]">
            <Icon className="size-5" strokeWidth={2} />
          </div>
        ) : null}
        
        <div className="flex flex-col z-10 relative">
          <p className="text-[13px] font-bold text-slate-700 mt-1">{label}</p>
          <p className="mt-1 text-3xl font-black text-[#0a1628] tabular-nums" style={{ fontFamily: '"Archivo Black", "Inter", sans-serif' }}>
            {value}
          </p>
          {trend ? (
            <div className={cn(
                "mt-3 flex items-center gap-1 text-[11px] font-bold tracking-wide",
                trend.direction === "up" && "text-emerald-500",
                trend.direction === "down" && "text-red-500",
                trend.direction === "flat" && "text-slate-500"
              )}>
              {trend.direction === "up" && <ArrowUp className="size-3" strokeWidth={3} />}
              {trend.direction === "down" && <ArrowDown className="size-3" strokeWidth={3} />}
              {trend.value}
            </div>
          ) : null}
        </div>
      </div>
      
      {/* Decorative Sparkline */}
      <div className="absolute right-0 bottom-4 w-28 opacity-80 pointer-events-none">
        <svg viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 25C10 25 15 15 25 15C35 15 40 22 50 22C60 22 65 5 75 5C85 5 90 12 100 12" stroke="#1e5fd6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M0 25C10 25 15 15 25 15C35 15 40 22 50 22C60 22 65 5 75 5C85 5 90 12 100 12L100 30L0 30Z" fill="url(#sparkline-gradient)" opacity="0.1" />
          <defs>
            <linearGradient id="sparkline-gradient" x1="50" y1="5" x2="50" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1e5fd6" />
              <stop offset="1" stopColor="#1e5fd6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </Card>
  );
}