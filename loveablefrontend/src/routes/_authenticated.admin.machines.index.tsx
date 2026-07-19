import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { machinesListQuery, customersListQuery } from "@/lib/operator360/queries";
import { PageHeader } from "@/components/operator360/PageHeader";
import { StatusBadge } from "@/components/operator360/StatusBadge";
import { EmptyState } from "@/components/operator360/EmptyState";
import { TableCard, Td, Th, Tr } from "@/components/operator360/DataShell";
import { Truck, Plus, Upload, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CsvUploadModal } from "@/components/operator360/CsvUploadModal";

export const Route = createFileRoute("/_authenticated/admin/machines/")({
  head: () => ({ meta: [{ title: "Machines · Operator360" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(machinesListQuery),
  component: MachinesPage,
});

function MachinesPage() {
  const { data } = useSuspenseQuery(machinesListQuery);
  const { data: customers } = useQuery(customersListQuery);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    customer_id: "", serial_number: "", model_number: "", 
    engine_number: "", purchase_date: "", warranty_end_date: "", remarks: ""
  });

  const mut = useMutation({
    mutationFn: async (payload: typeof formData) => {
      // Strip empty strings to let Supabase use defaults or NULLs
      const dbPayload = {
        ...payload,
        purchase_date: payload.purchase_date || null,
        warranty_end_date: payload.warranty_end_date || null,
        model_number: payload.model_number || null,
        engine_number: payload.engine_number || null,
        remarks: payload.remarks || null,
      };
      const { error } = await supabase.from("machines").insert(dbPayload);
      if (error) throw error;

      // Notifications Logic
      const { data: sessionData } = await supabase.auth.getSession();
      const adminAuthId = sessionData.session?.user?.id;
      let adminUserId = null;
      if (adminAuthId) {
        const { data: adminUser } = await supabase.from('users').select('user_id').eq('auth_user_id', adminAuthId).single();
        adminUserId = adminUser?.user_id;
      }

      let customerUserId = null;
      if (payload.customer_id) {
        const { data: customerUser } = await supabase.from('users').select('user_id').eq('customer_id', payload.customer_id).eq('role', 'CUSTOMER').maybeSingle();
        customerUserId = customerUser?.user_id;
      }

      if (adminUserId) {
        await supabase.from('notifications').insert({
          user_id: adminUserId,
          title: "Machine Registered",
          message: `Machine ${payload.serial_number} has been assigned to a customer.`,
          notification_type: "SYSTEM",
        });
      }

      if (customerUserId) {
        await supabase.from('notifications').insert({
          user_id: customerUserId,
          title: "New Machine Assigned",
          message: `Machine ${payload.serial_number} has been assigned to your fleet.`,
          notification_type: "SYSTEM",
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["machines"] });
      toast.success("Machine registered successfully");
      setIsModalOpen(false);
      setFormData({ 
        customer_id: "", serial_number: "", model_number: "", 
        engine_number: "", purchase_date: "", warranty_end_date: "", remarks: ""
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const filtered = data.filter((m) =>
    [m.serial_number, m.model_number, (m as any).customers?.company_name].some((v) =>
      (v ?? "").toLowerCase().includes(q.toLowerCase())
    )
  );
  return (
    <div>
      <PageHeader
        title="Machines"
        description="Every machine registered on the platform, across all customers."
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" /> Register machine
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsModalOpen(true)}>
                <PenTool className="size-4 mr-2" /> Manual register
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsUploadModalOpen(true)}>
                <Upload className="size-4 mr-2" /> Upload CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      {data.length === 0 ? (
        <EmptyState icon={Truck} title="No machines registered" description="Register a machine to begin." />
      ) : (
        <TableCard search={q} onSearch={setQ} placeholder="Search by serial, model, customer…">
          <table className="w-full">
            <thead><tr><Th>Serial</Th><Th>Model</Th><Th>Customer</Th><Th>Warranty</Th><Th>Status</Th></tr></thead>
            <tbody>
              {filtered.map((m) => (
                <Tr 
                  key={m.machine_id}
                  onClick={() => navigate({ to: '/admin/machines/$id', params: { id: m.machine_id } })}
                >
                  <Td>
                    <Link to="/admin/machines/$id" params={{ id: m.machine_id }} className="font-medium text-primary hover:underline">
                      {m.serial_number}
                    </Link>
                  </Td>
                  <Td>{m.model_number ?? "—"}</Td>
                  <Td className="text-muted-foreground">{(m as any).customers?.company_name ?? "—"}</Td>
                  <Td>{m.warranty_end_date ?? "—"}</Td>
                  <Td><StatusBadge status={m.status} /></Td>
                </Tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register new machine</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <Label>Assigned Customer <span className="text-destructive">*</span></Label>
              <Select value={formData.customer_id} onValueChange={(val) => setFormData({ ...formData, customer_id: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer..." />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((c) => (
                    <SelectItem key={c.customer_id} value={c.customer_id}>
                      {c.company_name} ({c.customer_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Serial Number <span className="text-destructive">*</span></Label>
              <Input placeholder="e.g. CAT-EX200-001" value={formData.serial_number} onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Model Number <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <Input placeholder="e.g. CAT 320D" value={formData.model_number} onChange={(e) => setFormData({ ...formData, model_number: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Engine Number <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <Input placeholder="e.g. ENG-5530-001" value={formData.engine_number} onChange={(e) => setFormData({ ...formData, engine_number: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Purchase Date <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <Input type="date" value={formData.purchase_date} onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Warranty End Date <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <Input type="date" value={formData.warranty_end_date} onChange={(e) => setFormData({ ...formData, warranty_end_date: e.target.value })} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Remarks <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <Input placeholder="Any additional details..." value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              disabled={!formData.customer_id || !formData.serial_number || mut.isPending} 
              onClick={() => mut.mutate(formData)}
            >
              Register Machine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CsvUploadModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        title="Upload Machines CSV"
        requiredColumns={["customer_id", "serial_number"]}
        onUpload={async (parsedData) => {
          const mappedData = parsedData.map(row => ({
            customer_id: row.customer_id,
            serial_number: row.serial_number,
            model_number: row.model_number || null,
            engine_number: row.engine_number || null,
            purchase_date: row.purchase_date || null,
            warranty_end_date: row.warranty_end_date || null,
            status: row.status || "UNASSIGNED",
            remarks: row.remarks || null
          }));
          
          const { error } = await supabase.from("machines").insert(mappedData);
          if (error) throw error;
          qc.invalidateQueries({ queryKey: ["machines"] });
        }}
      />
    </div>
  );
}