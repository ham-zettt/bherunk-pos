import { requireRole } from "@/lib/auth";
import { getDashboardMetrics } from "@/lib/queries/analytics";
import { formatIDR } from "@/lib/format";
import { MetricCard } from "@/components/dashboard/metric-card";

export const metadata = { title: "Dashboard | D'BHERUNK Cafe System" };

type Tone = "positive" | "negative" | "flat";

function tone(delta: number): Tone {
  if (delta > 0) return "positive";
  if (delta < 0) return "negative";
  return "flat";
}

function signedRupiah(delta: number): string {
  const abs = formatIDR(String(Math.abs(delta)));
  return delta > 0 ? `+${abs}` : delta < 0 ? `\u2212${abs}` : abs;
}

function signedInt(delta: number): string {
  const n = Math.abs(delta);
  const body = new Intl.NumberFormat("id-ID").format(n);
  return delta > 0 ? `+${body}` : delta < 0 ? `\u2212${body}` : body;
}

export default async function DashboardPage() {
  await requireRole("ADMIN");

  const { today, yesterday, lowStockCount } = await getDashboardMetrics();

  const revenueDelta = today.revenue - yesterday.revenue;
  const ordersDelta = today.orders - yesterday.orders;
  const avgDelta = today.avgTicket - yesterday.avgTicket;

  // DESIGN.md: the success color is reserved for positive money movement.
  const revenueTone: Tone =
    revenueDelta > 0
      ? "positive"
      : revenueDelta < 0
        ? "negative"
        : "flat";

  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.6px] text-ink">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          eyebrow="Today's revenue"
          value={formatIDR(String(today.revenue))}
          delta={signedRupiah(revenueDelta)}
          deltaTone={revenueTone}
        />
        <MetricCard
          eyebrow="Orders today"
          value={new Intl.NumberFormat("id-ID").format(today.orders)}
          delta={signedInt(ordersDelta)}
          deltaTone={tone(ordersDelta)}
        />
        <MetricCard
          eyebrow="Average ticket"
          value={formatIDR(String(today.avgTicket))}
          delta={signedRupiah(avgDelta)}
          deltaTone={tone(avgDelta)}
        />
        <MetricCard
          eyebrow="Low-stock items"
          value={new Intl.NumberFormat("id-ID").format(lowStockCount)}
          delta={null}
          deltaTone="flat"
        />
      </div>
    </div>
  );
}
