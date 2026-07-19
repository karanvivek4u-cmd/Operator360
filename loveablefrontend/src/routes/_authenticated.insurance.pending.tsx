import { createFileRoute } from "@tanstack/react-router";
import { InsuranceQueue } from "@/components/operator360/InsuranceQueue";
export const Route = createFileRoute("/_authenticated/insurance/pending")({
  head: () => ({ meta: [{ title: "Pending · Operator360" }] }),
  component: () => <InsuranceQueue status="PENDING" title="Pending requests" showActions />,
});
