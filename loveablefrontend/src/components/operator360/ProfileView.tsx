import { useSuspenseQuery } from "@tanstack/react-query";
import { currentUserQuery } from "@/lib/operator360/queries";
import { myCustomerProfileQuery } from "@/lib/operator360/portal-queries";
import { PageHeader } from "./PageHeader";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function ProfileView() {
  const { data: user } = useSuspenseQuery(currentUserQuery);
  const { data: customerData } = useSuspenseQuery(myCustomerProfileQuery);
  
  if (!user) return null;
  const initials = user.full_name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div>
      <PageHeader title="Profile" description="Your Operator360 account details." />
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="bg-primary text-lg text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2>{user.full_name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-primary-surface px-2 py-0.5 text-xs font-semibold text-primary">{user.role}</span>
          </div>
        </div>
        
        {customerData && (
          <div className="mt-8 grid gap-4 border-t pt-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Company Name</h3>
              <p className="mt-1 font-medium">{customerData.company_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Contact Person</h3>
              <p className="mt-1 font-medium">{customerData.contact_person}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Phone Number</h3>
              <p className="mt-1 font-medium">{customerData.phone || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
              <p className="mt-1 font-medium">{customerData.category}</p>
            </div>
            {customerData.address && (
              <div className="sm:col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                <p className="mt-1 font-medium">
                  {[customerData.address, customerData.city, customerData.state, customerData.pincode].filter(Boolean).join(", ")}
                </p>
              </div>
            )}
            {customerData.gst_number && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">GST Number</h3>
                <p className="mt-1 font-medium">{customerData.gst_number}</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}