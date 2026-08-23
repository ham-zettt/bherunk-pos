"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2, Minus, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { adjustStock } from "@/app/actions/products";
import { formatIDR } from "@/lib/format";
import { ProductDialog } from "./product-dialog";
import { ConfirmDeleteDialog } from "./confirm-delete";
import type { CategoryOption, ProductRow } from "./types";

interface InventoryViewProps {
	products: ProductRow[];
	categories: CategoryOption[];
}

export function InventoryView({ products, categories }: InventoryViewProps) {
	const [activeCategory, setActiveCategory] = useState<string>("all");
	const [dialogProduct, setDialogProduct] = useState<
		ProductRow | null | "closed"
	>("closed");
	const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);

	const visibleProducts = useMemo(
		() =>
			activeCategory === "all"
				? products
				: products.filter((p) => p.categoryId === activeCategory),
		[products, activeCategory],
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-[28px] font-semibold leading-tight tracking-[-0.6px] text-ink">
					Inventory
				</h1>
				<button
					type="button"
					onClick={() => setDialogProduct(null)}
					className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover active:bg-primary-focus"
				>
					<Plus className="h-4 w-4" aria-hidden="true" />
					Add product
				</button>
			</div>

			{/* Category filter tabs (pricing-tab pattern) */}
			<div
				role="tablist"
				aria-label="Filter by category"
				className="flex flex-wrap gap-2"
			>
				<FilterTab
					label="All"
					active={activeCategory === "all"}
					onClick={() => setActiveCategory("all")}
				/>
				{categories.map((c) => (
					<FilterTab
						key={c.id}
						label={c.name}
						active={activeCategory === c.id}
						onClick={() => setActiveCategory(c.id)}
					/>
				))}
			</div>

			{visibleProducts.length === 0 ? (
				<div
					role="status"
					className="rounded-lg bg-surface-1 border border-hairline p-12 text-center"
				>
					<Package
						className="mx-auto h-10 w-10 text-ink-tertiary"
						aria-hidden="true"
					/>
					<h2 className="mt-3 text-sm font-medium text-ink">
						{products.length === 0
							? "No products yet"
							: "No products in this category"}
					</h2>
					<p className="mt-1 text-sm text-ink-subtle">
						{products.length === 0
							? "Get started by adding your first product."
							: "Try a different category filter."}
					</p>
				</div>
			) : (
				<div className="overflow-hidden rounded-lg bg-surface-1 border border-hairline">
					<table className="w-full text-left text-sm table-fixed">
						<thead>
							<tr className="border-b border-hairline text-[13px] uppercase tracking-[0.4px] text-ink-subtle">
								<th
									scope="col"
									className="w-[35%] px-4 py-3 text-left font-medium"
								>
									Product
								</th>

								<th
									scope="col"
									className="hidden w-[20%] px-4 py-3 text-left font-medium md:table-cell"
								>
									Category
								</th>

								<th
									scope="col"
									className="w-[15%] px-4 py-3 text-right font-medium"
								>
									Price
								</th>

								<th
									scope="col"
									className="w-[20%] px-4 py-3 text-center font-medium"
								>
									Stock
								</th>

								<th
									scope="col"
									className="w-[10%] px-4 py-3 text-right font-medium"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{visibleProducts.map((p) => (
								<tr
									key={p.id}
									className="border-b border-hairline last:border-b-0 hover:bg-surface-2/60 transition-colors"
								>
									<td className="px-4 py-3">
										<p className="font-medium text-ink">
											{p.name}
										</p>
										{p.description && (
											<p className="mt-0.5 text-[13px] text-ink-subtle line-clamp-1">
												{p.description}
											</p>
										)}
										{/* Category chip for narrow screens */}
										<span className="md:hidden mt-1 inline-block rounded-xs bg-surface-2 px-1.5 py-0.5 text-[12px] text-ink-muted">
											{p.categoryName}
										</span>
									</td>
									<td className="px-4 py-3 hidden md:table-cell">
										<span className="inline-block rounded-pill bg-surface-2 px-2.5 py-1 text-[12px] leading-none text-ink-muted">
											{p.categoryName}
										</span>
									</td>
									<td className="px-4 py-3 text-right tabular-nums text-ink">
										{formatIDR(p.price)}
									</td>
									<td className="px-4 py-3 text-center">
										<div className="inline-flex items-center justify-end gap-2">
											<StockStepper product={p} />
										</div>
									</td>
									<td className="px-4 py-3">
										<div className="flex items-center justify-end gap-1">
											<IconButton
												label={`Edit ${p.name}`}
												onClick={() =>
													setDialogProduct(p)
												}
											>
												<Pencil
													className="h-4 w-4"
													aria-hidden="true"
												/>
											</IconButton>
											<IconButton
												label={
													p.orderItemCount > 0
														? `${p.name} has order history — cannot delete`
														: `Delete ${p.name}`
												}
												onClick={() =>
													setDeleteTarget(p)
												}
											>
												<Trash2
													className="h-4 w-4"
													aria-hidden="true"
												/>
											</IconButton>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<ProductDialog
				open={dialogProduct !== "closed"}
				product={dialogProduct === "closed" ? null : dialogProduct}
				categories={categories}
				onClose={() => setDialogProduct("closed")}
			/>
			{deleteTarget && (
				<ConfirmDeleteDialog
					product={deleteTarget}
					onClose={() => setDeleteTarget(null)}
				/>
			)}
		</div>
	);
}

/** Inline +/- stepper that calls the adjustStock server action. */
function StockStepper({ product }: { product: ProductRow }) {
	const [pending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	function adjust(delta: 1 | -1) {
		setError(null);
		startTransition(async () => {
			const formData = new FormData();
			formData.set("productId", product.id);
			formData.set("delta", String(delta));
			const result = await adjustStock(formData);
			if (result.message) setError(result.message);
		});
	}

	return (
		<>
			<button
				type="button"
				aria-label={`Decrease stock of ${product.name}`}
				disabled={pending || product.stock === 0}
				onClick={() => adjust(-1)}
				className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-ink-subtle hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
			>
				{pending ? (
					<Loader2
						className="h-3.5 w-3.5 animate-spin"
						aria-hidden="true"
					/>
				) : (
					<Minus className="h-3.5 w-3.5" aria-hidden="true" />
				)}
			</button>
			<span className="tabular-nums text-ink-muted min-w-[2ch]">
				{product.stock}
			</span>
			<button
				type="button"
				aria-label={`Increase stock of ${product.name}`}
				disabled={pending}
				onClick={() => adjust(1)}
				className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-ink-subtle hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
			>
				<Plus className="h-3.5 w-3.5" aria-hidden="true" />
			</button>
			{error && (
				<span role="alert" className="sr-only">
					{error}
				</span>
			)}
		</>
	);
}

function IconButton({
	label,
	onClick,
	children,
}: {
	label: string;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			aria-label={label}
			title={label}
			onClick={onClick}
			className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-primary-focus/50"
		>
			{children}
		</button>
	);
}

function FilterTab({
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
				active
					? "bg-surface-2 text-ink"
					: "bg-canvas text-ink-subtle hover:text-ink"
			}`}
		>
			{label}
		</button>
	);
}
