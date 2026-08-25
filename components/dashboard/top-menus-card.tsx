import type { TopMenuRow } from "@/lib/queries/analytics";

const RANK_STYLES = ["text-ink", "text-ink-muted", "text-ink-subtle"] as const;

/** 4th metric slot: top 3 best-selling menus, calendar month to date. */
export function TopMenusCard({ items }: { items: TopMenuRow[] }) {
	return (
		<div className="rounded-lg bg-surface-1 border border-hairline p-4">
			<p className="flex items-center gap-1.5 text-[13px] font-medium uppercase tracking-[0.6px] text-ink-subtle">
				Top menu Bulan Ini
			</p>

			{items.length === 0 ? (
				<p className="mt-4 text-sm text-ink-subtle">
					Belum ada penjualan bulan ini.
				</p>
			) : (
				<ol className="mt-3 space-y-2">
					{items.map((item, idx) => (
						<li
							key={item.productId}
							className="flex items-center gap-2.5"
						>
							<span
								aria-hidden="true"
								className={`inline-flex h-6 w-6 shrink-0 items-center justify-center text-[12px] font-semibold tabular-nums`}
							>
								{idx + 1}
							</span>
							<span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
								{item.name}
								{idx === 0 && (
									<span className="sr-only"> — terlaris</span>
								)}
							</span>
							<span className="shrink-0 tabular-nums text-[13px] text-ink-muted">
								{new Intl.NumberFormat("id-ID").format(
									item.qtySold,
								)}{" "}
								terjual
							</span>
						</li>
					))}
				</ol>
			)}
		</div>
	);
}
