/**
 * Suburban Toppers CRM — Phase 1 entry point
 *
 * The actual pages live in their own route segments:
 *   /             → Dashboard
 *   /clients      → Clients list
 *   /clients/[id] → Client Record
 *   /leads        → Leads & Outreach
 *   /stock        → Stock
 *   /schedule     → Schedule
 *   /reports      → Reports index
 *   /reports/[type] → Individual reports
 *   /maintenance  → Maintenance index
 *   /maintenance/[section] → Maintenance sub-pages
 *
 * The root / route redirects to /dashboard (or renders it directly).
 */
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/dashboard");
}
