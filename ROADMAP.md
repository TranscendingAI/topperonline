# Toppers Online — Agentic Roadmap

**Custom CRM for Suburban Toppers** · Denver, CO · Family-owned since 1985
**Vision:** An agent-driven CRM where AI handles the high-volume, conversational, rule-bound work — lead response, scheduling, reminders, collections, inventory chasing — while the humans (Dan, Chris, Brad, Nate) remain the face of every customer relationship.

---

## Current State (Phase 1 — Complete)

UI shell with realistic mock data. No backend, no persistence, no auth.

- **Stack:** Next.js 16 (App Router) + TypeScript, Tailwind v4, TanStack Table v8, Recharts, Lucide
- **Pages:** Dashboard, Clients (+ drawer), Leads & Outreach (5-stage Kanban), Stock (3 tabs), Schedule, Reports (9), Maintenance (8)
- **Data model already anticipates agents:** `aiHandled` flags, AI conversation threads ("Sarah"), `ai_active` / `auto_sent` / `lead_engaged` statuses, pipeline stages `new_lead → ai_contacted → responded → appointment_set → confirmed_sale`

---

## Architectural Principles

These apply to every agent below. Non-negotiable.

1. **One API layer.** All agents act through the CRM's own API routes (Next.js). No agent ever talks to Google, Twilio, or any external service directly. This gives us:
   - A single audit log — "what did Sarah say and do today?"
   - One permissions model
   - A human-approval gate that can be tightened or loosened per agent
2. **Service-account identities, not user OAuth.** Agents authenticate as stable non-human identities (e.g., the Google Calendar service account). No expiring tokens, no human re-auth.
3. **Escalate early, hand off with context.** Every agent has a defined "call a human" trigger, and hands off with a full summary — never a cold transfer.
4. **Metadata travels with the record.** External artifacts (calendar events, SMS threads) carry CRM IDs via extended properties / custom fields so everything cross-references.
5. **Approval tiers.** Each agent action is classified: `auto` (just do it), `notify` (do it, tell a human), `approve` (draft it, human clicks send). New agents start conservative and earn autonomy.

---

## Phase 2a — Foundation: Calendar Sync + Appointment Agent

> Status: **In progress.** Waiting on Google Cloud service-account setup from brad@suburbantoppers.com (project + Calendar API + service account key + share "INSTALL APPOINTMENTS" calendar).

### Google Calendar 2-Way Sync
- Single source of truth: the **INSTALL APPOINTMENTS** calendar (brad@suburbantoppers.com, Google Workspace)
- Service account with "Make changes to events" permission
- **API routes:**
  - `POST /api/calendar/installs` — create install
  - `GET /api/calendar/installs?date=…` — list installs for date/range
  - `PATCH /api/calendar/installs/:eventId` — reschedule / reassign
  - `DELETE /api/calendar/installs/:eventId` — cancel
  - `POST /api/calendar/webhook` — Google push-notification receiver (external edits flow back into CRM within seconds)
- **Field mapping:** clientName→summary, topperDescription+vehicle→description, startTime+durationMin→start/end, location+installer→location/attendees, clientId/invoiceId→extendedProperties
- Wire the Schedule page to real calendar data (replace mock `TODAY_INSTALLS`)

### Appointment Lifecycle Agent
The first customer-facing agent. Rides entirely on the calendar sync.

| Capability | Trigger | Approval tier |
|---|---|---|
| Booking confirmation SMS | Install created | auto |
| Reminder SMS | 48h and 24h before | auto |
| Two-way rescheduling ("can't make Saturday" → offers open slots, rebooks, updates GCal + CRM) | Inbound customer SMS | auto, notify staff |
| No-show recovery outreach | Appointment passed, not marked complete | auto |
| Day-of logistics (location, directions, "pull around back") | Morning of install | auto |
| Post-install follow-up ("everything sealed tight?") | 2 days after install | auto; unhappy reply → **escalate to human** |
| Google review ask | Happy post-install reply | auto |

**Agent tool surface:** `list_installs(date, location?)`, `create_install(...)`, `reschedule_install(id, new_time)`, `cancel_install(id, reason?)`, `assign_installer(id, name)`

**Dependencies:** SMS provider (Twilio or similar), a `conversations` store, the calendar API layer above.

---

## Phase 2b — AI Sales Agent ("Sarah")

The single highest-ROI agent. Speed-to-lead decides conversion, and a 7-person shop can't reliably respond in 5 minutes. The Leads Kanban UI already exists for this.

- **Instant response** to every website form, Google Ads lead, Facebook inquiry — SMS + email
- **Fitment intelligence:** qualifies year/make/model/bed length → knows which toppers fit → "2019 Tacoma 6′ bed? We have an Overland in stock in Cement Gray, or I can order the CX in ~3 weeks"
- Ballpark pricing, drives toward booking an appointment (hands off to Appointment Agent)
- **Human handoff** to Nate / Dan Jr. the moment it's needed — with full conversation summary attached to the lead
- **Re-engagement drip:** cold leads nudged at 3 days / 2 weeks / 45 days, including price-drop alerts on used inventory they asked about
- Kanban stages update automatically as the conversation progresses

