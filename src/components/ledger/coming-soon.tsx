import { LucideIcon } from "lucide-react";

export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="app-card flex flex-col items-center justify-center text-center gap-3 py-16 px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo">
        <Icon className="h-7 w-7" />
      </div>
      <div>
        <p className="font-display text-lg font-semibold text-foreground">{title}</p>
        <p className="text-sm text-foreground-soft max-w-sm mt-1.5">{description}</p>
      </div>
    </div>
  );
}
