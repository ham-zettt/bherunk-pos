import { Skeleton } from "@/components/ui/skeleton";

/** Loading shell for all (app) admin pages — sidebar stays mounted. */
export default function AppLoading() {
	return (
		<div className="space-y-6" role="status" aria-label="Memuat">
			<Skeleton className="h-8 w-48" />
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{[0, 1, 2, 3].map((i) => (
					<Skeleton key={i} className="h-[104px]" />
				))}
			</div>
			<Skeleton className="h-72" />
			<span className="sr-only">Memuat…</span>
		</div>
	);
}
