import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { myOperatorsQuery } from "@/lib/operator360/portal-queries";
import { currentUserQuery } from "@/lib/operator360/queries";
import { PageHeader } from "@/components/operator360/PageHeader";
import { StatusBadge } from "@/components/operator360/StatusBadge";
import { TableCard, Td, Th, Tr } from "@/components/operator360/DataShell";
import { EmptyState } from "@/components/operator360/EmptyState";
import { HardHat, Plus, Upload, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CsvUploadModal } from "@/components/operator360/CsvUploadModal";
import { apiFetch } from "@/lib/operator360/api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/customer/operators/")({
  head: () => ({ meta: [{ title: "My Operators · Operator360" }] }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(myOperatorsQuery),
      context.queryClient.ensureQueryData(currentUserQuery)
    ]);
  },
  component: CustomerOperatorsPage,
});

function CustomerOperatorsPage() {
    const { data } = useSuspenseQuery(myOperatorsQuery);
    const me = useSuspenseQuery(currentUserQuery).data;
    const qc = useQueryClient();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
      first_name: "",
      last_name: "",
      email: "",
      mobile: "",
      aadhaar_number: "",
      dob: "",
      gender: "",
      joining_date: "",
      address: "",
      emergency_contact: ""
    });

    const mut = useMutation({
      mutationFn: async () => {
        if (!me?.customer_id) throw new Error("Customer ID missing");
        if (!formData.first_name) throw new Error("First name is required");
        
        const payload = {
          customer_id: me.customer_id,
          first_name: formData.first_name,
          last_name: formData.last_name || null,
          email: formData.email || null,
          mobile: formData.mobile || null,
          aadhaar_number: formData.aadhaar_number || null,
          dob: formData.dob || null,
          gender: formData.gender || null,
          joining_date: formData.joining_date || null,
          address: formData.address || null,
          emergency_contact: formData.emergency_contact || null,
        };

        const res = await apiFetch(`/api/operators`, {
          method: "POST",
          body: JSON.stringify(payload)
        });

        if (!res.success) {
           throw new Error(res.error || "Failed to save operator");
        }
      },
      onSuccess: () => {
        toast.success("Operator added successfully");
        setIsModalOpen(false);
        qc.invalidateQueries({ queryKey: ["me", "operators"] });
        setFormData({
          first_name: "", last_name: "", email: "", mobile: "",
          aadhaar_number: "", dob: "", gender: "", joining_date: "",
          address: "", emergency_contact: ""
        });
      },
      onError: (e: any) => toast.error(e.message),
    });

    return (
      <div>
        <PageHeader 
          title="My operators" 
          actions={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Plus className="size-4 mr-2" /> Add operator
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsModalOpen(true)}>
                  <UserPlus className="size-4 mr-2" /> Manual add
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsUploadModalOpen(true)}>
                  <Upload className="size-4 mr-2" /> Upload CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          } 
        />
        {data.length === 0 ? <EmptyState icon={HardHat} title="No operators yet" /> : (
          <TableCard>
            <table className="w-full"><thead><tr><Th>Code</Th><Th>Name</Th><Th>Mobile</Th><Th>Status</Th></tr></thead>
              <tbody>{data.map((o) => (
                <Tr key={o.operator_id}>
                  <Td><Link to="/customer/operators/$id" params={{ id: o.operator_id }} className="text-primary hover:underline">{o.operator_code}</Link></Td>
                  <Td>{o.first_name} {o.last_name ?? ""}</Td>
                  <Td>{o.mobile ?? "—"}</Td>
                  <Td><StatusBadge status={o.status} /></Td>
                </Tr>
              ))}</tbody></table>
          </TableCard>
        )}

        <CsvUploadModal
          open={isUploadModalOpen}
          onOpenChange={setIsUploadModalOpen}
          title="Upload Operators CSV"
          requiredColumns={["first_name", "email"]}
          onUpload={async (parsedData) => {
            if (!me?.customer_id) throw new Error("Customer ID missing");
            const mappedData = parsedData.map(row => ({
              customer_id: me.customer_id,
              operator_code: row.operator_code,
              first_name: row.first_name,
              last_name: row.last_name || null,
              email: row.email || null,
              mobile: row.mobile || null,
              aadhaar_number: row.aadhaar_number || null,
              dob: row.dob || null,
              gender: row.gender || null,
              joining_date: row.joining_date || null,
              address: row.address || null,
              emergency_contact: row.emergency_contact || null,
              status: row.status || "ACTIVE"
            }));
            
            const data = await apiFetch(`/api/operators/import`, {
              method: "POST",
              body: JSON.stringify({ operators: mappedData })
            });

            if (!data.success) {
              throw new Error(data.error || "Failed to upload operators");
            }
            const failed = data.results.filter(r => !r.success);
            if (failed.length > 0) {
              toast.error(`${failed.length} operators failed to import. Check console for details.`);
              console.error("Failed imports:", failed);
            }
            
            const success = data.results.filter(r => r.success);
            if (success.length > 0) {
              toast.success(`${success.length} operators imported successfully`);
            }
            
            qc.invalidateQueries({ queryKey: ["me", "operators"] });
          }}
        />

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Operator</DialogTitle>
              <DialogDescription>
                Fill in the details below. Required fields are marked with an asterisk (*).
                {formData.email && (
                  <span className="block mt-2 font-medium text-primary">
                    Default Password will be: {formData.email.split('@')[0]}@123
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>First Name <span className="text-destructive">*</span></Label>
                <Input value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} placeholder="e.g. John" />
              </div>
              <div className="space-y-2">
                <Label>Last Name <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                <Input value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} placeholder="e.g. Doe" />
              </div>
              <div className="space-y-2">
                <Label>Email <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="e.g. demo@gmail.com" />
              </div>
              <div className="space-y-2">
                <Label>Mobile <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                <Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="e.g. 9876500000" />
              </div>
              <div className="space-y-2">
                <Label>Aadhaar Number <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                <Input value={formData.aadhaar_number} onChange={e => setFormData({...formData, aadhaar_number: e.target.value})} placeholder="e.g. 1234 5678 9012" />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                <Input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Gender <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                <Input value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} placeholder="e.g. Male" />
              </div>
              <div className="space-y-2">
                <Label>Joining Date <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                <Input type="date" value={formData.joining_date} onChange={e => setFormData({...formData, joining_date: e.target.value})} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="e.g. 123 Industrial Area" />
              </div>
              <div className="space-y-2">
                <Label>Emergency Contact <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                <Input value={formData.emergency_contact} onChange={e => setFormData({...formData, emergency_contact: e.target.value})} placeholder="e.g. 9876500000" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={() => mut.mutate()} disabled={mut.isPending || !formData.first_name}>
                {mut.isPending ? "Saving..." : "Save Operator"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
}
