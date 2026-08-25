"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { formatIDR } from "@/lib/format";
import { useCart } from "./cart-context";

interface SuccessDialogProps {
	open: boolean;
	orderId: string | null;
	totalInt: number;
	onNewOrder: () => void;
}

/**
 * Post-checkout confirmation (decision #3: success screen, no printing).
 * Native <dialog> so it lives in the top layer like the payment modal it
 * replaces on screen — backdrop click and Escape both dismiss.
 */
export function SuccessDialog({
	open,
	orderId,
	totalInt,
	onNewOrder,
}: SuccessDialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const { clear } = useCart();

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	function finish() {
		clear();
		onNewOrder();
	}

	return (
		<dialog
			ref={dialogRef}
			aria-labelledby="success-title"
			onClose={onNewOrder}
			onClick={(e) => {
				if (e.target === dialogRef.current) finish();
			}}
			className="mx-auto max-w-[min(22rem,calc(100vw-2rem))] w-[min(22rem,calc(100vw-2rem))] bg-transparent p-0 border-0 backdrop:bg-semantic-overlay/70"
		>
			<div className="rounded-lg border border-hairline bg-surface-1 p-6 text-center">
				<CheckCircle2
					className="mx-auto h-12 w-12 text-semantic-success"
					aria-hidden="true"
				/>
				<h2 id="success-title" className="mt-3 text-lg font-medium text-ink">
					Pesanan dibuat
				</h2>
				<p className="mt-1 text-sm text-ink-muted">
					Pesanan telah diterima antrean dapur.
				</p>
				<dl className="mt-4 space-y-1.5 rounded-md bg-surface-2 px-3.5 py-3 text-left text-sm">
					<div className="flex justify-between">
						<dt className="text-ink-subtle">Pesanan</dt>
						<dd className="font-mono text-[13px] text-ink">
							#{orderId ? orderId.slice(0, 8).toUpperCase() : "—"}
						</dd>
					</div>
					<div className="flex justify-between">
						<dt className="text-ink-subtle">Total</dt>
						<dd className="font-semibold tabular-nums text-ink">
							{formatIDR(String(totalInt))}
						</dd>
					</div>
				</dl>
				<button
					type="button"
					autoFocus
					onClick={finish}
					className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover active:bg-primary-focus"
				>
					Mulai pesanan baru
				</button>
			</div>
		</dialog>
	);
}
