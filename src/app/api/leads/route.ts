/**
 * /api/leads — list + create.
 *
 * POST is the lead-intake webhook: website forms, Google Ads, Facebook
 * lead forms all land here. Creating a lead immediately triggers
 * Sarah's initial outreach (speed-to-lead).
 */

import { NextRequest, NextResponse } from "next/server";
import { createLead, listLeads, getLeadMessages } from "@/lib/db";
import { sarahInitialOutreach } from "@/lib/agents/sarah";

export const dynamic = "force-dynamic";

function leadToJson(row: ReturnType<typeof listLeads>[number], includeMessages = false) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    email: row.email,
    source: row.source,
    vehicle: row.vehicle,
    interest: row.interest,
    stage: row.stage,
    aiHandled: !!row.ai_handled,
    estimatedValue: row.estimated_value,
    lastContactAt: row.last_contact_at,
    createdAt: row.created_at,
    ...(includeMessages
      ? {
          conversation: getLeadMessages(row.id).map((m) => ({
            id: String(m.id),
            from: m.sender,
            text: m.body,
            timestamp: m.created_at,
          })),
        }
      : {}),
  };
}

export async function GET() {
  const leads = listLeads().map((l) => leadToJson(l, true));
  return NextResponse.json({ leads });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  if (!firstName || !lastName) {
    return NextResponse.json(
      { error: "firstName and lastName are required" },
      { status: 400 }
    );
  }

  const lead = createLead({
    firstName,
    lastName,
    phone: body.phone ? String(body.phone) : undefined,
    email: body.email ? String(body.email) : undefined,
    source: body.source ? String(body.source) : undefined,
    vehicle: body.vehicle ? String(body.vehicle) : undefined,
    interest: body.interest ? String(body.interest) : undefined,
    estimatedValue: typeof body.estimatedValue === "number" ? body.estimatedValue : undefined,
  });

  // Speed-to-lead: Sarah responds immediately.
  const aiReply = sarahInitialOutreach(lead.id);

  return NextResponse.json(
    { lead: leadToJson(lead, true), aiReply },
    { status: 201 }
  );
}
