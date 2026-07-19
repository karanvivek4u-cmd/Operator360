import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { apiFetch } from "@/lib/operator360/api";
import { toast } from "sonner";
import { serviceRequestsListQuery } from "@/lib/operator360/queries";
import { PageHeader } from "@/components/operator360/PageHeader";
import { StatusBadge } from "@/components/operator360/StatusBadge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TableCard, Td, Th, Tr } from "@/components/operator360/DataShell";
import { EmptyState } from "@/components/operator360/EmptyState";
import { Button } from "@/components/ui/button";
import { FileWarning, CheckCircle2, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/service-requests/")({
  head: () => ({ meta: [{ title: "Service Requests · Operator360" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(serviceRequestsListQuery),
  component: ServiceRequestsPage,
});

function ServiceRequestsPage() {
  const { data } = useSuspenseQuery(serviceRequestsListQuery);
  const [q, setQ] = useState("");
  const filter = (rows: typeof data) => rows.filter((r) => [r.request_number, (r as any).customers?.company_name].some((v) => (v ?? "").toLowerCase().includes(q.toLowerCase())));
  const qc = useQueryClient();
  const navigate = useNavigate();
  const mut = useMutation({
    mutationFn: async ({ id, patch }: { id: string, patch: any }) => {
      let endpoint = "";
      if (patch.admin_status === "APPROVED") endpoint = `/api/service-requests/${id}/approve-admin`;
      else if (patch.admin_status === "REJECTED") endpoint = `/api/service-requests/${id}/reject-admin`;
      else if (patch.overall_status === "COMPLETED") endpoint = `/api/service-requests/${id}/complete`;
      
      if (!endpoint) throw new Error("Invalid patch operation");
      
      const res = await apiFetch(endpoint, { method: "POST" });
      if (!res.success) throw new Error(res.error || "Update failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service_requests"] });
      toast.success("Request updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const buckets = {
    all: data,
    pendingIns: data.filter((r) => r.insurance_status === "PENDING"),
    pendingAdm: data.filter((r) => r.insurance_status === "APPROVED" && r.admin_status === "PENDING"),
    completed: data.filter((r) => r.overall_status === "COMPLETED" || r.overall_status === "APPROVED"),
    rejected: data.filter((r) => r.overall_status === "REJECTED"),
  };

  return (
    <div>
      <PageHeader title="Service Requests" description="Operator replacement workflow: Customer → Insurance → Admin → Completed." />
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({buckets.all.length})</TabsTrigger>
          <TabsTrigger value="pendingIns">Pending Insurance ({buckets.pendingIns.length})</TabsTrigger>
          <TabsTrigger value="pendingAdm">Pending Admin ({buckets.pendingAdm.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({buckets.completed.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({buckets.rejected.length})</TabsTrigger>
        </TabsList>
        {Object.entries(buckets).map(([k, rows]) => (
          <TabsContent key={k} value={k} className="mt-4">
            {rows.length === 0 ? (
              <EmptyState icon={FileWarning} title="Nothing in this queue" />
            ) : (
              <TableCard search={q} onSearch={setQ} placeholder="Search by request # or customer…">
                <table className="w-full">
                  <thead><tr><Th>#</Th><Th>Customer</Th><Th>Machine</Th><Th>Insurance</Th><Th>Admin</Th><Th>Overall</Th><Th>Age</Th><Th className="text-right">Actions</Th></tr></thead>
                  <tbody>
                    {filter(rows).map((r) => (
                      <Tr 
                        key={r.request_id}
                        onClick={() => navigate({ to: '/admin/service-requests/$id', params: { id: r.request_id } })}
                      >
                        <Td>
                          <Link to="/admin/service-requests/$id" params={{ id: r.request_id }} className="font-medium text-primary hover:underline">{r.request_number}</Link>
                        </Td>
                        <Td>{(r as any).customers?.company_name ?? "—"}</Td>
                        <Td className="text-muted-foreground">{(r as any).machines?.serial_number ?? "—"}</Td>
                        <Td><StatusBadge status={r.insurance_status} /></Td>
                        <Td><StatusBadge status={r.admin_status} /></Td>
                        <Td><StatusBadge status={r.overall_status} /></Td>
                        <Td className="text-xs text-muted-foreground">{r.created_at ? formatDistanceToNow(new Date(r.created_at), { addSuffix: true }) : ""}</Td>
                        <Td className="text-right">
                          {r.admin_status === "PENDING" && r.insurance_status === "APPROVED" ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-success hover:text-success hover:bg-success/10"
                                disabled={mut.isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  mut.mutate({ id: r.request_id, patch: { admin_status: "APPROVED", admin_approved_at: new Date().toISOString(), overall_status: "APPROVED", closed_at: new Date().toISOString() } });
                                }}
                              >
                                <CheckCircle2 className="size-3.5 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                disabled={mut.isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  mut.mutate({ id: r.request_id, patch: { admin_status: "REJECTED", overall_status: "REJECTED", closed_at: new Date().toISOString() } });
                                }}
                              >
                                <XCircle className="size-3.5 mr-1" /> Reject
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); navigate({ to: '/admin/service-requests/$id', params: { id: r.request_id } }); }}>
                              View
                            </Button>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </table>
              </TableCard>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}