"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Crown, Search, Sparkles, X } from "lucide-react";
import { AppNav } from "@/components/nav";
import { Avatar, CopyButton, SendButton } from "@/components/shared";
import { generateIntroAsk } from "@/lib/ai";
import { useIsDark } from "@/components/theme";
import { statusOf, useContacts } from "@/lib/store";
import type { Contact } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false }) as any;

type GNode = { id: string; label: string; sub: string; tier: 0 | 1 | 2; contactId?: string; x?: number; y?: number; status?: string };
type GLink = { source: string | GNode; target: string | GNode };

const SUGGEST = ["Blackstone", "Goldman Sachs", "KKR", "Andreessen Horowitz", "Bain Capital", "P&G Ventures"];

const idOf = (v: string | GNode) => (typeof v === "string" ? v : v.id);

export default function MapPage() {
  const { contacts } = useContacts();
  const router = useRouter();
  const dark = useIsDark();
  const C = dark
    ? { c1: "#E4E4E7", c2: "#121216", c2Stroke: "rgba(255,255,255,0.35)", label: "#F4F4F5", sub: "rgba(244,244,245,0.5)", hlLabel: "#A5B4FC", link: "rgba(129,140,248,0.22)" }
    : { c1: "#0A0A0F", c2: "#FFFFFF", c2Stroke: "rgba(10,10,15,0.35)", label: "#0A0A0F", sub: "rgba(10,10,15,0.5)", hlLabel: "#4338CA", link: "rgba(99,102,241,0.18)" };
  const wrap = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fg = useRef<any>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [hover, setHover] = useState<GNode | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [query, setQuery] = useState("");
  const [path, setPath] = useState<{ contact: Contact; target: { name: string; firm: string; role: string } }[] | null>(null);
  const [selected, setSelected] = useState(0);
  const [draft, setDraft] = useState<string | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const data = useMemo(() => {
    const nodes: GNode[] = [{ id: "you", label: "You", sub: "", tier: 0 }];
    const links: GLink[] = [];
    for (const c of contacts || []) {
      nodes.push({ id: c.id, label: c.name, sub: c.firm, tier: 1, contactId: c.id, status: statusOf(c) });
      links.push({ source: "you", target: c.id });
      for (const k of c.connections) {
        const nid = `${c.id}::${k.name}`;
        nodes.push({ id: nid, label: k.name, sub: `${k.role} · ${k.firm}`, tier: 2, contactId: c.id });
        links.push({ source: c.id, target: nid });
      }
    }
    return { nodes, links };
  }, [contacts]);

  const hl = useMemo(() => {
    const nodes = new Set<string>();
    const links = new Set<string>();
    if (!path || !path.length) return { nodes, links };
    const p = path[selected] || path[0];
    const tid = p.target.name === p.contact.name ? p.contact.id : `${p.contact.id}::${p.target.name}`;
    nodes.add("you").add(p.contact.id).add(tid);
    links.add(`you>${p.contact.id}`);
    if (tid !== p.contact.id) links.add(`${p.contact.id}>${tid}`);
    return { nodes, links };
  }, [path, selected]);

  useEffect(() => {
    const t = setTimeout(() => {
      fg.current?.d3Force("charge")?.strength(-160);
      fg.current?.d3Force("link")?.distance((l: GLink) => (idOf(l.source) === "you" ? 110 : 55));
      fg.current?.d3ReheatSimulation?.();
    }, 50);
    return () => clearTimeout(t);
  }, [data]);

  const runSearch = (q: string) => {
    setQuery(q);
    setDraft(null);
    setSelected(0);
    const s = q.trim().toLowerCase();
    if (!s || !contacts) return setPath(null);
    const out: { contact: Contact; target: { name: string; firm: string; role: string } }[] = [];
    for (const c of contacts) {
      if (c.firm.toLowerCase().includes(s) || c.name.toLowerCase().includes(s)) out.push({ contact: c, target: { name: c.name, firm: c.firm, role: c.role } });
      for (const k of c.connections) if (k.firm.toLowerCase().includes(s) || k.name.toLowerCase().includes(s)) out.push({ contact: c, target: k });
    }
    // warm contacts first
    const rank = { warm: 0, cooling: 1, cold: 2 } as const;
    out.sort((a, b) => rank[statusOf(a.contact)] - rank[statusOf(b.contact)]);
    setPath(out);
  };

  const cur = path && path.length ? path[selected] : null;
  const direct = cur && cur.target.name === cur.contact.name;

  return (
    <div className="flex h-screen flex-col">
      <AppNav />
      <div className="relative flex-1 overflow-hidden" onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setMouse({ x: e.clientX - r.left, y: e.clientY - r.top }); }}>
        <div ref={wrap} className="absolute inset-0 grid-bg bg-[#FAFAFA]">
          {contacts && (
            <ForceGraph2D
              ref={fg}
              width={size.w}
              height={size.h}
              graphData={data}
              backgroundColor="rgba(0,0,0,0)"
              cooldownTicks={120}
              autoPauseRedraw={false}
              onEngineStop={() => fg.current?.zoomToFit(600, 80)}
              nodeRelSize={6}
              linkColor={(l: GLink) => (hl.links.has(`${idOf(l.source)}>${idOf(l.target)}`) ? "#6366F1" : C.link)}
              linkWidth={(l: GLink) => (hl.links.has(`${idOf(l.source)}>${idOf(l.target)}`) ? 3 : idOf(l.source) === "you" ? 1.4 : 0.8)}
              linkDirectionalParticles={(l: GLink) => (hl.links.has(`${idOf(l.source)}>${idOf(l.target)}`) ? 4 : idOf(l.source) === "you" ? 1 : 0)}
              linkDirectionalParticleWidth={(l: GLink) => (hl.links.has(`${idOf(l.source)}>${idOf(l.target)}`) ? 4 : 2)}
              linkDirectionalParticleColor={() => "#6366F1"}
              linkDirectionalParticleSpeed={0.006}
              onNodeHover={(n: GNode | null) => setHover(n)}
              onNodeClick={(n: GNode) => {
                if (n.tier === 1 && n.contactId) router.push(`/contact/${n.contactId}`);
                if (n.tier === 2) runSearch(n.label);
              }}
              nodePointerAreaPaint={(n: GNode, color: string, ctx: CanvasRenderingContext2D) => {
                if (!Number.isFinite(n.x) || !Number.isFinite(n.y)) return;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(n.x!, n.y!, n.tier === 0 ? 16 : n.tier === 1 ? 10 : 6, 0, 2 * Math.PI);
                ctx.fill();
              }}
              nodeCanvasObject={(n: GNode, ctx: CanvasRenderingContext2D, scale: number) => {
                if (!Number.isFinite(n.x) || !Number.isFinite(n.y)) return;
                const t = performance.now() / 1000;
                const isHl = hl.nodes.has(n.id);
                const dim = hl.nodes.size > 0 && !isHl;
                const pulse = 1 + Math.sin(t * 2 + (n.x || 0) * 0.05) * 0.08;
                const r = (n.tier === 0 ? 14 : n.tier === 1 ? 8 : 4.5) * (n.tier === 0 || isHl ? pulse : 1);
                ctx.globalAlpha = dim ? 0.25 : 1;
                // glow
                if (n.tier === 0 || isHl || n.tier === 1) {
                  const g = ctx.createRadialGradient(n.x!, n.y!, r * 0.5, n.x!, n.y!, r * (n.tier === 0 ? 3.2 : 2.4));
                  g.addColorStop(0, n.tier === 0 || isHl ? "rgba(99,102,241,0.45)" : "rgba(99,102,241,0.14)");
                  g.addColorStop(1, "rgba(99,102,241,0)");
                  ctx.fillStyle = g;
                  ctx.beginPath();
                  ctx.arc(n.x!, n.y!, r * (n.tier === 0 ? 3.2 : 2.4), 0, 2 * Math.PI);
                  ctx.fill();
                }
                ctx.beginPath();
                ctx.arc(n.x!, n.y!, r, 0, 2 * Math.PI);
                if (n.tier === 0) ctx.fillStyle = "#6366F1";
                else if (n.tier === 1) ctx.fillStyle = isHl ? "#6366F1" : C.c1;
                else ctx.fillStyle = isHl ? "#6366F1" : C.c2;
                ctx.fill();
                if (n.tier === 2) {
                  ctx.lineWidth = 1.2;
                  ctx.strokeStyle = isHl ? "#6366F1" : C.c2Stroke;
                  ctx.stroke();
                }
                if (n.tier === 1) {
                  // status ring
                  ctx.lineWidth = 2;
                  ctx.strokeStyle = n.status === "warm" ? "#10B981" : n.status === "cooling" ? "#F59E0B" : "#94A3B8";
                  ctx.stroke();
                }
                // labels
                const fs = (n.tier === 0 ? 13 : n.tier === 1 ? 11 : 9) / Math.max(scale, 0.8);
                if (n.tier === 0) {
                  ctx.font = `600 ${fs}px Geist, ui-sans-serif, system-ui`;
                  ctx.fillStyle = "#FFFFFF";
                  ctx.textAlign = "center";
                  ctx.textBaseline = "middle";
                  ctx.fillText("You", n.x!, n.y!);
                } else if (n.tier === 1 || scale > 1.1 || isHl) {
                  ctx.textAlign = "center";
                  ctx.textBaseline = "top";
                  ctx.font = `${n.tier === 1 ? 600 : 500} ${fs}px Geist, ui-sans-serif, system-ui`;
                  ctx.fillStyle = isHl ? C.hlLabel : C.label;
                  ctx.fillText(n.label, n.x!, n.y! + r + 3);
                  ctx.font = `400 ${fs * 0.85}px Geist, ui-sans-serif, system-ui`;
                  ctx.fillStyle = C.sub;
                  ctx.fillText(n.tier === 1 ? n.sub : n.sub.split(" · ")[1] || n.sub, n.x!, n.y! + r + 3 + fs * 1.15);
                }
                ctx.globalAlpha = 1;
              }}
            />
          )}
        </div>

        {/* Top-left: search */}
        <div className="pointer-events-none absolute inset-x-0 top-0 p-4 sm:p-6">
          <div className="pointer-events-auto max-w-md">
            <div className="mb-3 flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">Network Map</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#6366F1] to-violet-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow-[0_4px_14px_-4px_rgba(99,102,241,0.8)]">
                <Crown className="h-3 w-3" /> Premium
              </span>
            </div>
            <div className="glass flex items-center gap-2 rounded-xl border border-black/[0.08] px-3 py-2.5 shadow-lg focus-within:border-[#6366F1]/50 focus-within:ring-4 focus-within:ring-[#6366F1]/10">
              <Search className="h-4 w-4 text-neutral-400" />
              <input
                value={query}
                onChange={(e) => runSearch(e.target.value)}
                placeholder="Find a path to… (e.g. Blackstone)"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
              />
              {query && (
                <button onClick={() => runSearch("")} className="text-neutral-400 hover:text-neutral-700"><X className="h-4 w-4" /></button>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SUGGEST.map((s) => (
                <button key={s} onClick={() => runSearch(s)} className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${query === s ? "border-[#6366F1] bg-[#6366F1] text-white" : "glass border-black/[0.08] text-neutral-600 hover:border-[#6366F1]/40 hover:text-[#6366F1]"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="glass pointer-events-none absolute bottom-4 left-4 hidden rounded-xl border border-black/[0.06] px-3 py-2 text-[11px] text-neutral-500 shadow sm:block">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#6366F1]" />You</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#0A0A0F]" />Your contacts</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full border border-neutral-500 bg-white" />Who they know</span>
          </div>
        </div>

        {/* Hover card */}
        <AnimatePresence>
          {hover && hover.tier !== 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="pointer-events-none absolute z-20 w-60 rounded-xl border border-black/[0.06] bg-white p-3 shadow-xl"
              style={{ left: Math.min(mouse.x + 14, size.w - 250), top: mouse.y + 14 }}
            >
              <div className="flex items-center gap-2.5">
                <Avatar id={hover.id} name={hover.label} size={32} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{hover.label}</p>
                  <p className="truncate text-xs text-neutral-500">{hover.sub}</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-neutral-400">
                {hover.tier === 1 ? "1st degree · click to open profile" : `2nd degree · via ${(contacts || []).find((c) => c.id === hover.contactId)?.name}`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Side panel */}
        <AnimatePresence>
          {cur && (
            <motion.aside
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="absolute bottom-3 right-3 top-auto z-30 max-h-[60%] w-[calc(100%-1.5rem)] overflow-y-auto rounded-2xl border border-black/[0.06] bg-white p-5 shadow-2xl sm:bottom-6 sm:right-6 sm:top-6 sm:max-h-none sm:w-[380px]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6366F1]">Warm intro path</p>
                  <p className="mt-1 text-lg font-semibold tracking-tight">{direct ? "You already know them" : `${path!.length} path${path!.length > 1 ? "s" : ""} to ${cur.target.firm}`}</p>
                </div>
                <button onClick={() => runSearch("")} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100"><X className="h-4 w-4" /></button>
              </div>

              {/* Path visual */}
              <div className="mt-5 flex items-center justify-between rounded-xl bg-[#6366F1]/[0.05] p-3">
                <PathNode label="You" sub="" you />
                <ArrowRight className="h-4 w-4 text-[#6366F1]" />
                <PathNode label={cur.contact.name} sub={cur.contact.firm} id={cur.contact.id} />
                {!direct && (
                  <>
                    <ArrowRight className="h-4 w-4 text-[#6366F1]" />
                    <PathNode label={cur.target.name} sub={cur.target.firm} id={cur.target.name} />
                  </>
                )}
              </div>

              {path!.length > 1 && (
                <div className="mt-4 space-y-1.5">
                  {path!.map((p, i) => (
                    <button key={i} onClick={() => { setSelected(i); setDraft(null); }} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition-colors ${i === selected ? "border-[#6366F1]/40 bg-[#6366F1]/[0.05]" : "border-black/[0.06] hover:bg-neutral-50"}`}>
                      <span>
                        <span className="font-semibold">{p.target.name}</span> <span className="text-neutral-500">· {p.target.role}</span>
                      </span>
                      <span className="text-neutral-400">via {p.contact.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              )}

              {!direct && (
                <div className="mt-5">
                  {!draft ? (
                    <button onClick={() => setDraft(generateIntroAsk(cur.contact, cur.target))} className="btn-primary w-full !py-3">
                      <Sparkles className="h-4 w-4" /> Draft intro ask
                    </button>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="input min-h-[240px] text-[13px] leading-relaxed" />
                      <div className="mt-3 flex justify-end gap-2">
                        <CopyButton text={draft} />
                        <SendButton onSend={() => setDraft(null)} />
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
              {direct && (
                <button onClick={() => router.push(`/contact/${cur.contact.id}`)} className="btn-primary mt-5 w-full !py-3">
                  Open {cur.contact.name.split(" ")[0]}&apos;s profile <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
        {path && path.length === 0 && (
          <div className="glass absolute bottom-6 right-6 rounded-xl border border-black/[0.06] px-4 py-3 text-sm text-neutral-600 shadow-lg">No path yet — log more coffee chats to grow your network.</div>
        )}
      </div>
    </div>
  );
}

function PathNode({ label, sub, you, id }: { label: string; sub: string; you?: boolean; id?: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center text-center">
      {you ? (
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#6366F1] text-xs font-semibold text-white shadow-[0_0_16px_rgba(99,102,241,0.7)]">You</div>
      ) : (
        <Avatar id={id || label} name={label} size={36} />
      )}
      <p className="mt-1 w-full truncate text-[11px] font-semibold">{label}</p>
      {sub && <p className="w-full truncate text-[10px] text-neutral-500">{sub}</p>}
    </div>
  );
}
