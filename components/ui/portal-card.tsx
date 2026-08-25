import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";
import { SessionUser } from "@/lib/constants";

export default function PortalCard({
	title,
	description,
	href,
	icon: Icon,
}: {
	session: SessionUser | null;
	title: string;
	description: string;
	icon: LucideIcon;
	href: string;
}) {
	return (
		<div className="bg-surface-1 border border-hairline rounded-lg p-6 flex flex-col justify-between hover:border-hairline-strong transition-colors group">
			<div className="space-y-3">
				<div className="w-10 h-10 rounded-md bg-surface-2 flex items-center justify-center text-primary">
					<Icon className="w-5 h-5" aria-hidden="true" />
				</div>
				<h2 className="text-lg font-medium text-ink">{title}</h2>
				<p className="text-ink-subtle text-sm">{description}</p>
			</div>
			<Link
				href={href}
				className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
			>
				Buka Halaman
				<ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
			</Link>
		</div>
	);
}
