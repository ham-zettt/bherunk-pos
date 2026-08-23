"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { Loader2, X } from "lucide-react";
import { deleteProduct, type DeleteResult } from "@/app/actions/products";
import type { ProductRow } from "./types";

const initialDeleteState: DeleteResult = {};

interface ConfirmDeleteDialogProps {
	product: ProductRow;
	onClose: () => void;
}

export function ConfirmDeleteDialog({ product, onClose }: ConfirmDeleteDialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [state, action, pending] = useActionState(
		deleteProduct,
		initialDeleteState,
	);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (!dialog.open) dialog.showModal();
	}, []);

	useEffect(() => {
		if (state.ok) onClose();
	}, [state.ok, onClose]);

	const hasHistory = product.orderItemCount > 0;

	return (
		<dialog
			ref={dialogRef}
			aria-labelledby="delete-dialog-title"
			onClose={onClose}
			onClick={(e) => {
				if (e.target === dialogRef.current) onClose();
			}}
			className="w-[min(24rem,calc(100vw-2rem))] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg border border-hairline bg-surface-1 p-6 text-ink backdrop:bg-semantic-overlay/70"
		>
			<div className="flex items-start justify-between gap-4">
				<h2 id="delete-dialog-title" className="text-base font-medium text-ink">
					Delete {product.name}?
				</h2>
				<button
					type="button"
					aria-label="Close dialog"
					onClick={onClose}
					className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-2 hover:text-ink"
				>
					<X className="h-4 w-4" aria-hidden="true" />
				</button>
			</div>

			<p className="mt-3 text-sm text-ink-muted">
				This permanently removes the product from the catalog. This action
				cannot be undone.
			</p>
			{hasHistory && (
				<p role="alert" className="mt-3 text-sm text-ink-muted">
					This product appears in {product.orderItemCount} order record(s).
					Deletion is blocked to keep past orders intact — set its stock to 0
					instead if you want to retire it.
				</p>
			)}
			{state.message && !state.ok && (
				<p
					role="alert"
					className="mt-3 rounded-md bg-surface-2 px-3 py-2 text-sm text-ink-muted"
				>
					{state.message}
				</p>
			)}

			<form action={action} className="mt-5 flex justify-end gap-2">
				<input type="hidden" name="productId" value={product.id} />
				<button
					type="button"
					onClick={onClose}
					className="min-h-[40px] rounded-md bg-surface-2 px-3.5 text-sm font-medium text-ink hover:border-hairline-strong border border-transparent"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={pending || hasHistory}
					className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-surface-2 px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60"
				>
					{pending && (
						<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
					)}
					{hasHistory ? "Blocked" : pending ? "Deleting…" : "Delete"}
				</button>
			</form>
		</dialog>
	);
}
