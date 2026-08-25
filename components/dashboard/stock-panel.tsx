import Link from "next/link";
import { ArrowRight, TriangleAlert } from "lucide-react";
import type { StockRow } from "@/lib/queries/analytics";

interface StockPanelProps {
	stocks: StockRow[];
}

/**
 * Live stock levels, lowest first. Low rows (<10) carry a warning pill;
 * the whole panel links into /inventory for management actions.
 */
export function StockPanel({ stocks }: StockPanelProps) {
	return (
		<section
			aria-label="Level stok"
			className="rounded-lg bg-surface-1 border border-hairline"
		>
			<header className="flex items-center justify-between border-b border-hairline px-4 py-3">
				<h2 className="text-[13px] font-semibold uppercase tracking-[0.6px] text-ink-subtle">
					Stok Rendah
				</h2>
				<Link
					href="/inventory"
					className="inline-flex min-h-[32px] items-center gap-1 rounded-md px-1.5 text-[12px] font-medium text-ink-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-primary-focus/50"
				>
					Atur
					<ArrowRight className="h-3 w-3" aria-hidden="true" />
				</Link>
			</header>

			{stocks.length === 0 ? (
				<p className="px-4 py-10 text-center text-sm text-ink-subtle">
					Tidak ada produk dengan stok rendah.
				</p>
			) : (
				<ul className="max-h-[420px] divide-y divide-hairline overflow-y-auto">
					{stocks.map((p) => {
						const low = p.stock < 10;
						return (
							<li
								key={p.id}
								className="flex items-center gap-3 px-4 py-2.5 text-sm"
							>
								<div className="min-w-0 flex-1">
									<p className="truncate font-medium text-ink">{p.name}</p>
									<p className="text-[12px] text-ink-subtle">
										{p.categoryName}
									</p>
								</div>
								{low ? (
									<span className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-surface-2 px-2.5 py-1 text-[12px] font-semibold leading-none text-ink">
										<TriangleAlert
											className="h-3 w-3 text-red-500"
											aria-hidden="true"
										/>
										Stok Rendah : {p.stock}
									</span>
								) : (
									<span className="shrink-0 tabular-nums text-ink-muted">
										{p.stock}
									</span>
								)}
							</li>
						);
					})}
				</ul>
			)}
		</section>
	);
}
