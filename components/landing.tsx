"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Bell, Brain, Check, ClipboardPaste, CreditCard, Linkedin, Mail, MessageCircle, Sparkles, StickyNote, Users, X } from "lucide-react";
import { Logo } from "./nav";
import { FadeUp } from "./shared";
import { ThemeToggle } from "./theme";
import { cn } from "@/lib/utils";

/* ---------------- Landing nav (overlays hero) ---------------- */
export function LandingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-2xl border border-black/[0.06] px-4 py-2.5 glass shadow-[0_8px_30px_-12px_rgba(10,10,15,0.12)] mx-3 sm:mx-auto">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          <a href="#gone-cold" className="btn-ghost">Why Loop</a>
          <a href="#how" className="btn-ghost">How it works</a>
          <a href="#pricing" className="btn-ghost">Pricing</a>
          <Link href="/map" className="btn-ghost">Network Map</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="btn-ghost hidden sm:inline-flex">Dashboard</Link>
          <ThemeToggle />
          <Link href="/new" className="btn-primary !px-4 !py-2">Start free</Link>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Gone Cold ---------------- */
type ColdCard = {
  kind: "linkedin" | "imessage" | "email" | "card" | "note";
  title: string;
  body: string;
  meta: string;
  reply: string;
  rot: number;
};

const COLD: ColdCard[] = [
  { kind: "linkedin", title: "LinkedIn · Jordan Ellis", body: "Thanks so much for your time today! Would love to stay in touch 🙏", meta: "Last message: 8 months ago", reply: "Jordan — congrats on the move to Evercore! Your advice on paper LBOs got me through my first superday.", rot: -2 },
  { kind: "imessage", title: "iMessage · Priya", body: "Great meeting you at the career fair! Let's grab coffee soon", meta: "Read 5 months ago · no reply", reply: "Hey Priya! Saw P&G Ventures just led a seed round — still down for that coffee? My treat ☕", rot: 1.5 },
  { kind: "linkedin", title: "LinkedIn · Tom Hughes", body: "You're now connected with Tom Hughes, Principal at Blackstone", meta: "Connected 1 year ago · 0 messages since", reply: "Tom — loved your post on data center infra. Would you have 15 min to share how you made the jump to PE?", rot: -1 },
  { kind: "email", title: "Email · Re: Coffee chat", body: "Thank you for the coffee chat!", meta: "Sent Oct 2025. Nothing after.", reply: "Hi Marcus — I built my 60-second story like you suggested. It worked: I landed a superday at Fifth Third!", rot: 2 },
  { kind: "card", title: "Sarah Chen, VP — Blackstone", body: "follow up??", meta: "2 semesters ago", reply: "Sarah — congrats on the $150M close! Your 10-K tip changed how I prep for every interview.", rot: -2.5 },
  { kind: "note", title: "Notes app", body: "Met at Startup Weekend — what was his name again?", meta: "Jake Morrison · Founder, Lumen Health", reply: "Jake! Congrats on the $4M seed. I talked to 50 customers like you said — would love to chat about the growth intern role.", rot: 1 },
];

const ICONS = {
  linkedin: <Linkedin className="h-3.5 w-3.5" />,
  imessage: <MessageCircle className="h-3.5 w-3.5" />,
  email: <Mail className="h-3.5 w-3.5" />,
  card: <Users className="h-3.5 w-3.5" />,
  note: <StickyNote className="h-3.5 w-3.5" />,
};

