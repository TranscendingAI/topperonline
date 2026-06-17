"use client";

/**
 * Collapsible primary navigation sidebar.
 *
 * Expanded: 240px wide, shows wordmark, full nav labels, user cluster at bottom.
 * Collapsed: 60px wide, icons only, tooltips on hover.
 *
 * The width transition is 200ms ease-in-out.
 * Label opacity transitions 150ms with a 50ms delay so the width change
 * leads and the label crossfade follows.
 *
 * State is stored in localStorage and exposed via the `data-sidebar` attribute
 * on <html> so pages can respond (e.g. adjust their own max-width).
 *
 * Sizing uses inline style values from the DESIGN.md spec to avoid
 * confusion with Tailwind's spacing scale (e.g. design "44px" = `h-11`,
 * not `h-44` which is 176px in Tailwind).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Settings, ChevronRight } from "lucide-react";
import { NAV_ITEMS, type NavItem, type NavLeaf } from "@/lib/nav";
import { cn, getInitials } from "@/lib/utils";

const STORAGE_KEY = "st-sidebar-collapsed";

// Design spec values (px) — sourced from DESIGN.md
const NAV_ITEM_HEIGHT = 44;
const SUB_ITEM_HEIGHT = 36;
const ICON_BUTTON = 36;
const AVATAR_SIZE = 32;
const EXPAND_BTN = 36;
const SIDEBAR_PAD = 16;
const SIGNAL_BAR = 3;
const SIDEBAR_BORDER = 1;

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount (avoid SSR mismatch)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setCollapsed(true);
    setHydrated(true);
  }, []);

  // Persist + broadcast so other components can react
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, String(collapsed));
    document.documentElement.dataset.sidebar = collapsed ? "collapsed" : "expanded";
  }, [collapsed, hydrated]);

  const width = collapsed ? 60 : 240;

  return (
    <aside
      className="fixed top-0 left-0 h-screen bg-paper z-40 flex flex-col overflow-hidden transition-[width] duration-200 ease-in-out"
      style={{
        width: `${width}px`,
        borderRight: `${SIDEBAR_BORDER}px solid var(--color-chalk)`,
      }}
      aria-label="Primary navigation"
    >
      {/* Wordmark + toggle */}
      <div
        className={cn(
          "flex items-center shrink-0",
          collapsed ? "justify-center" : "gap-12"
        )}
        style={{
          height: "64px",
          paddingLeft: collapsed ? 0 : `${SIDEBAR_PAD}px`,
          paddingRight: collapsed ? 0 : `${SIDEBAR_PAD}px`,
        }}
      >
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="rounded-md flex items-center justify-center shrink-0 text-graphite hover:bg-fog active:bg-chalk transition-colors"
          style={{ width: `${EXPAND_BTN}px`, height: `${EXPAND_BTN}px` }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <Menu size={20} strokeWidth={2} /> : <X size={20} strokeWidth={2} />}
        </button>

        {!collapsed && (
          <span
            className="truncate text-carbon"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              opacity: 1,
              transition: "opacity 150ms ease-in-out 50ms",
            }}
          >
            Suburban Toppers CRM
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav
        className="flex-1 overflow-y-auto min-h-0"
        style={{
          paddingLeft: `${SIDEBAR_PAD}px`,
          paddingRight: `${SIDEBAR_PAD}px`,
          marginTop: "8px",
        }}
        aria-label="Main"
      >
        <ul className="flex flex-col">
          {NAV_ITEMS.map((item) => {
            const hasChildren = !!item.children?.length;
            if (hasChildren) {
              return (
                <ExpandableGroup
                  key={item.label}
                  item={item}
                  pathname={pathname}
                  collapsed={collapsed}
                />
              );
            }
            return (
              <li key={item.label} className="mb-4 last:mb-0">
                <LeafLink
                  item={item}
                  pathname={pathname}
                  collapsed={collapsed}
                />
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Divider + user cluster */}
      <div
        className="shrink-0"
        style={{
          padding: collapsed
            ? `${SIDEBAR_PAD}px 0 0 0`
            : `${SIDEBAR_PAD}px ${SIDEBAR_PAD}px ${SIDEBAR_PAD}px ${SIDEBAR_PAD}px`,
        }}
      >
        {!collapsed && (
          <div
            style={{
              borderTop: "1px solid var(--color-chalk)",
              marginBottom: "12px",
            }}
          />
        )}

        <div
          className={cn("flex items-center", collapsed ? "justify-center" : "gap-12")}
        >
          {/* Avatar */}
          <div
            className="rounded-full bg-chalk flex items-center justify-center shrink-0 text-carbon"
            style={{
              width: `${AVATAR_SIZE}px`,
              height: `${AVATAR_SIZE}px`,
              fontFamily: "var(--font-display)",
              fontSize: "13px",
              fontWeight: 600,
            }}
            aria-hidden="true"
          >
            {getInitials("Zack Vivas")}
          </div>

          {!collapsed && (
            <div
              className="flex-1 min-w-0"
              style={{ transition: "opacity 150ms ease-in-out 50ms" }}
            >
              <div className="truncate text-carbon" style={{ fontSize: "13px", fontWeight: 500 }}>
                Zack Vivas
              </div>
              <div className="truncate text-slate" style={{ fontSize: "12px" }}>
                Admin
              </div>
            </div>
          )}

          {!collapsed && (
            <button
              type="button"
              className="rounded-md flex items-center justify-center text-graphite hover:bg-fog active:bg-chalk transition-colors shrink-0"
              style={{ width: `${ICON_BUTTON}px`, height: `${ICON_BUTTON}px` }}
              aria-label="Settings"
            >
              <Settings size={18} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

function LeafLink({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const href = item.href!;
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "relative flex items-center rounded-md transition-colors",
        active ? "bg-fog text-carbon" : "text-carbon hover:bg-fog"
      )}
      style={{
        height: collapsed ? `${ICON_BUTTON}px` : `${NAV_ITEM_HEIGHT}px`,
        width: collapsed ? `${ICON_BUTTON}px` : "100%",
        margin: collapsed ? "0 auto" : undefined,
        justifyContent: collapsed ? "center" : undefined,
        paddingLeft: collapsed ? 0 : "12px",
        paddingRight: collapsed ? 0 : "12px",
        gap: collapsed ? 0 : "12px",
        fontSize: "14px",
        fontWeight: active ? 600 : 500,
      }}
    >
      {active && (
        <span
          className="absolute bg-signal-orange rounded-r-sm"
          style={{
            left: 0,
            top: "8px",
            bottom: "8px",
            width: `${SIGNAL_BAR}px`,
          }}
          aria-hidden="true"
        />
      )}
      <Icon
        size={20}
        strokeWidth={2}
        className={active ? "text-signal-orange" : "text-graphite"}
        style={{ flexShrink: 0 }}
      />
      {!collapsed && (
        <span
          className="truncate"
          style={{ transition: "opacity 150ms ease-in-out 50ms" }}
        >
          {item.label}
        </span>
      )}
    </Link>
  );
}

function ExpandableGroup({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const childActive = item.children!.some(
    (c) => pathname === c.href || pathname.startsWith(c.href + "/")
  );

  if (collapsed) {
    return (
      <li className="mb-4 last:mb-0">
        <Link
          href={item.children![0].href}
          title={item.label}
          className={cn(
            "relative flex items-center justify-center rounded-md transition-colors",
            childActive ? "bg-fog" : "hover:bg-fog"
          )}
          style={{
            width: `${ICON_BUTTON}px`,
            height: `${ICON_BUTTON}px`,
            margin: "0 auto",
          }}
        >
          {childActive && (
            <span
              className="absolute bg-signal-orange rounded-r-sm"
              style={{
                left: 0,
                top: "8px",
                bottom: "8px",
                width: `${SIGNAL_BAR}px`,
              }}
              aria-hidden="true"
            />
          )}
          <Icon
            size={20}
            strokeWidth={2}
            className={childActive ? "text-signal-orange" : "text-graphite"}
          />
        </Link>
      </li>
    );
  }

  // Expanded mode: collapsible group with sub-list
  const [open, setOpen] = useState(childActive);

  return (
    <li className="mb-4 last:mb-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "flex items-center rounded-md transition-colors text-left",
          childActive ? "bg-fog text-carbon" : "text-carbon hover:bg-fog"
        )}
        style={{
          width: "100%",
          height: `${NAV_ITEM_HEIGHT}px`,
          paddingLeft: "12px",
          paddingRight: "12px",
          gap: "12px",
          fontSize: "14px",
          fontWeight: childActive ? 600 : 500,
        }}
      >
        <Icon
          size={20}
          strokeWidth={2}
          className={childActive ? "text-signal-orange" : "text-graphite"}
          style={{ flexShrink: 0 }}
        />
        <span className="flex-1 truncate">{item.label}</span>
        <ChevronRight
          size={14}
          strokeWidth={2}
          className="text-graphite transition-transform"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", flexShrink: 0 }}
        />
      </button>
      {open && (
        <ul className="flex flex-col" style={{ marginTop: "4px", marginLeft: "32px" }}>
          {item.children!.map((child, i) => (
            <li key={child.href} className={i > 0 ? "mt-2" : ""}>
              <SubItem child={child} pathname={pathname} />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function SubItem({ child, pathname }: { child: NavLeaf; pathname: string }) {
  const active = pathname === child.href;
  return (
    <Link
      href={child.href}
      className={cn(
        "flex items-center rounded-md transition-colors",
        active ? "text-carbon" : "text-graphite hover:bg-fog hover:text-carbon"
      )}
      style={{
        height: `${SUB_ITEM_HEIGHT}px`,
        paddingLeft: "12px",
        paddingRight: "12px",
        fontSize: "13px",
        fontWeight: active ? 500 : 400,
      }}
    >
      {child.label}
    </Link>
  );
}
