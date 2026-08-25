import { Skeleton } from "@/components/ui/skeleton";

/** Loading shell for the POS screen. */
export default function PosLoading() {
	return (
		<div
			className="flex flex-col gap-4 lg:flex-row"
			role="status"
			aria-label="Memuat"
		>
			<div className="min-w-0 flex-1 space-y-4">
				<Skeleton className="h-9 w-full max-w-md" />
				<div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
					{Array.from({ length: 8 }).map((_, i) => (
						<Skeleton key={i} className="h-[88px]" />
					))}
				</div>
			</div>
			<Skeleton className="h-80 w-full shrink-0 lg:w-[300px]" />
			<span className="sr-only">Memuat…</span>
		</div>
	);
}
