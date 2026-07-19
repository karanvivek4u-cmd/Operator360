import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import { ROLE_HOME } from "@/lib/operator360/types";
import type { AppRole } from "@/lib/operator360/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import logoImage from "@/assets/logo.png";
import { Mail, Lock, User, Briefcase, Eye, EyeOff } from "lucide-react";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in · Operator360" }] }),
  validateSearch: (s) => searchSchema.parse(s),
  component: AuthPage,
});

function AuthPage() {
  const { redirect: redirectTo } = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) routeByRole(data.session.user.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function routeByRole(uid: string) {
    try {
      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("auth_user_id", uid)
        .maybeSingle();
      const role = (data?.role ?? "ADMIN") as AppRole;
      navigate({ to: redirectTo ?? ROLE_HOME[role], replace: true });
    } catch {
      navigate({ to: "/admin/dashboard", replace: true });
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2 bg-[#f4f5f7]">
      {/* Left Pane - Dark Industrial Theme */}
      <div className="relative hidden overflow-hidden bg-[#0a1628] text-white md:block border-r border-[#0a1628]/10 shadow-2xl">
        {/* Deep background glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-[#1e5fd6]/20 blur-[100px]" />
        
        {/* Blueprint grid with radial mask */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(circle at center, black 40%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 80%)"
          }}
        />

        {/* Large watermark text */}
        <div 
          className="pointer-events-none absolute -bottom-16 left-1/2 -translate-x-1/2 text-[15rem] font-black leading-none tracking-tighter text-white/[0.02] select-none" 
          style={{ fontFamily: '"Archivo Black", "Inter", sans-serif' }}
        >
          360
        </div>
        
        <div className="relative flex h-full flex-col justify-between p-12 lg:p-16 z-10">
          <div className="max-w-xl flex-1 flex flex-col justify-center mt-12">
            <div className="mb-6 flex items-center gap-4">
              <span className="h-[2px] w-8 bg-[#22d3c5]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#22d3c5]">
                AUTHENTICATION
              </span>
            </div>
            <h2 className="text-[4rem] lg:text-[5.5rem] font-black uppercase tracking-tighter text-white leading-[0.9]" style={{ fontFamily: '"Archivo Black", "Inter", sans-serif' }}>
              The<br />Command<br /><span className="text-[#1e5fd6]">Center</span><br />For Heavy<br />Equipment
            </h2>
            <p className="mt-8 text-xl text-[#8a9ab0] leading-relaxed max-w-md font-medium">
              Manage machines, operators, benefits, and replacement workflows across all operational portals.
            </p>
          </div>
          <div className="text-[11px] font-bold tracking-[0.15em] text-white/50 uppercase">
            © {new Date().getFullYear()} Operator360 · Secure Portal
          </div>
        </div>
      </div>

      {/* Right Pane - Auth Form */}
      <div className="relative flex items-center justify-center px-6 py-12">
        {/* Subtle grid on the light side */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(10,22,40,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(10,22,40,0.06) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        
        <Card className="w-full max-w-md border border-[#0a1628]/10 p-10 shadow-[0_30px_60px_-20px_rgba(10,22,40,0.15)] relative z-10 bg-white/95 backdrop-blur-xl rounded-3xl">
          <div className="mb-10 text-center">
            <h1 className="text-[28px] font-black uppercase tracking-tight text-[#0a1628]" style={{ fontFamily: '"Archivo Black", "Inter", sans-serif' }}>Welcome Back</h1>
            <p className="mt-2 text-[15px] font-medium text-[#4a5568]">
              Sign in to your Operator360 portal
            </p>
          </div>
          <SignInForm onSuccess={(uid) => routeByRole(uid)} />
          <p className="mt-8 text-center text-xs font-medium text-[#8a9ab0] leading-relaxed">
            By continuing, you agree to Operator360's <br />
            <a href="/terms" className="text-[#1e5fd6] hover:underline font-semibold">Terms of Service</a> and <a href="/privacy" className="text-[#1e5fd6] hover:underline font-semibold">Privacy Policy</a>.
          </p>
          <div className="mt-6 text-center text-[13px] font-bold">
            <Link to="/" className="text-[#1e5fd6] hover:text-[#123472] transition-colors inline-flex items-center gap-2">
              <span aria-hidden="true">&larr;</span> Back to home
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SignInForm({ onSuccess }: { onSuccess: (uid: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Signed in");
    if (data.user) onSuccess(data.user.id);
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-5">
      <div>
        <Label htmlFor="email" className="text-xs font-semibold text-[#0a1628]">Email</Label>
        <div className="relative mt-1.5">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8a9ab0]" />
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-11 bg-white/50 border-[#0a1628]/10 text-[13px] focus-visible:ring-[#1e5fd6]"
            placeholder="you@company.com"
          />
        </div>
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <Label htmlFor="password" className="text-xs font-semibold text-[#0a1628]">Password</Label>
          <Link
            to="/forgot-password"
            className="text-[11px] font-semibold text-[#1e5fd6] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative mt-1.5">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8a9ab0]" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 h-11 bg-white/50 border-[#0a1628]/10 text-[13px] focus-visible:ring-[#1e5fd6]"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9ab0] hover:text-[#0a1628] transition-colors focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      <Button type="submit" className="w-full h-11 rounded-lg bg-[#114bc5] hover:bg-[#0c3792] text-white font-semibold text-[15px] shadow-md shadow-[#1e5fd6]/10 transition-all active:scale-[0.98] mt-2" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
