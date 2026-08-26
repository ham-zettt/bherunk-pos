"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { AlarmClock, Check, ChefHat, Loader2 } from "lucide-react";
import { transitionOrder, type TransitionResult } from "@/app/actions/kds";
import type { KdsOrder } from "@/hooks/use-order-polling";

const LATE_AFTER_MS = 15 * 60 * 1000;

/** Ticking elapsed timer; re-renders only this component every second. */
function useElapsed(createdAt: string): number {
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(timer);
	}, []);

	return Math.max(0, now - new Date(createdAt).getTime());
}

function formatElapsed(ms: number): string {
	const totalSec = Math.floor(ms / 1000);
	const h = Math.floor(totalSec / 3600);
	const m = Math.floor((totalSec % 3600) / 60);
	const s = totalSec % 60;
	const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
	return `${h > 0 ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

interface TicketCardProps {
	order: KdsOrder;
	onSynced: () => void;
}

const initialTransition: TransitionResult = {};

export function TicketCard({ order, onSynced }: TicketCardProps) {
	const elapsed = useElapsed(order.createdAt);
	const late = elapsed >= LATE_AFTER_MS;
	const shortId = order.id.slice(0, 8).toUpperCase();

	const [state, formAction, isPending] = useActionState(
		transitionOrder,
		initialTransition,
	);
	// Which button is in flight — drives the optimistic status pill.
	const [pendingKind, setPendingKind] = useState<"start" | "complete" | null>(
		null,
	);
	const seenStateRef = useRef<TransitionResult | null>(null);

	// After each completed flight, nudge the board to resync (deferred —
	// effects only touch external systems here).
	useEffect(() => {
		if (!seenStateRef.current || seenStateRef.current === state) return;
		if (!state.ok) return;
		const t = setTimeout(() => onSynced(), 0);
		return () => clearTimeout(t);
	}, [state, onSynced]);
	useEffect(() => {
		seenStateRef.current = state;
	}, [state]);

	// Optimistic while pending; on failure the override disappears with it
	// (rollback), and the board resyncs via polling/onSynced on success.
	const status =
		isPending && pendingKind
			? pendingKind === "start"
				? "PREPARING"
				: "COMPLETED"
			: order.status;

	return (
		<article
			className={`rounded-lg border bg-surface-1 p-4 ${
				late
					? "border-hairline-strong ring-1 ring-primary-focus/40"
					: "border-hairline"
			}`}
		>
			<header className="flex items-center justify-between gap-2">
				<span className="font-mono text-[13px] font-semibold tracking-wide text-ink">
					#{shortId}
				</span>
				<span
					className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[12px] font-semibold tabular-nums ${
						late ? "bg-surface-2 text-ink" : "text-ink-muted"
					}`}
					title={late ? "Menunggu lebih dari 10 menit" : undefined}
				>
					{status !== "COMPLETED" && (
						<div>
							<AlarmClock
								className="h-3.5 w-3.5"
								aria-hidden="true"
							/>
							{formatElapsed(elapsed)}
						</div>
					)}
					{late && <span className="sr-only"> — terlambat</span>}
				</span>
			</header>

			<ul className="mt-3 space-y-1.5">
				{order.items.map((item, idx) => (
					<li key={idx}>
						<p className="text-sm leading-snug text-ink">
							<span className="font-semibold tabular-nums">
								{item.qty}×
							</span>{" "}
							{item.name}
						</p>
						{/* Notes are never truncated — full callout, always readable */}
						{item.note && (
							<p className="mt-1 inline-block rounded-pill bg-surface-2 px-2.5 py-1 text-[12px] font-medium uppercase leading-snug text-ink">
								Catatan · {item.note}
							</p>
						)}
					</li>
				))}
			</ul>

			{!isPending && state.message && (
				<p
					role="alert"
					className="mt-2 text-[12px] font-medium text-ink-subtle"
				>
					{state.message}
				</p>
			)}

			{status !== "COMPLETED" && (
				<form
					action={formAction}
					className="mt-3 flex gap-2 border-t border-hairline pt-3"
				>
					<input type="hidden" name="orderId" value={order.id} />
					{status === "IN_QUEUE" && (
						<button
							type="submit"
							name="action"
							value="start"
							onClick={(e) =>
								setPendingKind(e.currentTarget.value as "start")
							}
							disabled={isPending}
							className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-md bg-surface-2 px-3 text-sm font-medium text-ink transition-colors hover:border-hairline-strong disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isPending && pendingKind === "start" ? (
								<Loader2
									className="h-4 w-4 animate-spin"
									aria-hidden="true"
								/>
							) : (
								<ChefHat
									className="h-4 w-4"
									aria-hidden="true"
								/>
							)}
							Mulai proses
						</button>
					)}
					<button
						type="submit"
						name="action"
						value="complete"
						onClick={(e) =>
							setPendingKind(e.currentTarget.value as "complete")
						}
						disabled={isPending}
						className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover active:bg-primary-focus disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isPending && pendingKind === "complete" ? (
							<Loader2
								className="h-4 w-4 animate-spin"
								aria-hidden="true"
							/>
						) : (
							<Check className="h-4 w-4" aria-hidden="true" />
						)}
						Selesaikan
					</button>
				</form>
			)}
		</article>
	);
}
