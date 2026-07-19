import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { myMachinesQuery } from "@/lib/operator360/portal-queries";
import { PageHeader } from "@/components/operator360/PageHeader";
import { StatusBadge } from "@/components/operator360/StatusBadge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/operator360/EmptyState";
import { Truck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/customer/machines/")({
  head: () => ({ meta: [{ title: "My Machines · Operator360" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(myMachinesQuery),
  component: () => {
    const { data } = useSuspenseQuery(myMachinesQuery);
    return (
      <div>
        <PageHeader title="My machines" description="Your fleet of heavy equipment registered on Operator360." />
        {data.length === 0 ? <EmptyState icon={Truck} title="No machines registered yet" /> : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((m) => (
              <Link to="/customer/machines/$id" params={{ id: m.machine_id }} key={m.machine_id}>
                <Card className="fade-in-up cursor-pointer p-5 transition-shadow hover:shadow-[var(--shadow-lift)]">
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-lg bg-primary-surface text-primary"><Truck className="size-5" /></div>
                    <div className="min-w-0"><h3 className="truncate">{m.serial_number}</h3><p className="text-xs text-muted-foreground">{m.model_number ?? "—"}</p></div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <StatusBadge status={m.status} />
                    <span className="text-muted-foreground">Warranty: {m.warranty_end_date ?? "—"}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  },
});
