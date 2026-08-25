"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { formatIDR } from "@/lib/format";
import { useCart } from "./cart-context";
import type { PosCategory, PosProduct } from "./types";

const LOW_STOCK_THRESHOLD = 10;

interface CatalogGridProps {
	products: PosProduct[];
	categories: PosCategory[];
}

export function CatalogGrid({ products, categories }: CatalogGridProps) {
	const [activeCategory, setActiveCategory] = useState<string>("all");
	const [query, setQuery] = useState("");
	const { add, qtyOf } = useCart();

	const visible = useMemo(() => {
		const q = query.trim().toLowerCase();
		return products.filter(
			(p) =>
				(activeCategory === "all" || p.categoryId === activeCategory) &&
				(q === "" || p.name.toLowerCase().includes(q)),
		);
	}, [products, activeCategory, query]);

	return (
		<section aria-label="Katalog produk" className="flex min-w-0 flex-1 flex-col gap-4">
			<div className="flex flex-wrap items-center gap-2">
				<div role="tablist" aria-label="Filter kategori" className="flex flex-wrap gap-2">
					<Tab
						label="Semua"
						active={activeCategory === "all"}
						onClick={() => setActiveCategory("all")}
					/>
					{categories.map((c) => (
						<Tab
							key={c.id}
							label={c.name}
							active={activeCategory === c.id}
							onClick={() => setActiveCategory(c.id)}
						/>
					))}
				</div>
				<div className="relative ml-auto w-full max-w-[220px]">
					<Search
						className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary"
						aria-hidden="true"
					/>
					<input
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Cari produk…"
						aria-label="Cari produk"
						className="w-full rounded-pill bg-surface-1 border border-hairline py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-tertiary outline-none focus-visible:border-hairline-strong focus-visible:outline-2 focus-visible:outline-primary-focus/50"
					/>
				</div>
			</div>

			{visible.length === 0 ? (
				<p role="status" className="rounded-lg border border-hairline bg-surface-1 p-10 text-center text-sm text-ink-subtle">
					Tidak ada produk yang cocok.
				</p>
			) : (
				<ul className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
					{visible.map((p) => {
						const inCart = qtyOf(p.id);
						const soldOut = p.stock < 1;
						const capped = inCart >= p.stock;
						return (
							<li key={p.id}>
								<button
									type="button"
									disabled={soldOut || capped}
									onClick={() => add(p.id, p.stock)}
									aria-label={
										soldOut
											? `${p.name} — habis`
											: `Tambah ${p.name} ke keranjang`
									}
									className={`group flex w-full flex-col gap-1.5 rounded-lg border border-hairline bg-surface-1 p-3.5 text-left transition-colors ${
										soldOut || capped
											? "cursor-not-allowed opacity-45"
											: "hover:border-hairline-strong hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-primary-focus/50"
									}`}
								>
									<span className="line-clamp-2 text-sm font-medium leading-snug text-ink">
										{p.name}
									</span>
									<span className="mt-auto inline-flex items-center justify-between gap-2">
										<span className="tabular-nums text-sm text-ink-muted">
											{formatIDR(p.price)}
										</span>
										{soldOut ? (
											<span className="rounded-pill bg-surface-2 px-2 py-0.5 text-[11px] font-medium leading-none text-ink-subtle">
												Habis
											</span>
										) : inCart > 0 ? (
											<span className="inline-flex items-center gap-1 rounded-pill bg-primary px-2 py-0.5 text-[11px] font-semibold leading-none text-on-primary">
												{inCart}×
												{!capped && (
													<Plus className="h-3 w-3" aria-hidden="true" />
												)}
											</span>
										) : p.stock < LOW_STOCK_THRESHOLD ? (
											<span className="rounded-pill bg-surface-2 px-2 py-0.5 text-[11px] font-medium leading-none text-ink-muted">
												Sisa {p.stock}
											</span>
										) : null}
									</span>
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</section>
	);
}

function Tab({
	label,
	active,
	onClick,
}: {
	label: string;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			role="tab"
			aria-selected={active}
			onClick={onClick}
			className={`min-h-[36px] rounded-pill px-3.5 py-1.5 text-sm font-medium transition-colors ${
				active ? "bg-surface-2 text-ink" : "bg-transparent text-ink-subtle hover:text-ink"
			}`}
		>
			{label}
		</button>
	);
}
