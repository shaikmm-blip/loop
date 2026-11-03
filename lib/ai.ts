// Loop's built-in generator. Produces realistic, personalized output from messy notes
// so the demo never breaks — used whenever the Claude API is unavailable.
import type { Activity, ChatResult, Contact } from "./types";

const first = (name: string) => (name.trim().split(/\s+/)[0] || "there").replace(/[^A-Za-z'-]/g, "") || "there";

function fragments(notes: string): string[] {
  return notes
    .split(/\n|(?<=[.!?])\s+|;|\s+[-–—•]\s+/)
    .map((s) =>
      s
        .replace(/^[\s\-*•·>\d.)]+/, "")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/[.!?,;:]+$/, "")
    )
    .filter((s) => s.length > 8 && s.split(" ").length >= 2);
}

const PRONOUN_LEAD =
  /^(he|she|they|[A-Z][a-z]+)\s+(said|says|mentioned|told me|recommended|suggested|thinks|believes|emphasized|stressed|talked about|shared|noted)\s+(that\s+|to\s+)?/i;

const VERB_LEAD = /^(said|says|mentioned|told me|thinks|believes|emphasized|stressed|talked about|shared|noted|advice:?|biggest advice:?)\s+(that\s+|to\s+)?/i;
const BEST_LEAD = /^(the\s+)?(best|biggest|#1|number one|most important|main)\s+(thing|advice|tip|mistake)[^,]*?\s+(is|was)\s+(to\s+|that\s+)?/i;

// Light tidy for profile bullets
function tidy(frag: string): string {
  let f = frag.replace(PRONOUN_LEAD, "").replace(VERB_LEAD, "").replace(BEST_LEAD, "").trim();
  f = f.replace(/^(recommended|suggested)\s+(.*)$/i, "$2 (recommended)");
  return f;
}

// Message voice: speaking directly to the contact
function clean(frag: string): string {
  let f = frag.replace(PRONOUN_LEAD, "").replace(VERB_LEAD, "").replace(BEST_LEAD, "").trim();
  f = f.replace(/^(recommended|suggested)\s+(.*)$/i, "$2 you recommended");
  f = f.replace(/\b(he's|she's|they're)\b/gi, "you're").replace(/\b(he|she)\b/gi, "you").replace(/\b(his|her|their)\b/gi, "your");
  if (f && f[0] === f[0].toUpperCase() && f[1] && f[1] === f[1].toLowerCase() && !/^(I|AI|PE|VC|NYC|IB)\b/.test(f)) {
    f = f[0].toLowerCase() + f.slice(1);
  }
  return f;
}

const has = (s: string, re: RegExp) => re.test(s);
const ADVICE = /(advice|recommend|suggest|should|tip|focus|learn|don'?t|do not|make sure|key is|important|always|never|start|network|reach out|read|practice|recruit|apply|resume|interview|technical|model)/i;
const CARES = /(love|passion|care|excited|interest|into|hobby|family|kid|daughter|son|dog|wife|husband|run|marathon|golf|hike|travel|cook|music|book|podcast|bengals|reds|buckeyes|football|basketball|climb|faith|volunteer|mentor|impact|culture|team)/i;
const HOOK = /(book|podcast|article|newsletter|event|conference|summit|panel|fund|launch|raising|hiring|intern|intro|connect|send|follow up|check out|next week|next month|trip|moving|race|marathon|wedding|baby|deal|closing|portfolio)/i;

function pick<T>(arr: T[], n: number): T[] {
  return Array.from(new Set(arr)).slice(0, n);
}

function capitalize(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

export function generateChat(input: { name: string; firm: string; role: string; notes: string }): ChatResult {
  const name = input.name.trim() || "your contact";
  const fn = first(name);
  const firm = input.firm.trim() || "their firm";
  const role = input.role.trim() || "professional";
  const frags = fragments(input.notes);

  const adviceRaw = frags.filter((f) => has(f, ADVICE));
  const caresRaw = frags.filter((f) => has(f, CARES) && !adviceRaw.slice(0, 3).includes(f));
  const hooksRaw = frags.filter((f) => has(f, HOOK));

  const advice = pick(adviceRaw.length ? adviceRaw : frags.slice(0, 3), 3).map((f) => capitalize(tidy(f)));
  const caresAbout = pick(caresRaw.length ? caresRaw : frags.slice(3, 6), 3).map((f) => capitalize(tidy(f)));
  const hooks = pick(hooksRaw.length ? hooksRaw : frags.slice(-2), 3).map((f) => capitalize(tidy(f)));

  if (!advice.length) advice.push(`Build relationships early — recruiting at ${firm} is relationship-driven`);
  if (!caresAbout.length) caresAbout.push(`Helping students break into ${firm.includes("Capital") || /ventures|vc/i.test(firm) ? "investing" : "the industry"}`);
  if (!hooks.length) hooks.push(`Share an update on your recruiting progress`, `Send an article relevant to ${firm}'s focus`);

  const specific1 = clean(adviceRaw[0] || frags[0] || `how you think about building a career at ${firm}`);
  const specific2 = clean(caresRaw[0] || hooksRaw[0] || frags[1] || "");

  const summary = `${name} is a ${role} at ${firm}. ${
    adviceRaw[0] || frags[0]
      ? `${fn}'s biggest takeaway for you: “${tidy(adviceRaw[0] || frags[0])}.”${caresRaw[0] ? ` On a personal note — ${tidy(caresRaw[0]).replace(/^./, (m) => m.toLowerCase())}.` : ""}`
      : `A high-value relationship worth keeping warm through recruiting season.`
  } Best way to stay top of mind: short, specific updates that show you acted on their advice.`;

  const thankYou = [
    `Hi ${fn},`,
    ``,
    `Thank you so much for taking the time to chat today — I really enjoyed it. I especially appreciated your advice — ${specific1} — it's already reframing how I'm approaching the next few months.`,
    specific2 ? `` : null,
    specific2 ? `I also loved hearing ${/^you/i.test(specific2) ? "that " : "about "}${specific2}. It's clear why people enjoy working with you at ${firm}.` : null,
    ``,
    `I'm going to put your advice into practice and would love to keep you posted on how it goes. Thanks again for being so generous with your time.`,
    ``,
    `Best,`,
    `[Your name]`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const hook = clean(hooksRaw[0] || adviceRaw[1] || adviceRaw[0] || `your advice on recruiting`);
  const plan = [
    {
      when: "2 weeks",
      label: "Show you took action",
      message: `Hi ${fn} — quick update since our coffee chat. I took your advice to heart (${specific1}) and it's already paying off. Thanks again for pointing me in the right direction. Hope things at ${firm} are going well!`,
    },
    {
      when: "1 month",
      label: "Add value",
      message: `Hi ${fn}, I came across something that made me think of our conversation (${hook}) — thought you might enjoy it. Would love to hear your take if you have a minute. Hope the month's been great!`,
    },
    {
      when: "3 months",
      label: "Deepen the relationship",
      message: `Hi ${fn}! It's been a few months since we talked — wanted to share where I've landed: I've been applying everything you told me and I'm heading into recruiting season with a much clearer plan. Would you be open to a quick 15-minute catch-up in the next couple of weeks? I'd love to get your perspective on what's next.`,
    },
  ];

  return { profile: { summary, advice, caresAbout, hooks }, thankYou, plan, source: "loop" };
}

function adviceFrom(c: { notes: string }): string {
  return fragments(c.notes).find((f) => ADVICE.test(f)) || "";
}

export function generateNewsFollowUp(c: Pick<Contact, "name" | "firm" | "notes" | "profile">, a: Pick<Activity, "type" | "title" | "detail">): string {
  const fn = first(c.name);
  const callback = clean(adviceFrom(c) || fragments(c.notes)[0] || "breaking into the industry").replace(/\.$/, "");
  const opener: Record<Activity["type"], string> = {
    promotion: `Congratulations on the promotion — ${a.title.toLowerCase().replace(/^promoted to /, "")}! So well deserved.`,
    deal: `Just saw the news — ${a.title.replace(/\.$/, "")}. Huge milestone, congratulations to you and the team!`,
    post: `I really enjoyed your recent post${a.detail ? ` — ${a.detail.replace(/\.$/, "")}` : ""}. It got me thinking.`,
    job: `Congrats on the new role — ${a.title.replace(/\.$/, "")}! Exciting next chapter.`,
  };
  return [
    `Hi ${fn},`,
    ``,
    opener[a.type],
    ``,
    `It's funny — I still come back to the advice you gave me during our coffee chat: ${callback}. I've been putting it into practice, and it's made a real difference in how I'm approaching recruiting.`,
    ``,
    `Would love to hear how things are going on your end whenever you have a minute. Congrats again!`,
    ``,
    `Best,`,
    `[Your name]`,
  ].join("\n");
}

export function generateCheckIn(c: Pick<Contact, "name" | "firm" | "notes" | "profile">, days: number): string {
  const fn = first(c.name);
  const callback = clean(adviceFrom(c) || "your advice on recruiting");
  const care = clean(c.profile.caresAbout[0] || "");
  return `Hi ${fn} — it's been ${days >= 60 ? "a little while" : "a few weeks"} since our coffee chat and I wanted to say thanks again. I've been acting on your advice (${callback}) and it's made a real difference. Hope everything at ${c.firm} is going great — would love to keep you posted on how recruiting goes!`;
}

export function generateIntroAsk(c: Pick<Contact, "name" | "firm" | "profile" | "notes">, target: { name: string; firm: string; role: string }): string {
  const fn = first(c.name);
  const callback = clean(adviceFrom(c) || "how to break into the industry");
  return [
    `Hey ${fn},`,
    ``,
    `Hope you're doing well! I've been thinking a lot about our coffee chat — especially your advice (${callback}). I've been putting it to work and I'm now focused on ${target.firm}.`,
    ``,
    `I noticed you're connected with ${target.name} (${target.role} at ${target.firm}). Would you be open to introducing me? I'd love to learn about their path and how they think about the work there. Happy to send a short blurb you can forward so it's zero effort on your end.`,
    ``,
    `Totally understand if the timing isn't right — thanks either way!`,
    ``,
    `Best,`,
    `[Your name]`,
  ].join("\n");
}
