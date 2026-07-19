import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  ACTIVE: "bg-[oklch(0.95_0.09_145)] text-[oklch(0.35_0.15_145)]",
  INACTIVE: "bg-[oklch(0.94_0.05_25)] text-[oklch(0.4_0.2_25)]",
  PENDING: "bg-[oklch(0.96_0.09_85)] text-[oklch(0.4_0.15_65)]",
  APPROVED: "bg-[oklch(0.95_0.09_145)] text-[oklch(0.35_0.15_145)]",
  REJECTED: "bg-[oklch(0.94_0.05_25)] text-[oklch(0.4_0.2_25)]",
  COMPLETED: "bg-primary-surface text-[oklch(0.35_0.08_195)]",
  ASSIGNED: "bg-primary-surface text-[oklch(0.35_0.08_195)]",
  UNASSIGNED: "bg-muted text-muted-foreground",
  MAINTENANCE: "bg-[oklch(0.96_0.09_85)] text-[oklch(0.4_0.15_65)]",
  RETIRED: "bg-muted text-muted-foreground",
  TERMINATED: "bg-[oklch(0.94_0.05_25)] text-[oklch(0.4_0.2_25)]",
};

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const key = (status ?? "").toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-0.5 text-[12px] font-medium",
        STYLES[key] ?? "bg-muted text-muted-foreground"
      )}
    >
      {key || "—"}
    </span>
  );
}