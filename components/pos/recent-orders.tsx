"use client";

import { formatIDR } from "@/lib/format";
import { useOrderPolling, type KdsOrder } from "@/hooks/use-order-polling";

const STATUS_META: Record<
	KdsOrder["status"],
	{ label: string; dot: string }
> = {
	IN_QUEUE: { label: "Menunggu", dot: "bg-ink-tertiary" },
	PREPARING: { label: "Diproses", dot: "bg-semantic-success" },
	COMPLETED: { label: "Selesai", dot: "bg-semantic-success opacity-40" },
};

const timeFmt = new Intl.DateTimeFormat("id-ID", {
	hour: "2-digit",
	minute: "2-digit",
});

interface RecentOrdersProps {
	initialOrders: KdsOrder[];
}

/** Slim live strip for the POS page: latest orders + kitchen status badges. */
export function RecentOrders({ initialOrders }: RecentOrdersProps) {
	const { orders } = useOrderPolling(initialOrders, 5000);
	const latest = [...orders].reverse().slice(0, 8);

	return (
		<section
			aria-label="Pesanan terbaru"
			className="mt-4 rounded-lg border border-hairline bg-surface-1 p-4"
		>
			<h2 className="text-[13px] font-semibold uppercase tracking-[0.4px] text-ink-subtle">
				Pesanan terbaru
			</h2>
			{latest.length === 0 ? (
				<p className="mt-2 text-sm text-ink-subtle">Belum ada pesanan hari ini.</p>
			) : (
				<ul className="mt-2 divide-y divide-hairline">
					{latest.map((o) => {
						const meta = STATUS_META[o.status];
						return (
							<li
								key={o.id}
								className="flex items-center gap-3 py-2 text-sm"
							>
								<span className="font-mono text-[13px] font-semibold text-ink">
									#{o.id.slice(0, 8).toUpperCase()}
								</span>
								<span className="tabular-nums text-[13px] text-ink-subtle">
									{timeFmt.format(new Date(o.createdAt))}
								</span>
								<span className="ml-auto inline-flex items-center gap-1.5 rounded-pill bg-surface-2 px-2.5 py-1 text-[12px] font-medium leading-none text-ink-muted">
									<span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
									{meta.label}
								</span>
								<span className="w-[84px] shrink-0 text-right tabular-nums text-ink">
									{formatIDR(o.total)}
								</span>
							</li>
						);
					})}
				</ul>
			)}
		</section>
	);
}
