"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { AddEmployeeDialog } from "./add-employee-dialog";
import type { EmployeeRow } from "./types";

const ROLE_LABELS: Record<EmployeeRow["role"], string> = {
	ADMIN: "Admin",
	CASHIER: "Cashier",
	KITCHEN: "Kitchen",
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
	day: "numeric",
	month: "short",
	year: "numeric",
});

interface EmployeesViewProps {
	employees: EmployeeRow[];
}

export function EmployeesView({ employees }: EmployeesViewProps) {
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-[28px] font-semibold leading-tight tracking-[-0.6px] text-ink">
					Employees
				</h1>
				<button
					type="button"
					onClick={() => setDialogOpen(true)}
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
				<div className="overflow-hidden rounded-lg bg-surface-1 border border-hairline">
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="border-b border-hairline text-[13px] uppercase tracking-[0.4px] text-ink-subtle">
								<th scope="col" className="px-4 py-3 font-medium">Name</th>
								<th scope="col" className="px-4 py-3 font-medium hidden sm:table-cell">Email</th>
								<th scope="col" className="px-4 py-3 font-medium">Role</th>
								<th scope="col" className="px-4 py-3 font-medium text-right hidden md:table-cell">Joined</th>
							</tr>
						</thead>
						<tbody>
							{employees.map((e) => (
								<tr
									key={e.id}
									className="border-b border-hairline last:border-b-0 hover:bg-surface-2/60 transition-colors"
								>
									<td className="px-4 py-3">
										<p className="font-medium text-ink">{e.name}</p>
										{/* Email for narrow screens */}
										<p className="sm:hidden mt-0.5 text-[13px] text-ink-subtle">{e.email}</p>
									</td>
									<td className="px-4 py-3 hidden sm:table-cell text-ink-muted">
										{e.email}
									</td>
									<td className="px-4 py-3">
										<span className="inline-block rounded-pill bg-surface-2 px-2.5 py-1 text-[12px] font-medium leading-none text-ink-muted">
											{ROLE_LABELS[e.role]}
										</span>
									</td>
									<td className="px-4 py-3 text-right hidden md:table-cell tabular-nums text-ink-muted">
										{dateFormatter.format(new Date(e.createdAt))}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<AddEmployeeDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
			/>
		</div>
	);
}
