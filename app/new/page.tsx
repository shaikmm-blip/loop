"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Brain, CalendarClock, Heart, Lightbulb, Sparkles, UserRound, Wand2 } from "lucide-react";
import { AppNav } from "@/components/nav";
import { Avatar, CopyButton, SectionLabel, SendButton } from "@/components/shared";
import { generateChat } from "@/lib/ai";
import { useContacts } from "@/lib/store";
import type { ChatResult, Contact } from "@/lib/types";

const SAMPLE = {
  name: "Alex Rivera",
  firm: "Bain Capital",
  role: "Private Equity Associate",
  notes: `coffee at Rohs Street Cafe, he's an FSB alum ('20)
- said the best thing I can do right now is learn to build a 3-statement model from scratch
- recommended the book "The Hard Thing About Hard Things"
- bain values people who can talk about a business like an owner, not just numbers
- he's really into cycling, did RAGBRAI last summer
- moving to the Boston office in January
- offered to send me his old modeling test if I follow up`,
};

const THINKING = ["Reading your notes…", "Building their profile…", "Finding follow-up hooks…", "Drafting your thank-you…", "Planning the next 90 days…"];

export default function NewChat() {
  const { save } = useContacts();
  const [form, setForm] = useState({ name: "", firm: "", role: "", notes: "" });
  const [phase, setPhase] = useState<"form" | "thinking" | "done">("form");
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<ChatResult | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.notes.trim()) return;
    setPhase("thinking");
    setStep(0);
    const iv = setInterval(() => setStep((s) => Math.min(s + 1, THINKING.length - 1)), 650);
    const minWait = new Promise((r) => setTimeout(r, 2800));
    let res: ChatResult;
    try {
      const r = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error("bad");
      res = await r.json();
      if (!res?.profile) throw new Error("bad");
    } catch {
      res = generateChat(form);
    }
    await minWait;
    clearInterval(iv);
    setResult(res);
    setPhase("done");
    // auto-save the contact
    const id = `${form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const c: Contact = {
      id,
      name: form.name.trim(),
      firm: form.firm.trim() || "—",
      role: form.role.trim() || "Professional",
      location: "",
      sector: "",
      metAt: now,
      lastContact: now,
      notes: form.notes,
      profile: res.profile,
      thankYou: res.thankYou,
      plan: res.plan,
      activity: [],
      connections: [],
      timeline: [{ date: now, text: `Coffee chat with ${form.name.split(" ")[0]}`, kind: "chat" }],
    };
    save(c);
    setSavedId(id);
  };

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <AnimatePresence mode="wait">
          {phase === "form" && (
            <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ type: "spring", stiffness: 140, damping: 20 }}>
              <div className="mb-8 max-w-2xl">
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#6366F1]/10 px-2.5 py-1 text-xs font-medium text-[#6366F1]">
                  <Sparkles className="h-3.5 w-3.5" /> New coffee chat
                </span>
                <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">Who did you just meet?</h1>
                <p className="mt-3 text-neutral-500">Dump your notes — Loop turns them into a profile, a thank-you that references specifics, and a 90-day plan.</p>
              </div>
              <form onSubmit={submit} className="card p-5 sm:p-7">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Name">
                    <input className="input" placeholder="Alex Rivera" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </Field>
                  <Field label="Firm">
                    <input className="input" placeholder="Bain Capital" value={form.firm} onChange={(e) => setForm({ ...form, firm: e.target.value })} />
                  </Field>
                  <Field label="Role">
                    <input className="input" placeholder="PE Associate" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                  </Field>
                </div>
                <div className="mt-4">
                  <Field label="Paste your coffee chat notes (messy is fine)">
                    <textarea
                      className="input min-h-[220px] resize-y font-mono text-[13px] leading-relaxed"
                      placeholder={"- FSB alum, been at the firm 4 yrs\n- said to learn modeling early\n- into cycling\n- offered to send practice test"}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      required
                    />
                  </Field>
                </div>
                <div className="mt-5 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                  <button type="button" onClick={() => setForm(SAMPLE)} className="btn-ghost justify-start">
                    <Wand2 className="h-4 w-4" /> Try with sample notes
                  </button>
                  <button type="submit" className="btn-primary !py-3 !px-6" disabled={!form.name || !form.notes}>
                    <Sparkles className="h-4 w-4" /> Build with Loop
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {phase === "thinking" && (
            <motion.div key="thinking" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="grid min-h-[60vh] place-items-center">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-8 h-24 w-24">
                  <motion.div className="absolute inset-0 rounded-full bg-[#6366F1]/20 blur-2xl" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-[#6366F1]/20 border-t-[#6366F1]"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
                  />
                  <div className="absolute inset-3 grid place-items-center rounded-full bg-white shadow-lg">
                    <Brain className="h-8 w-8 text-[#6366F1]" />
                  </div>
                </div>
                <p className="shimmer text-2xl font-semibold tracking-tight">Loop is thinking…</p>
                <AnimatePresence mode="wait">
                  <motion.p key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-3 text-sm text-neutral-500">
                    {THINKING[step]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {phase === "done" && result && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Results form={form} result={result} savedId={savedId} onReset={() => { setForm({ name: "", firm: "", role: "", notes: "" }); setPhase("form"); }} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  );
}

const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };

function Results({ form, result, savedId, onReset }: { form: typeof SAMPLE; result: ChatResult; savedId: string | null; onReset: () => void }) {
  const [thankYou, setThankYou] = useState(result.thankYou);
  const p = result.profile;
  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.12 } } }} className="space-y-6">
      <motion.div variants={item} className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/15">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Saved to your network
          </span>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{form.name} is in your loop.</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={onReset} className="btn-secondary">Log another</button>
          {savedId && (
            <Link href={`/contact/${savedId}`} className="btn-primary">
              View profile <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Profile */}
        <motion.div variants={item} className="card p-6 lg:col-span-2">
          <div className="flex items-center gap-3">
            <Avatar id={savedId || form.name} name={form.name} size={48} />
            <div>
              <p className="font-semibold">{form.name}</p>
              <p className="text-sm text-neutral-500">
                {form.role || "Professional"} · {form.firm || "—"}
              </p>
            </div>
          </div>
          <div className="mt-5">
            <SectionLabel>Who they are</SectionLabel>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">{p.summary}</p>
          </div>
          <ProfileList icon={<Lightbulb className="h-4 w-4" />} title="Key advice" items={p.advice} />
          <ProfileList icon={<Heart className="h-4 w-4" />} title="What they care about" items={p.caresAbout} />
          <ProfileList icon={<UserRound className="h-4 w-4" />} title="Follow-up hooks" items={p.hooks} accent />
        </motion.div>

        {/* Thank you */}
        <motion.div variants={item} className="card flex flex-col p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <SectionLabel>Personalized thank-you</SectionLabel>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#6366F1]/10 px-2 py-0.5 text-[11px] font-medium text-[#6366F1]">
              <Sparkles className="h-3 w-3" /> {result.source === "claude" ? "Written by Claude" : "Written by Loop"}
            </span>
          </div>
          <textarea
            value={thankYou}
            onChange={(e) => setThankYou(e.target.value)}
            className="mt-3 min-h-[320px] flex-1 resize-none rounded-xl border border-black/[0.06] bg-neutral-50/60 p-4 text-[14px] leading-relaxed text-neutral-800 outline-none focus:border-[#6366F1]/40 focus:bg-white"
          />
          <div className="mt-4 flex items-center justify-end gap-2">
            <CopyButton text={thankYou} />
            <SendButton label="Send" />
          </div>
        </motion.div>
      </div>

      {/* 90 day plan */}
      <motion.div variants={item} className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-[#6366F1]" />
          <SectionLabel>Your 90-day plan</SectionLabel>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {result.plan.map((s, i) => (
            <motion.div key={i} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="relative flex flex-col rounded-xl border border-black/[0.06] bg-gradient-to-b from-white to-neutral-50/70 p-5">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#0A0A0F] text-[11px] font-semibold text-white">{i + 1}</span>
                <span className="text-sm font-semibold">In {s.when}</span>
              </div>
              <p className="mt-1 text-xs font-medium text-[#6366F1]">{s.label}</p>
              <p className="mt-3 flex-1 text-[13px] leading-relaxed text-neutral-600">{s.message}</p>
              <div className="mt-3 flex justify-end">
                <CopyButton text={s.message} className="!px-2 !py-1 text-xs" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProfileList({ icon, title, items, accent }: { icon: React.ReactNode; title: string; items: string[]; accent?: boolean }) {
  return (
    <div className="mt-5">
      <div className="flex items-center gap-1.5 text-neutral-400">
        {icon}
        <SectionLabel>{title}</SectionLabel>
      </div>
      <ul className="mt-2 space-y-1.5">
        {items.map((t, i) => (
          <li key={i} className={`rounded-lg px-3 py-2 text-[13px] leading-snug ${accent ? "bg-[#6366F1]/[0.06] text-[#3730A3]" : "bg-neutral-50 text-neutral-700"}`}>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
