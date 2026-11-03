import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { generateChat } from "@/lib/ai";
import type { ChatResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const SYSTEM = `You are Loop, an assistant that helps college students maintain professional relationships after coffee chats.
Given a contact's name, firm, role and the student's messy notes, return ONLY valid JSON (no markdown) with this shape:
{"profile":{"summary":string,"advice":string[3],"caresAbout":string[3],"hooks":string[3]},
 "thankYou":string,
 "plan":[{"when":"2 weeks","label":string,"message":string},{"when":"1 month","label":string,"message":string},{"when":"3 months","label":string,"message":string}]}
Rules: reference SPECIFIC details from the notes; warm, concise, professional, student voice; no clichés; thankYou is an email starting "Hi <FirstName>," and ending "Best,\\n[Your name]"; plan messages are short texts/LinkedIn DMs (2-4 sentences).`;

export async function POST(req: Request) {
  let body: { name?: string; firm?: string; role?: string; notes?: string } = {};
  try {
    body = await req.json();
  } catch {}
  const input = { name: body.name || "", firm: body.firm || "", role: body.role || "", notes: body.notes || "" };
  const fallback = () => NextResponse.json(generateChat(input));

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return fallback();

  try {
    const client = new Anthropic({ apiKey: key, timeout: 25000, maxRetries: 0 });
    const msg = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
      max_tokens: 1800,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Name: ${input.name}\nFirm: ${input.firm}\nRole: ${input.role}\nNotes:\n${input.notes}`,
        },
      ],
    });
    const text = msg.content.map((c) => (c.type === "text" ? c.text : "")).join("");
    const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as ChatResult;
    if (!json?.profile?.summary || !json.thankYou || !Array.isArray(json.plan)) throw new Error("bad shape");
    return NextResponse.json({ ...json, source: "claude" });
  } catch (e) {
    console.error("Claude call failed, using Loop generator:", (e as Error).message);
    return fallback();
  }
}
