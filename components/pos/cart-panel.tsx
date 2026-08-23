"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { formatIDR } from "@/lib/format";
import { formatAmount, toRupiahInt } from "@/lib/money";
import { useCart } from "./cart-context";
import { NoteEditor } from "./note-editor";
import type { PosProduct } from "./types";

interface CartPanelProps {
	/** Indexed lookup for line rendering; keyed by product id. */
	productById: Map<string, PosProduct>;
	onCharge: () => void;
}

export function CartPanel({ productById, onCharge }: CartPanelProps) {
	const { lines, increment, decrement, clear } = useCart();

	const resolved = lines
		.map((l) => {
			const product = productById.get(l.productId);
			return product ? { ...l, product, unit: toRupiahInt(product.price) } : null;
		})
		.filter((x): x is { productId: string; qty: number; product: PosProduct; unit: number } => x !== null);

	const subtotalInt = resolved.reduce((sum, l) => sum + l.unit * l.qty, 0);

	return (
		<aside
			aria-label="Order cart"
			className="flex w-full shrink-0 flex-col rounded-lg border border-hairline bg-surface-1 lg:w-[300px]"
		>
			<div className="flex items-center justify-between border-b border-hairline px-4 py-3">
				<h2 className="text-sm font-semibold uppercase tracking-[0.4px] text-ink-subtle">
					Cart · {resolved.reduce((n, l) => n + l.qty, 0)}
				</h2>
				{resolved.length > 0 && (
					<button
						type="button"
						onClick={clear}
						aria-label="Clear cart"
						title="Clear cart"
						className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-primary-focus/50"
					>
						<Trash2 className="h-4 w-4" aria-hidden="true" />
					</button>
				)}
			</div>

			{resolved.length === 0 ? (
				<p className="px-4 py-10 text-center text-sm text-ink-subtle">
					Tap products to start an order.
				</p>
			) : (
				<ul className="max-h-[46vh] flex-1 space-y-1 overflow-y-auto p-2 lg:max-h-none">
					{resolved.map((l) => (
						<li
							key={l.productId}
							className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-2/60"
						>
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-medium text-ink">
									{l.product.name}
								</p>
								<p className="text-[12px] tabular-nums text-ink-subtle">
									{formatAmount(l.unit)} × {l.qty}
								</p>
								<NoteEditor productId={l.productId} productName={l.product.name} />
							</div>
							<div className="flex items-center gap-0.5">
								<button
									type="button"
									aria-label={`Decrease ${l.product.name}`}
									onClick={() => decrement(l.productId)}
									className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-ink-subtle hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-primary-focus/50"
								>
									<Minus className="h-3.5 w-3.5" aria-hidden="true" />
								</button>
								<span className="min-w-[2ch] text-center text-sm font-semibold tabular-nums text-ink">
									{l.qty}
								</span>
								<button
									type="button"
									aria-label={`Increase ${l.product.name}`}
									disabled={l.qty >= l.product.stock}
									onClick={() => increment(l.productId, l.product.stock)}
									className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-ink-subtle hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-primary-focus/50"
								>
									<Plus className="h-3.5 w-3.5" aria-hidden="true" />
								</button>
							</div>
							<span className="w-[72px] shrink-0 text-right text-sm font-medium tabular-nums text-ink">
								{formatAmount(l.unit * l.qty)}
							</span>
						</li>
					))}
				</ul>
			)}

			<div className="space-y-3 border-t border-hairline px-4 py-4">
				<div className="flex items-baseline justify-between">
					<span className="text-sm text-ink-muted">Subtotal</span>
					{/* Display-only; the server re-snapshots prices at checkout. */}
					<span
						data-testid="cart-subtotal"
						className="text-xl font-semibold tabular-nums tracking-tight text-ink"
					>
						{formatIDR(String(subtotalInt))}
					</span>
				</div>
				<button
					type="button"
					disabled={resolved.length === 0}
					onClick={onCharge}
					className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover active:bg-primary-focus disabled:cursor-not-allowed disabled:opacity-40"
				>
					Charge
				</button>
			</div>
		</aside>
	);
}
