"use client";

import { useState } from "react";
import { NotebookPen, X } from "lucide-react";
import { useCart } from "./cart-context";

interface NoteEditorProps {
	productId: string;
	productName: string;
}

/** Inline per-line note editor ("less sugar" etc.) inside the cart panel. */
export function NoteEditor({ productId, productName }: NoteEditorProps) {
	const { noteOf, setNote } = useCart();
	const note = noteOf(productId);
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState(note ?? "");

	function close() {
		setOpen(false);
	}

	if (open) {
		return (
			<div className="mt-1.5 flex items-start gap-1.5">
				<textarea
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					rows={2}
					maxLength={200}
					placeholder="e.g. Less sugar"
					aria-label={`Note for ${productName}`}
					autoFocus
					className="min-h-[40px] w-full rounded-md bg-surface-2 border border-hairline px-2.5 py-1.5 text-[13px] text-ink placeholder:text-ink-tertiary outline-none focus-visible:border-hairline-strong focus-visible:outline-2 focus-visible:outline-primary-focus/50"
				/>
				<button
					type="button"
					aria-label="Save note"
					onClick={() => {
						setNote(productId, draft);
						close();
					}}
					className="inline-flex h-8 shrink-0 items-center rounded-md bg-surface-2 px-2.5 text-[12px] font-medium text-ink hover:border-hairline-strong border border-transparent"
				>
					Save
				</button>
				<button
					type="button"
					aria-label="Discard note changes"
					onClick={() => {
						setDraft(note ?? "");
						close();
					}}
					className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-2 hover:text-ink"
				>
					<X className="h-3.5 w-3.5" aria-hidden="true" />
				</button>
			</div>
		);
	}

	return (
		<div className="mt-0.5">
			{note ? (
				<p className="flex items-center gap-1 text-[12px] leading-snug">
					<NotebookPen className="h-3 w-3 shrink-0" aria-hidden="true" />
					<span>{note}</span>
				</p>
			) : null}
			<button
				type="button"
				onClick={() => {
					setDraft(note ?? "");
					setOpen(true);
				}}
				className="mt-0.5 inline-flex min-h-[24px] items-center gap-1 rounded text-[11px] font-medium text-ink-subtle hover:text-ink"
			>
				<NotebookPen className="h-3 w-3" aria-hidden="true" />
				{note ? "Edit note" : "Add note"}
			</button>
		</div>
	);
}
