import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { apiFetch } from "@/lib/operator360/api";
import { PageHeader } from "@/components/operator360/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/operator360/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/service-requests/$id")({
  head: () => ({ meta: [{ title: "Request · Operator360" }] }),
  component: RequestDetail,
});

function requestQuery(id: string) {
  return queryOptions({
    queryKey: ["request", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*, customers(company_name), machines(serial_number,model_number), old_op:old_operator_id(first_name,last_name), new_op:new_operator_id(first_name,last_name)")
        .eq("request_id", id).single();
      if (error) throw error;
      return data;
    },
  });
}

function RequestDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data: r, isLoading } = useQuery(requestQuery(id));

  const mut = useMutation({
    mutationFn: async (patch: {
      admin_status?: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
      admin_approved_at?: string;
      overall_status?: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
      closed_at?: string;
    }) => {
      let endpoint = "";
      if (patch.admin_status === "APPROVED") endpoint = `/api/service-requests/${id}/approve-admin`;
      else if (patch.admin_status === "REJECTED") endpoint = `/api/service-requests/${id}/reject-admin`;
      else if (patch.overall_status === "COMPLETED") endpoint = `/api/service-requests/${id}/complete`;
      
      if (!endpoint) throw new Error("Invalid patch operation");
      
      const res = await apiFetch(endpoint, { method: "POST" });
      if (!res.success) throw new Error(res.error || "Update failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["request", id] });
      qc.invalidateQueries({ queryKey: ["service_requests"] });
      toast.success("Request updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !r) return <Skeleton className="h-96 w-full" />;

  return (
    <div>
      <PageHeader
        title={r.request_number}
        description={`${(r as any).customers?.company_name ?? "—"} · Machine ${(r as any).machines?.serial_number ?? "—"}`}
        actions={<StatusBadge status={r.overall_status} />}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5">
            <h3 className="mb-3">Replacement details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <F label="Old operator" v={`${(r as any).old_op?.first_name ?? ""} ${(r as any).old_op?.last_name ?? ""}`.trim() || "—"} />
              <F label="New operator" v={`${(r as any).new_op?.first_name ?? ""} ${(r as any).new_op?.last_name ?? ""}`.trim() || "—"} />
              <F label="Type" v={r.request_type} />
              <F label="Requested at" v={r.created_at ? new Date(r.created_at).toLocaleString() : "—"} />
            </div>
            {r.customer_comments && (
              <div className="mt-4 rounded-md bg-muted p-3 text-sm text-foreground">
                <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Customer comments</div>
                {r.customer_comments}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="mb-3">Workflow</h3>
            <div className="space-y-3">
              <Step label="Customer submitted" done />
              <Step label="Insurance approval" done={r.insurance_status === "APPROVED"} rejected={r.insurance_status === "REJECTED"} status={r.insurance_status} />
              <Step label="Admin approval" done={r.admin_status === "APPROVED"} rejected={r.admin_status === "REJECTED"} status={r.admin_status} />
              <Step label="Completed" done={r.overall_status === "COMPLETED" || r.overall_status === "APPROVED"} />
            </div>
          </Card>

          <div className="flex flex-wrap gap-2">
            {r.admin_status === "PENDING" && r.insurance_status === "APPROVED" && (
              <>
                <Button
                  disabled={mut.isPending}
                  onClick={() => mut.mutate({ admin_status: "APPROVED", admin_approved_at: new Date().toISOString(), overall_status: "APPROVED", closed_at: new Date().toISOString() })}
                >
                  <CheckCircle2 className="size-4" /> Approve (Admin)
                </Button>
                <Button
                  variant="destructive"
                  disabled={mut.isPending}
                  onClick={() => mut.mutate({ admin_status: "REJECTED", overall_status: "REJECTED", closed_at: new Date().toISOString() })}
                >
                  <XCircle className="size-4" /> Reject
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => nav({ to: "/admin/service-requests" })}>Back</Button>
          </div>
        </div>

        <Card className="p-5 h-fit">
          <h3 className="mb-3">Ticket summary</h3>
          <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-4 marker:text-primary/50">
            <li>
              <span className="font-medium text-foreground">Replacement request</span> for machine {(r as any).machines?.serial_number ?? "—"}.
            </li>
            <li>
              Customer <span className="font-medium text-foreground">{(r as any).customers?.company_name ?? "—"}</span> initiated the workflow.
            </li>
            <li>
              Insurance status: <span className="font-medium text-foreground">{r.insurance_status}</span>. Admin status: <span className="font-medium text-foreground">{r.admin_status}</span>.
            </li>
          </ul>
        </Card>
      </div>
      <div className="mt-6 text-xs text-muted-foreground">
        <Link to="/admin/service-requests" className="hover:underline">← Back to all requests</Link>
      </div>
    </div>
  );
}

function F({ label, v }: { label: string; v: string }) {
  return <div><div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div><div className="mt-0.5">{v}</div></div>;
}

function Step({ label, done, rejected, status }: { label: string; done?: boolean; rejected?: boolean; status?: string | null }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`grid size-6 place-items-center rounded-full text-[10px] font-bold ${done ? "bg-success text-white" : rejected ? "bg-destructive text-white" : "bg-muted text-muted-foreground"}`}>
        {done ? "✓" : rejected ? "✕" : "•"}
      </div>
      <div className="text-sm">{label}</div>
      {status ? <span className="ml-auto"><StatusBadge status={status} /></span> : null}
    </div>
  );
}