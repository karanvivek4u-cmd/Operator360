import { createFileRoute } from "@tanstack/react-router";
import { InsuranceQueue } from "@/components/operator360/InsuranceQueue";
export const Route = createFileRoute("/_authenticated/insurance/approved")({
  head: () => ({ meta: [{ title: "Approved · Operator360" }] }),
  component: () => <InsuranceQueue status="APPROVED" title="Approved requests" />,
});
