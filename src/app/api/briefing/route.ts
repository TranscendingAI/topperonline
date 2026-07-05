/**
 * /api/briefing — the Morning Briefing endpoint.
 *
 * GET             → JSON briefing (powers the dashboard card)
 * GET ?format=md  → rendered markdown (what gets emailed/SMS'd)
 *
 * A scheduler (cron) hits this at 6:30am and delivers the markdown.
 */

import { NextRequest, NextResponse } from "next/server";
import { buildBriefing, renderBriefingMarkdown } from "@/lib/briefing";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const briefing = buildBriefing();

  const format = req.nextUrl.searchParams.get("format");
  if (format === "md" || format === "markdown") {
    return new NextResponse(renderBriefingMarkdown(briefing), {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }

  return NextResponse.json({ briefing, markdown: renderBriefingMarkdown(briefing) });
}
