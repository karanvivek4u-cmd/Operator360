import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { loyaltyListQuery } from "@/lib/operator360/queries";
import { PageHeader } from "@/components/operator360/PageHeader";
import { StatusBadge } from "@/components/operator360/StatusBadge";
import { TableCard, Td, Th, Tr } from "@/components/operator360/DataShell";
import { EmptyState } from "@/components/operator360/EmptyState";
import { Award } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/loyalty")({
  head: () => ({ meta: [{ title: "Loyalty · Operator360" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(loyaltyListQuery),
  component: LoyaltyPage,
});
function LoyaltyPage() {
  const { data } = useSuspenseQuery(loyaltyListQuery);
  return (
    <div>
      <PageHeader title="Loyalty" description="Customer loyalty wallet balances." />
      {data.length === 0 ? <EmptyState icon={Award} title="No wallets yet" /> : (
        <TableCard>
          <table className="w-full"><thead><tr><Th>Customer</Th><Th>Balance (pts)</Th><Th>Status</Th></tr></thead>
            <tbody>{data.map((w) => (
              <Tr key={w.customer_id}>
                <Td>{(w as any).customers?.company_name ?? "—"}</Td>
                <Td className="font-bold tabular-nums text-primary">{Number(w.loyalty_points ?? 0).toLocaleString()}</Td>
                <Td><StatusBadge status={w.status} /></Td>
              </Tr>
            ))}</tbody>
          </table>
        </TableCard>
      )}
    </div>
  );
}