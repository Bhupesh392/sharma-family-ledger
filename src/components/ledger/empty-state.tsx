import { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rule/40 text-ink-soft">
        <Icon className="h-6 w-6" />
      </div>
      <p className="font-display text-base font-medium text-ink">{title}</p>
      <p className="text-sm text-ink-soft max-w-sm">{description}</p>
    </div>
  );
}
