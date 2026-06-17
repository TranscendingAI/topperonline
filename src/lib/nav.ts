/**
 * Centralized navigation config for the CRM sidebar.
 *
 * `href` is a Next.js route segment. For expandable groups with sub-items,
 * `children` is provided and the parent has no direct href.
 *
 * The order here is the order shown in the sidebar.
 */

import {
  LayoutDashboard,
  Users,
  Sparkles,
  Package,
  Calendar,
  BarChart3,
  Wrench,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

export type NavLeaf = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  icon: LucideIcon;
  href?: string; // present for non-expandable items
  children?: NavLeaf[]; // present for expandable groups
  /** Short label used when the sidebar is collapsed (falls back to label) */
  shortLabel?: string;
};

export type NavItem = NavGroup;

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Clients", icon: Users, href: "/clients" },
  { label: "Leads & Outreach", icon: Sparkles, href: "/leads" },
  { label: "Stock", icon: Package, href: "/stock" },
  { label: "Schedule", icon: Calendar, href: "/schedule" },
  {
    label: "Reports",
    icon: BarChart3,
    children: [
      { label: "Ready for Install", href: "/reports/install", icon: ChevronRight },
      { label: "Day End", href: "/reports/day-end", icon: ChevronRight },
      { label: "Sales Analysis", href: "/reports/sales-analysis", icon: ChevronRight },
      { label: "AR", href: "/reports/ar", icon: ChevronRight },
      { label: "Confirmation", href: "/reports/confirmation", icon: ChevronRight },
      { label: "Manufacturer", href: "/reports/manufacturer", icon: ChevronRight },
      { label: "Zip Code", href: "/reports/zip", icon: ChevronRight },
      { label: "Taxable / Non-Taxable", href: "/reports/taxable", icon: ChevronRight },
      { label: "Labor", href: "/reports/labor", icon: ChevronRight },
    ],
  },
  {
    label: "Maintenance",
    icon: Wrench,
    children: [
      { label: "Locations", href: "/maintenance/locations", icon: ChevronRight },
      { label: "Users", href: "/maintenance/users", icon: ChevronRight },
      { label: "Password", href: "/maintenance/password", icon: ChevronRight },
      { label: "Pricing", href: "/maintenance/pricing", icon: ChevronRight },
      { label: "Manufacturers", href: "/maintenance/manufacturers", icon: ChevronRight },
      { label: "Items", href: "/maintenance/items", icon: ChevronRight },
      { label: "Vehicles", href: "/maintenance/vehicles", icon: ChevronRight },
      { label: "Installation Packs", href: "/maintenance/installation-packs", icon: ChevronRight },
    ],
  },
];
