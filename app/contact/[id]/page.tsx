"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Award, Briefcase, CalendarClock, Check, Coffee, Handshake, Heart, Lightbulb, MapPin, Megaphone, Network, Send, Sparkles } from "lucide-react";
import { AppNav } from "@/components/nav";
import { Avatar, CopyButton, SectionLabel, SendButton, StatusBadge } from "@/components/shared";
import { generateNewsFollowUp } from "@/lib/ai";
import { statusOf, timeAgo, useContacts } from "@/lib/store";
import type { Activity } from "@/lib/types";

const ACT_ICON: Record<Activity["type"], React.ReactNode> = {
  promotion: <Award className="h-4 w-4" />,
  deal: <Handshake className="h-4 w-4" />,
  post: <Megaphone className="h-4 w-4" />,
  job: <Briefcase className="h-4 w-4" />,
};

export default function ContactPage() {
  const { id } = useParams<{ id: string }>();
  const { contacts, update } = useContacts();
  const [active, setActive] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);

  if (!contacts) return <div className="min-h-screen"><AppNav /></div>;
  const c = contacts.find((x) => x.id === id);
  if (!c)
    return (
      <div className="min-h-screen">
        <AppNav />
        <div className="grid min-h-[60vh] place-items-center text-center">
          <div>
            <p className="text-lg font-semibold">Contact not found</p>
            <Link href="/dashboard" className="btn-primary mt-4">Back to dashboard</Link>
          </div>
        </div>
      </div>
    );

  const pick = (a: Activity) => {
    setActive(a.id);
    setThinking(true);
    setTimeout(() => {
      setDraft(generateNewsFollowUp(c, a));
      setThinking(false);
    }, 1100);
  };

  const sent = () => {
    const a = c.activity.find((x) => x.id === active);
    update(c.id, (x) => ({
      ...x,
      lastContact: new Date().toISOString(),
      activity: x.activity.map((y) => (y.id === active ? { ...y, seen: true } : y)),
      timeline: [...x.timeline, { date: new Date().toISOString(), text: `Sent follow-up re: ${a?.title}`, kind: "sent" }],
    }));
    setActive(null);
  };

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link href="/dashboard" className="btn-ghost -ml-3 mb-4">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#6366F1]/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar id={c.id} name={c.name} size={64} />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{c.name}</h1>
                  <StatusBadge status={statusOf(c)} />
                </div>
                <p className="text-neutral-500">{c.role} · {c.firm}</p>
                <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                  {c.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>}
                  <span className="flex items-center gap-1"><Coffee className="h-3 w-3" />Met {timeAgo(c.metAt)}</span>
                  <span>Last touch {timeAgo(c.lastContact)}</span>
                </p>
              </div>
            </div>
            <Link href="/map" className="btn-secondary self-start sm:self-auto">
              <Network className="h-4 w-4" /> {c.connections.length} connections
            </Link>
          </div>
          <p className="relative mt-6 max-w-3xl text-[15px] leading-relaxed text-neutral-700">{c.profile.summary}</p>
        </motion.div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Activity */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Recent activity</h2>
                <span className="text-xs text-neutral-400">Click any item to draft a follow-up</span>
              </div>
              <div className="mt-4 space-y-2">
                {c.activity.length === 0 && <p className="text-sm text-neutral-500">Loop is watching for news about {c.name.split(" ")[0]}. You&apos;ll see promotions, job changes and deals here.</p>}
                {c.activity.map((a) => (
                  <div key={a.id}>
                    <motion.button
                      whileHover={{ x: 3 }}
                      onClick={() => pick(a)}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${active === a.id ? "border-[#6366F1]/40 bg-[#6366F1]/[0.04]" : "border-black/[0.05] hover:border-[#6366F1]/25 hover:bg-neutral-50"}`}
                    >
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${a.type === "promotion" ? "bg-emerald-50 text-emerald-600" : a.type === "deal" ? "bg-[#6366F1]/10 text-[#6366F1]" : "bg-sky-50 text-sky-600"}`}>{ACT_ICON[a.type]}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">{a.title}</p>
                          {!a.seen && <span className="h-1.5 w-1.5 rounded-full bg-[#6366F1]" />}
                          {a.seen && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                        </div>
                        <p className="mt-0.5 text-[13px] text-neutral-500">{a.detail}</p>
                      </div>
                      <span className="shrink-0 text-xs text-neutral-400">{timeAgo(a.date)}</span>
                    </motion.button>
                    <AnimatePresence>
                      {active === a.id && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="mt-2 rounded-xl border border-[#6366F1]/20 bg-gradient-to-b from-[#6366F1]/[0.05] to-white p-4">
                            <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#6366F1]">
                              <Sparkles className="h-3 w-3" /> Follow-up · references the news + your coffee chat
                            </p>
                            {thinking ? (
                              <div className="mt-3 space-y-2">
                                {[90, 75, 85, 60].map((w, i) => (
                                  <div key={i} className="h-3 animate-pulse rounded bg-[#6366F1]/10" style={{ width: `${w}%` }} />
                                ))}
                              </div>
                            ) : (
                              <>
                                <textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="mt-3 min-h-[220px] w-full resize-none rounded-lg border border-black/[0.06] bg-white p-3 text-[13.5px] leading-relaxed outline-none focus:border-[#6366F1]/40" />
                                <div className="mt-3 flex justify-end gap-2">
                                  <CopyButton text={draft} />
                                  <SendButton onSend={sent} />
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 90-day plan */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-[#6366F1]" />
                <h2 className="font-semibold">90-day plan</h2>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {c.plan.map((s, i) => (
                  <div key={i} className={`rounded-xl border p-4 ${s.done ? "border-emerald-200 bg-emerald-50/40" : "border-black/[0.06]"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{s.when}</span>
                      {s.done ? <span className="text-[11px] font-medium text-emerald-600">Sent ✓</span> : <span className="text-[11px] text-neutral-400">Scheduled</span>}
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-[#6366F1]">{s.label}</p>
                    <p className="mt-2 line-clamp-5 text-[12.5px] leading-relaxed text-neutral-600">{s.message}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Notes */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6">
              <h2 className="font-semibold">Original notes</h2>
              <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-neutral-50 p-4 font-mono text-[12.5px] leading-relaxed text-neutral-600">{c.notes}</pre>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="card p-6">
              <div className="flex items-center gap-1.5 text-neutral-400"><Lightbulb className="h-4 w-4" /><SectionLabel>Key advice</SectionLabel></div>
              <ul className="mt-2 space-y-1.5">{c.profile.advice.map((t, i) => <li key={i} className="rounded-lg bg-neutral-50 px-3 py-2 text-[13px] leading-snug text-neutral-700">{t}</li>)}</ul>
              <div className="mt-5 flex items-center gap-1.5 text-neutral-400"><Heart className="h-4 w-4" /><SectionLabel>What they care about</SectionLabel></div>
              <ul className="mt-2 space-y-1.5">{c.profile.caresAbout.map((t, i) => <li key={i} className="rounded-lg bg-neutral-50 px-3 py-2 text-[13px] leading-snug text-neutral-700">{t}</li>)}</ul>
              <div className="mt-5 flex items-center gap-1.5 text-neutral-400"><Send className="h-4 w-4" /><SectionLabel>Follow-up hooks</SectionLabel></div>
              <ul className="mt-2 space-y-1.5">{c.profile.hooks.map((t, i) => <li key={i} className="rounded-lg bg-[#6366F1]/[0.06] px-3 py-2 text-[13px] leading-snug text-[#3730A3]">{t}</li>)}</ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="card p-6">
              <h2 className="font-semibold">Follow-up timeline</h2>
              <ol className="relative mt-4 space-y-4 border-l border-black/[0.08] pl-5">
                {[...c.timeline].reverse().map((t, i) => (
                  <li key={i} className="relative">
                    <span className={`absolute -left-[26px] top-1 h-3 w-3 rounded-full ring-4 ring-white ${t.kind === "chat" ? "bg-[#0A0A0F]" : t.kind === "sent" ? "bg-[#6366F1]" : "bg-neutral-300"}`} />
                    <p className="text-[13px] font-medium">{t.text}</p>
                    <p className="text-xs text-neutral-400">{timeAgo(t.date)}</p>
                  </li>
                ))}
              </ol>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
