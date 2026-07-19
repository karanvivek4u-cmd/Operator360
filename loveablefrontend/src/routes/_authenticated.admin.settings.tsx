import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/operator360/PageHeader";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({ meta: [{ title: "Settings · Operator360" }] }),
  component: () => (
    <div>
      <PageHeader title="Settings" description="Workspace, billing, and integrations." />
      <div className="grid gap-4 md:grid-cols-2">
        {["Workspace", "Roles & permissions", "Integrations", "Billing"].map((t) => (
          <Card key={t} className="p-6"><h3>{t}</h3><p className="mt-2 text-sm text-muted-foreground">Coming soon.</p></Card>
        ))}
      </div>
    </div>
  ),
});
