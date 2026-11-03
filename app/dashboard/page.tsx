"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Newspaper, Pencil, RotateCcw, Snowflake, Thermometer, Timer, Users } from "lucide-react";
import { AppNav } from "@/components/nav";
import { Avatar, SectionLabel, SendButton, StatusBadge } from "@/components/shared";
import { generateCheckIn, generateNewsFollowUp } from "@/lib/ai";
import { daysSince, statusOf, timeAgo, useContacts } from "@/lib/store";
import type { Contact } from "@/lib/types";

type QueueItem = { contact: Contact; reason: string; kind: "news" | "time"; message: string; activityId?: string };

export default function Dashboard() {
  const { contacts, update, reset } = useContacts();

  const stats = useMemo(() => {
    const list = contacts || [];
    return {
      total: list.length,
      warm: list.filter((c) => statusOf(c) === "warm").length,
      cooling: list.filter((c) => statusOf(c) === "cooling").length,
      cold: list.filter((c) => statusOf(c) === "cold").length,
    };
  }, [contacts]);

  const queue: QueueItem[] = useMemo(() => {
    if (!contacts) return [];
    const out: QueueItem[] = [];
    for (const c of contacts) {
      if (c.queueSkippedAt && daysSince(c.queueSkippedAt) < 1) continue;
      const news = c.activity.find((a) => !a.seen && (a.type === "promotion" || a.type === "deal") && daysSince(a.date) <= 10);
      const d = daysSince(c.lastContact);
      if (news) out.push({ contact: c, kind: "news", reason: `News: ${news.title}`, message: generateNewsFollowUp(c, news), activityId: news.id });
      else if (d >= 14) out.push({ contact: c, kind: "time", reason: `${d} days since your last touchpoint`, message: generateCheckIn(c, d) });
    }
    return out.slice(0, 4);
  }, [contacts]);

  const markSent = (q: QueueItem) =>
    update(q.contact.id, (c) => ({
      ...c,
      lastContact: new Date().toISOString(),
      activity: c.activity.map((a) => (a.id === q.activityId ? { ...a, seen: true } : a)),
      timeline: [...c.timeline, { date: new Date().toISOString(), text: q.kind === "news" ? `Sent follow-up re: ${q.reason.replace("News: ", "")}` : "Sent check-in", kind: "sent" }],
    }));

  const skip = (q: QueueItem) => update(q.contact.id, (c) => ({ ...c, queueSkippedAt: new Date().toISOString() }));

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm text-neutral-500">Good to see you 👋</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Your network</h1>
          </div>
          <button onClick={reset} className="btn-ghost self-start sm:self-auto">
            <RotateCcw className="h-4 w-4" /> Reset demo data
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat icon={<Users className="h-4 w-4" />} label="Total contacts" value={stats.total} tone="text-[#6366F1] bg-[#6366F1]/10" />
          <Stat icon={<Flame className="h-4 w-4" />} label="Warm" value={stats.warm} tone="text-emerald-600 bg-emerald-50" />
          <Stat icon={<Thermometer className="h-4 w-4" />} label="Cooling" value={stats.cooling} tone="text-amber-600 bg-amber-50" />
          <Stat icon={<Snowflake className="h-4 w-4" />} label="Cold" value={stats.cold} tone="text-slate-500 bg-slate-100" />
        </div>

        {/* Queue */}
        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Today&apos;s follow-ups</h2>
              <p className="text-sm text-neutral-500">Loop drafted these. Approve, tweak, or skip.</p>
            </div>
            <span className="rounded-full bg-[#6366F1]/10 px-2.5 py-1 text-xs font-semibold text-[#6366F1]">{queue.length} ready</span>
          </div>
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {queue.map((q) => (
                <QueueCard key={q.contact.id} q={q} onSent={() => markSent(q)} onSkip={() => skip(q)} />
              ))}
            </AnimatePresence>
            {contacts && queue.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card grid place-items-center p-12 text-center">
                <p className="text-3xl">🎉</p>
                <p className="mt-2 font-semibold">Inbox zero for relationships.</p>
                <p className="text-sm text-neutral-500">Everyone in your loop is warm. Loop will ping you when there&apos;s news.</p>
              </motion.div>
            )}
          </div>
        </section>

        {/* Grid */}
        <section className="mt-14">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Everyone in your loop</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(contacts || []).map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/contact/${c.id}`}>
                  <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="card group h-full p-5 transition-shadow hover:shadow-[0_20px_40px_-20px_rgba(99,102,241,0.35)]">
                    <div className="flex items-start justify-between">
                      <Avatar id={c.id} name={c.name} size={44} />
                      <StatusBadge status={statusOf(c)} />
                    </div>
                    <p className="mt-4 font-semibold">{c.name}</p>
                    <p className="text-sm text-neutral-500">
                      {c.role} · {c.firm}
                    </p>
                    <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-neutral-600">{c.profile.advice[0]}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-black/[0.05] pt-3 text-xs text-neutral-400">
                      <span>Last touch {timeAgo(c.lastContact)}</span>
                      {c.activity.some((a) => !a.seen) && <span className="flex items-center gap-1 font-medium text-[#6366F1]"><Newspaper className="h-3 w-3" /> News</span>}
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: string }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="card p-5">
      <span className={`grid h-8 w-8 place-items-center rounded-lg ${tone}`}>{icon}</span>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="text-sm text-neutral-500">{label}</p>
    </motion.div>
  );
}

function QueueCard({ q, onSent, onSkip }: { q: QueueItem; onSent: () => void; onSkip: () => void }) {
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState(q.message);
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 60, height: 0, marginTop: 0 }} transition={{ type: "spring", stiffness: 200, damping: 24 }} className="card overflow-hidden">
      <div className="flex flex-col gap-5 p-5 md:flex-row">
        <div className="flex shrink-0 items-start gap-3 md:w-60">
          <Avatar id={q.contact.id} name={q.contact.name} size={40} />
          <div className="min-w-0">
            <Link href={`/contact/${q.contact.id}`} className="font-semibold hover:text-[#6366F1]">{q.contact.name}</Link>
            <p className="truncate text-xs text-neutral-500">{q.contact.role} · {q.contact.firm}</p>
            <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${q.kind === "news" ? "bg-[#6366F1]/10 text-[#6366F1]" : "bg-amber-50 text-amber-700"}`}>
              {q.kind === "news" ? <Newspaper className="h-3 w-3" /> : <Timer className="h-3 w-3" />}
              {q.reason}
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <SectionLabel>Drafted message</SectionLabel>
          {editing ? (
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} className="input mt-2 min-h-[160px] text-[13px] leading-relaxed" autoFocus />
          ) : (
            <p className="mt-2 line-clamp-5 whitespace-pre-line text-[13.5px] leading-relaxed text-neutral-700">{msg}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <button onClick={onSkip} className="btn-ghost">Skip</button>
            <button onClick={() => setEditing((e) => !e)} className="btn-secondary !py-2">
              <Pencil className="h-3.5 w-3.5" /> {editing ? "Done" : "Edit"}
            </button>
            <SendButton onSend={onSent} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
