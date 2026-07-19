import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { myAssignmentsQuery } from "@/lib/operator360/portal-queries";
import { PageHeader } from "@/components/operator360/PageHeader";
import { StatusBadge } from "@/components/operator360/StatusBadge";
import { TableCard, Td, Th, Tr } from "@/components/operator360/DataShell";
import { EmptyState } from "@/components/operator360/EmptyState";
import { ClipboardList } from "lucide-react";

export const Route = createFileRoute("/_authenticated/customer/assignments")({
  head: () => ({ meta: [{ title: "Assignments · Operator360" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(myAssignmentsQuery),
  component: () => {
    const { data } = useSuspenseQuery(myAssignmentsQuery);
    return (
      <div>
        <PageHeader title="Assignments" />
        {data.length === 0 ? <EmptyState icon={ClipboardList} title="No assignments" /> : (
          <TableCard><table className="w-full"><thead><tr><Th>Machine</Th><Th>Operator</Th><Th>Start</Th><Th>End</Th><Th>Status</Th></tr></thead>
            <tbody>{data.map((a) => (
              <Tr key={a.assignment_id}>
                <Td>{(a as any).machines?.serial_number ?? "—"}</Td>
                <Td>{(a as any).operators?.first_name} {(a as any).operators?.last_name}</Td>
                <Td>{a.assignment_start_date}</Td><Td>{a.assignment_end_date ?? "—"}</Td>
                <Td><StatusBadge status={a.status} /></Td>
              </Tr>
            ))}</tbody></table></TableCard>
        )}
      </div>
    );
  },
});
