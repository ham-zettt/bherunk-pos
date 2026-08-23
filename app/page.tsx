import Link from "next/link";
import { Coffee, LogOut, ShieldCheck, ShoppingBag, UtensilsCrossed, ArrowRight } from "lucide-react";
import { getSession } from "@/lib/session";
import { logout } from "@/app/actions/auth";

export default async function HomePage() {
  const session = await getSession();

  return (
    <main className="min-h-screen bg-canvas text-ink flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-surface-2)_1px,_transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none" />

      <div className="max-w-4xl w-full z-10 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-hairline text-ink-muted text-xs font-medium tracking-wide">
            <Coffee className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            <span>D&apos;BHERUNK CAFE WEBSITE</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-ink">
            D'Bherunk Cafe System
          </h1>
          <p className="text-ink-subtle text-base md:text-lg max-w-xl mx-auto">
            Aplikasi web untuk mengelola pesanan, inventaris, sistem kasir dan laporan penjualan di D'Bherunk Cafe.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Admin / Dashboard */}
          <div className="bg-surface-1 border border-hairline rounded-lg p-6 flex flex-col justify-between hover:border-hairline-strong transition-colors group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-md bg-surface-2 flex items-center justify-center text-primary">
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-medium text-ink">Admin Dashboard</h2>
              <p className="text-ink-subtle text-sm">
                Dashboard, telemetri penjualan, kontrol stok inventaris, dan akun staf.
              </p>
            </div>
            {session?.role === "ADMIN" ? (
              <Link
                href="/dashboard"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Buka Dashboard <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            ) : (
              <Link
                href="/login?redirect=%2Fdashboard"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Akses Dashboard <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            )}
          </div>

          {/* Cashier / POS */}
          <div className="bg-surface-1 border border-hairline rounded-lg p-6 flex flex-col justify-between hover:border-hairline-strong transition-colors group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-md bg-surface-2 flex items-center justify-center text-primary">
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-medium text-ink">Sistem Kasir</h2>
              <p className="text-ink-subtle text-sm">
                Transaksi menu, pembayaran, dan notifikasi pesanan ke bagian dapur.
              </p>
            </div>
            <Link
              href="/pos"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
            >
              Buka Register <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          {/* Kitchen / KDS */}
          <div className="bg-surface-1 border border-hairline rounded-lg p-6 flex flex-col justify-between hover:border-hairline-strong transition-colors group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-md bg-surface-2 flex items-center justify-center text-primary">
                <UtensilsCrossed className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-medium text-ink">Kitchen Display (KDS)</h2>
              <p className="text-ink-subtle text-sm">
                Order secara real-time dan transisi status pesanan secara langsung.
              </p>
            </div>
            <Link
              href="/kds"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
            >
              Buka Kitchen Screen <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Session area */}
        <div className="flex justify-center pt-4">
          {session ? (
            <form action={logout} className="inline-flex items-center gap-4 rounded-full bg-surface-1 border border-hairline py-1.5 pl-4 pr-1.5">
              <span className="text-sm text-ink-muted">
                {session.name}
                <span className="ml-2 rounded-pill bg-surface-2 px-2 py-0.5 text-[12px] text-ink-muted">
                  {session.role}
                </span>
              </span>
              <button
                type="submit"
                aria-label={`Sign out ${session.name}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 hover:bg-surface-3 px-3 py-1.5 text-sm font-medium text-ink transition-colors min-h-[36px]"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sign out
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-primary hover:bg-primary-hover active:bg-primary-focus text-on-primary text-sm font-medium transition-colors min-h-[40px]"
            >
              Login Akun
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
