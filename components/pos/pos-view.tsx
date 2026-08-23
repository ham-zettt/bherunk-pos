"use client";

import { useMemo, useState } from "react";
import { CartProvider, useCart } from "./cart-context";
import { CatalogGrid } from "./catalog-grid";
import { CartPanel } from "./cart-panel";
import { PaymentModal } from "./payment-modal";
import { SuccessDialog } from "./success-dialog";
import { RecentOrders } from "./recent-orders";
import type { KdsOrder } from "@/hooks/use-order-polling";
import type { PosCategory, PosProduct } from "./types";

interface PosViewProps {
	products: PosProduct[];
	categories: PosCategory[];
	initialRecent: KdsOrder[];
}

export function PosView({ products, categories, initialRecent }: PosViewProps) {
	const productById = useMemo(
		() => new Map(products.map((p) => [p.id, p])),
		[products],
	);

	return (
		<CartProvider>
			<PosWorkspace
				productById={productById}
				products={products}
				categories={categories}
				initialRecent={initialRecent}
			/>
		</CartProvider>
	);
}

function PosWorkspace({
	productById,
	products,
	categories,
	initialRecent,
}: {
	productById: Map<string, PosProduct>;
	products: PosProduct[];
	categories: PosCategory[];
	initialRecent: KdsOrder[];
}) {
	const [payOpen, setPayOpen] = useState(false);
	const [orderId, setOrderId] = useState<string | null>(null);
	const { lines } = useCart();

	const subtotalInt = lines.reduce((sum, l) => {
		const p = productById.get(l.productId);
		return p ? sum + Math.round(Number.parseFloat(p.price)) * l.qty : sum;
	}, 0);

	return (
		<>
			<div className="flex flex-col gap-4 lg:flex-row">
				<CatalogGrid products={products} categories={categories} />
				<CartPanel
					productById={productById}
					onCharge={() => setPayOpen(true)}
				/>
			</div>

			<PaymentModal
				open={payOpen}
				subtotalInt={subtotalInt}
				onOrdered={(id) => {
					setPayOpen(false);
					setOrderId(id);
				}}
				onClose={() => setPayOpen(false)}
			/>
			<SuccessDialog
				open={orderId !== null}
				orderId={orderId}
				totalInt={subtotalInt}
				onNewOrder={() => setOrderId(null)}
			/>
			<RecentOrders initialOrders={initialRecent} />
		</>
	);
}
