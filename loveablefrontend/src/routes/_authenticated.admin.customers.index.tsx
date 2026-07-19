import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { customersListQuery } from "@/lib/operator360/queries";
import { PageHeader } from "@/components/operator360/PageHeader";
import { StatusBadge } from "@/components/operator360/StatusBadge";
import { EmptyState } from "@/components/operator360/EmptyState";
import { TableCard, Td, Th, Tr } from "@/components/operator360/DataShell";
import { Users, Plus, Upload, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CsvUploadModal } from "@/components/operator360/CsvUploadModal";

type CustomerCategory = Database["public"]["Enums"]["customer_category"];
type ActiveStatus = Database["public"]["Enums"]["active_status"];

const customerCategories: CustomerCategory[] = ["BRONZE", "SILVER", "GOLD", "PLATINUM"];
const activeStatuses: ActiveStatus[] = ["ACTIVE", "INACTIVE"];

export const Route = createFileRoute("/_authenticated/admin/customers/")({
  head: () => ({ meta: [{ title: "Customers · Operator360" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(customersListQuery),
  component: CustomersPage,
});

function CustomersPage() {
  const { data } = useSuspenseQuery(customersListQuery);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    customer_code: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gst_number: "",
    category: "BRONZE" as CustomerCategory,
    status: "ACTIVE" as ActiveStatus,
  });

  const mut = useMutation({
    mutationFn: async (payload: typeof formData) => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customers: [payload] })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save customer");
      }
      
      const data = await res.json();
      const result = data.results[0];
      if (!result.success) {
         throw new Error(result.error || "Failed to save customer");
      }

      // 4. Send notification to the Admin
      const { data: sessionData } = await supabase.auth.getSession();
      const adminAuthId = sessionData.session?.user?.id;
      if (adminAuthId) {
        const { data: adminUser } = await supabase
          .from("users")
          .select("user_id")
          .eq("auth_user_id", adminAuthId)
          .single();
        if (adminUser?.user_id) {
          await supabase.from("notifications").insert({
            user_id: adminUser.user_id,
            title: "New Customer Added",
            message: `Successfully registered ${payload.company_name}.`,
            notification_type: "SYSTEM",
          });
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer added successfully");
      setIsModalOpen(false);
      setFormData({
        company_name: "",
        customer_code: "",
        contact_person: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        gst_number: "",
        category: "BRONZE" as CustomerCategory,
        status: "ACTIVE" as ActiveStatus,
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = data.filter((c) =>
    [c.company_name, c.customer_code, c.email, c.city].some((v) =>
      (v ?? "").toLowerCase().includes(q.toLowerCase()),
    ),
  );

  return (
    <div>
      <PageHeader
        title="Customers"
        description="All companies operating machines on the Operator360 platform."
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" /> Add customer
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
      {data.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers registered yet"
          description="Add a customer to start managing their machines and workforce."
        />
      ) : (
        <TableCard search={q} onSearch={setQ} placeholder="Search customers…">
          <table className="w-full">
            <thead>
              <tr>
                <Th>Code</Th>
                <Th>Company</Th>
                <Th>Contact</Th>
                <Th>Email</Th>
                <Th>City</Th>
                <Th>Category</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <Tr
                  key={c.customer_id}
                  onClick={() =>
                    navigate({ to: "/admin/customers/$id", params: { id: c.customer_id } })
                  }
                >
                  <Td>
                    <Link
                      to="/admin/customers/$id"
                      params={{ id: c.customer_id }}
                      className="font-medium text-primary hover:underline"
                    >
                      {c.customer_code}
                    </Link>
                  </Td>
                  <Td>{c.company_name}</Td>
                  <Td>{c.contact_person}</Td>
                  <Td className="text-muted-foreground">{c.email}</Td>
                  <Td>{c.city ?? "—"}</Td>
                  <Td>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                      {c.category}
                    </span>
                  </Td>
                  <Td>
                    <StatusBadge status={c.status} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add new customer</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Customer code (unique)</Label>
              <Input
                placeholder="e.g. ACM123"
                value={formData.customer_code}
                onChange={(e) => setFormData({ ...formData, customer_code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Company name</Label>
              <Input
                placeholder="e.g. Acme Corp"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email address</Label>
              <Input
                placeholder="e.g. john@acme.com"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Portal Password (Auto-generated)</Label>
              <Input
                disabled
                value={formData.email ? `${formData.email.split("@")[0]}@123` : ""}
                type="text"
                className="bg-muted text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label>Contact person</Label>
              <Input
                placeholder="e.g. John Doe"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone number</Label>
              <Input
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Address</Label>
              <Input
                placeholder="123 Business Park"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                placeholder="Mumbai"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input
                placeholder="Maharashtra"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Pincode</Label>
              <Input
                placeholder="400001"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>GST Number (No.)</Label>
              <Input
                placeholder="27XXXXX1234X1ZX"
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(category: CustomerCategory) =>
                  setFormData({ ...formData, category })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {customerCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(status: ActiveStatus) => setFormData({ ...formData, status })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {activeStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={
                !formData.company_name ||
                !formData.customer_code ||
                !formData.email ||
                mut.isPending
              }
              onClick={() => mut.mutate(formData)}
            >
              Save customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CsvUploadModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        title="Upload Customers CSV"
        requiredColumns={["company_name", "customer_code", "contact_person", "email"]}
        onUpload={async (parsedData) => {
          // Defaulting fields that might be missing
          const mappedData = parsedData.map((row) => ({
            company_name: row.company_name,
            customer_code: row.customer_code,
            contact_person: row.contact_person,
            email: row.email,
            phone: row.phone || null,
            address: row.address || null,
            city: row.city || null,
            state: row.state || null,
            pincode: row.pincode || null,
            gst_number: row.gst_number || null,
            category: customerCategories.includes(row.category as CustomerCategory)
              ? (row.category as CustomerCategory)
              : "BRONZE",
            status: activeStatuses.includes(row.status as ActiveStatus)
              ? (row.status as ActiveStatus)
              : "ACTIVE",
          }));

          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/customers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customers: mappedData })
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to upload customers");
          }

          const data = await res.json();
          const failed = data.results.filter((r: any) => !r.success);
          if (failed.length > 0) {
            toast.error(`${failed.length} customers failed to import. Check console for details.`);
            console.error("Failed imports:", failed);
          }
          
          const success = data.results.filter((r: any) => r.success);
          if (success.length > 0) {
            toast.success(`${success.length} customers imported successfully`);
          }

          qc.invalidateQueries({ queryKey: ["customers"] });
        }}
      />
    </div>
  );
}
