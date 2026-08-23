"use client";

import { useState } from "react";
import { Pencil, Plus, Power, Users } from "lucide-react";
import { setEmployeeActive } from "@/app/actions/users";
import { AddEmployeeDialog } from "./add-employee-dialog";
import { EditEmployeeDialog } from "./edit-employee-dialog";
import type { EmployeeRow } from "./types";

const ROLE_LABELS: Record<EmployeeRow["role"], string> = {
	ADMIN: "Admin",
	CASHIER: "Cashier",
	KITCHEN: "Kitchen",
};

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
	day: "numeric",
	month: "short",
	hour: "2-digit",
	minute: "2-digit",
});

interface EmployeesViewProps {
	employees: EmployeeRow[];
	currentUserId: string;
}

export function EmployeesView({ employees, currentUserId }: EmployeesViewProps) {
	const [addOpen, setAddOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<EmployeeRow | null>(null);

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-[28px] font-semibold leading-tight tracking-[-0.6px] text-ink">
					Employees
				</h1>
				<button
					type="button"
					onClick={() => setAddOpen(true)}
					className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover active:bg-primary-focus"
				>
					<Plus className="h-4 w-4" aria-hidden="true" />
					Add employee
				</button>
			</div>

			{employees.length === 0 ? (
				<div
					role="status"
					className="rounded-lg bg-surface-1 border border-hairline p-12 text-center"
				>
					<Users
						className="mx-auto h-10 w-10 text-ink-tertiary"
						aria-hidden="true"
					/>
					<h2 className="mt-3 text-sm font-medium text-ink">No employees yet</h2>
					<p className="mt-1 text-sm text-ink-subtle">
						Add your first staff account to get started.
					</p>
				</div>
			) : (
				<div className="overflow-x-auto rounded-lg bg-surface-1 border border-hairline">
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="border-b border-hairline text-[13px] uppercase tracking-[0.4px] text-ink-subtle">
								<th scope="col" className="px-4 py-3 font-medium">Name</th>
								<th scope="col" className="px-4 py-3 font-medium hidden sm:table-cell">Email</th>
								<th scope="col" className="px-4 py-3 font-medium">Role</th>
								<th scope="col" className="px-4 py-3 font-medium">Status</th>
								<th scope="col" className="px-4 py-3 font-medium hidden lg:table-cell">Last activity</th>
								<th scope="col" className="px-4 py-3 font-medium text-right">
									<span className="sr-only">Actions</span>
								</th>
							</tr>
						</thead>
						<tbody>
							{employees.map((e) => (
								<tr
									key={e.id}
									className={`border-b border-hairline last:border-b-0 hover:bg-surface-2/60 transition-colors ${
										e.isActive ? "" : "opacity-60"
									}`}
								>
									<td className="px-4 py-3">
										<p className="font-medium text-ink">
											{e.name}
											{e.id === currentUserId && (
												<span className="ml-2 rounded-pill bg-surface-2 px-2 py-0.5 text-[11px] font-normal leading-none text-ink-muted">
													You
												</span>
											)}
										</p>
										<p className="sm:hidden mt-0.5 text-[13px] text-ink-subtle">
											{e.email}
										</p>
									</td>
									<td className="px-4 py-3 hidden sm:table-cell text-ink-muted">
										{e.email}
									</td>
									<td className="px-4 py-3">
										<span className="inline-block rounded-pill bg-surface-2 px-2.5 py-1 text-[12px] font-medium leading-none text-ink-muted">
											{ROLE_LABELS[e.role]}
										</span>
									</td>
									<td className="px-4 py-3">
										<span className="inline-flex items-center gap-1.5 rounded-pill bg-surface-2 px-2.5 py-1 text-[12px] font-medium leading-none text-ink-muted">
											<span
												aria-hidden="true"
												className={`h-1.5 w-1.5 rounded-full ${e.isActive ? "bg-semantic-success" : "bg-ink-tertiary"}`}
											/>
											{e.isActive ? "Active" : "Deactivated"}
										</span>
									</td>
									<td
										className="px-4 py-3 hidden lg:table-cell tabular-nums text-ink-muted"
										title={
											e.lastOrderAt
												? `Last order: ${dateTimeFormatter.format(new Date(e.lastOrderAt))}`
												: undefined
										}
									>
										{e.lastOrderAt
											? dateTimeFormatter.format(new Date(e.lastOrderAt))
											: "—"}
									</td>
									<td className="px-4 py-3">
										<div className="flex items-center justify-end gap-1">
											<button
												type="button"
												aria-label={`Edit ${e.name}`}
												title={`Edit ${e.name}`}
												onClick={() => setEditTarget(e)}
												className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-primary-focus/50"
											>
												<Pencil className="h-4 w-4" aria-hidden="true" />
											</button>
											{/* Deactivate/activate as a real form per row (works without JS). */}
											<form action={setEmployeeActive}>
												<input type="hidden" name="employeeId" value={e.id} />
												<input
													type="hidden"
													name="active"
													value={e.isActive ? "false" : "true"}
												/>
												<ToggleButton employee={e} disabled={e.id === currentUserId} />
											</form>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<AddEmployeeDialog open={addOpen} onClose={() => setAddOpen(false)} />
			<EditEmployeeDialog
				open={editTarget !== null}
				employee={editTarget}
				isSelf={editTarget?.id === currentUserId}
				onClose={() => setEditTarget(null)}
			/>
		</div>
	);
}

function ToggleButton({
	employee,
	disabled,
}: {
	employee: EmployeeRow;
	disabled: boolean;
}) {
	const nextActive = !employee.isActive;
	const label = nextActive
		? `Reactivate ${employee.name}`
		: `Deactivate ${employee.name}`;
	return (
		<>
			<button
				type="submit"
				aria-label={label}
				title={
					disabled
						? "You cannot deactivate your own account"
						: label
				}
				disabled={disabled}
				className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-primary-focus/50"
			>
				<Power className="h-4 w-4" aria-hidden="true" />
			</button>
			{/* Screen-reader announcement of what this toggle does. */}
			<span className="sr-only">{label}</span>
		</>
	);
}
