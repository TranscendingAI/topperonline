/**
 * /api/leads/[id]/messages — inbound customer message endpoint.
 *
 * This is where the SMS provider webhook (Twilio etc.) will POST
 * inbound texts in production. Until then it doubles as the
 * conversation simulator for the Kanban UI ("customer replies...").
 *
 * Sarah handles the message and replies automatically (unless the
 * lead is marked human-owned).
 */

import { NextRequest, NextResponse } from "next/server";
import { getLead, getLeadMessages } from "@/lib/db";
import { sarahHandleInbound } from "@/lib/agents/sarah";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lead = getLead(id);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = String(body.text ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const aiReply = sarahHandleInbound(id, text);

  const fresh = getLead(id)!;
  return NextResponse.json({
    aiReply,
    stage: fresh.stage,
    conversation: getLeadMessages(id).map((m) => ({
      id: String(m.id),
      from: m.sender,
      text: m.body,
      timestamp: m.created_at,
    })),
  });
}
