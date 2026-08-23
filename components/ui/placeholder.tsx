interface PlaceholderProps {
  title: string;
  note: string;
}

export function Placeholder({ title, note }: PlaceholderProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.6px] text-ink">
        {title}
      </h1>
      <div
        role="status"
        className="rounded-lg bg-surface-1 border border-hairline p-6 text-center"
      >
        <p className="text-sm text-ink-muted">Module not yet implemented.</p>
        <p className="mt-1 text-sm text-ink-subtle">{note}</p>
      </div>
    </div>
  );
}
