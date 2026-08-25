"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function AppError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div
			role="alert"
			className="rounded-lg border border-hairline bg-surface-1 p-12 text-center"
		>
			<h2 className="text-base font-medium text-ink">Terjadi kesalahan</h2>
			<p className="mt-1 text-sm text-ink-subtle">
				Halaman gagal dimuat. Data Anda tetap aman — coba lagi.
			</p>
			<button
				type="button"
				onClick={reset}
				className="mt-5 inline-flex min-h-[40px] items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover active:bg-primary-focus"
			>
				<RefreshCw className="h-4 w-4" aria-hidden="true" />
				Coba lagi
			</button>
		</div>
	);
}
