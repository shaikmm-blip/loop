"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_STYLE, gradFor, initials } from "@/lib/store";
import type { Status } from "@/lib/types";

export function FadeUp({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 120, damping: 20, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Avatar({ id, name, size = 40, className }: { id: string; name: string; size?: number; className?: string }) {
  return (
    <div
      className={cn("grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-semibold text-white shadow-sm ring-2 ring-white", gradFor(id), className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </div>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset", s.chip)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className={cn("btn-ghost", className)}
      onClick={() => {
        navigator.clipboard?.writeText(text).catch(() => {});
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      {done ? "Copied" : "Copy"}
    </button>
  );
}

export function SendButton({ onSend, label = "Approve & Send", className }: { onSend?: () => void; label?: string; className?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  return (
    <button
      disabled={state !== "idle"}
      onClick={() => {
        setState("sending");
        setTimeout(() => {
          setState("sent");
          setTimeout(() => onSend?.(), 900);
        }, 700);
      }}
      className={cn(
        "btn-primary relative overflow-hidden min-w-[150px]",
        state === "sent" && "!bg-emerald-500 !shadow-[0_8px_24px_-8px_rgba(16,185,129,0.6)]",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={state}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="inline-flex items-center gap-2"
        >
          {state === "idle" && (
            <>
              <Send className="h-4 w-4" /> {label}
            </>
          )}
          {state === "sending" && (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Sending…
            </>
          )}
          {state === "sent" && (
            <>
              <Check className="h-4 w-4" /> Sent ✓
            </>
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">{children}</p>;
}
