import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

interface MetricCardProps {
	eyebrow: string;
	value: string;
	/** Absolute delta vs yesterday, preformatted; null = no comparison. */
	delta?: string | null;
	/** Positive deltas render with the success dot (revenue only). */
	deltaTone: "positive" | "negative" | "flat";
	href?: string;
}

export function MetricCard({
	eyebrow,
	value,
	delta,
	deltaTone,
}: MetricCardProps) {
	const DeltaIcon =
		deltaTone === "positive"
			? ArrowUpRight
			: deltaTone === "negative"
				? ArrowDownRight
				: Minus;

	return (
		<div className="rounded-lg bg-surface-1 border border-hairline p-4">
			<p className="text-[13px] font-medium uppercase tracking-[0.6px] text-ink-subtle">
				{eyebrow}
			</p>
			<p className="mt-2 text-[26px] font-semibold leading-none tracking-[-0.5px] tabular-nums text-ink">
				{value}
			</p>
			{delta != null && (
				<p className="mt-2.5 flex items-center gap-1.5 text-[13px]">
					<span
						aria-hidden="true"
						className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${
							deltaTone === "positive" ? "bg-surface-2" : ""
						}`}
					>
						<DeltaIcon
							className={`h-3 w-3 ${
								deltaTone === "positive"
									? "text-semantic-success"
									: "text-ink-tertiary"
							}`}
						/>
					</span>
					<span
						className={
							deltaTone === "positive" ? "font-medium text-ink-muted" : "text-ink-tertiary"
						}
					>
						{delta}
						<span className="sr-only"> versus yesterday</span>
					</span>
				</p>
			)}
		</div>
	);
}
