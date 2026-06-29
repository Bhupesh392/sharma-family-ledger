import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <div className="relative hidden sm:block w-full max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-faint pointer-events-none" />
      <input
        type="search"
        placeholder="Search properties, tenants…"
        className="h-9 w-full rounded-[var(--radius-control)] border border-border bg-surface-muted pl-9 pr-3 text-sm text-foreground placeholder:text-foreground-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo focus-visible:bg-surface transition-colors"
      />
    </div>
  );
}
