/**
 * PHASE 2 SHOWCASE — temporary demo page to verify all base UI components.
 * Replaced in Phase 4a with the real Dashboard.
 *
 * Exercises:
 *   - Buttons (filled, outlined, ghost, report variants, sm + md sizes)
 *   - Status badges (all 5 colors)
 *   - KPI cards (with various delta states)
 *   - Page header (with breadcrumbs + actions)
 *   - Search input
 *   - Form inputs (text, textarea, select)
 *   - Ghost icon buttons (3 sizes)
 *   - Section card with title + actions
 *   - Empty state
 */

import {
  Plus,
  Download,
  Pencil,
  Trash2,
  Eye,
  Wrench,
  Calendar,
  Package,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Button,
  StatusBadge,
  GhostIconButton,
  KpiCard,
  PageHeader,
  SearchInput,
  FormInput,
  FormTextarea,
  FormSelect,
  EmptyState,
  SectionCard,
  Card,
} from "@/components/ui";

export default function DashboardPage() {
  return (
    <div style={{ padding: "32px" }}>
      <PageHeader
        breadcrumbs={[{ label: "Suburban Toppers CRM" }, { label: "Dashboard" }]}
        title="Dashboard"
        actions={
          <>
            <Button variant="outlined" leadingIcon={<Download size={16} strokeWidth={2} />}>
              Export
            </Button>
            <Button variant="filled" leadingIcon={<Plus size={16} strokeWidth={2} />}>
              New
            </Button>
          </>
        }
      />

      {/* KPI row */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        <KpiCard
          label="Today's Installs"
          value="12"
          icon={Wrench}
          iconAccent="orange"
          deltaDirection="up"
          deltaValue="+3"
          contextLabel="vs. yesterday"
        />
        <KpiCard
          label="Open Invoices"
          value="48"
          icon={FileText}
          iconAccent="orange"
          deltaDirection="down"
          deltaValue="-5"
          contextLabel="vs. last week"
        />
        <KpiCard
          label="AR Overdue 30+"
          value="$24,800"
          icon={FileText}
          iconAccent="bronze"
          deltaDirection="up"
          deltaValue="+$3,200"
          contextLabel="vs. last month"
        />
        <KpiCard
          label="Pending Confirmations"
          value="7"
          icon={Package}
          iconAccent="orange"
          deltaDirection="neutral"
          deltaValue="0"
          contextLabel="this week"
        />
      </div>

      {/* Status badges demo */}
      <Card padding={24} className="mb-32">
        <h2
          className="text-carbon"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "16px",
            fontWeight: 600,
            lineHeight: 1.2,
            marginBottom: "16px",
          }}
        >
          Status Badges
        </h2>
        <div className="flex flex-wrap items-center" style={{ gap: "8px" }}>
          <StatusBadge variant="green">Confirmed</StatusBadge>
          <StatusBadge variant="green">Paid</StatusBadge>
          <StatusBadge variant="green">In Stock</StatusBadge>
          <StatusBadge variant="green">Active</StatusBadge>
          <StatusBadge variant="amber">Pending</StatusBadge>
          <StatusBadge variant="amber">Awaiting</StatusBadge>
          <StatusBadge variant="amber">Partial</StatusBadge>
          <StatusBadge variant="red">Overdue</StatusBadge>
          <StatusBadge variant="red">Cancelled</StatusBadge>
          <StatusBadge variant="red">Failed</StatusBadge>
          <StatusBadge variant="blue">Sent</StatusBadge>
          <StatusBadge variant="blue">In Transit</StatusBadge>
          <StatusBadge variant="blue">Scheduled</StatusBadge>
          <StatusBadge variant="purple">AI Active</StatusBadge>
          <StatusBadge variant="purple">Auto-Sent</StatusBadge>
          <StatusBadge variant="purple">Lead Engaged</StatusBadge>
        </div>
      </Card>

      {/* Buttons + form demo */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        <Card padding={24}>
          <h2
            className="text-carbon"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "16px",
              fontWeight: 600,
              lineHeight: 1.2,
              marginBottom: "16px",
            }}
          >
            Buttons
          </h2>
          <div className="flex flex-wrap items-center" style={{ gap: "12px" }}>
            <Button variant="filled" leadingIcon={<Plus size={16} strokeWidth={2} />}>
              Filled Button
            </Button>
            <Button variant="outlined" leadingIcon={<Download size={16} strokeWidth={2} />}>
              Outlined Button
            </Button>
            <Button variant="ghost" leadingIcon={<Pencil size={16} strokeWidth={2} />}>
              Ghost Button
            </Button>
            <Button variant="report" leadingIcon={<Download size={16} strokeWidth={2} />}>
              Get Report
            </Button>
            <Button variant="filled" size="sm">
              Small
            </Button>
            <Button variant="outlined" size="sm">
              Small Outlined
            </Button>
            <Button variant="filled" disabled>
              Disabled
            </Button>
          </div>
        </Card>

        <Card padding={24}>
          <h2
            className="text-carbon"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "16px",
              fontWeight: 600,
              lineHeight: 1.2,
              marginBottom: "16px",
            }}
          >
            Icon Buttons
          </h2>
          <div className="flex flex-wrap items-center" style={{ gap: "8px" }}>
            <GhostIconButton size="sm" aria-label="View">
              <Eye size={18} strokeWidth={2} />
            </GhostIconButton>
            <GhostIconButton size="sm" aria-label="Edit">
              <Pencil size={16} strokeWidth={2} />
            </GhostIconButton>
            <GhostIconButton size="sm" aria-label="Delete">
              <Trash2 size={16} strokeWidth={2} />
            </GhostIconButton>
            <GhostIconButton size="md" aria-label="Previous">
              <ChevronLeft size={18} strokeWidth={2} />
            </GhostIconButton>
            <GhostIconButton size="md" aria-label="Next">
              <ChevronRight size={18} strokeWidth={2} />
            </GhostIconButton>
            <GhostIconButton size="lg" aria-label="Calendar">
              <Calendar size={20} strokeWidth={2} />
            </GhostIconButton>
            <GhostIconButton size="md" aria-label="Active toggle" active>
              <Wrench size={18} strokeWidth={2} />
            </GhostIconButton>
            <GhostIconButton size="md" aria-label="Disabled" disabled>
              <Plus size={18} strokeWidth={2} />
            </GhostIconButton>
          </div>
        </Card>
      </div>

      {/* Form inputs + search */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        <Card padding={24}>
          <h2
            className="text-carbon"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "16px",
              fontWeight: 600,
              lineHeight: 1.2,
              marginBottom: "16px",
            }}
          >
            Form Inputs
          </h2>
          <div className="flex flex-col" style={{ gap: "16px" }}>
            <FormInput label="Company Name" placeholder="Acme Trucking" required />
            <FormInput
              label="Email"
              type="email"
              placeholder="ops@acme.com"
              helperText="We'll never share this."
            />
            <FormInput
              label="PO Number"
              placeholder="PO-2026-001"
              errorText="PO Number is already in use."
            />
            <FormSelect label="Manufacturer" defaultValue="">
              <option value="" disabled>
                Choose a manufacturer…
              </option>
              <option>ARE</option>
              <option>Leer</option>
              <option>Snugtop</option>
            </FormSelect>
            <FormTextarea label="Notes" placeholder="Add a note…" rows={3} />
          </div>
        </Card>

        <Card padding={24}>
          <h2
            className="text-carbon"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "16px",
              fontWeight: 600,
              lineHeight: 1.2,
              marginBottom: "16px",
            }}
          >
            Search + Section Card
          </h2>
          <div className="flex flex-col" style={{ gap: "16px" }}>
            <SearchInput placeholder="Search by name, phone, company…" />
            <SearchInput defaultValue="Acme" placeholder="Search…" />
            <SearchInput placeholder="Disabled search" disabled />
          </div>

          <div style={{ marginTop: "24px" }}>
            <SectionCard
              title="All Clients"
              actions={
                <Button variant="outlined" size="sm" leadingIcon={<Download size={14} strokeWidth={2} />}>
                  Export
                </Button>
              }
              bodyPadding={0}
            >
              <EmptyState
                icon={FileText}
                title="No clients yet"
                description="Add your first client to get started."
                action={{ label: "New Client" }}
                compact
              />
            </SectionCard>
          </div>
        </Card>
      </div>
    </div>
  );
}
