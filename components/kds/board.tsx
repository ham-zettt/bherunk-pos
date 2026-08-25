"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { useOrderPolling, type KdsOrder } from "@/hooks/use-order-polling";
import { TicketCard } from "./ticket-card";

const COLUMNS = [
	{ status: "IN_QUEUE", label: "Antrean" },
	{ status: "PREPARING", label: "Diproses" },
	{ status: "COMPLETED", label: "Selesai" },
] as const;

/** Completed tickets leave the Done column after this window. */
const COMPLETED_TTL_MS = 30 * 60 * 1000;
const TOAST_TTL_MS = 8000;

/* ------------------------------------------------------------------ */
/* Sound: tiny two-tone chime via WebAudio (no assets). Browsers gate  */
/* audio behind a user gesture, so the context is unlocked on first    */
/* pointerdown.                                                        */
/* ------------------------------------------------------------------ */

let audioCtx: AudioContext | null = null;

function ensureAudio(): void {
	if (typeof window === "undefined") return;
	const Ctor =
		window.AudioContext ??
		(window as unknown as { webkitAudioContext?: typeof AudioContext })
			.webkitAudioContext;
	if (!Ctor) return;
	audioCtx ??= new Ctor();
	if (audioCtx.state === "suspended") void audioCtx.resume();
}

function chime(): void {
	try {
		ensureAudio();
		if (!audioCtx) return;
		const now = audioCtx.currentTime;
		const notes = [659.25, 880.0]; // E5 → A5
		for (const [i, freq] of notes.entries()) {
			const osc = audioCtx.createOscillator();
			const gain = audioCtx.createGain();
			osc.type = "sine";
			osc.frequency.value = freq;
			const t0 = now + i * 0.18;
			gain.gain.setValueAtTime(0.0001, t0);
			gain.gain.exponentialRampToValueAtTime(0.22, t0 + 0.02);
			gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3);
			osc.connect(gain).connect(audioCtx.destination);
			osc.start(t0);
			osc.stop(t0 + 0.32);
		}
	} catch {
		// Audio is best-effort; visual alerts still fire.
	}
}

interface Toast {
	key: string;
	orderId: string;
	itemCount: number;
}

interface BoardProps {
	initialOrders: KdsOrder[];
}

