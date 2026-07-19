import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/operator360/PageHeader";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/operator360/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { HardHat } from "lucide-react";
import { Td, Th, Tr } from "@/components/operator360/DataShell";

export const Route = createFileRoute("/_authenticated/admin/operators/$id")({
  head: () => ({ meta: [{ title: "Operator · Operator360" }] }),
  component: OperatorWorkspace,
});

function opQuery(id: string) {
  return queryOptions({
    queryKey: ["operator", id],
    queryFn: async () => {
      const { data: op } = await supabase.from("operators").select("*, customers(category, company_name)").eq("operator_id", id).single();
      
      const promises: Promise<any>[] = [
        supabase.from("operator_assignments").select("*, machines(serial_number,model_number)").eq("operator_id", id).order("assignment_start_date", { ascending: false })
      ];

      const category = op && (op as any).customers ? (op as any).customers.category : null;
      if (category) {
        promises.push(
          supabase.from("category_benefits").select("*, benefits_master(*)").eq("category_code", category)
        );
      }

      const results = await Promise.all(promises);
      const assigns = results[0].data ?? [];
      const bensData = results.length > 1 ? (results[1].data ?? []) : [];
      
      // Map category_benefits to the format the UI expects for 'bens'
      const bens = bensData.map((cb: any) => ({
        benefit_id: cb.benefit_id,
        benefit_name: cb.benefits_master?.benefit_name ?? "Unknown Benefit",
        start_date: cb.created_at?.split('T')[0] ?? "—",
        end_date: null,
        status: "ACTIVE",
        coverage_amount: cb.benefits_master?.coverage_amount ?? 0
      }));

      return { op, assigns, bens };
    },
  });
}

function OperatorWorkspace() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery(opQuery(id));
  if (isLoading || !data) return <Skeleton className="h-96 w-full" />;
  const o = data.op;
  if (!o) return <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">Operator not found. <Link to="/admin/operators" className="text-primary hover:underline">Back</Link></div>;
  return (
    <div>
      <PageHeader title={`${o.first_name} ${o.last_name ?? ""}`} description={`${o.operator_code} · ${(o as any).customers?.company_name ?? ""}`} actions={<StatusBadge status={o.status} />} />
      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="assignments">Assignments ({data.assigns.length})</TabsTrigger>
          <TabsTrigger value="benefits">Benefits ({data.bens.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="personal" className="mt-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-full bg-primary-surface text-primary"><HardHat className="size-6" /></div>
              <div><h3>Personal information</h3><p className="text-xs text-muted-foreground">{o.operator_code}</p></div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
              <F label="Mobile" v={o.mobile} />
              <F label="Email" v={o.email} />
              <F label="Aadhaar" v={o.aadhaar_number} />
              <F label="DOB" v={o.dob} />
              <F label="Gender" v={o.gender} />
              <F label="Joined" v={o.joining_date} />
              <F label="Emergency" v={o.emergency_contact} />
              <F label="Address" v={o.address} />
            </dl>
          </Card>
        </TabsContent>
        <TabsContent value="assignments" className="mt-4">
          <Card className="overflow-hidden">
            <table className="w-full"><thead><tr><Th>Machine</Th><Th>Start</Th><Th>End</Th><Th>Status</Th></tr></thead>
              <tbody>{data.assigns.map((a) => (
                <Tr key={a.assignment_id}>
                  <Td>{(a as any).machines?.serial_number}</Td>
                  <Td>{a.assignment_start_date}</Td>
                  <Td>{a.assignment_end_date ?? "—"}</Td>
                  <Td><StatusBadge status={a.status} /></Td>
                </Tr>
              ))}</tbody>
            </table>
          </Card>
        </TabsContent>
        <TabsContent value="benefits" className="mt-4">
          <div className="grid gap-3 md:grid-cols-2">
            {data.bens.map((b) => (
              <Card key={b.benefit_id} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3>{b.benefit_name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{b.start_date} → {b.end_date ?? "ongoing"}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <p className="mt-3 text-2xl font-bold text-primary">₹{Number(b.coverage_amount ?? 0).toLocaleString()}</p>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
function F({ label, v }: { label: string; v: string | null | undefined }) {
  return <div><dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-0.5">{v ?? "—"}</dd></div>;
}