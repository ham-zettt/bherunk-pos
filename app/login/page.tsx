import { redirect } from "next/navigation";
import { Coffee } from "lucide-react";
import { getSession } from "@/lib/session";
import { ROLE_HOME } from "@/lib/constants";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
	title: "Masuk | Sistem Kafe D'BHERUNK",
};

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ redirect?: string }>;
}) {
	const session = await getSession();
	if (session) {
		redirect(ROLE_HOME[session.role]);
	}

	const { redirect: redirectTo } = await searchParams;

	return (
		<main className="min-h-screen bg-canvas text-ink flex flex-col items-center justify-center p-6">
			<div className="w-full max-w-sm space-y-8">
				{/* Brand mark */}
				<div className="flex flex-col items-center gap-3 text-center">
					<div className="flex h-11 w-11 items-center justify-center rounded-md bg-surface-1 border border-hairline">
						<Coffee
							className="h-5 w-5 text-primary"
							aria-hidden="true"
						/>
					</div>
					<div>
						<p className="text-[13px] font-medium tracking-[0.4px] text-ink-subtle uppercase">
							D&apos;Bherunk Cafe System
						</p>
						<h1 className="mt-1 text-[28px] font-semibold leading-tight tracking-[-0.6px] text-ink">
							Masuk
						</h1>
					</div>
				</div>

				<LoginForm redirectTo={redirectTo} />
			</div>
		</main>
	);
}
