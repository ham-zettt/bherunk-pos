"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { Loader2, X } from "lucide-react";
import { createEmployee, type EmployeeFormState } from "@/app/actions/users";

const initialFormState: EmployeeFormState = {};

const ROLES = [
	{ value: "CASHIER", label: "Kasir" },
	{ value: "KITCHEN", label: "Dapur" },
	{ value: "ADMIN", label: "Admin" },
] as const;

interface AddEmployeeDialogProps {
	open: boolean;
	onClose: () => void;
}

export function AddEmployeeDialog({ open, onClose }: AddEmployeeDialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [state, action, pending] = useActionState(createEmployee, initialFormState);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	useEffect(() => {
		if (state.ok) onClose();
	}, [state.ok, onClose]);

	return (
		<dialog
			ref={dialogRef}
			aria-labelledby="employee-dialog-title"
			onClose={onClose}
			onClick={(e) => {
				if (e.target === dialogRef.current) onClose();
			}}
			className="w-[min(26rem,calc(100vw-2rem))] rounded-lg border border-hairline bg-surface-1 p-6 text-ink backdrop:bg-semantic-overlay/70"
		>
			<div className="flex items-start justify-between gap-4">
				<h2 id="employee-dialog-title" className="text-lg font-medium text-ink">
					Tambah karyawan
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

			<form action={action} className="mt-4 space-y-3" noValidate>
				{state.message && !state.ok && (
					<p
						role="alert"
						className="rounded-md bg-surface-2 px-3 py-2 text-sm text-ink-muted"
					>
						{state.message}
					</p>
				)}

				<Field
					label="Nama lengkap"
					name="name"
					placeholder="Rina Putri"
					error={state.errors?.name?.[0]}
					required
				/>
				<Field
					label="Email"
					name="email"
					type="email"
					placeholder="rina@dbherunk.id"
					autoComplete="off"
					error={state.errors?.email?.[0]}
					required
				/>
				<Field
					label="Kata sandi"
					name="password"
					type="password"
					placeholder="Minimal 8 karakter"
					autoComplete="new-password"
					error={state.errors?.password?.[0]}
					required
				/>

				<div className="space-y-1.5">
					<label htmlFor="role" className="block text-sm text-ink-muted">
						Role <span aria-hidden="true">*</span>
					</label>
					<select
						id="role"
						name="role"
						required
						defaultValue=""
						aria-invalid={Boolean(state.errors?.role)}
						className="w-full rounded-md bg-surface-2 border border-hairline px-3 py-2 text-base text-ink outline-none focus-visible:border-hairline-strong focus-visible:outline-2 focus-visible:outline-primary-focus/50"
					>
						<option value="" disabled>
							Pilih Role…
						</option>
						{ROLES.map((r) => (
							<option key={r.value} value={r.value}>
								{r.label}
							</option>
						))}
					</select>
					{state.errors?.role && (
						<p className="text-sm text-ink-subtle">{state.errors.role[0]}</p>
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
					<button
						type="submit"
						disabled={pending}
						className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover active:bg-primary-focus disabled:cursor-not-allowed disabled:opacity-60"
					>
						{pending && (
							<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
						)}
						{pending ? "Membuat…" : "Buat akun"}
					</button>
				</div>
			</form>
		</dialog>
	);
}

interface FieldProps {
	label: string;
	name: string;
	type?: string;
	placeholder?: string;
	autoComplete?: string;
	error?: string;
	required?: boolean;
}

function Field({
	label,
	name,
	type = "text",
	placeholder,
	autoComplete,
	error,
	required,
}: FieldProps) {
	return (
		<div className="space-y-1.5">
			<label htmlFor={name} className="block text-sm text-ink-muted">
				{label} {required && <span aria-hidden="true">*</span>}
			</label>
			<input
				id={name}
				name={name}
				type={type}
				placeholder={placeholder}
				autoComplete={autoComplete}
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
