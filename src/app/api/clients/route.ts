/**
 * /api/clients — search/list endpoint backing the Clients page.
 *
 * The clients table has ~98k rows, so the client-side table shows a
 * capped, server-computed page (id DESC = most recently added) and this
 * route re-runs the same query with a search term / type filter as the
 * user types, rather than shipping the whole table to the browser.
 */

import { NextRequest, NextResponse } from "next/server";
import { listClients } from "@/lib/data/clients";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("q") ?? undefined;
  const typeParam = req.nextUrl.searchParams.get("type");
  const type = typeParam === "commercial" || typeParam === "residential" ? typeParam : "all";
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 200) || 200, 500);

  const result = await listClients({ search, type, limit });
  return NextResponse.json(result);
}
