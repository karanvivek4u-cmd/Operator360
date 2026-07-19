import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { myOperatorProfileQuery } from "@/lib/operator360/portal-queries";
import { currentUserQuery } from "@/lib/operator360/queries";
import { PageHeader } from "@/components/operator360/PageHeader";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, Phone, Mail, IdCard, Wrench, Calendar } from "lucide-react";

export const Route = createFileRoute("/_authenticated/operator/profile")({
  head: () => ({ meta: [{ title: "Profile · Operator360" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(myOperatorProfileQuery);
    context.queryClient.ensureQueryData(currentUserQuery);
  },
  component: OperatorProfile,
});

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1e5fd6]">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-[14px] font-bold text-[#0a1628]">{value}</p>
      </div>
    </div>
  );
}

function OperatorProfile() {
  const { data: user } = useSuspenseQuery(currentUserQuery);
  const profile = useSuspenseQuery(myOperatorProfileQuery).data;
  if (!user) return null;

  const initials = (profile?.first_name?.[0] ?? "") + (profile?.last_name?.[0] ?? "");
  const fullName = profile
    ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
    : user.full_name;
  const company = profile?.customers as any;
  const assignments: any[] = profile?.operator_assignments ?? [];
  const activeAssignment =
    assignments.find((a) => a.status?.toUpperCase() === "ACTIVE") ?? assignments[0];
  const machine = activeAssignment?.machines;

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Your personal details and company information." />

      {/* Identity Card */}
      <Card className="p-6 border-slate-200/60 shadow-sm rounded-2xl">
        <div className="flex items-center gap-5 mb-6">
          <Avatar className="size-20 border-2 border-[#1e5fd6]/20">
            <AvatarFallback className="bg-[#1e5fd6]/10 text-[#1e5fd6] text-2xl font-black">
              {initials.toUpperCase() || "OP"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-black text-[#0a1628]">{fullName}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
            <span className="mt-2 inline-block rounded-full bg-blue-50 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-[#1e5fd6]">
              Operator
            </span>
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-2">
          <div className="md:pr-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Personal Details
            </p>
            <InfoRow icon={IdCard} label="Operator Code" value={profile?.operator_code} />
            <InfoRow icon={Phone} label="Phone" value={profile?.mobile} />
            <InfoRow icon={Mail} label="Email" value={profile?.email ?? user.email} />
            <InfoRow icon={Calendar} label="Date of Birth" value={profile?.dob} />
          </div>

          <div className="md:pl-6 md:border-l md:border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Company
            </p>
            <InfoRow icon={Building2} label="Company Name" value={company?.company_name} />
            <InfoRow icon={Mail} label="Company Email" value={company?.email} />
            <InfoRow icon={Phone} label="Company Phone" value={company?.phone} />
          </div>
        </div>
      </Card>

      {/* Current Machine */}
      {machine && (
        <Card className="p-6 border-l-4 border-l-[#1e5fd6] border-slate-200/60 shadow-sm rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1e5fd6]">
              <Wrench className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0a1628]">Assigned Machine</h3>
              <p className="text-xs text-slate-400">Your current equipment</p>
            </div>
            <span className="ml-auto inline-flex items-center rounded-md bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-green-700">
              {activeAssignment?.status ?? "ACTIVE"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Serial No.
              </p>
              <p className="text-lg font-black text-[#0a1628]">
                {machine.serial_number ?? activeAssignment?.machine_id ?? "--"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Company
              </p>
              <p className="text-lg font-black text-[#0a1628]">
                {machine.customers?.company_name ?? company?.company_name ?? "--"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Model
              </p>
              <p className="text-lg font-black text-[#0a1628]">{machine.model_number ?? "--"}</p>
            </div>
          </div>
          {activeAssignment?.assignment_start_date && (
            <p className="mt-3 text-xs text-slate-400">
              Assigned since{" "}
              <span className="font-semibold text-slate-600">
                {activeAssignment.assignment_start_date}
              </span>
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
