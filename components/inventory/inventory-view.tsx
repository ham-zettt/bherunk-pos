"use client";

import { useMemo, useState, useTransition } from "react";
import {
	ArrowDown,
	ArrowUp,
	ChevronsUpDown,
	Loader2,
	Minus,
	Package,
	Pencil,
	Plus,
	Search,
	Trash2,
} from "lucide-react";
import { adjustStock } from "@/app/actions/products";
import { formatIDR } from "@/lib/format";
import { ProductDialog } from "./product-dialog";
import { ConfirmDeleteDialog } from "./confirm-delete";
import type { CategoryOption, ProductRow } from "./types";

const PAGE_SIZE = 15;

type SortKey = "name" | "categoryName" | "price" | "stock";
type SortDir = "asc" | "desc";

interface InventoryViewProps {
	products: ProductRow[];
	categories: CategoryOption[];
}

export function InventoryView({ products, categories }: InventoryViewProps) {
	const [activeCategory, setActiveCategory] = useState<string>("all");
	const [sortKey, setSortKey] = useState<SortKey>("name");
	const [sortDir, setSortDir] = useState<SortDir>("asc");
	const [page, setPage] = useState(1);
	const [dialogProduct, setDialogProduct] = useState<
		ProductRow | null | "closed"
	>("closed");
	const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);
	const [query, setQuery] = useState("");
	const [createKey, setCreateKey] = useState(0);

	function toggleSort(key: SortKey) {
		if (key === sortKey) {
			setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortKey(key);
			setSortDir("asc");
		}
		setPage(1);
	}

	const filteredProducts = useMemo(() => {
		const q = query.trim().toLowerCase();
		return products.filter(
			(p) =>
				(activeCategory === "all" || p.categoryId === activeCategory) &&
				(q === "" ||
					p.name.toLowerCase().includes(q) ||
					(p.description ?? "").toLowerCase().includes(q)),
		);
	}, [products, activeCategory, query]);

	const sortedProducts = useMemo(() => {
		const arr = [...filteredProducts];
		arr.sort((a, b) => {
			let cmp = 0;
			switch (sortKey) {
				case "name":
					cmp = a.name.localeCompare(b.name, "id");
					break;
				case "categoryName":
					cmp =
						a.categoryName.localeCompare(b.categoryName, "id") ||
						a.name.localeCompare(b.name, "id");
					break;
				case "price":
					cmp =
						Number.parseFloat(a.price) - Number.parseFloat(b.price);
					break;
				case "stock":
					cmp =
						a.stock - b.stock || a.name.localeCompare(b.name, "id");
					break;
			}
			return sortDir === "asc" ? cmp : -cmp;
		});
		return arr;
	}, [filteredProducts, sortKey, sortDir]);

	const totalPages = Math.max(
		1,
		Math.ceil(sortedProducts.length / PAGE_SIZE),
	);
	const safePage = Math.min(page, totalPages);
	const pageItems = useMemo(
		() =>
			sortedProducts.slice(
				(safePage - 1) * PAGE_SIZE,
				safePage * PAGE_SIZE,
			),
		[sortedProducts, safePage],
	);

	function changeCategory(id: string) {
		setActiveCategory(id);
		setPage(1);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-[28px] font-semibold leading-tight tracking-[-0.6px] text-ink">
					Kelola Menu
				</h1>
				<button
					type="button"
					onClick={() => {
						setCreateKey((k) => k + 1);
						setDialogProduct(null);
					}}
					className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover active:bg-primary-focus"
				>
					<Plus className="h-4 w-4" aria-hidden="true" />
					Add product
				</button>
			</div>

			{/* Category filter tabs (pricing-tab pattern) */}
			<div
				role="tablist"
				aria-label="Filter kategori"
				className="flex flex-wrap gap-2"
			>
				<div className="relative max-w-[240px]">
					<Search
						className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary"
						aria-hidden="true"
					/>
					<input
						type="search"
						value={query}
						onChange={(e) => {
							setQuery(e.target.value);
							setPage(1);
						}}
						placeholder="Cari produk…"
						aria-label="Cari produk"
						className="w-full rounded-pill bg-surface-1 border border-hairline py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-tertiary outline-none focus-visible:border-hairline-strong focus-visible:outline-2 focus-visible:outline-primary-focus/50"
					/>
				</div>
				<FilterTab
					label="Semua"
					active={activeCategory === "all"}
					onClick={() => changeCategory("all")}
				/>
				{categories.map((c) => (
					<FilterTab
						key={c.id}
						label={c.name}
						active={activeCategory === c.id}
						onClick={() => changeCategory(c.id)}
					/>
				))}
			</div>

			{sortedProducts.length === 0 ? (
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
							? "Belum ada produk"
							: query.trim() !== ""
								? `Tidak ada hasil untuk "${query.trim()}"`
								: "Tidak ada produk di kategori ini"}
					</h2>
					<p className="mt-1 text-sm text-ink-subtle">
						{products.length === 0
							? "Tidak ada produk."
							: query.trim() !== ""
								? "Coba kata kunci lain atau hapus filter kategori."
								: "Coba filter kategori lain."}
					</p>
				</div>
			) : (
				<div className="overflow-hidden rounded-lg bg-surface-1 border border-hairline">
					<table className="w-full text-left text-sm table-fixed">
						<thead>
							<tr className="border-b border-hairline text-[13px] uppercase tracking-[0.4px] text-ink-subtle">
								<SortableTh
									label="Produk"
									sortKey="name"
									activeKey={sortKey}
									dir={sortDir}
									onSort={toggleSort}
									align="left"
									width="w-[35%]"
								/>

								<SortableTh
									label="Kategori"
									sortKey="categoryName"
									activeKey={sortKey}
									dir={sortDir}
									onSort={toggleSort}
									align="left"
									width="hidden w-[20%] md:table-cell"
								/>

								<SortableTh
									label="Harga"
									sortKey="price"
									activeKey={sortKey}
									dir={sortDir}
									onSort={toggleSort}
									align="right"
									width="w-[15%]"
								/>

								<SortableTh
									label="Stok"
									sortKey="stock"
									activeKey={sortKey}
									dir={sortDir}
									onSort={toggleSort}
									align="center"
									width="w-[20%]"
								/>

								<th
									scope="col"
									className="w-[10%] px-4 py-3 text-right font-medium"
								>
									Aksi
								</th>
							</tr>
						</thead>
						<tbody>
							{pageItems.map((p) => (
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
												label={`Ubah ${p.name}`}
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
														? `${p.name} memiliki riwayat pesanan — tidak dapat dihapus`
														: `Hapus ${p.name}`
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
					<PaginationFooter
						page={safePage}
						totalPages={totalPages}
						totalItems={sortedProducts.length}
						onPageChange={setPage}
					/>
				</div>
			)}

		<ProductDialog
			key={dialogProduct === "closed" ? undefined : dialogProduct?.id ?? `create-${createKey}`}
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

/** Sortable column header with aria-sort and direction indicator. */
function SortableTh({
	label,
	sortKey,
	activeKey,
	dir,
	onSort,
	align,
	width = "",
}: {
	label: string;
	sortKey: SortKey;
	activeKey: SortKey;
	dir: SortDir;
	onSort: (key: SortKey) => void;
	align: "left" | "right" | "center";
	width?: string;
}) {
	const active = activeKey === sortKey;
	const Icon = !active ? ChevronsUpDown : dir === "asc" ? ArrowUp : ArrowDown;
	const alignClass =
		align === "right"
			? "text-right"
			: align === "center"
				? "text-center"
				: "text-left";
	return (
		<th
			scope="col"
			aria-sort={
				active ? (dir === "asc" ? "ascending" : "descending") : "none"
			}
			className={`${width} px-4 py-3 ${alignClass} font-medium`}
		>
			<button
				type="button"
				onClick={() => onSort(sortKey)}
				className={`inline-flex min-h-[32px] items-center gap-1 uppercase tracking-[0.4px] transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-primary-focus/50 ${
					active ? "text-ink" : ""
				}`}
			>
				{label}
				<Icon
					className={`h-3.5 w-3.5 ${active ? "text-ink" : "text-ink-tertiary"}`}
					aria-hidden="true"
				/>
				<span className="sr-only">
					{active
						? `, diurutkan ${dir === "asc" ? "menaik" : "menurun"}`
						: ", aktifkan untuk mengurutkan"}
				</span>
			</button>
		</th>
	);
}

/** Table footer: row-range summary + prev/next pager. */
function PaginationFooter({
	page,
	totalPages,
	totalItems,
	onPageChange,
}: {
	page: number;
	totalPages: number;
	totalItems: number;
	onPageChange: (page: number) => void;
}) {
	const start = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
	const end = Math.min(page * PAGE_SIZE, totalItems);
	const pagerBtn =
		"inline-flex min-h-[36px] items-center gap-1 rounded-md border border-transparent px-3 text-sm font-medium text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40";
	return (
		<div className="flex flex-wrap items-center justify-between gap-2 border-t border-hairline px-4 py-3">
			<p className="text-[13px] tabular-nums text-ink-subtle">
				Menampilkan {start}&ndash;{end} dari{" "}
				{new Intl.NumberFormat("id-ID").format(totalItems)} produk
			</p>
			<nav
				aria-label="Paginasi tabel"
				className="flex items-center gap-1"
			>
				<button
					type="button"
					onClick={() => onPageChange(page - 1)}
					disabled={page <= 1}
					aria-label="Halaman sebelumnya"
					className={pagerBtn}
				>
					Sebelumnya
				</button>
				<span
					aria-current="page"
					className="px-2 text-[13px] font-medium tabular-nums text-ink"
				>
					Halaman {page} dari {totalPages}
				</span>
				<button
					type="button"
					onClick={() => onPageChange(page + 1)}
					disabled={page >= totalPages}
					aria-label="Halaman berikutnya"
					className={pagerBtn}
				>
					Berikutnya
				</button>
			</nav>
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
				aria-label={`Kurangi stok ${product.name}`}
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
				aria-label={`Tambah stok ${product.name}`}
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
