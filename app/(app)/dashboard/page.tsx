import { requireRole } from "@/lib/auth";
import {
	getDashboardMetrics,
	getRecentOrders,
	getStockLevels,
	getTopMenusThisMonth,
} from "@/lib/queries/analytics";
import { formatIDR } from "@/lib/format";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TopMenusCard } from "@/components/dashboard/top-menus-card";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { StockPanel } from "@/components/dashboard/stock-panel";

export const metadata = { title: "Dasbor | Sistem Kafe D'BHERUNK" };

type Tone = "positive" | "negative" | "flat";

function tone(delta: number): Tone {
	if (delta > 0) return "positive";
	if (delta < 0) return "negative";
	return "flat";
}

function signedRupiah(delta: number): string {
	const abs = formatIDR(String(Math.abs(delta)));
	return delta > 0 ? `+${abs}` : delta < 0 ? `\u2212${abs}` : abs;
}

function signedInt(delta: number): string {
	const n = Math.abs(delta);
	const body = new Intl.NumberFormat("id-ID").format(n);
	return delta > 0 ? `+${body}` : delta < 0 ? `\u2212${body}` : body;
}

export default async function DashboardPage() {
	await requireRole("ADMIN");

	const [
		{ today, yesterday, lowStockCount },
		recentOrders,
		stocks,
		topMenus,
	] = await Promise.all([
		getDashboardMetrics(),
		getRecentOrders(5),
		getStockLevels(),
		getTopMenusThisMonth(3),
	]);

	const revenueDelta = today.revenue - yesterday.revenue;
	const ordersDelta = today.orders - yesterday.orders;

	// DESIGN.md: the success color is reserved for positive money movement.
	const revenueTone: Tone =
		revenueDelta > 0 ? "positive" : revenueDelta < 0 ? "negative" : "flat";

	return (
		<div className="space-y-6">
			<h1 className="text-[28px] font-semibold leading-tight tracking-[-0.6px] text-ink">
				Dashboard
			</h1>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
				<MetricCard
					eyebrow="Penghasilan Hari Ini"
					value={formatIDR(String(today.revenue))}
					delta={signedRupiah(revenueDelta)}
					deltaTone={revenueTone}
				/>
				<MetricCard
					eyebrow="Pesanan Hari Ini"
					value={new Intl.NumberFormat("id-ID").format(today.orders)}
					delta={signedInt(ordersDelta)}
					deltaTone={tone(ordersDelta)}
				/>
				<MetricCard
					eyebrow="Item Stok Rendah"
					value={new Intl.NumberFormat("id-ID").format(lowStockCount)}
					delta={
						lowStockCount === 0
							? "Semua aman"
							: `${lowStockCount} item dengan stok rendah`
					}
					deltaTone="flat"
				/>
				<TopMenusCard items={topMenus} />
			</div>

			<div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
				<RecentOrders orders={recentOrders} />
				<StockPanel stocks={stocks} />
			</div>
		</div>
	);
}