**Dependencies:** product/fitment knowledge base, website form webhook, lead-source integrations (Google Ads, Facebook), SMS from 2a.

---

## Phase 2c — Trust Builders: Morning Briefing + AR Agent

### Morning Briefing Agent
Daily 6:30am digest to Brad/Dan: today's installs at both locations (confirmed vs. unconfirmed), low-stock alerts, yesterday's leads and pipeline movement, AR changes, and "3 things that need a human decision today." Cheap to build; creates daily trust in the whole system.

### AR Collections Agent
Mock dashboard already shows $24.8k overdue 30+ and climbing — this recovers real dollars, and nobody at a small business enjoys collections calls.

- Polite escalating sequence: gentle reminder at due date → firmer at 15 / 30 / 45 days
- Handles "can I split it?" → payment plans within owner-defined rules
- Flags genuinely stuck accounts to Dan with full history
- **Approval tiers:** reminders `auto`; payment plans `approve` initially, relax later; write-off suggestions always `approve`

---

## Phase 3 — Operations Multipliers

### Inventory & Reorder Agent
- Watches stock vs. reorder points (already in the data model) → drafts POs to A.R.E. / ATC / etc. for one-click approval
- **ETA chaser:** monitors ordered toppers, emails manufacturer reps when ETAs slip, proactively notifies the waiting customer and offers to shift the install
- **The chain that sells this whole system:** stock arrival → auto-triggers Appointment Agent → customer books install. Today that's 3 phone calls done by humans.

### Used Topper Listing Agent
High-margin inventory Suburban Toppers already merchandises hard.
- Trade-in arrives → staff snaps 4 photos → agent writes the listing, prices against market, posts to website / Facebook Marketplace / Craigslist
- Monitors and answers inquiries across channels
- **Fitment matchmaking:** new used topper arrives → agent searches the lead/client DB for matching trucks → texts them first: "You asked about a Tacoma topper in March — one just came in at $850."

### Voice Agent / After-Hours Phone
- Answers the same 5 questions (hours, fitment, price, order status, directions)
- After-hours + overflow: captures the lead instead of voicemail-to-nowhere
- "Is my topper in yet?" → looks up the order, answers directly
- Books appointments straight into the calendar; warm-transfers anything complex

---

## Phase 4 — Differentiators

### Photo-Based Instant Quoting
Customer texts a photo of their truck → vision model identifies year/make/model/bed config → agent replies with fitting options, in-stock status, prices. Most customers don't know their bed length; this is both a demo "wow" and genuinely useful.

### Commercial Fleet Concierge
Client notes literally say "Has a fleet of 4 trucks — keep this client warm." Tracks fleet clients, notices replacement cycles (bought 3 toppers 4 years ago), pings on manufacturer fleet pricing, coordinates multi-truck install scheduling. Commercial is repeat revenue; this agent farms it.

### Review & Reputation Agent
Extends the post-install check: happy → timed, personalized Google review ask; unhappy → intercepted and escalated before it becomes a public review. Also monitors Google/Yelp and drafts on-brand responses for approval.

### Weather-Aware Scheduling (Denver-specific)
Hail/snow forecast → proactively offers to move affected installs. Hail aftermath → tasteful outreach ("protect your bed gear"). Storm tonight → confirm or reshuffle tomorrow's schedule preemptively.

### Build-Your-Own Copilot ("Silent Salesman")
Embedded chat in the website's existing configurator: answers mid-config questions ("does the CX come with a headliner?"), captures the config as a rich lead, and Sarah follows up referencing exactly what they built.

### Lifecycle / Anniversary Touches
Topper owners re-enter the market when they buy a new truck (5–8 yr cycle). 1-year "how's it holding up," seasonal maintenance tips, and a "new truck? We do transfers and trade-ins" nudge at typical trade-in age.

---

## Build Sequence Summary

| Phase | Deliverables | Value |
|---|---|---|
| **2a** | GCal 2-way sync · Appointment Agent · SMS infra | Foundation + immediate daily value |
| **2b** | AI Sales Agent (web leads, SMS, Kanban automation) | Direct revenue |
| **2c** | Morning Briefing · AR Collections Agent | Trust + recovered dollars |
| **3** | Inventory/ETA chaser · Used Listing Agent · Voice | Ops leverage |
| **4** | Photo quoting · Fleet concierge · Reviews · Weather · BYO copilot · Lifecycle | Differentiation |

## Shared Infrastructure Backlog (unlocks Phase 2+)

- [ ] Database + persistence (replace mock-data.ts) — Postgres suggested
- [ ] Auth (staff logins; roles already modeled: admin/manager/sales/installer)
- [ ] SMS provider account + number (Twilio or similar)
- [ ] `conversations` + `agent_actions` (audit log) tables
- [ ] Google Cloud service account *(waiting on Brad — see Phase 2a)*
- [ ] Website form → CRM webhook
- [ ] Product/fitment knowledge base for Sarah
