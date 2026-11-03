export type Status = "warm" | "cooling" | "cold";

export interface Profile {
  summary: string;
  advice: string[];
  caresAbout: string[];
  hooks: string[];
}

export interface PlanStep {
  when: string; // "2 weeks" | "1 month" | "3 months"
  label: string;
  message: string;
  done?: boolean;
}

export interface Activity {
  id: string;
  type: "promotion" | "deal" | "post" | "job";
  title: string;
  detail: string;
  date: string; // ISO
  seen?: boolean;
}

export interface Connection {
  name: string;
  firm: string;
  role: string;
}

export interface TimelineItem {
  date: string;
  text: string;
  kind: "chat" | "sent" | "news" | "skip";
}

export interface Contact {
  id: string;
  name: string;
  firm: string;
  role: string;
  location: string;
  sector: string;
  metAt: string;
  lastContact: string;
  notes: string;
  profile: Profile;
  thankYou: string;
  plan: PlanStep[];
  activity: Activity[];
  connections: Connection[];
  timeline: TimelineItem[];
  queueSkippedAt?: string;
}

export interface ChatResult {
  profile: Profile;
  thankYou: string;
  plan: PlanStep[];
  source?: "claude" | "loop";
}
