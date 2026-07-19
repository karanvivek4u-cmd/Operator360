import { createFileRoute } from "@tanstack/react-router";
import { InsuranceQueue } from "@/components/operator360/InsuranceQueue";
export const Route = createFileRoute("/_authenticated/insurance/rejected")({
  head: () => ({ meta: [{ title: "Rejected · Operator360" }] }),
  component: () => <InsuranceQueue status="REJECTED" title="Rejected requests" />,
});
