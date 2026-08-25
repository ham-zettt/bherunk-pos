import { Skeleton } from "@/components/ui/skeleton";

/** Loading shell for the KDS board. */
export default function KdsLoading() {
	return (
		<div
			className="grid grid-cols-1 gap-4 md:grid-cols-3"
			role="status"
			aria-label="Memuat"
		>
			{[0, 1, 2].map((col) => (
				<div key={col} className="space-y-2.5">
					<Skeleton className="h-9 rounded-pill" />
					<Skeleton className="h-[140px]" />
					<Skeleton className="h-[140px]" />
				</div>
			))}
			<span className="sr-only">Memuat…</span>
		</div>
	);
}
