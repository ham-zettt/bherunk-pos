import { formatIDR } from "@/lib/format";
import type { RecentOrderRow } from "@/lib/queries/analytics";

const STATUS_META: Record<RecentOrderRow["status"], { label: string; dot: string }> = {
	IN_QUEUE: { label: "Menunggu", dot: "bg-ink-tertiary" },
	PREPARING: { label: "Diproses", dot: "bg-semantic-success" },
	COMPLETED: { label: "Selesai", dot: "bg-semantic-success opacity-40" },
};

const timeFmt = new Intl.DateTimeFormat("id-ID", {
	hour: "2-digit",
	minute: "2-digit",
});

export function RecentOrders({ orders }: { orders: RecentOrderRow[] }) {
	return (
		<section
			aria-label="Pesanan terbaru"
			className="rounded-lg bg-surface-1 border border-hairline"
		>
			<header className="flex items-center justify-between border-b border-hairline px-4 py-3">
				<h2 className="text-[13px] font-semibold uppercase tracking-[0.6px] text-ink-subtle">
					Pesanan terbaru
				</h2>
			</header>

			{orders.length === 0 ? (
				<p className="px-4 py-10 text-center text-sm text-ink-subtle">
					Belum ada pesanan — akan muncul di sini setelah transaksi pertama.
				</p>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="border-b border-hairline text-[12px] uppercase tracking-[0.4px] text-ink-subtle">
								<th scope="col" className="px-4 py-2.5 font-medium">Pesanan</th>
								<th scope="col" className="px-4 py-2.5 font-medium">Kasir</th>
								<th scope="col" className="px-4 py-2.5 font-medium text-right hidden sm:table-cell">Item</th>
								<th scope="col" className="px-4 py-2.5 font-medium text-right">Total</th>
								<th scope="col" className="px-4 py-2.5 font-medium">Status</th>
								<th scope="col" className="px-4 py-2.5 font-medium text-right">Waktu</th>
							</tr>
						</thead>
						<tbody>
							{orders.map((o) => {
								const meta = STATUS_META[o.status];
								return (
									<tr
										key={o.id}
										className="border-b border-hairline last:border-b-0 hover:bg-surface-2/60 transition-colors"
									>
										<td className="px-4 py-2.5 font-mono text-[13px] font-semibold text-ink">
											#{o.id.slice(0, 8).toUpperCase()}
										</td>
										<td className="px-4 py-2.5 text-ink-muted">{o.cashierName}</td>
										<td className="px-4 py-2.5 text-right tabular-nums text-ink-muted hidden sm:table-cell">
											{o.itemCount}
										</td>
										<td className="px-4 py-2.5 text-right tabular-nums text-ink">
											{formatIDR(o.totalAmount)}
										</td>
										<td className="px-4 py-2.5">
											<span className="inline-flex items-center gap-1.5 rounded-pill bg-surface-2 px-2.5 py-1 text-[12px] font-medium leading-none text-ink-muted">
												<span
													aria-hidden="true"
													className={`h-1.5 w-1.5 rounded-full ${meta.dot}`}
												/>
												{meta.label}
											</span>
										</td>
										<td className="px-4 py-2.5 text-right tabular-nums text-ink-muted">
											{timeFmt.format(new Date(o.createdAt))}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
}
