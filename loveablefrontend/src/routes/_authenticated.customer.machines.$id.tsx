import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { apiFetch } from "@/lib/operator360/api";
import { PageHeader } from "@/components/operator360/PageHeader";
import { StatusBadge } from "@/components/operator360/StatusBadge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/customer/machines/$id")({
  head: () => ({ meta: [{ title: "Machine · Operator360" }] }),
  component: MDetail,
});

function AssignOperatorDialog({ machineId, customerId, disabled, activeOperatorIds }: { machineId: string; customerId: string; disabled: boolean; activeOperatorIds: string[] }) {
  const [open, setOpen] = useState(false);
  const [opId, setOpId] = useState("");
  const qc = useQueryClient();

  const opsQuery = useQuery({
    queryKey: ["cust", "ops", customerId],
    queryFn: async () => {
      const { data } = await supabase.from("operators").select("operator_id, first_name, last_name, operator_code").eq("customer_id", customerId);
      return data ?? [];
    },
    enabled: open,
  });

  const mut = useMutation({
    mutationFn: async () => {
      if (!opId) throw new Error("Select an operator");
      const { error } = await supabase.from("operator_assignments").insert({
        machine_id: machineId,
        operator_id: opId,
      });
      if (error) throw error;
      
      // Update the machine's status to ACTIVE so the badge matches the new assignment
      await supabase.from("machines").update({ status: 'ACTIVE' }).eq("machine_id", machineId);
    },
    onSuccess: () => {
      toast.success("Operator assigned successfully");
      setOpen(false);
      setOpId("");
      qc.invalidateQueries({ queryKey: ["cust", "machine", machineId] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={disabled} variant={disabled ? "secondary" : "default"}>
          <Plus className="mr-1.5 size-4" />
          Assign Operator
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Operator</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Select value={opId} onValueChange={setOpId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an operator..." />
            </SelectTrigger>
            <SelectContent>
              {opsQuery.data?.filter(o => !activeOperatorIds.includes(o.operator_id)).map((o) => (
                <SelectItem key={o.operator_id} value={o.operator_id}>
                  {o.first_name} {o.last_name} ({o.operator_code})
                </SelectItem>
              ))}
              {opsQuery.data?.filter(o => !activeOperatorIds.includes(o.operator_id)).length === 0 && (
                <div className="p-2 text-sm text-muted-foreground text-center">No operators available to assign.</div>
              )}
            </SelectContent>
          </Select>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending || !opId} className="w-full">
            Confirm Assignment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
function MDetail() {
  const { id } = Route.useParams();
  const q = useQuery(queryOptions({
    queryKey: ["cust", "machine", id],
    queryFn: async () => {
      const [m, a] = await Promise.all([
        supabase.from("machines").select("*").eq("machine_id", id).single(),
        supabase.from("operator_assignments").select("*, operators(first_name,last_name,operator_code)").eq("machine_id", id).order("assignment_start_date", { ascending: false }),
      ]);
      return { m: m.data, a: a.data ?? [] };
    },
  }));
  if (q.isLoading || !q.data) return <Skeleton className="h-96 w-full" />;
  const m = q.data.m;
  if (!m) return null;

  const activeAssignments = q.data.a.filter((x) => x.status === "ACTIVE");
  const activeCount = activeAssignments.length;
  const isMaxedOut = activeCount >= 3;
  const activeOperatorIds = activeAssignments.map((x) => x.operator_id);

  const qc = useQueryClient();
  const toggleStatusMut = useMutation({
    mutationFn: async (newStatus: string) => {
      await apiFetch(`/api/machines/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
    },
    onSuccess: () => {
      toast.success("Machine status updated");
      qc.invalidateQueries({ queryKey: ["cust", "machine", id] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title={m.serial_number} 
        description={m.model_number ?? ""} 
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge status={m.status} />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => toggleStatusMut.mutate(m.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
              disabled={toggleStatusMut.isPending}
            >
              Set to {m.status === 'ACTIVE' ? 'Inactive' : 'Active'}
            </Button>
          </div>
        } 
      />
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Operator history</h3>
          <div className="flex items-center gap-3">
            {isMaxedOut && <span className="text-xs font-medium text-destructive">Max 3 active operators reached</span>}
            <AssignOperatorDialog machineId={m.machine_id} customerId={m.customer_id} disabled={isMaxedOut} activeOperatorIds={activeOperatorIds} />
          </div>
        </div>
        <div className="space-y-2">
          {q.data.a.map((x) => (
            <div key={x.assignment_id} className="flex items-center justify-between border-b border-border py-2 text-sm">
              <Link 
                to="/customer/operators/$id" 
                params={{ id: x.operator_id }}
                className="font-medium text-primary hover:underline"
              >
                {(x as any).operators?.first_name} {(x as any).operators?.last_name}
              </Link>
              <span className="text-xs text-muted-foreground">{x.assignment_start_date} → {x.assignment_end_date ?? "present"}</span>
              <StatusBadge status={x.status} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
