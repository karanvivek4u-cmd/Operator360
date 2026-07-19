import { createFileRoute } from "@tanstack/react-router";
import { NotificationsView } from "@/components/operator360/NotificationsView";
export const Route = createFileRoute("/_authenticated/operator/notifications")({
  head: () => ({ meta: [{ title: "Notifications · Operator360" }] }),
  component: () => <NotificationsView />,
});
