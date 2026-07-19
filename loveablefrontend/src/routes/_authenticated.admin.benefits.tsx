import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { benefitsListQuery } from "@/lib/operator360/queries";
import { PageHeader } from "@/components/operator360/PageHeader";
import { TableCard, Td, Th, Tr } from "@/components/operator360/DataShell";
import { EmptyState } from "@/components/operator360/EmptyState";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/benefits")({
  head: () => ({ meta: [{ title: "Benefits · Operator360" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(benefitsListQuery),
  component: BenefitsPage,
});

function BenefitsPage() {
  const { data } = useSuspenseQuery(benefitsListQuery);
  return (
    <div>
      <PageHeader title="Benefits" description="Benefit templates available across operator categories." />
      {data.length === 0 ? (
        <EmptyState icon={Shield} title="No benefits registered" />
      ) : (
        <TableCard>
          <table className="w-full">
            <thead><tr><Th>Benefit Name</Th><Th>Description</Th><Th>Coverage</Th></tr></thead>
            <tbody>
              {data.map((b: any) => (
                <Tr key={b.benefit_id}>
                  <Td className="font-semibold">{b.benefit_name}</Td>
                  <Td className="text-muted-foreground">{b.description ?? "—"}</Td>
                  <Td className="font-medium tabular-nums">₹{Number(b.coverage_amount ?? 0).toLocaleString()}</Td>
                </Tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      )}
    </div>
  );
}