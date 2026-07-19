import { createFileRoute } from "@tanstack/react-router";
import { ProfileView } from "@/components/operator360/ProfileView";
export const Route = createFileRoute("/_authenticated/insurance/profile")({
  head: () => ({ meta: [{ title: "Profile · Operator360" }] }),
  component: () => <ProfileView />,
});
