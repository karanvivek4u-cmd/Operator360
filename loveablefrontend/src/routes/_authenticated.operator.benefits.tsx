import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { myCategoryBenefitsQuery } from "@/lib/operator360/portal-queries";
import { PageHeader } from "@/components/operator360/PageHeader";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/operator360/StatusBadge";
import { EmptyState } from "@/components/operator360/EmptyState";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/_authenticated/operator/benefits")({
  head: () => ({ meta: [{ title: "Benefits · Operator360" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(myCategoryBenefitsQuery),
  component: () => {
    const b = useSuspenseQuery(myCategoryBenefitsQuery).data;
    return (
      <div>
        <PageHeader title="My benefits" />
        {b.length === 0 ? <EmptyState icon={Shield} title="No benefits assigned" /> : (
          <div className="grid gap-3 md:grid-cols-2">
            {b.map((x) => (
              <Card key={x.benefit_id} className="p-5 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Shield className="size-5" />
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <h3 className="font-bold text-lg text-primary">{x.benefits_master?.benefit_name}</h3>
                    <span className="font-bold tabular-nums text-primary">
                      ₹{Number(x.benefits_master?.coverage_amount ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{x.benefits_master?.description}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  },
});
