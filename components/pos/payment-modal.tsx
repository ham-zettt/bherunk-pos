"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { Banknote, Loader2, QrCode, X } from "lucide-react";
import { createOrder, type CheckoutState } from "@/app/actions/orders";
import { formatIDR } from "@/lib/format";
import { formatAmount } from "@/lib/money";
import { useCart } from "./cart-context";

const initialCheckout: CheckoutState = {};

interface PaymentModalProps {
	open: boolean;
	subtotalInt: number;
	/** Called after a successful order (parent shows the success screen). */
	onOrdered: (orderId: string) => void;
	onClose: () => void;
}

export function PaymentModal({
	open,
	subtotalInt,
	onOrdered,
	onClose,
}: PaymentModalProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const handledOrderRef = useRef<string | null>(null);
	const { lines, notes } = useCart();
	const [state, action, pending] = useActionState(
		createOrder,
		initialCheckout,
	);
	const [method, setMethod] = useState<"CASH" | "QRIS">("CASH");
	const [cashReceived, setCashReceived] = useState<string>("");

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) {
			setMethod("CASH");
			setCashReceived("");
			dialog.showModal();
		}
		if (!open && dialog.open) dialog.close();
	}, [open]);

	useEffect(() => {
		if (
			state.ok &&
			state.orderId &&
			handledOrderRef.current !== state.orderId
		) {
			handledOrderRef.current = state.orderId;
			onOrdered(state.orderId);
		}
	}, [state.ok, state.orderId, onOrdered]);

	const receivedInt = Number.parseInt(cashReceived, 10);
	const cashValid =
		method !== "CASH" ||
		(Number.isFinite(receivedInt) && receivedInt >= subtotalInt);

	const cartPayload = JSON.stringify(
		lines.map((l) => ({
			productId: l.productId,
			qty: l.qty,
			note: notes[l.productId],
		})),
	);

	return (
		<dialog
			ref={dialogRef}
			aria-labelledby="payment-dialog-title"
			onClose={onClose}
			onClick={(e) => {
				if (e.target === dialogRef.current) onClose();
			}}
			className="w-[min(24rem,calc(100vw-2rem))] mx-auto my-auto rounded-lg border border-hairline bg-surface-1 p-6 text-ink backdrop:bg-semantic-overlay/70"
		>
			<div className="flex items-start justify-between gap-4">
				<h2
					id="payment-dialog-title"
					className="text-lg font-medium text-ink"
				>
					Pembayaran
				</h2>
				<button
					type="button"
					aria-label="Tutup dialog pembayaran"
					onClick={onClose}
					className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-2 hover:text-ink"
				>
					<X className="h-4 w-4" aria-hidden="true" />
				</button>
			</div>

			<form action={action} className="mt-4 space-y-4" noValidate>
				<input type="hidden" name="cart" value={cartPayload} />
				<input type="hidden" name="paymentMethod" value={method} />

				{state.message && !state.ok && (
					<p
						role="alert"
						className="rounded-md bg-surface-2 px-3 py-2 text-sm text-ink-muted"
					>
						{state.message}
					</p>
				)}

				<div className="flex items-baseline justify-between rounded-md bg-surface-2 px-3.5 py-3">
					<span className="text-sm text-ink-muted">Total bayar</span>
					<span className="text-xl font-semibold tabular-nums text-ink">
						{formatIDR(String(subtotalInt))}
					</span>
				</div>

				<fieldset>
					<legend className="mb-1.5 text-sm text-ink-muted">
						Metode
					</legend>
					<div className="grid grid-cols-2 gap-2">
						<MethodChip
							selected={method === "CASH"}
							onClick={() => setMethod("CASH")}
							icon={
								<Banknote
									className="h-4 w-4"
									aria-hidden="true"
								/>
							}
							label="Tunai"
						/>
						<MethodChip
							selected={method === "QRIS"}
							onClick={() => setMethod("QRIS")}
							icon={
								<QrCode
									className="h-4 w-4"
									aria-hidden="true"
								/>
							}
							label="QRIS"
						/>
					</div>
				</fieldset>

				{method === "CASH" && (
					<div className="space-y-1.5">
						<label
							htmlFor="cash-received"
							className="block text-sm text-ink-muted"
						>
							Uang diterima
						</label>
						<input
							id="cash-received"
							name="cashReceived"
							type="number"
							min={0}
							step={1000}
							inputMode="numeric"
							value={cashReceived}
							onChange={(e) => setCashReceived(e.target.value)}
							placeholder="mis. 50000"
							aria-invalid={!cashValid}
							className="w-full rounded-md bg-surface-2 border border-hairline px-3 py-2 text-base tabular-nums text-ink placeholder:text-ink-tertiary outline-none focus-visible:border-hairline-strong focus-visible:outline-2 focus-visible:outline-primary-focus/50"
						/>
						{cashReceived !== "" &&
							Number.isFinite(receivedInt) && (
								<p
									aria-live="polite"
									className="text-sm text-ink-muted"
								>
									{receivedInt >= subtotalInt
										? `Kembalian: Rp ${formatAmount(receivedInt - subtotalInt)}`
										: "Uang diterima belum cukup."}
								</p>
							)}
					</div>
				)}

				<div className="flex justify-end gap-2 pt-1">
					<button
						type="button"
						onClick={onClose}
						className="min-h-[40px] rounded-md bg-surface-2 px-3.5 text-sm font-medium text-ink hover:border-hairline-strong border border-transparent"
					>
						Batal
					</button>
					<button
						type="submit"
						disabled={pending || lines.length === 0 || !cashValid}
						className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover active:bg-primary-focus disabled:cursor-not-allowed disabled:opacity-60"
					>
						{pending && (
							<Loader2
								className="h-4 w-4 animate-spin"
								aria-hidden="true"
							/>
						)}
						{pending ? "Memproses…" : "Konfirmasi Bayar"}
					</button>
				</div>
			</form>
		</dialog>
	);
}

function MethodChip({
	selected,
	onClick,
	icon,
	label,
}: {
	selected: boolean;
	onClick: () => void;
	icon: React.ReactNode;
	label: string;
}) {
	return (
		<button
			type="button"
			aria-pressed={selected}
			onClick={onClick}
			className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border px-3.5 py-2 text-sm font-medium transition-colors ${
				selected
					? "border-primary-focus/60 bg-surface-2 text-ink"
					: "border-hairline bg-canvas text-ink-subtle hover:text-ink"
			}`}
		>
			{icon}
			{label}
		</button>
	);
}
