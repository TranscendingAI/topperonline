/**
 * Clients — real data (Supabase), server-rendered initial page.
 *
 * The clients table has ~98k rows, so we don't ship them all to the
 * browser: this Server Component fetches an initial capped page
 * (most-recently-added 200), and ClientsTable (client component) re-queries
 * /api/clients as the user searches/filters.
 */

import { ClientsTable } from "@/components/clients/ClientsTable";
import { listClients } from "@/lib/data/clients";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const { clients, totalMatching } = await listClients({ limit: 200 });

  return <ClientsTable initialClients={clients} initialTotalMatching={totalMatching} />;
}
