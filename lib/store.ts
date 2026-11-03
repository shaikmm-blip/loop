"use client";

import { useCallback, useEffect, useState } from "react";
import { buildSeed } from "./seed";
import type { Contact, Status } from "./types";

const KEY = "loop.contacts.v1";
const EVT = "loop:contacts";

function read(): Contact[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Contact[];
  } catch {}
  const seed = buildSeed();
  write(seed);
  return seed;
}

function write(list: Contact[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVT));
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[] | null>(null);

  useEffect(() => {
    setContacts(read());
    const on = () => setContacts(read());
    window.addEventListener(EVT, on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener(EVT, on);
      window.removeEventListener("storage", on);
    };
  }, []);

  const save = useCallback((c: Contact) => {
    const list = read();
    const i = list.findIndex((x) => x.id === c.id);
    if (i >= 0) list[i] = c;
    else list.unshift(c);
    write(list);
  }, []);

  const update = useCallback((id: string, fn: (c: Contact) => Contact) => {
    const list = read();
    const i = list.findIndex((x) => x.id === id);
    if (i >= 0) {
      list[i] = fn(list[i]);
      write(list);
    }
  }, []);

  const reset = useCallback(() => write(buildSeed()), []);

  return { contacts, save, update, reset };
}

export const daysSince = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));

export function statusOf(c: Contact): Status {
  const d = daysSince(c.lastContact);
  if (d <= 21) return "warm";
  if (d <= 75) return "cooling";
  return "cold";
}

export const STATUS_STYLE: Record<Status, { label: string; dot: string; chip: string }> = {
  warm: { label: "Warm", dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 ring-emerald-600/15" },
  cooling: { label: "Cooling", dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700 ring-amber-600/15" },
  cold: { label: "Cold", dot: "bg-slate-400", chip: "bg-slate-100 text-slate-600 ring-slate-500/15" },
};

export function timeAgo(iso: string) {
  const d = daysSince(iso);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d} days ago`;
  const m = Math.round(d / 30);
  return m === 1 ? "1 month ago" : `${m} months ago`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const GRADS = [
  "from-indigo-500 to-violet-500",
  "from-sky-500 to-indigo-500",
  "from-fuchsia-500 to-pink-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-slate-600 to-slate-800",
];
export function gradFor(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return GRADS[h % GRADS.length];
}
