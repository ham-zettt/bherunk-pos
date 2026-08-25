"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { Loader2, X } from "lucide-react";
import {
	createProduct,
	updateProduct,
	type ProductFormState,
} from "@/app/actions/products";
import type { CategoryOption, ProductRow } from "./types";

const initialFormState: ProductFormState = {};

interface ProductDialogProps {
	/** null = create mode; set = edit mode (prefilled) */
	product: ProductRow | null;
	categories: CategoryOption[];
	open: boolean;
	onClose: () => void;
}

export function ProductDialog({
	product,
	categories,
	open,
	onClose,
}: ProductDialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [state, action, pending] = useActionState(
		product ? updateProduct : createProduct,
		initialFormState,
	);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	// Re-run when switching between products so stale state clears.
	useEffect(() => {
		if (state.ok) onClose();
	}, [state.ok, onClose]);

	return (
		<dialog
			ref={dialogRef}
			aria-labelledby="product-dialog-title"
			onClose={onClose}
			onClick={(e) => {
				if (e.target === dialogRef.current) onClose();
			}}
			className="w-[min(28rem,calc(100vw-2rem))] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg border border-hairline bg-surface-1 p-6 text-ink backdrop:bg-semantic-overlay/70"
		>
			<div className="flex items-start justify-between gap-4">
				<h2
					id="product-dialog-title"
					className="text-lg font-medium text-ink"
				>
					{product ? `Ubah ${product.name}` : "Tambah produk"}
				</h2>
				<button
					type="button"
					aria-label="Tutup dialog"
					onClick={onClose}
					className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-2 hover:text-ink"
				>
					<X className="h-4 w-4" aria-hidden="true" />
				</button>
			</div>

			<form
				key={product?.id ?? "create"}
				action={action}
				className="mt-4 space-y-3"
				noValidate
			>
				{product && (
					<input type="hidden" name="productId" value={product.id} />
				)}
				{state.message && !state.ok && (
					<p
						role="alert"
						className="rounded-md bg-surface-2 px-3 py-2 text-sm text-ink-muted"
					>
						{state.message}
					</p>
				)}

				<Field
					label="Nama"
					name="name"
					defaultValue={product?.name}
					error={state.errors?.name?.[0]}
					required
				/>
				<Field
					label="Deskripsi"
					name="description"
					defaultValue={product?.description ?? ""}
					error={state.errors?.description?.[0]}
					optional
				/>
				<div className="grid grid-cols-2 gap-3">
					<Field
						label="Harga (IDR)"
						name="price"
						type="number"
						min={1}
						step="any"
						placeholder="22000"
						defaultValue={
							product
								? Number.parseFloat(product.price).toString()
								: undefined
						}
						error={state.errors?.price?.[0]}
						required
					/>
					<Field
						label="Stok"
						name="stock"
						type="number"
						min={0}
						step={1}
						placeholder="0"
						defaultValue={product?.stock}
						error={state.errors?.stock?.[0]}
						required
					/>
				</div>

				<div className="space-y-1.5">
					<label
						htmlFor="categoryId"
						className="block text-sm text-ink-muted"
					>
						Kategori <span aria-hidden="true">*</span>
					</label>
					<select
						id="categoryId"
						name="categoryId"
						required
						aria-invalid={Boolean(state.errors?.categoryId)}
						defaultValue={product?.categoryId ?? ""}
						className="w-full rounded-md bg-surface-2 border border-hairline px-3 py-2 text-base text-ink outline-none focus-visible:border-hairline-strong focus-visible:outline-2 focus-visible:outline-primary-focus/50"
					>
						<option value="" disabled>
							Pilih kategori…
						</option>
						{categories.map((c) => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</select>
					{state.errors?.categoryId && (
						<p className="text-sm text-ink-subtle">
							{state.errors.categoryId[0]}
						</p>
					)}
				</div>

				<div className="flex justify-end gap-2 pt-2">
					<button
						type="button"
						onClick={onClose}
						className="min-h-[40px] rounded-md bg-surface-2 px-3.5 text-sm font-medium text-ink hover:border-hairline-strong border border-transparent"
					>
						Batal
					</button>
					<SubmitButton
						pending={pending}
						label={product ? "Simpan perubahan" : "Simpan produk"}
					/>
				</div>
			</form>
		</dialog>
	);
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
	return (
		<button
			type="submit"
			disabled={pending}
			className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover active:bg-primary-focus disabled:cursor-not-allowed disabled:opacity-60"
		>
			{pending && (
				<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
			)}
			{pending ? "Menyimpan…" : label}
		</button>
	);
}

interface FieldProps {
	label: string;
	name: string;
	error?: string;
	type?: string;
	placeholder?: string;
	min?: number | string;
	step?: number | string;
	defaultValue?: string | number;
	required?: boolean;
	optional?: boolean;
}

function Field({
	label,
	name,
	error,
	type = "text",
	placeholder,
	min,
	step,
	defaultValue,
	required,
	optional,
}: FieldProps) {
	return (
		<div className="space-y-1.5">
			<label htmlFor={name} className="block text-sm text-ink-muted">
				{label} {required && <span aria-hidden="true">*</span>}
				{optional && (
					<span className="text-ink-tertiary">(opsional)</span>
				)}
			</label>
			<input
				id={name}
				name={name}
				type={type}
				min={min}
				step={step}
				placeholder={placeholder}
				defaultValue={defaultValue}
				required={required}
				aria-invalid={Boolean(error)}
				aria-describedby={error ? `${name}-error` : undefined}
				className="w-full rounded-md bg-surface-2 border border-hairline px-3 py-2 text-base text-ink placeholder:text-ink-tertiary outline-none focus-visible:border-hairline-strong focus-visible:outline-2 focus-visible:outline-primary-focus/50"
			/>
			{error && (
				<p id={`${name}-error`} className="text-sm text-ink-subtle">
					{error}
				</p>
			)}
		</div>
	);
}
