import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { myRequestsQuery, myMachinesQuery, myOperatorsQuery, myAssignmentsQuery } from "@/lib/operator360/portal-queries";
import { currentUserQuery } from "@/lib/operator360/queries";
import { PageHeader } from "@/components/operator360/PageHeader";
import { StatusBadge } from "@/components/operator360/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/customer/requests")({
  head: () => ({ meta: [{ title: "Service Requests · Operator360" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(myRequestsQuery);
    context.queryClient.ensureQueryData(myMachinesQuery);
    context.queryClient.ensureQueryData(myOperatorsQuery);
    context.queryClient.ensureQueryData(myAssignmentsQuery);
  },
  component: RequestsPage,
});

function RequestsPage() {
  const { data: requests } = useSuspenseQuery(myRequestsQuery);
  return (
    <div>
      <PageHeader title="Service requests" description="Operator replacement workflow." actions={<NewRequestDialog />} />
      <Card className="divide-y divide-border">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No requests yet.</div>
        ) : requests.map((r) => (
          <div key={r.request_id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <div className="text-sm font-medium">{r.request_number}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">Machine {(r as any).machines?.serial_number ?? "—"}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Ins: </span>
                <StatusBadge status={r.insurance_status} />
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Adm: </span>
                <StatusBadge status={r.admin_status} />
              </div>
              <StatusBadge status={r.overall_status} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function NewRequestDialog() {
  const machines = useSuspenseQuery(myMachinesQuery).data;
  const operators = useSuspenseQuery(myOperatorsQuery).data;
  const assignments = useSuspenseQuery(myAssignmentsQuery).data;
  const me = useSuspenseQuery(currentUserQuery).data;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [machineId, setMachineId] = useState("");
  const [oldOp, setOldOp] = useState("");
  const [newOp, setNewOp] = useState("");
  const [comments, setComments] = useState("");

  const activeOperatorIds = assignments
    .filter((a) => a.machine_id === machineId && a.status === "ACTIVE")
    .map((a) => a.operator_id);
    
  const validOldOperators = operators.filter((o) => activeOperatorIds.includes(o.operator_id));
  const validNewOperators = operators.filter((o) => !activeOperatorIds.includes(o.operator_id));

  const mut = useMutation({
    mutationFn: async () => {
      if (!me) throw new Error("Not signed in");
      const rn = `SR-${Date.now().toString(36).toUpperCase()}`;
      const { error } = await supabase.from("service_requests").insert({
        request_number: rn,
        request_type: "OPERATOR_REPLACEMENT",
        customer_id: me.customer_id!,
        machine_id: machineId,
        old_operator_id: oldOp || null,
        new_operator_id: newOp || null,
        requested_by: me.user_id,
        customer_comments: comments,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Request submitted");
      qc.invalidateQueries({ queryKey: ["me", "requests"] });
      setOpen(false);
      setMachineId(""); setOldOp(""); setNewOp(""); setComments("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="size-4" /> New request</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Operator replacement request</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Machine</Label>
            <Select value={machineId} onValueChange={setMachineId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select a machine" /></SelectTrigger>
              <SelectContent>{machines.map((m) => <SelectItem key={m.machine_id} value={m.machine_id}>{m.serial_number} · {m.model_number ?? ""}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Old operator</Label>
              <Select value={oldOp} onValueChange={setOldOp} disabled={!machineId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {validOldOperators.map((o) => <SelectItem key={o.operator_id} value={o.operator_id}>{o.first_name} {o.last_name ?? ""}</SelectItem>)}
                  {validOldOperators.length === 0 && <div className="p-2 text-sm text-muted-foreground text-center">No active operators</div>}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>New operator</Label>
              <Select value={newOp} onValueChange={setNewOp} disabled={!machineId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {validNewOperators.map((o) => <SelectItem key={o.operator_id} value={o.operator_id}>{o.first_name} {o.last_name ?? ""}</SelectItem>)}
                  {validNewOperators.length === 0 && <div className="p-2 text-sm text-muted-foreground text-center">No operators available</div>}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Reason / comments</Label>
            <Textarea className="mt-1" value={comments} onChange={(e) => setComments(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending || !machineId}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
