"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, LayoutDashboard, LogOut, Menu, Package, Users } from "lucide-react";
import { logout } from "@/app/actions/auth";
import type { Role } from "@/lib/constants";

interface AppShellProps {
  user: { name: string; role: Role };
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/employees", label: "Employees", icon: Users },
] as const;

export function AppShell({ user, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-hairline bg-canvas px-4 md:hidden">
        <BrandMark />
        <button
          type="button"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink-muted hover:bg-surface-1 hover:text-ink"
        >
          {mobileOpen ? <Menu className="h-5 w-5 rotate-45" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </header>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <nav aria-label="Primary" className="border-b border-hairline bg-canvas px-3 py-2 md:hidden">
          <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          <div className="mt-2 border-t border-hairline pt-2">
            <UserBlock name={user.name} role={user.role} />
          </div>
        </nav>
      )}

      <div className="flex">
        {/* Desktop sidebar rail */}
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-hairline bg-canvas md:flex">
          <div className="flex h-14 items-center border-b border-hairline px-4">
            <BrandMark />
          </div>
          <nav aria-label="Primary" className="flex-1 space-y-1 overflow-y-auto p-3">
            <NavLinks pathname={pathname} />
          </nav>
          <div className="border-t border-hairline p-3">
            <UserBlock name={user.name} role={user.role} />
          </div>
        </aside>

        {/* Content area */}
        <main className="min-w-0 flex-1 px-4 py-6 md:ml-60 md:px-8">{children}</main>
      </div>
    </div>
  );
}

function BrandMark() {
  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-primary-focus/50"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-1 border border-hairline">
        <Coffee className="h-4 w-4 text-primary" aria-hidden="true" />
      </span>
      <span className="text-[13px] font-semibold tracking-[0.4px] uppercase text-ink">
        D&apos;Bherunk
      </span>
    </Link>
  );
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[40px] items-center gap-3 rounded-md px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary-focus/50 ${
              active
                ? "bg-surface-2 font-medium text-ink"
                : "text-ink-subtle hover:bg-surface-1 hover:text-ink"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </>
  );
}

function UserBlock({ name, role }: { name: string; role: Role }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="truncate text-sm text-ink">{name}</p>
        <span className="mt-0.5 inline-block rounded-pill bg-surface-2 px-2 py-0.5 text-[12px] leading-none text-ink-muted">
          {role}
        </span>
      </div>
      <form action={logout}>
        <button
          type="submit"
          aria-label="Sign out"
          title="Sign out"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-1 hover:text-ink transition-colors"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