export function Board({ initialOrders }: BoardProps) {
	const { orders, stale, refresh } = useOrderPolling(initialOrders);
	const [toasts, setToasts] = useState<Toast[]>([]);
	const [notifState, setNotifState] = useState<
		NotificationPermission | "unsupported"
	>("unsupported");
	/** Ticking clock for TTL aging (deferred set keeps effects rule-clean). */
	const [nowMs, setNowMs] = useState(0);

	/* Unlock audio on first interaction so later chimes are allowed. */
	useEffect(() => {
		const unlock = () => ensureAudio();
		window.addEventListener("pointerdown", unlock, { once: true });
		return () => window.removeEventListener("pointerdown", unlock);
	}, []);

	useEffect(() => {
		const readPermission = () => {
			if ("Notification" in window)
				setNotifState(Notification.permission);
		};
		const t0 = setTimeout(readPermission, 0);
		return () => clearTimeout(t0);
	}, []);

	useEffect(() => {
		const tick = () => setNowMs(Date.now());
		const first = setTimeout(tick, 0);
		const timer = setInterval(tick, 30_000);
		return () => {
			clearTimeout(first);
			clearInterval(timer);
		};
	}, []);

	/* Real-time new-order detection: diff IN_QUEUE ids between polls. */
	const seenQueueRef = useRef<Set<string> | null>(null);
	useEffect(() => {
		const queuedIds = new Set(
			orders.filter((o) => o.status === "IN_QUEUE").map((o) => o.id),
		);

		if (seenQueueRef.current === null) {
			seenQueueRef.current = queuedIds;
			return;
		}

		const fresh = [...queuedIds].filter(
			(id) => !seenQueueRef.current!.has(id),
		);
		seenQueueRef.current = queuedIds;

		if (fresh.length === 0) return;

		chime();
		if (typeof navigator !== "undefined" && "vibrate" in navigator) {
			navigator.vibrate?.([180, 80, 180]);
		}

		const byId = new Map(orders.map((o) => [o.id, o]));
		const newToasts: Toast[] = fresh.map((id) => ({
			key: `${id}:${Date.now()}`,
			orderId: id,
			itemCount: byId.get(id)?.items.reduce((n, i) => n + i.qty, 0) ?? 0,
		}));
		setToasts((prev) => [...newToasts, ...prev].slice(0, 3));

		if (
			document.hidden &&
			typeof window !== "undefined" &&
			"Notification" in window &&
			Notification.permission === "granted"
		) {
			for (const t of newToasts) {
				new Notification("Pesanan baru diterima", {
					body: `#${t.orderId.slice(0, 8).toUpperCase()} · ${t.itemCount} item menunggu`,
				});
			}
		}

		const timers = newToasts.map((t) =>
			setTimeout(
				() => setToasts((prev) => prev.filter((x) => x.key !== t.key)),
				TOAST_TTL_MS,
			),
		);
		return () => timers.forEach(clearTimeout);
	}, [orders]);

	async function requestNotifications() {
		if (typeof window === "undefined" || !("Notification" in window))
			return;
		const result = await Notification.requestPermission();
		setNotifState(result);
		if (result === "granted") ensureAudio();
	}

	function dismissToast(key: string) {
		setToasts((prev) => prev.filter((t) => t.key !== key));
	}

	/* Column buckets; completed tickets age out after the TTL window.
	 * Aging uses the deferred nowMs clock (0 until first tick → nothing
	 * ages out during hydration). */
	const columns = useMemo(() => {
		const cutoff = (nowMs || Infinity) - COMPLETED_TTL_MS;
		const map: Record<string, KdsOrder[]> = {
			IN_QUEUE: [],
			PREPARING: [],
			COMPLETED: [],
		};
		for (const o of orders) {
			if (
				o.status === "COMPLETED" &&
				new Date(o.createdAt).getTime() < cutoff
			) {
				continue; // aged out
			}
			map[o.status]?.push(o);
		}
		return map;
	}, [orders, nowMs]);

	return (
		<div className="relative flex min-h-0 flex-1 flex-col gap-4">
			{/* New-order toasts */}
			<div
				aria-live="assertive"
				className="pointer-events-none fixed left-1/2 top-4 z-[60] flex w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-2"
			>
				{toasts.map((t) => (
					<button
						key={t.key}
						type="button"
						onClick={() => dismissToast(t.key)}
						className="pointer-events-auto rounded-lg border border-yellow-300 bg-surface-1 px-4 py-3 text-left shadow-lg"
					>
						<p className="text-sm font-semibold text-yellow-300">
							Pesanan baru #{t.orderId.slice(0, 8).toUpperCase()}
						</p>
						<p className="mt-0.5 text-[13px] text-amber-400">
							{t.itemCount} item menunggu di antrean — ketuk untuk
							dismiss
						</p>
					</button>
				))}
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				{COLUMNS.map((col) => (
					<section
						key={col.status}
						aria-label={`${col.label} tickets`}
						className="flex min-w-0 flex-col gap-2.5"
					>
						<h2 className="flex items-center justify-between rounded-pill border border-hairline bg-surface-1 px-3.5 py-1.5 text-[13px] font-semibold uppercase tracking-[0.6px] text-ink-subtle">
							{col.label}
							<span className="tabular-nums text-ink-muted">
								{columns[col.status].length}
							</span>
						</h2>
						{columns[col.status].length === 0 ? (
							<p className="rounded-lg border border-dashed border-hairline p-6 text-center text-sm text-ink-tertiary">
								Belum ada tiket
							</p>
						) : (
							columns[col.status].map((order) => (
								<TicketCard
									key={order.id}
									order={order}
									onSynced={refresh}
								/>
							))
						)}
					</section>
				))}
			</div>

			<div className="flex items-center justify-between gap-3">
				{notifState === "granted" ? (
					<span className="inline-flex items-center gap-1.5 text-[12px] text-ink-tertiary">
						<Bell className="h-3.5 w-3.5" aria-hidden="true" />
						Suara &amp; notifikasi aktif
					</span>
				) : notifState === "denied" ? (
					<span className="inline-flex items-center gap-1.5 text-[12px] text-ink-tertiary">
						<BellOff className="h-3.5 w-3.5" aria-hidden="true" />
						Notifikasi diblokir di pengaturan peramban
					</span>
				) : (
					<button
						type="button"
						onClick={requestNotifications}
						className="inline-flex min-h-[32px] items-center gap-1.5 rounded-md px-2 text-[12px] font-medium text-ink-subtle hover:text-ink"
					>
						<Bell className="h-3.5 w-3.5" aria-hidden="true" />
						Aktifkan suara &amp; notifikasi desktop
					</button>
				)}
				<p
					aria-live="polite"
					className="inline-flex items-center gap-1.5 text-[12px] text-ink-tertiary"
				>
					{stale && (
						<Loader2
							className="h-3 w-3 animate-spin"
							aria-hidden="true"
						/>
					)}
					{stale
						? "Menyambungkan ulang…"
						: `Langsung · ${orders.length} tiket`}
				</p>
			</div>
		</div>
	);
}