function ColdUICard({ c, warm, i }: { c: ColdCard; warm: boolean; i: number }) {
  return (
    <motion.div
      className="floaty"
      style={{ animationDelay: `${i * 0.7}s` }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08, type: "spring", stiffness: 90, damping: 18 }}
    >
      <motion.div
        animate={{ filter: warm ? "grayscale(0) blur(0px)" : "grayscale(0.9) blur(0.6px)", rotate: warm ? 0 : c.rot }}
        transition={{ duration: 0.9, delay: warm ? 0.25 + i * 0.18 : 0 }}
        className="relative"
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border p-4 shadow-[0_10px_30px_-15px_rgba(10,10,15,0.25)] transition-colors duration-1000",
            c.kind === "card" ? "bg-[#FFFDF7]" : "bg-white",
            warm ? "border-[#6366F1]/25" : "border-sky-200/70"
          )}
          style={{ transitionDelay: warm ? `${250 + i * 180}ms` : "0ms" }}
        >
          {/* frost */}
          <motion.div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-100/80 via-sky-50/70 to-blue-100/60 backdrop-blur-[1px]"
            animate={{ opacity: warm ? 0 : 1 }}
            transition={{ duration: 1, delay: warm ? 0.25 + i * 0.18 : 0 }}
          />
          <div className="relative">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
              <span className={cn("grid h-5 w-5 place-items-center rounded-md", c.kind === "linkedin" ? "bg-[#0A66C2] text-white" : c.kind === "imessage" ? "bg-emerald-500 text-white" : c.kind === "email" ? "bg-neutral-800 text-white" : "bg-amber-100 text-amber-700")}>
                {ICONS[c.kind]}
              </span>
              {c.title}
            </div>
            {c.kind === "imessage" ? (
              <div className="mt-3 inline-block max-w-[90%] rounded-2xl rounded-br-md bg-[#0A84FF] px-3 py-2 text-[13px] text-white">{c.body}</div>
            ) : c.kind === "card" ? (
              <div className="relative mt-3">
                <p className="font-serif text-base font-semibold">Sarah Chen</p>
                <p className="text-xs text-neutral-500">Vice President · Blackstone</p>
                <span className="absolute -right-1 -top-3 rotate-6 rounded-sm bg-yellow-200 px-2 py-1 font-mono text-[11px] text-neutral-700 shadow">{c.body}</span>
              </div>
            ) : (
              <p className="mt-3 text-[13px] leading-snug text-neutral-800">{c.body}</p>
            )}
            <p className="mt-3 text-[11px] text-sky-700/80">{c.meta}</p>
          </div>
        </div>

        <AnimatePresence>
          {warm && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              transition={{ delay: 0.6 + i * 0.18, type: "spring", stiffness: 120, damping: 18 }}
              className="overflow-hidden"
            >
              <div className="mt-2 rounded-xl border border-[#6366F1]/20 bg-gradient-to-br from-[#6366F1]/[0.07] to-white p-3 shadow-[0_8px_24px_-12px_rgba(99,102,241,0.45)]">
                <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#6366F1]">
                  <Sparkles className="h-3 w-3" /> Loop drafted
                </p>
                <p className="text-[12.5px] leading-snug text-neutral-700">{c.reply}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export function GoneCold() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-35% 0px -35% 0px" });
  return (
    <section id="gone-cold" className="relative overflow-hidden bg-gradient-to-b from-[#FAFAFA] via-sky-50/40 to-[#FAFAFA] py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeUp className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600">Gone cold</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.035em] sm:text-6xl">Every connection you&apos;ve ever lost.</h2>
        </FadeUp>

        <div ref={ref} className="relative mt-16">
          {/* sweeping indigo line */}
          <motion.div
            className="pointer-events-none absolute left-0 right-0 top-1/2 z-10 h-[2px] origin-left bg-gradient-to-r from-transparent via-[#6366F1] to-transparent shadow-[0_0_24px_4px_rgba(99,102,241,0.5)]"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={inView ? { scaleX: [0, 1, 1], opacity: [0, 1, 0] } : {}}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COLD.map((c, i) => (
              <ColdUICard key={i} c={c} warm={inView} i={i} />
            ))}
          </div>
        </div>

        <FadeUp className="mt-16 text-center">
          <p className="mx-auto max-w-xl text-lg text-neutral-600 sm:text-xl">
            You met them. You meant to follow up. <span className="font-semibold text-[#0A0A0F]">Loop makes sure you do.</span>
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

/* ---------------- How it works ---------------- */
const STEPS = [
  { icon: <ClipboardPaste className="h-5 w-5" />, title: "Paste your notes", body: "Right after the coffee chat, dump whatever you remember. Bullet points, typos, half-sentences — all fine." },
  { icon: <Brain className="h-5 w-5" />, title: "Loop builds their profile", body: "AI pulls out their advice, what they care about, and follow-up hooks — then writes a thank-you that references specifics." },
  { icon: <Bell className="h-5 w-5" />, title: "Never go cold", body: "Loop watches for promotions, job changes and deals, then drafts a timely follow-up. Approve and send in one tap." },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeUp className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6366F1]">How it works</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Thirty seconds after coffee. Relationships for years.</h2>
        </FadeUp>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <FadeUp key={i} delay={i * 0.1}>
              <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="card group relative h-full overflow-hidden p-7">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#6366F1]/0 blur-2xl transition-colors duration-500 group-hover:bg-[#6366F1]/15" />
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#0A0A0F] text-white shadow-[0_8px_20px_-8px_rgba(99,102,241,0.7)]">{s.icon}</span>
                  <span className="font-mono text-sm text-neutral-300">0{i + 1}</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">{s.body}</p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pricing ---------------- */
const PLANS = [
  { name: "Free", price: "$0", per: "", blurb: "For your first few coffee chats.", features: ["Up to 10 contacts", "AI thank-you messages", "Warm / cooling / cold tracking"], cta: "Start free" },
  { name: "Pro", price: "$10", per: "/mo", blurb: "For students actively recruiting.", features: ["Unlimited contacts", "News tracking — promotions, job changes, firm deals", "AI follow-ups tied to news", "One-tap send"], cta: "Go Pro", popular: true },
  { name: "Premium", price: "$20", per: "/mo", blurb: "For finding the warm intro.", features: ["Everything in Pro", "Network Map", "Warm Intro Finder", "Recruiting Season Mode", "Relationship Score by firm"], cta: "Go Premium" },
  { name: "Organizations", price: "Custom", per: "", blurb: "SEPi chapters, business fraternities, career centers.", features: ["Member dashboard", "Shared alumni network", "Chapter leaderboard"], cta: "Talk to us" },
];

