"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface KdsOrderItem {
	name: string;
	qty: number;
	note: string | null;
}

export interface KdsOrder {
	id: string;
	status: "IN_QUEUE" | "PREPARING" | "COMPLETED";
	createdAt: string;
	total: string;
	items: KdsOrderItem[];
}

const DEFAULT_POLL_MS = 3000;

/**
 * Polls /api/orders?active=1 (default every 3s). Pauses while the tab is
 * hidden (battery courtesy) and refetches immediately on return. Keeps the
 * last successful data on transient errors. `refresh()` forces an immediate
 * fetch (used after optimistic transitions).
 */
export function useOrderPolling(
	initialData: KdsOrder[],
	pollMs: number = DEFAULT_POLL_MS,
): { orders: KdsOrder[]; stale: boolean; refresh: () => void } {
	const [orders, setOrders] = useState<KdsOrder[]>(initialData);
	const [stale, setStale] = useState(false);
	const inFlight = useRef(false);

	const fetchOrders = useCallback(async () => {
		if (inFlight.current) return;
		inFlight.current = true;
		try {
			const res = await fetch("/api/orders?active=1", { cache: "no-store" });
			if (!res.ok) throw new Error(String(res.status));
			const json = (await res.json()) as { orders: KdsOrder[] };
			setOrders(json.orders);
			setStale(false);
		} catch {
			setStale(true);
		} finally {
			inFlight.current = false;
		}
	}, []);

	const refresh = useCallback(() => {
		void fetchOrders();
	}, [fetchOrders]);

	useEffect(() => {
		let timer: ReturnType<typeof setInterval> | undefined;

		function start() {
			if (document.hidden) return;
			void fetchOrders();
			timer ??= setInterval(() => void fetchOrders(), pollMs);
		}
		function stop() {
			if (timer) clearInterval(timer);
			timer = undefined;
		}
		function onVisibility() {
			if (document.hidden) stop();
			else start();
		}

		start();
		document.addEventListener("visibilitychange", onVisibility);
		return () => {
			stop();
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [fetchOrders, pollMs]);

	return { orders, stale, refresh };
}
