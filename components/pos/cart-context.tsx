"use client";

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useReducer,
} from "react";

export interface CartLine {
	productId: string;
	qty: number;
}

type LinesAction =
	| { type: "add"; productId: string; max: number }
	| { type: "increment"; productId: string; max: number }
	| { type: "decrement"; productId: string }
	| { type: "clear" };

type NotesAction =
	| { type: "set"; productId: string; note: string }
	| { type: "clear" };

function linesReducer(state: CartLine[], action: LinesAction): CartLine[] {
	switch (action.type) {
		case "add": {
			const existing = state.find((l) => l.productId === action.productId);
			if (existing) {
				if (existing.qty >= action.max) return state;
				return state.map((l) =>
					l.productId === action.productId ? { ...l, qty: l.qty + 1 } : l,
				);
			}
			if (action.max < 1) return state;
			return [...state, { productId: action.productId, qty: 1 }];
		}
		case "increment": {
			return state.map((l) =>
				l.productId === action.productId && l.qty < action.max
					? { ...l, qty: l.qty + 1 }
					: l,
			);
		}
		case "decrement": {
			return state
				.map((l) =>
					l.productId === action.productId ? { ...l, qty: l.qty - 1 } : l,
				)
				.filter((l) => l.qty > 0);
		}
		case "clear":
			return [];
		default:
			return state;
	}
}

function notesReducer(
	state: Record<string, string>,
	action: NotesAction,
): Record<string, string> {
	switch (action.type) {
		case "set": {
			const next = { ...state };
			if (action.note.trim() === "") delete next[action.productId];
			else next[action.productId] = action.note.trim();
			return next;
		}
		case "clear":
			return {};
		default:
			return state;
	}
}

interface CartContextValue {
	lines: CartLine[];
	notes: Record<string, string>;
	noteOf: (productId: string) => string | undefined;
	qtyOf: (productId: string) => number;
	add: (productId: string, max: number) => void;
	increment: (productId: string, max: number) => void;
	decrement: (productId: string) => void;
	setNote: (productId: string, note: string) => void;
	clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [lines, dispatchLines] = useReducer(linesReducer, []);
	const [notes, dispatchNotes] = useReducer(notesReducer, {});

	const qtyOf = useCallback(
		(productId: string) =>
			lines.find((l) => l.productId === productId)?.qty ?? 0,
		[lines],
	);

	const noteOf = useCallback(
		(productId: string) => notes[productId],
		[notes],
	);

	const value = useMemo<CartContextValue>(
		() => ({
			lines,
			notes,
			noteOf,
			qtyOf,
			add: (productId, max) =>
				dispatchLines({ type: "add", productId, max }),
			increment: (productId, max) =>
				dispatchLines({ type: "increment", productId, max }),
			decrement: (productId) => dispatchLines({ type: "decrement", productId }),
			setNote: (productId, note) =>
				dispatchNotes({ type: "set", productId, note }),
			clear: () => {
				dispatchLines({ type: "clear" });
				dispatchNotes({ type: "clear" });
			},
		}),
		[lines, notes, noteOf, qtyOf],
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
	const ctx = useContext(CartContext);
	if (!ctx) throw new Error("useCart must be used within CartProvider");
	return ctx;
}
