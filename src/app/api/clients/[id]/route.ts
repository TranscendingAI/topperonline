/**
 * /api/clients/[id] — single client detail (invoices, line items, contacts)
 * for the ClientDrawer. Fetched on demand when the drawer opens, rather
 * than preloading detail for all ~98k clients.
 */

import { NextRequest, NextResponse } from "next/server";
import { getClientDetail } from "@/lib/data/clients";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: "Invalid client id" }, { status: 400 });
  }

  const detail = await getClientDetail(numericId);
  if (!detail) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json(detail);
}
