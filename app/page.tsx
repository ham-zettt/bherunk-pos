import Link from "next/link";
import {
	Coffee,
	ShieldCheck,
	ShoppingBag,
	UtensilsCrossed,
} from "lucide-react";
import PortalCard from "@/components/ui/portal-card";
import { ROLE_HOME } from "@/lib/constants";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function HomePage() {
	const session = await getSession();
	if (session) {
		redirect(ROLE_HOME[session.role]);
	}
	return (
		<main className="min-h-screen bg-canvas text-ink flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-surface-2)_1px,_transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none" />

			<div className="max-w-4xl w-full z-10 space-y-12">
				<div className="text-center space-y-4">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-hairline text-ink-muted text-xs font-medium tracking-wide">
						<Coffee
							className="w-3.5 h-3.5 text-primary"
							aria-hidden="true"
						/>
						<span>CAFE & RESTO MANAGEMENT SYSTEM</span>
					</div>
					<h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-ink">
						D&apos;Bherunk Cafe & Resto
					</h1>
					<p className="text-ink-subtle text-base md:text-lg max-w-xl mx-auto">
						Aplikasi web untuk mengelola pesanan, inventaris, sistem
						kasir dan laporan penjualan di D&apos;Bherunk Cafe & Resto.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<PortalCard
						session={session}
						title="Admin Dashboard"
						description="Dashboard, telemetri penjualan, kontrol stok inventaris, dan akun staf."
						href="/dashboard"
						icon={ShieldCheck}
					/>

					<PortalCard
						session={session}
						title="Sistem Kasir"
						description="Transaksi menu, pembayaran, dan notifikasi pesanan ke bagian dapur."
						href="/pos"
						icon={ShoppingBag}
					/>

					<PortalCard
						session={session}
						title="Kitchen Display (KDS)"
						description="Order secara real-time dan transisi status pesanan secara langsung."
						href="/kds"
						icon={UtensilsCrossed}
					/>
        </div>

				<div className="flex justify-center">
					<Link
						href="/login"
						className="inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-primary hover:bg-primary-hover active:bg-primary-focus text-on-primary text-sm font-medium transition-colors min-h-[40px]"
					>
						Login Akun
					</Link>
				</div>
			</div>
		</main>
	);
}
