import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Truck,
  HardHat,
  Gauge,
  Plus,
  AlertTriangle,
  Clock,
  FileWarning,
  Map,
  Cpu,
  FileCheck,
  Smartphone,
  Quote,
  Star,
} from "lucide-react";
import craneHero from "@/assets/crane.png";
import logoImage from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f5f7] text-[#0a1628]">
      {/* Blueprint grid background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(10,22,40,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(10,22,40,0.06) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at 70% 40%, black 40%, transparent 85%)",
        }}
      />
      {/* Giant faded L5 mark */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-2rem] top-24 select-none text-[22rem] font-black leading-none tracking-tighter text-[#0a1628]/[0.04]"
        style={{ fontFamily: '"Archivo Black", "Inter", sans-serif' }}
      >
        L5
      </div>

      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/40 backdrop-blur-xl transition-all duration-300 shadow-[0_8px_32px_-12px_rgba(10,22,40,0.1)]">
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6">
          {/* Logo (Left) */}
          <Link to="/" className="flex shrink-0 items-center translate-y-1">
            <img src={logoImage} alt="Operator360 Logo" className="w-56 md:w-72 h-auto object-contain hover:opacity-90 transition-opacity" />
          </Link>
          
          {/* Centered Navigation */}
          <nav className="hidden md:flex flex-1 justify-center items-center gap-12 text-[13px] font-bold uppercase tracking-[0.1em] text-[#0a1628]/80">
            <a href="#problem" className="hover:text-[#1e5fd6] transition-colors">The Problem</a>
            <a href="#solution" className="hover:text-[#1e5fd6] transition-colors">Platform</a>
            <a href="#testimonials" className="hover:text-[#1e5fd6] transition-colors">Testimonials</a>
          </nav>

          {/* Actions (Right) */}
          <div className="flex shrink-0 items-center gap-4">
            <Button asChild variant="ghost" className="font-semibold text-[#4a5568] hover:text-[#0a1628] hover:bg-black/5 transition-colors">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild className="bg-[#1e5fd6] text-white hover:bg-[#123472] font-bold shadow-lg shadow-[#1e5fd6]/25 transition-all hover:shadow-xl hover:-translate-y-0.5 px-7 rounded-full">
              <Link to="/auth" search={{ mode: "signup" }}>
                Get started
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Right-edge vertical "LIVE OPERATIONS" tab */}
      <div className="pointer-events-none absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 lg:block">
        <div className="flex items-center gap-2 rounded-l-2xl bg-[#0a1628] px-3 py-6 text-white shadow-lg">
          <span className="size-1.5 rounded-full bg-[#22d3c5]" />
          <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-semibold uppercase tracking-[0.28em]">
            Live Operations
          </span>
        </div>
      </div>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-32 pt-12 md:pt-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.45fr)] lg:items-start">
          {/* LEFT: copy */}
          <div className="fade-in-up relative pt-2 lg:pt-10">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-[#22d3c5]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#22d3c5]">
                AI-Native Workforce OS
              </span>
            </div>
            <h1
              className="text-5xl font-black uppercase leading-[0.95] tracking-tight text-[#0a1628] md:text-6xl lg:text-[5.25rem]"
              style={{ fontFamily: '"Archivo Black", "Inter", sans-serif' }}
            >
              Command<br />center for<br />heavy{" "}
              <span className="text-[#1e5fd6]">equipment</span>
              <br />operators
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-[#4a5568]">
              Unify machines, operators, assignments, welfare benefits, and
              replacement workflows in one intelligent platform for
              manufacturers, dealers, and insurers.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Button
                asChild
                size="lg"
                className="h-14 gap-3 rounded-full bg-[#1e5fd6] px-8 text-base font-semibold text-white hover:bg-[#123472] shadow-xl shadow-[#1e5fd6]/30 transition-all hover:-translate-y-0.5 hover:shadow-2xl"
              >
                <Link to="/auth">
                  Explore the platform <ArrowRight className="size-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* RIGHT: crane hero */}
          <div className="relative min-h-[30rem] md:min-h-[36rem] lg:min-h-[42rem]">
            {/* corner plus marks */}
            <Plus className="absolute right-6 top-4 size-4 text-[#0a1628]/30 md:right-14 md:top-8" />
            <Plus className="absolute right-24 top-14 size-3 text-[#0a1628]/25 md:right-44 md:top-20" />
            {/* technical note */}
            <div className="absolute left-[16%] top-10 z-20 hidden max-w-[11rem] md:left-[24%] md:top-14 md:block">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-px w-6 bg-[#0a1628]/60" />
                <span className="h-1 w-1 rounded-full bg-[#0a1628]/60" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0a1628]/70">
                Built for<br />performance.<br />Designed for<br />reliability.
              </p>
              <div
                className="mt-3 h-2 w-16"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, #0a1628 0 2px, transparent 2px 6px)",
                }}
              />
            </div>
            {/* faint compass mark */}
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-36 left-[14%] z-10 size-28 rounded-full border border-[#0a1628]/15 md:bottom-44 md:left-[22%]"
            >
              <div className="absolute inset-2 rounded-full border border-[#0a1628]/10" />
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#0a1628]/10" />
              <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-[#0a1628]/10" />
            </div>
            <img
              src={craneHero}
              alt="Heavy-lift crawler crane"
              className="absolute bottom-[-1.5rem] right-[-8%] z-10 h-auto w-[115%] max-w-none object-contain drop-shadow-[0_30px_40px_rgba(10,22,40,0.18)] md:bottom-[-2rem] md:right-[-12%] md:w-[120%] lg:bottom-[-2.5rem] lg:right-[-16%] lg:w-[125%]"
            />
          </div>
        </div>


      </section>

      {/* --- PROBLEM SECTION --- */}
      <section id="problem" className="relative z-10 bg-[#0a1628] py-24 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 max-w-2xl">
            <h2 className="text-4xl font-black uppercase tracking-tight md:text-5xl" style={{ fontFamily: '"Archivo Black", "Inter", sans-serif' }}>
              Heavy Equipment <span className="text-[#22d3c5]">Deserves Better Operations</span>
            </h2>
            <p className="mt-4 text-[#8a9ab0] text-lg">
              Operators, machines, service teams, insurers, and customers work across disconnected systems—leading to delays, compliance gaps, and costly downtime.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: AlertTriangle, title: "Workforce Coordination", desc: "Operators, fleet managers, and customers rely on calls and messaging apps, causing assignment delays and poor visibility." },
              { icon: Clock, title: "Low Fleet Visibility", desc: "Without a unified platform, machine status, operator availability, and maintenance updates remain difficult to track in real time." },
              { icon: FileWarning, title: "Manual Compliance", desc: "Paper-based welfare logs and insurance workflows increase administrative effort and delay critical approvals." }
            ].map((item, i) => (
              <div key={i} className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 transition-all hover:border-[#22d3c5]/50 hover:bg-white/10">
                <div className="mb-6 inline-flex size-12 items-center justify-center rounded-xl bg-[#22d3c5]/20 text-[#22d3c5] group-hover:scale-110 transition-transform">
                  <item.icon className="size-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold">{item.title}</h3>
                <p className="text-sm text-[#8a9ab0] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SOLUTION BENTO GRID SECTION --- */}
      <section id="solution" className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-black uppercase tracking-tight text-[#0a1628] md:text-5xl" style={{ fontFamily: '"Archivo Black", "Inter", sans-serif' }}>
              Everything your fleet needs. <span className="text-[#1e5fd6]">One platform.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#4a5568] text-lg">
              Connect customers, machines, operators, insurance partners, and administrators through a single intelligent platform.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3 md:grid-rows-2">
            {/* Bento 1: Large */}
            <div className="md:col-span-2 relative overflow-hidden rounded-3xl border border-[#0a1628]/10 bg-white p-8 shadow-sm transition-all hover:shadow-md">
              <div className="absolute -right-10 -top-10 size-64 rounded-full bg-gradient-to-br from-[#1e5fd6]/20 to-transparent blur-3xl" />
              <Map className="mb-4 size-8 text-[#1e5fd6]" />
              <h3 className="mb-2 text-2xl font-bold text-[#0a1628]">Fleet & Operator Visibility</h3>
              <p className="max-w-md text-[#4a5568]">Monitor machine assignments, operator availability, and operational status from one centralized dashboard.</p>
            </div>
            
            {/* Bento 2: Small */}
            <div className="relative overflow-hidden rounded-3xl border border-[#0a1628]/10 bg-gradient-to-br from-[#0a1628] to-[#111f38] p-8 text-white shadow-sm transition-all hover:shadow-md">
              <Cpu className="mb-4 size-8 text-[#22d3c5]" />
              <h3 className="mb-2 text-xl font-bold">AI Operations Assistant</h3>
              <p className="text-sm text-[#8a9ab0]">Instantly answer operational questions, summarize service requests, and receive intelligent recommendations for operator management.</p>
            </div>

            {/* Bento 3: Small */}
            <div className="relative overflow-hidden rounded-3xl border border-[#0a1628]/10 bg-white p-8 shadow-sm transition-all hover:shadow-md">
              <FileCheck className="mb-4 size-8 text-[#1e5fd6]" />
              <h3 className="mb-2 text-xl font-bold text-[#0a1628]">Digital Compliance</h3>
              <p className="text-sm text-[#4a5568]">Replace manual paperwork with digital welfare logs, approval workflows, and centralized records.</p>
            </div>

            {/* Bento 4: Large */}
            <div className="md:col-span-2 relative overflow-hidden rounded-3xl border border-[#0a1628]/10 bg-white p-8 shadow-sm transition-all hover:shadow-md flex items-end">
              <div className="absolute -bottom-20 -right-20 size-80 rounded-full bg-gradient-to-tl from-[#22d3c5]/20 to-transparent blur-3xl" />
              <div className="relative z-10 w-full">
                <Smartphone className="mb-4 size-8 text-[#1e5fd6]" />
                <h3 className="mb-2 text-2xl font-bold text-[#0a1628]">Operator Experience</h3>
                <p className="max-w-md text-[#4a5568]">Give operators instant access to assigned machines, benefits, notifications, and important updates from any device.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIAL SECTION --- */}
      <section id="testimonials" className="relative z-10 bg-[#f4f5f7] py-24 border-y border-[#0a1628]/5">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Quote className="mx-auto mb-8 size-12 text-[#1e5fd6]/20" />
          <h2 className="mb-8 text-3xl font-bold leading-tight text-[#0a1628] md:text-4xl">
            "The approval workflow between our customers, insurance team, and administrators became significantly faster after adopting Operator360."
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="size-12 rounded-full bg-[#0a1628] flex items-center justify-center text-white font-bold">
              SH
            </div>
            <div className="text-left">
              <div className="font-bold text-[#0a1628]">Operations Head</div>
              <div className="text-sm text-[#4a5568]">Surmano Mining Ltd.</div>
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-1 text-[#fbbf24]">
            {[...Array(5)].map((_, i) => <Star key={i} className="size-5 fill-current" />)}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="relative z-10 overflow-hidden bg-[#0a1628] py-32">
        {/* Deep background glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] rounded-full bg-[#1e5fd6]/20 blur-[120px]" />
        
        {/* Industrial hazard stripes overlay (very faint) */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: "repeating-linear-gradient(-45deg, #ffffff, #ffffff 2px, transparent 2px, transparent 12px)" }}
        />
        
        {/* Blueprint grid with radial mask */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(circle at center, black 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(circle at center, black 30%, transparent 80%)"
          }}
        />

        {/* Large watermark text */}
        <div 
          className="pointer-events-none absolute -bottom-16 left-1/2 -translate-x-1/2 text-[15rem] font-black leading-none tracking-tighter text-white/[0.02] select-none md:text-[20rem]" 
          style={{ fontFamily: '"Archivo Black", "Inter", sans-serif' }}
        >
          360
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-6 text-4xl font-black uppercase tracking-tight text-white md:text-6xl" style={{ fontFamily: '"Archivo Black", "Inter", sans-serif' }}>
            Ready to digitalize your operations?
          </h2>
          <p className="mb-10 text-lg text-white/80">
            See how Operator360 helps manage operators, machines, approvals, and compliance from a single intelligent platform.
          </p>
          <Button
            asChild
            size="lg"
            className="h-14 rounded-full bg-[#22d3c5] px-10 text-lg font-bold text-[#0a1628] hover:bg-[#1bb8ab] shadow-xl shadow-[#22d3c5]/20 transition-transform hover:-translate-y-1"
          >
            <Link to="/auth" search={{ mode: "signup" }}>
              Request Demo <ArrowRight className="ml-2 size-5" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[#0a1628]/10 py-8 text-center text-xs text-[#4a5568]">
        © {new Date().getFullYear()} Operator360 · Built for the heavy equipment industry
      </footer>
    </div>
  );
}