import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { myOperatorProfileQuery, myCategoryBenefitsQuery } from "@/lib/operator360/portal-queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Loader2, Send, Wrench, Shield, HeartPulse, Plus } from "lucide-react";
import truckImg from "@/assets/truck.png";

export const Route = createFileRoute("/_authenticated/operator/dashboard")({
  head: () => ({ meta: [{ title: "My Machine · Operator360" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(myOperatorProfileQuery);
    context.queryClient.ensureQueryData(myCategoryBenefitsQuery);
  },
  component: OperatorDash,
});

function OperatorDash() {
  const profile = useSuspenseQuery(myOperatorProfileQuery).data;
  const benefits = useSuspenseQuery(myCategoryBenefitsQuery).data;
  // Pick the active (or most recent) assignment from the operator profile
  const assignments: Record<string, any>[] = profile?.operator_assignments ?? [];
  const current =
    assignments.find((x) => x.status?.toUpperCase() === "ACTIVE") ?? assignments[0] ?? null;
  const activeBenefits = benefits as Record<string, any>[];

  return (
    <div>
      {/* Hero Section */}
      <div className="relative mb-8 rounded-3xl border border-slate-200/60 shadow-sm flex items-center bg-[#f7f9fc] min-h-[340px] md:aspect-[3/1]">
        {/* Full Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl">
          <img
            src={truckImg}
            alt="Operator Dashboard Background"
            className="h-full w-full object-cover object-right"
          />
        </div>

        {/* Content */}
        <div className="relative z-20 max-w-2xl px-8 py-10 md:px-12 lg:px-16 w-full">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-[2px] w-8 bg-[#1e5fd6]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#1e5fd6]">
              OPERATOR PORTAL
            </span>
          </div>
          <h1
            className="mb-4 flex flex-col font-black uppercase tracking-tight text-[#0a1628] leading-[0.95] text-5xl md:text-6xl lg:text-[5.5rem]"
            style={{ fontFamily: '"Archivo Black", "Inter", sans-serif' }}
          >
            <span>
              My <span className="text-[#1e5fd6]">machine</span>
            </span>
          </h1>
          <p className="text-lg md:text-xl font-semibold text-slate-500 max-w-md">
            Your current assignment and benefits.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Machine Card */}
        <Card className="relative overflow-hidden p-6 md:p-8 border-l-4 border-l-[#1e5fd6] border-slate-200/60 shadow-sm rounded-2xl min-h-[250px]">
          {/* Decorative Dotted Pattern (Bottom Right) */}
          <div className="absolute bottom-6 right-6 grid grid-cols-4 gap-2 opacity-30 pointer-events-none">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="size-1 rounded-full bg-[#1e5fd6]" />
            ))}
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#1e5fd6]">
              <Wrench className="size-6" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0a1628]">Current machine</h3>
              <p className="text-[13px] font-medium text-slate-500">Assigned equipment</p>
            </div>
          </div>

          {current ? (
            <div>
              <div className="text-4xl font-bold text-[#0a1628] tracking-tight mb-2">
                {(current as any).machines?.serial_number ?? current.machine_id ?? "--"}
              </div>
              <div className="mb-6 space-y-1 text-[13px] font-medium text-slate-500">
                <p>{(current as any).machines?.model_number ?? "Machine details not accessible"}</p>
                <p>
                  {(current as any).machines?.customers?.company_name ??
                    profile?.customers?.company_name ??
                    "Company not available"}
                </p>
                <p>Since {current.assignment_start_date}</p>
              </div>

              <span className="inline-flex items-center rounded-md bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-green-700">
                {current.status ?? "ACTIVE"}
              </span>
            </div>
          ) : (
            <div className="mt-8">
              <p className="text-sm font-medium text-slate-500">
                You are not currently assigned to a machine.
              </p>
            </div>
          )}
        </Card>

        {/* Active Benefits Card */}
        <Card className="p-6 md:p-8 border-l-4 border-l-[#1e5fd6] border-slate-200/60 shadow-sm rounded-2xl min-h-[250px]">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#1e5fd6]">
              <Shield className="size-6" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0a1628]">Active benefits</h3>
            </div>
          </div>

          <div className="space-y-4">
            {activeBenefits.slice(0, 4).map((benefit: Record<string, any>, i: number) => (
              <div
                key={benefit.category_benefit_id ?? i}
                className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1e5fd6]">
                    {i === 0 ? (
                      <HeartPulse className="size-4.5" strokeWidth={2} />
                    ) : (
                      <Plus className="size-4.5" strokeWidth={2} />
                    )}
                  </div>
                  <span className="text-[14px] font-bold text-[#0a1628]">
                    {benefit.benefits_master?.benefit_name ?? benefit.benefit_name}
                  </span>
                </div>
                <span className="tabular-nums font-bold text-[#1e5fd6]">
                  ₹
                  {Number(
                    benefit.benefits_master?.coverage_amount ?? benefit.coverage_amount ?? 0,
                  ).toLocaleString()}
                </span>
              </div>
            ))}

            {activeBenefits.length === 0 && (
              <p className="text-sm font-medium text-slate-500 text-center py-4">
                No benefits assigned to this category.
              </p>
            )}
          </div>
        </Card>
      </div>

      <OperatorChatPanel profile={profile} current={current} benefits={activeBenefits} />
    </div>
  );
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function OperatorChatPanel({
  profile,
  current,
  benefits,
}: {
  profile: Record<string, any> | null | undefined;
  current: Record<string, any> | null;
  benefits: Record<string, any>[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi, I can help with your assigned machine, benefits, and portal questions.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || isSending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/operator-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          context: {
            machine: (current as any)?.machines,
            company: profile?.customers,
            assignment: current,
            benefits: benefits.map((benefit) => ({
              name: benefit.benefits_master?.benefit_name ?? benefit.benefit_name,
              description: benefit.benefits_master?.description ?? benefit.description,
            })),
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Chat request failed");

      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat request failed");
      setMessages(nextMessages);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="mt-6 overflow-hidden border-l-4 border-l-[#1e5fd6] border-slate-200/60 shadow-sm rounded-2xl">
      <div className="flex items-center gap-4 border-b border-slate-100 p-6">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#1e5fd6]">
          <Bot className="size-6" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#0a1628]">Operator assistant</h3>
          <p className="text-[13px] font-medium text-slate-500">
            Ask about your machine, benefits, or next steps.
          </p>
        </div>
      </div>

      <div className="max-h-[360px] space-y-3 overflow-y-auto p-6">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.role === "user" ? "bg-[#1e5fd6] text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" /> Thinking
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 p-4">
        {error && <p className="mb-3 text-sm font-medium text-red-600">{error}</p>}
        <div className="flex gap-3">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask the assistant..."
            rows={2}
            className="resize-none"
          />
          <Button
            onClick={sendMessage}
            disabled={!draft.trim() || isSending}
            className="h-auto px-4"
          >
            {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
      </div>
    </Card>
  );
}
