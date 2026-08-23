"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PAYMENT_METHODS } from "@/lib/constants";

const CartItemSchema = z.object({
	productId: z.uuid(),
	qty: z.number().int().min(1).max(999),
	note: z.string().trim().max(200).optional(),
});

const CheckoutSchema = z.object({
	items: z.array(CartItemSchema).min(1).max(50),
	paymentMethod: z.enum(PAYMENT_METHODS),
});

class StockError extends Error {
	constructor(public productName: string) {
		super(`Insufficient stock for ${productName}`);
	}
}

/** Thrown inside the checkout transaction; surfaces as an inline message. */
export type CheckoutState = {
	ok?: boolean;
	orderId?: string;
	message?: string;
};

interface LockedRow {
	id: string;
	name: string;
	price_text: string;
	stock: number;
}

/**
 * Create an order atomically: locks product rows (SELECT … FOR UPDATE),
 * validates sufficiency, snapshots prices, writes Order + OrderItems and
 * decrements stock — all in ONE interactive transaction. A concurrent
 * double-submit serializes on the row locks; the loser sees stale stock
 * and is rejected without side effects.
 */
export async function createOrder(
	_prev: CheckoutState,
	formData: FormData,
): Promise<CheckoutState> {
	const session = await requireRole("CASHIER", "ADMIN");

	let parsedJson: unknown;
	try {
		parsedJson = JSON.parse(String(formData.get("cart") ?? ""));
	} catch {
		return { message: "Invalid cart payload." };
	}

	const parsed = CheckoutSchema.safeParse({
		items: parsedJson,
		paymentMethod: formData.get("paymentMethod"),
	});
	if (!parsed.success) {
		return { message: "Please review your cart and payment method." };
	}

	// Defensive merge: duplicate productIds collapse into one line.
	const merged = new Map<string, { qty: number; note?: string }>();
	for (const item of parsed.data.items) {
		const existing = merged.get(item.productId);
		if (existing) {
			existing.qty += item.qty;
			if (item.note) existing.note = item.note;
		} else {
			merged.set(item.productId, {
				qty: item.qty,
				note: item.note || undefined,
			});
		}
	}
	const items = [...merged.entries()].map(([productId, v]) => ({
		productId,
		qty: v.qty,
		note: v.note,
	}));

	try {
		const order = await db.$transaction(
			async (tx) => {
				const ids = [...merged.keys()].sort();

				const locked = await tx.$queryRaw<LockedRow[]>`
					SELECT id, name, price::text AS price_text, stock
					FROM "Product"
					WHERE id IN (${Prisma.join(ids)})
					FOR UPDATE`;

				const byId = new Map(locked.map((r) => [r.id, r]));

				let totalInt = 0;
				for (const item of items) {
					const row = byId.get(item.productId);
					if (!row) throw new StockError("Unknown product");
					if (row.stock < item.qty) throw new StockError(row.name);
					totalInt += Math.round(Number.parseFloat(row.price_text)) * item.qty;
				}

				const created = await tx.order.create({
					data: {
						cashierId: session.userId,
						totalAmount: totalInt,
						status: "IN_QUEUE",
						paymentMethod: parsed.data.paymentMethod,
						orderItems: {
							create: items.map((item) => ({
								productId: item.productId,
								quantity: item.qty,
								price: Math.round(
									Number.parseFloat(byId.get(item.productId)!.price_text),
								),
								notes: item.note ?? null,
							})),
						},
					},
					select: { id: true },
				});

				// Still inside the same txn + lock window: exactly one decrement
				// per purchased unit; row locks serialize concurrent checkouts.
				await Promise.all(
					items.map((item) =>
						tx.product.updateMany({
							where: { id: item.productId },
							data: { stock: { decrement: item.qty } },
						}),
					),
				);

				return created;
			},
			{ timeout: 10_000 },
		);

		// Push fresh product stock to the cashier's own tab: the action
		// response carries the revalidated /pos payload, so catalog chips
		// update without a manual refresh.
		revalidatePath("/pos");
		revalidatePath("/inventory");
		revalidatePath("/dashboard");

		return { ok: true, orderId: order.id };
	} catch (err) {
		if (err instanceof StockError) {
			return { message: `${err.productName}: not enough stock.` };
		}
		throw err;
	}
}
