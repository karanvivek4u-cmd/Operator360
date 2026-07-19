import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryMasterQuery } from "@/lib/operator360/queries";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { PageHeader } from "@/components/operator360/PageHeader";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/operator360/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, Sparkles } from "lucide-react";
import { Td, Th, Tr } from "@/components/operator360/DataShell";

type CustomerCategory = Database["public"]["Enums"]["customer_category"];

export const Route = createFileRoute("/_authenticated/admin/customers/$id")({
  head: () => ({ meta: [{ title: "Customer · Operator360" }] }),
  component: CustomerWorkspace,
});

function customerQuery(id: string) {
  return queryOptions({
    queryKey: ["customer", id],
    queryFn: async () => {
      const cRes = await supabase.from("customers").select("*").eq("customer_id", id).single();
      const c = cRes.data;
      if (!c) throw new Error("Customer not found");

      const [machines, operators, requests, categoryData, benefitsData] = await Promise.all([
        supabase.from("machines").select("*").eq("customer_id", id),
        supabase.from("operators").select("*").eq("customer_id", id),
        supabase
          .from("service_requests")
          .select("*")
          .eq("customer_id", id)
          .order("created_at", { ascending: false }),
        supabase.from("category_master").select("*").eq("category_code", c.category).maybeSingle(),
        supabase
          .from("category_benefits")
          .select("*, benefits_master(*)")
          .eq("category_code", c.category),
      ]);

      return {
        customer: c,
        machines: machines.data ?? [],
        operators: operators.data ?? [],
        requests: requests.data ?? [],
        category: categoryData.data,
        benefits: benefitsData.data ?? [],
      };
    },
  });
}

function CustomerWorkspace() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(customerQuery(id));

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  const c = data.customer;
  if (!c) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
        Customer not found.{" "}
        <Link to="/admin/customers" className="text-primary hover:underline">
          Back to customers
        </Link>
      </div>
    );
  }

  const healthScore = Math.min(
    100,
    60 +
      data.operators.length * 3 +
      data.machines.length * 2 -
      data.requests.filter((r) => r.overall_status === "PENDING").length * 4,
  );

  return (
    <div>
      <PageHeader
        title={c.company_name}
        description={`${c.customer_code} · ${c.city ?? "—"}, ${c.state ?? ""}`}
        actions={
          <div className="flex items-center gap-3">
            <HealthGauge score={healthScore} />
            <StatusBadge status={c.status} />
          </div>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="machines">Machines ({data.machines.length})</TabsTrigger>
          <TabsTrigger value="operators">Operators ({data.operators.length})</TabsTrigger>
          <TabsTrigger value="requests">Requests ({data.requests.length})</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty & Benefits</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5">
              <h3 className="mb-3">Company details</h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Field label="Contact" value={c.contact_person} />
                <Field label="Email" value={c.email} />
                <Field label="Phone" value={c.phone} />
                <Field label="GST" value={c.gst_number} />
                <Field label="Address" value={c.address} />
                <Field label="Pincode" value={c.pincode} />
              </dl>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h3>Account summary</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {c.company_name} operates {data.machines.length} machine{data.machines.length !== 1 ? "s" : ""} with{" "}
                {data.operators.length} operator{data.operators.length !== 1 ? "s" : ""}. Recent activity: {data.requests.length} service
                request{data.requests.length !== 1 ? "s" : ""} logged. Health score is {healthScore}/100.
              </p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="machines" className="mt-4">
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr>
                  <Th>Serial</Th>
                  <Th>Model</Th>
                  <Th>Warranty</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {data.machines.map((m) => (
                  <Tr
                    key={m.machine_id}
                    onClick={() =>
                      navigate({ to: "/admin/machines/$id", params: { id: m.machine_id } })
                    }
                  >
                    <Td>{m.serial_number}</Td>
                    <Td>{m.model_number ?? "—"}</Td>
                    <Td className="text-muted-foreground">{m.warranty_end_date ?? "—"}</Td>
                    <Td>
                      <StatusBadge status={m.status} />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="operators" className="mt-4">
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr>
                  <Th>Code</Th>
                  <Th>Name</Th>
                  <Th>Mobile</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {data.operators.map((o) => (
                  <Tr
                    key={o.operator_id}
                    onClick={() =>
                      navigate({ to: "/admin/operators/$id", params: { id: o.operator_id } })
                    }
                  >
                    <Td>{o.operator_code}</Td>
                    <Td>
                      {o.first_name} {o.last_name ?? ""}
                    </Td>
                    <Td>{o.mobile ?? "—"}</Td>
                    <Td>
                      <StatusBadge status={o.status} />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Type</Th>
                  <Th>Insurance</Th>
                  <Th>Admin</Th>
                  <Th>Overall</Th>
                </tr>
              </thead>
              <tbody>
                {data.requests.map((r) => (
                  <Tr
                    key={r.request_id}
                    onClick={() =>
                      navigate({ to: "/admin/service-requests/$id", params: { id: r.request_id } })
                    }
                  >
                    <Td>{r.request_number}</Td>
                    <Td>{r.request_type}</Td>
                    <Td>
                      <StatusBadge status={r.insurance_status} />
                    </Td>
                    <Td>
                      <StatusBadge status={r.admin_status} />
                    </Td>
                    <Td>
                      <StatusBadge status={r.overall_status} />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="loyalty" className="mt-4">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-primary/10 p-3">
                  <Sparkles className="size-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">Category {data.category?.category_code}</h3>
                    {data.category?.category_name && (
                      <StatusBadge status={data.category.category_name} />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{data.category?.description}</p>
                  <div className="mt-4 text-3xl font-bold tabular-nums">
                    {Number(data.category?.loyalty_points ?? 0).toLocaleString()} pts
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Loyalty balance
                  </div>
                </div>
              </div>
              <ChangeCategoryDialog customerId={c.customer_id} currentCategory={c.category} />
            </div>
          </Card>

          <h3 className="mt-8 mb-4 text-lg font-semibold">Category Benefits</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.benefits.length === 0 && (
              <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
                No benefits associated with this category.
              </div>
            )}
            {data.benefits.map((b: any) => (
              <Card key={b.benefit_id} className="p-5 flex flex-col gap-2">
                <h4 className="font-semibold text-primary">{b.benefits_master?.benefit_name}</h4>
                <p className="text-sm text-muted-foreground">{b.benefits_master?.description}</p>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm">{value ?? "—"}</dd>
    </div>
  );
}

function HealthGauge({ score }: { score: number }) {
  const color = score >= 80 ? "text-success" : score >= 60 ? "text-primary" : "text-warning";
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold ${color}`}
    >
      <Sparkles className="size-3.5" /> Health {score}/100
    </div>
  );
}

function ChangeCategoryDialog({
  customerId,
  currentCategory,
}: {
  customerId: string;
  currentCategory: CustomerCategory;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<CustomerCategory>(currentCategory);
  const queryClient = useQueryClient();
  const { data: categories = [] } = useQuery(categoryMasterQuery);

  const mutation = useMutation({
    mutationFn: async (newCategory: CustomerCategory) => {
      const { error } = await supabase
        .from("customers")
        .update({ category: newCategory })
        .eq("customer_id", customerId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["customer", customerId] });
      setOpen(false);
    },
    onError: (err) => {
      toast.error("Failed to update category: " + err.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Change category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Customer Category</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Select value={selected} onValueChange={(value: CustomerCategory) => setSelected(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c: any) => (
                <SelectItem key={c.category_code} value={c.category_code}>
                  {c.category_name || `Category ${c.category_code}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate(selected)}
            disabled={selected === currentCategory || mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
