import { generateChat } from "./ai";
import type { Activity, Connection, Contact } from "./types";

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

type SeedIn = {
  id: string;
  name: string;
  firm: string;
  role: string;
  location: string;
  sector: string;
  met: number;
  last: number;
  notes: string;
  activity: Omit<Activity, "id" | "date">[];
  activityDays: number[];
  connections: Connection[];
};

const raw: SeedIn[] = [
  {
    id: "maya-patel",
    name: "Maya Patel",
    firm: "CincyTech",
    role: "Principal",
    location: "Cincinnati, OH",
    sector: "Venture Capital",
    met: 9,
    last: 6,
    notes: `Met at the FSB VC night. Former P&G brand manager turned VC.
She said to pick a thesis and write about it publicly — investors notice students with a point of view.
Recommended reading "Venture Deals" by Brad Feld before any VC interview.
Loves running — training for the Flying Pig marathon in May.
Excited about Midwest healthtech, thinks Cincinnati is underrated for B2B SaaS.
Offered to look at my market map if I send it next week.`,
    activity: [
      { type: "promotion", title: "Promoted to Partner", detail: "Maya was named Partner at CincyTech, leading healthtech investments." },
      { type: "post", title: "Posted about AI in private equity", detail: "why AI-native ops teams will reshape Midwest portfolio companies" },
    ],
    activityDays: [2, 12],
    connections: [
      { name: "Tom Hughes", firm: "Blackstone", role: "Principal" },
      { name: "Priya Nair", firm: "Andreessen Horowitz", role: "Partner" },
      { name: "Ben Alvarez", firm: "P&G Ventures", role: "Director" },
      { name: "Hannah Brooks", firm: "Drive Capital", role: "Associate" },
    ],
  },
  {
    id: "david-kim",
    name: "David Kim",
    firm: "Blackstone",
    role: "Vice President",
    location: "New York, NY",
    sector: "Private Equity",
    met: 18,
    last: 12,
    notes: `Coffee at Blue Bottle near Hudson Yards. Miami University alum (FSB '14) — RedHawk connection!
Biggest advice: nail your LBO modeling — do at least 3 paper LBOs before on-cycle recruiting.
Said banking first is still the cleanest path into mega-fund PE.
Big Knicks fan, has season tickets. Just had his first daughter.
His team is focused on infrastructure and data centers right now.
Told me to reach back out once I lock a summer analyst offer.`,
    activity: [
      { type: "deal", title: "Firm closed $150M Fund II", detail: "Blackstone's infrastructure growth vehicle closed its $150M Fund II co-invest sleeve." },
      { type: "post", title: "Shared an article on data center demand", detail: "the AI-driven power crunch for data centers" },
    ],
    activityDays: [3, 20],
    connections: [
      { name: "Lauren Mitchell", firm: "KKR", role: "Vice President" },
      { name: "Chris Wang", firm: "Goldman Sachs", role: "Managing Director" },
      { name: "Sam Ortiz", firm: "Bain Capital", role: "Principal" },
      { name: "Elena Rossi", firm: "Blackstone", role: "Managing Director" },
      { name: "Nate Fischer", firm: "Evercore", role: "Associate" },
    ],
  },
  {
    id: "rachel-okafor",
    name: "Rachel Okafor",
    firm: "Goldman Sachs",
    role: "Investment Banking Associate",
    location: "New York, NY",
    sector: "Investment Banking",
    met: 40,
    last: 34,
    notes: `Zoom chat via the SEPi alumni network. Covers TMT M&A.
Said the #1 mistake students make is not knowing why THIS bank — be specific about deals.
Recommended following the Morning Brew + reading Goldman's TMT team deal announcements.
Played D1 soccer at Ohio State, still plays in a Sunday league in Brooklyn.
Cares a lot about mentoring first-gen students.
Mentioned Goldman's sophomore diversity program deadline is in January.`,
    activity: [
      { type: "promotion", title: "Promoted to Vice President", detail: "Rachel was promoted to VP in Goldman's TMT group." },
      { type: "deal", title: "Advised on $2.1B software acquisition", detail: "Goldman advised on the take-private of a cybersecurity company." },
    ],
    activityDays: [5, 15],
    connections: [
      { name: "Marcus Lee", firm: "Goldman Sachs", role: "Managing Director" },
      { name: "Olivia Grant", firm: "KKR", role: "Associate" },
      { name: "Daniel Park", firm: "Morgan Stanley", role: "Vice President" },
    ],
  },
  {
    id: "jake-morrison",
    name: "Jake Morrison",
    firm: "Lumen Health",
    role: "Founder & CEO",
    location: "Cincinnati, OH",
    sector: "Startups",
    met: 52,
    last: 45,
    notes: `Met at Startup Weekend Cincinnati. Built Lumen Health out of UC's 1819 Innovation Hub.
Advice: talk to 50 customers before writing a line of code.
Raising a seed round right now — said they're hiring a summer growth intern.
Huge Bengals fan, coaches his son's little league team.
Thinks every student should learn SQL regardless of major.`,
    activity: [
      { type: "deal", title: "Lumen Health raised $4M seed", detail: "Led by CincyTech with participation from P&G Ventures." },
      { type: "job", title: "Hiring a summer growth intern", detail: "Lumen posted a growth internship on LinkedIn." },
    ],
    activityDays: [4, 9],
    connections: [
      { name: "Ava Thompson", firm: "P&G Ventures", role: "Principal" },
      { name: "Ryan Cole", firm: "Andreessen Horowitz", role: "Investor" },
      { name: "Grace Liu", firm: "CincyTech", role: "Associate" },
      { name: "Leo Martin", firm: "Kroger", role: "VP Digital" },
    ],
  },
  {
    id: "sarah-chen",
    name: "Sarah Chen",
    firm: "KKR",
    role: "Vice President",
    location: "New York, NY",
    sector: "Private Equity",
    met: 140,
    last: 132,
    notes: `Met at the career fair, then coffee the next morning. Ex-Morgan Stanley banker, now KKR healthcare PE.
She said to read 10-Ks of companies I like and form an investment view — interviewers love it.
Recommended the "Acquired" podcast episode on Costco.
Into rock climbing and travels to Japan every year.
Said KKR's healthcare team values operating curiosity over pure modeling.`,
    activity: [
      { type: "deal", title: "KKR closed $150M healthcare growth deal", detail: "Sarah's team led the investment in a specialty pharmacy platform." },
      { type: "post", title: "Posted about AI in private equity", detail: "how AI diligence tools are compressing deal timelines" },
    ],
    activityDays: [6, 25],
    connections: [
      { name: "James O'Neil", firm: "Blackstone", role: "Vice President" },
      { name: "Mia Johnson", firm: "Bain Capital", role: "Associate" },
      { name: "Kevin Zhao", firm: "KKR", role: "Partner" },
      { name: "Sofia Alvarez", firm: "Goldman Sachs", role: "Vice President" },
    ],
  },
  {
    id: "marcus-reed",
    name: "Marcus Reed",
    firm: "Fifth Third Securities",
    role: "Managing Director",
    location: "Cincinnati, OH",
    sector: "Banking",
    met: 210,
    last: 195,
    notes: `Guest speaker in FIN 401, grabbed coffee after class.
Advice: build your story — why finance, why now, why you — in 60 seconds.
Said middle-market banking gives way more deal reps than bulge bracket.
Big golfer, plays at Kenwood every Saturday. Two kids at St. Xavier.
Offered to intro me to their analyst class if I stay in touch.`,
    activity: [
      { type: "promotion", title: "Named Head of Midwest M&A", detail: "Marcus now leads Fifth Third's Midwest M&A coverage." },
      { type: "deal", title: "Advised on sale of Ohio manufacturer", detail: "Fifth Third advised a family-owned Dayton manufacturer on its sale." },
    ],
    activityDays: [8, 30],
    connections: [
      { name: "Erin Walsh", firm: "Goldman Sachs", role: "Vice President" },
      { name: "Tyler Banks", firm: "P&G Ventures", role: "Associate" },
      { name: "Nina Patel", firm: "Bain Capital", role: "Vice President" },
    ],
  },
];

export function buildSeed(): Contact[] {
  return raw.map((r) => {
    const gen = generateChat({ name: r.name, firm: r.firm, role: r.role, notes: r.notes });
    const activity: Activity[] = r.activity.map((a, i) => ({ ...a, id: `${r.id}-a${i}`, date: daysAgo(r.activityDays[i]) }));
    return {
      id: r.id,
      name: r.name,
      firm: r.firm,
      role: r.role,
      location: r.location,
      sector: r.sector,
      metAt: daysAgo(r.met),
      lastContact: daysAgo(r.last),
      notes: r.notes,
      profile: gen.profile,
      thankYou: gen.thankYou,
      plan: gen.plan.map((p, i) => ({ ...p, done: i === 0 && r.last < 30 })),
      activity,
      connections: r.connections,
      timeline: [
        { date: daysAgo(r.met), text: `Coffee chat with ${r.name.split(" ")[0]}`, kind: "chat" as const },
        { date: daysAgo(r.met - 1 > 0 ? r.met - 1 : 0), text: "Sent thank-you note", kind: "sent" as const },
        ...(r.last < r.met - 1 ? [{ date: daysAgo(r.last), text: "Sent follow-up", kind: "sent" as const }] : []),
      ],
    };
  });
}
