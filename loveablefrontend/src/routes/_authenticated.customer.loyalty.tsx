import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { myCategoryQuery } from "@/lib/operator360/portal-queries";
import { PageHeader } from "@/components/operator360/PageHeader";
import { Card } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/customer/loyalty")({
  head: () => ({ meta: [{ title: "Loyalty · Operator360" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(myCategoryQuery),
  component: () => {
    const category = useSuspenseQuery(myCategoryQuery).data;
    const balance = Number(category?.loyalty_points ?? 0);
    const next = 100000;
    const pct = Math.min(100, (balance / next) * 100);
    return (
      <div>
        <PageHeader title="Loyalty wallet" description="Earn and redeem points across programs." />
        <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-8">
          <div className="flex items-center gap-3"><Wallet className="size-8 text-primary" /><h2>Your balance</h2></div>
          <p className="mt-4 text-5xl font-bold tabular-nums text-primary">{balance.toLocaleString()}<span className="ml-2 text-sm font-medium text-muted-foreground">pts</span></p>
          <div className="mt-6">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Category: {category?.category_name ?? 'None'}</span><span>{Math.round(pct)}% to Next Tier</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>
          </div>
        </Card>
      </div>
    );
  },
});
