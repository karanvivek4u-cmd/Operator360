import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { insuranceQueueQuery } from "@/lib/operator360/portal-queries";
import { PageHeader } from "./PageHeader";
import { EmptyState } from "./EmptyState";
import { StatusBadge } from "./StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, XCircle, FileWarning } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiFetch } from "@/lib/operator360/api";

export function InsuranceQueue({ status, title, showActions }: { status: "PENDING" | "APPROVED" | "REJECTED"; title: string; showActions?: boolean }) {
  const { data } = useSuspenseQuery(insuranceQueueQuery(status));
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: "APPROVED" | "REJECTED" }) => {
      const endpoint = decision === "APPROVED" 
        ? `/api/service-requests/${id}/approve-insurance`
        : `/api/service-requests/${id}/reject-insurance`;
      const res = await apiFetch(endpoint, { method: "POST" });
      if (!res.success) throw new Error(res.error || "Update failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["insurance"] });
      toast.success("Decision recorded");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title={title} description={`${data.length} request(s) in this queue.`} />
      {data.length === 0 ? (
        <EmptyState icon={FileWarning} title="Queue is empty" description="Nothing to review right now." />
      ) : (
        <div className="space-y-3">
          {data.map((r) => (
            <Card key={r.request_id} className="p-5 fade-in-up">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{r.request_number}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {(r as any).customers?.company_name ?? "—"} · Machine {(r as any).machines?.serial_number ?? "—"} · {r.created_at ? formatDistanceToNow(new Date(r.created_at), { addSuffix: true }) : ""}
                  </div>
                </div>
                <StatusBadge status={r.insurance_status} />
              </div>
              <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
                <div><div className="text-[11px] uppercase tracking-wide text-muted-foreground">Old operator</div><div>{(r as any).old_op?.first_name ?? "—"} {(r as any).old_op?.last_name ?? ""}</div></div>
                <div><div className="text-[11px] uppercase tracking-wide text-muted-foreground">New operator</div><div>{(r as any).new_op?.first_name ?? "—"} {(r as any).new_op?.last_name ?? ""}</div></div>
                <div><div className="text-[11px] uppercase tracking-wide text-muted-foreground">Reason</div><div className="line-clamp-2">{r.customer_comments ?? "—"}</div></div>
              </div>
              {showActions && (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => mut.mutate({ id: r.request_id, decision: "APPROVED" })}><CheckCircle2 className="size-4" /> Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => mut.mutate({ id: r.request_id, decision: "REJECTED" })}><XCircle className="size-4" /> Reject</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