export function Pricing() {
  const [checkout, setCheckout] = useState<string | null>(null);
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-20 mx-auto h-72 max-w-3xl rounded-full bg-[#6366F1]/10 blur-[100px]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <FadeUp className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6366F1]">Pricing</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Cheaper than one missed offer.</h2>
          <p className="mt-4 text-neutral-500">Start free. Upgrade when recruiting season hits.</p>
        </FadeUp>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p, i) => (
            <FadeUp key={p.name} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border p-6",
                  p.popular
                    ? "border-[#6366F1]/40 bg-[#0A0A0F] text-white shadow-[0_20px_60px_-20px_rgba(99,102,241,0.65)]"
                    : "card"
                )}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-6 rounded-full bg-[#6366F1] px-2.5 py-1 text-[11px] font-semibold text-white shadow-[0_6px_20px_-4px_rgba(99,102,241,0.8)]">
                    Most popular
                  </span>
                )}
                <p className={cn("text-sm font-semibold", p.popular ? "text-[#A5B4FC]" : "text-neutral-500")}>{p.name}</p>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
                  <span className={cn("text-sm", p.popular ? "text-white/50" : "text-neutral-400")}>{p.per}</span>
                </p>
                <p className={cn("mt-2 text-sm", p.popular ? "text-white/60" : "text-neutral-500")}>{p.blurb}</p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2 text-[13.5px] leading-snug">
                      <Check className={cn("mt-0.5 h-4 w-4 shrink-0", p.popular ? "text-[#A5B4FC]" : "text-[#6366F1]")} />
                      <span className={p.popular ? "text-white/85" : "text-neutral-700"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setCheckout(p.name)}
                  className={cn("mt-7 w-full", p.popular ? "btn-primary !py-3" : "btn-secondary !py-3")}
                >
                  {p.cta}
                </button>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
      <CheckoutModal plan={checkout} onClose={() => setCheckout(null)} />
    </section>
  );
}

function CheckoutModal({ plan, onClose }: { plan: string | null; onClose: () => void }) {
  const [stage, setStage] = useState<"pay" | "done">("pay");
  const p = PLANS.find((x) => x.name === plan);
  const close = () => {
    onClose();
    setTimeout(() => setStage("pay"), 300);
  };
  return (
    <AnimatePresence>
      {p && (
        <motion.div className="fixed inset-0 z-[100] grid place-items-center bg-[#0A0A0F]/40 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl"
          >
            <button onClick={close} className="absolute right-4 top-4 rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
            {stage === "pay" ? (
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-600/15">Test mode</span>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">Loop {p.name}</h3>
                <p className="text-sm text-neutral-500">
                  {p.price}
                  {p.per} {p.name === "Organizations" ? "— we'll tailor a plan for your chapter" : "· cancel anytime"}
                </p>
                <div className="mt-5 space-y-3">
                  <div className="input flex items-center justify-between !py-3 text-neutral-500">
                    <span className="font-mono text-[13px]">4242 4242 4242 4242</span>
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="input !py-3 font-mono text-[13px] text-neutral-500">12 / 34</div>
                    <div className="input !py-3 font-mono text-[13px] text-neutral-500">123</div>
                  </div>
                </div>
                <button onClick={() => setStage("done")} className="btn-primary mt-6 w-full !py-3">
                  {p.name === "Organizations" ? "Request a demo" : `Subscribe — ${p.price}${p.per}`}
                </button>
                <p className="mt-3 text-center text-[11px] text-neutral-400">Demo checkout. No real card is charged.</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 14 }}
                  className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_10px_30px_-8px_rgba(16,185,129,0.7)]"
                >
                  <Check className="h-8 w-8" strokeWidth={3} />
                </motion.div>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight">Test checkout complete ✓</h3>
                <p className="mt-2 text-sm text-neutral-500">Welcome to Loop {p.name}. Your network just got a lot harder to lose.</p>
                <div className="mt-6 flex justify-center gap-2">
                  <Link href={p.name === "Premium" ? "/map" : "/dashboard"} className="btn-primary">
                    {p.name === "Premium" ? "Open Network Map" : "Go to dashboard"}
                  </Link>
                  <button onClick={close} className="btn-secondary">Close</button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- CTA + Footer ---------------- */
export function FinalCTA() {
  return (
    <section className="px-4 pb-24 sm:px-6">
      <FadeUp className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#0A0A0F] px-6 py-16 text-center text-white sm:px-12">
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-[#6366F1]/40 blur-[100px]" />
        <h2 className="relative text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">Your next offer is already in your network.</h2>
        <p className="relative mx-auto mt-4 max-w-lg text-white/60">Log your last coffee chat. It takes 30 seconds.</p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/new" className="btn-primary !px-6 !py-3">Start free</Link>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10">
            View demo dashboard
          </Link>
        </div>
      </FadeUp>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-black/[0.06] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <Logo />
        <p className="text-sm text-neutral-500">Built at the FSB AI Build-a-thon.</p>
        <p className="text-sm text-neutral-400">Never lose a connection again.</p>
      </div>
    </footer>
  );
}
