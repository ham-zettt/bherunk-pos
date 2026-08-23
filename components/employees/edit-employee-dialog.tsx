"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { Loader2, X } from "lucide-react";
import { updateEmployee, type EmployeeFormState } from "@/app/actions/users";
import type { EmployeeRow } from "./types";

const initialFormState: EmployeeFormState = {};

const ROLES = [
	{ value: "CASHIER", label: "Cashier" },
	{ value: "KITCHEN", label: "Kitchen" },
	{ value: "ADMIN", label: "Admin" },
] as const;

interface EditEmployeeDialogProps {
	open: boolean;
	employee: EmployeeRow | null;
	isSelf: boolean;
	onClose: () => void;
}

export function EditEmployeeDialog({
	open,
	employee,
	isSelf,
	onClose,
}: EditEmployeeDialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [state, action, pending] = useActionState(
		updateEmployee,
		initialFormState,
	);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	useEffect(() => {
		if (state.ok) onClose();
	}, [state.ok, onClose]);

	const selfRoleLocked = isSelf;

	return (
		<dialog
			ref={dialogRef}
			aria-labelledby="edit-employee-dialog-title"
			onClose={onClose}
			onClick={(e) => {
				if (e.target === dialogRef.current) onClose();
			}}
			className="w-[min(26rem,calc(100vw-2rem))] rounded-lg border border-hairline bg-surface-1 p-6 text-ink backdrop:bg-semantic-overlay/70"
		>
			<div className="flex items-start justify-between gap-4">
				<h2
					id="edit-employee-dialog-title"
					className="text-lg font-medium text-ink"
				>
					{employee ? `Edit ${employee.name}` : "Edit employee"}
				</h2>
				<button
					type="button"
					aria-label="Close dialog"
					onClick={onClose}
					className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-2 hover:text-ink"
				>
					<X className="h-4 w-4" aria-hidden="true" />
				</button>
			</div>

			<form
				key={employee?.id ?? "none"}
				action={action}
				className="mt-4 space-y-3"
				noValidate
			>
				<input type="hidden" name="employeeId" value={employee?.id ?? ""} />
				{state.message && !state.ok && (
					<p
						role="alert"
						className="rounded-md bg-surface-2 px-3 py-2 text-sm text-ink-muted"
					>
						{state.message}
					</p>
				)}

				<div className="space-y-1.5">
					<label htmlFor="edit-name" className="block text-sm text-ink-muted">
						Full name <span aria-hidden="true">*</span>
					</label>
					<input
						id="edit-name"
						name="name"
						type="text"
						required
						defaultValue={employee?.name}
						aria-invalid={Boolean(state.errors?.name)}
						className="w-full rounded-md bg-surface-2 border border-hairline px-3 py-2 text-base text-ink outline-none focus-visible:border-hairline-strong focus-visible:outline-2 focus-visible:outline-primary-focus/50"
					/>
					{state.errors?.name && (
						<p className="text-sm text-ink-subtle">{state.errors.name[0]}</p>
					)}
				</div>

				<div className="space-y-1.5">
					<label htmlFor="edit-role" className="block text-sm text-ink-muted">
						Role <span aria-hidden="true">*</span>
						{selfRoleLocked && (
							<span className="text-ink-tertiary"> (locked for your own account)</span>
						)}
					</label>
					<select
						id="edit-role"
						name="role"
						required
						disabled={selfRoleLocked}
						defaultValue={employee?.role ?? ""}
						aria-invalid={Boolean(state.errors?.role)}
						className="w-full rounded-md bg-surface-2 border border-hairline px-3 py-2 text-base text-ink outline-none focus-visible:border-hairline-strong focus-visible:outline-2 focus-visible:outline-primary-focus/50 disabled:opacity-60"
					>
						<option value="" disabled>
							Select a role…
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

				<div className="space-y-1.5">
					<label
						htmlFor="edit-new-password"
						className="block text-sm text-ink-muted"
					>
						New password{" "}
						<span className="text-ink-tertiary">(leave blank to keep current)</span>
					</label>
					<input
						id="edit-new-password"
						name="newPassword"
						type="password"
						autoComplete="new-password"
						placeholder="Min. 8 characters"
						aria-invalid={Boolean(state.errors?.newPassword)}
						className="w-full rounded-md bg-surface-2 border border-hairline px-3 py-2 text-base text-ink placeholder:text-ink-tertiary outline-none focus-visible:border-hairline-strong focus-visible:outline-2 focus-visible:outline-primary-focus/50"
					/>
					{state.errors?.newPassword && (
						<p className="text-sm text-ink-subtle">
							{state.errors.newPassword[0]}
						</p>
					)}
				</div>

				<div className="flex justify-end gap-2 pt-2">
					<button
						type="button"
						onClick={onClose}
						className="min-h-[40px] rounded-md bg-surface-2 px-3.5 text-sm font-medium text-ink hover:border-hairline-strong border border-transparent"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={pending}
						className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover active:bg-primary-focus disabled:cursor-not-allowed disabled:opacity-60"
					>
						{pending && (
							<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
						)}
						{pending ? "Saving…" : "Save changes"}
					</button>
				</div>
			</form>
		</dialog>
	);
}
