import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { operatorsListQuery } from "@/lib/operator360/queries";
import { PageHeader } from "@/components/operator360/PageHeader";
import { StatusBadge } from "@/components/operator360/StatusBadge";
import { TableCard, Td, Th, Tr } from "@/components/operator360/DataShell";
import { EmptyState } from "@/components/operator360/EmptyState";
import { HardHat } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/operators/")({
  head: () => ({ meta: [{ title: "Operators · Operator360" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(operatorsListQuery),
  component: OperatorsPage,
});

function OperatorsPage() {
  const { data } = useSuspenseQuery(operatorsListQuery);
  const [q, setQ] = useState("");

  const filtered = data.filter((o) =>
    [o.first_name, o.last_name, o.operator_code, o.mobile, (o as any).customers?.company_name].some((v) =>
      (v ?? "").toLowerCase().includes(q.toLowerCase())
    )
  );
  return (
    <div>
      <PageHeader 
        title="Operators" 
        description="Every registered operator across all customers." 
      />
      {data.length === 0 ? (
        <EmptyState icon={HardHat} title="No operators found" />
      ) : (
        <TableCard search={q} onSearch={setQ} placeholder="Search operators…">
          <table className="w-full">
            <thead><tr><Th>Code</Th><Th>Name</Th><Th>Mobile</Th><Th>Customer</Th><Th>Joined</Th><Th>Status</Th></tr></thead>
            <tbody>
              {filtered.map((o) => (
                <Tr key={o.operator_id}>
                  <Td>
                    <Link to="/admin/operators/$id" params={{ id: o.operator_id }} className="font-medium text-primary hover:underline">{o.operator_code}</Link>
                  </Td>
                  <Td>{o.first_name} {o.last_name ?? ""}</Td>
                  <Td>{o.mobile ?? "—"}</Td>
                  <Td className="text-muted-foreground">{(o as any).customers?.company_name ?? "—"}</Td>
                  <Td>{o.joining_date ?? "—"}</Td>
                  <Td><StatusBadge status={o.status} /></Td>
                </Tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      )}
    </div>
  );
}