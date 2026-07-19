import { createFileRoute } from "@tanstack/react-router";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { myCategoryBenefitsQuery } from "@/lib/operator360/portal-queries";
import { PageHeader } from "@/components/operator360/PageHeader";
import { StatusBadge } from "@/components/operator360/StatusBadge";
import { Card } from "@/components/ui/card";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/_authenticated/customer/operators/$id")({
  head: () => ({ meta: [{ title: "Operator · Operator360" }] }),
  component: () => {
    const { id } = Route.useParams();
    const q = useQuery(queryOptions({
      queryKey: ["cust", "op", id],
      queryFn: async () => (await supabase.from("operators").select("*").eq("operator_id", id).single()).data,
    }));
    const { data: benefits } = useQuery(myCategoryBenefitsQuery);
    
    const o = q.data;
    if (!o) return null;
    return (
      <div>
        <PageHeader title={`${o.first_name} ${o.last_name ?? ""}`} description={o.operator_code} actions={<StatusBadge status={o.status} />} />
        <Card className="p-5">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {[["Mobile", o.mobile], ["Email", o.email], ["DOB", o.dob], ["Emergency", o.emergency_contact], ["Address", o.address]].map(([l, v]) => (
              <div key={l as string}><dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{l}</dt><dd className="mt-0.5">{(v as string) ?? "—"}</dd></div>
            ))}
          </dl>
        </Card>

        {benefits && benefits.length > 0 && (
          <>
            <h3 className="mb-4 mt-8 text-lg font-semibold">Active Benefits</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map((b: any) => (
                <Card key={b.benefit_id} className="flex flex-col gap-2 p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <Shield className="size-5" />
                    </div>
                    <h4 className="text-lg font-bold text-primary">{b.benefits_master?.benefit_name}</h4>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{b.benefits_master?.description}</p>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    );
  },
});
