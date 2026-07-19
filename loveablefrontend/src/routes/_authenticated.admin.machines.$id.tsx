import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/operator360/PageHeader";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/operator360/StatusBadge";
import { Truck, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/admin/machines/$id")({
  head: () => ({ meta: [{ title: "Machine · Operator360" }] }),
  component: MachineTwin,
});

function machineDetail(id: string) {
  return queryOptions({
    queryKey: ["machine", id],
    queryFn: async () => {
      const [machine, assignments] = await Promise.all([
        supabase.from("machines").select("*, customers(company_name, customer_id)").eq("machine_id", id).single(),
        supabase.from("operator_assignments").select("*, operators(first_name,last_name,operator_code)").eq("machine_id", id).order("assignment_start_date", { ascending: false }),
      ]);
      return { machine: machine.data, assignments: assignments.data ?? [] };
    },
  });
}

function MachineTwin() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(machineDetail(id));
  if (isLoading || !data) return <Skeleton className="h-96 w-full" />;
  const m = data.machine;
  if (!m) return <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">Machine not found. <Link to="/admin/machines" className="text-primary hover:underline">Back</Link></div>;

  const active = data.assignments.filter((a) => a.status === "ACTIVE");
  return (
    <div>
      <PageHeader title={m.serial_number} description={`Digital twin · ${m.model_number ?? "—"}`} actions={<StatusBadge status={m.status} />} />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-lg bg-primary-surface text-primary">
              <Truck className="size-6" />
            </div>
            <div>
              <h3>Machine details</h3>
              <p className="text-xs text-muted-foreground">Owned by {(m as any).customers?.company_name ?? "—"}</p>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <F label="Engine" v={m.engine_number} />
            <F label="Model" v={m.model_number} />
            <F label="Purchased" v={m.purchase_date} />
            <F label="Warranty until" v={m.warranty_end_date} />
            <F label="Remarks" v={m.remarks} />
          </dl>
        </Card>
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2"><Users className="size-4 text-primary" /><h3>Active operators</h3></div>
          {active.length === 0 ? (
            <p className="text-sm text-muted-foreground">No operators currently assigned.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {active.map((a) => (
                <li 
                  key={a.assignment_id} 
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 cursor-pointer transition-colors hover:bg-muted/40"
                  onClick={() => navigate({ to: '/admin/operators/$id', params: { id: a.operator_id } })}
                >
                  <span>{(a as any).operators?.first_name} {(a as any).operators?.last_name}</span>
                  <span className="text-xs text-muted-foreground">since {a.assignment_start_date}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <Card className="mt-4 p-5">
        <h3 className="mb-3">Assignment history</h3>
        <div className="space-y-3">
          {data.assignments.map((a) => (
            <div 
              key={a.assignment_id} 
              className="flex items-center gap-4 border-l-2 border-primary/40 pl-4 cursor-pointer rounded-r-md transition-colors hover:bg-muted/40 py-2 pr-2 -my-2"
              onClick={() => navigate({ to: '/admin/operators/$id', params: { id: a.operator_id } })}
            >
              <div className="flex-1">
                <div className="text-sm font-medium">{(a as any).operators?.first_name} {(a as any).operators?.last_name}</div>
                <div className="text-xs text-muted-foreground">{a.assignment_start_date} → {a.assignment_end_date ?? "present"}</div>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function F({ label, v }: { label: string; v: string | null | undefined }) {
  return <div><dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-0.5">{v ?? "—"}</dd></div>;
}