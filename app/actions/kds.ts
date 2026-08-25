"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import type { OrderStatus } from "@/lib/constants";

const TransitionSchema = z.object({
	orderId: z.uuid(),
	/** start: IN_QUEUE→PREPARING · complete: IN_QUEUE|PREPARING→COMPLETED */
	action: z.enum(["start", "complete"]),
});

export type TransitionResult = { ok?: boolean; message?: string };

const LEGAL_FROM: Record<"start" | "complete", OrderStatus[]> = {
	start: ["IN_QUEUE"],
	complete: ["IN_QUEUE", "PREPARING"],
};

const NEXT_STATUS: Record<"start" | "complete", OrderStatus> = {
	start: "PREPARING",
	complete: "COMPLETED",
};

/**
 * Advance a ticket's status. Authorized roles only (KITCHEN/ADMIN). The
 * where-clause pins the expected source statuses, so racing double-clicks
 * or stale boards cannot apply an illegal transition — the loser gets a
 * soft "changed elsewhere" message instead of corrupting state.
 * Stateful signature for useActionState + plain form posts (no-JS safe).
 */
export async function transitionOrder(
	_prev: TransitionResult,
	formData: FormData,
): Promise<TransitionResult> {
	await requireRole("KITCHEN", "ADMIN");

	const parsed = TransitionSchema.safeParse({
		orderId: formData.get("orderId"),
		action: formData.get("action"),
	});
	if (!parsed.success) {
		return { message: "Permintaan perubahan status tidak valid." };
	}

	const { orderId, action } = parsed.data;

	const exists = await db.order.findUnique({
		where: { id: orderId },
		select: { id: true },
	});
	if (!exists) {
		return { message: "Pesanan tidak lagi ada." };
	}

	const result = await db.order.updateMany({
		where: { id: orderId, status: { in: LEGAL_FROM[action] } },
		data: { status: NEXT_STATUS[action] },
	});

	if (result.count === 0) {
		return { message: "Tiket sudah diproses di layar lain." };
	}

	revalidatePath("/kds");
	revalidatePath("/pos");
	return { ok: true };
}
