import { useEffect } from "react";
import { useQuery, useQueryClient, useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { currentUserQuery, notificationsQuery } from "@/lib/operator360/queries";
import { PageHeader } from "./PageHeader";
import { EmptyState } from "./EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function NotificationsView() {
  const { data: user } = useSuspenseQuery(currentUserQuery);
  const qc = useQueryClient();
  const { data = [] } = useQuery(notificationsQuery(user?.user_id ?? null));

  useEffect(() => {
    if (!user?.user_id) return;
    const channel = supabase
      .channel("notif-" + user.user_id)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.user_id}` }, () => {
        qc.invalidateQueries({ queryKey: ["notifications", user.user_id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.user_id, qc]);

  const markAllReadMut = useMutation({
    mutationFn: async () => {
      if (!user?.user_id) throw new Error("Not logged in");
      
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false);
        
      if (updateError) {
        throw new Error(`Failed to update notifications: ${updateError.message}`);
      }
      
      return `Notifications dismissed successfully.`;
    },
    onSuccess: async (msg) => {
      toast.success(msg);
      // Seamlessly trigger a re-render without reloading the page
      await qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => toast.error(error.message, { duration: 10000 }),
  });

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Recent activity from Operator360."
        actions={
          <Button 
            variant="outline" 
            size="sm" 
            disabled={markAllReadMut.isPending}
            onClick={() => markAllReadMut.mutate()}
          >
            <Check className="size-4 mr-2" /> Mark all read
          </Button>
        }
      />
      {data.length === 0 ? (
        <EmptyState icon={Bell} title="All caught up!" description="No new notifications right now." />
      ) : (
        <Card className="divide-y divide-border">
          {data.map((n) => {
            const isRead = n.is_read;
            return (
              <div key={n.notification_id} className={cn("flex items-start gap-3 p-4", !isRead && "bg-primary-surface/40")}>
                <span className={cn("mt-1 size-2 shrink-0 rounded-full", isRead ? "bg-muted" : "bg-primary")} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className={cn("truncate text-sm", !isRead && "font-semibold")}>{n.title}</h3>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {n.created_at ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true }) : ""}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
