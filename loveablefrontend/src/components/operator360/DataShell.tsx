import { type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function TableCard({
  search,
  onSearch,
  placeholder,
  actions,
  children,
}: {
  search?: string;
  onSearch?: (v: string) => void;
  placeholder?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="fade-in-up overflow-hidden">
      {(onSearch || actions) && (
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          {onSearch && (
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder={placeholder ?? "Search…"}
                className="h-9 pl-9"
              />
            </div>
          )}
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      )}
      <div className="overflow-x-auto">{children}</div>
    </Card>
  );
}

export function Th({ children }: { children: ReactNode }) {
  return (
    <th className="border-b border-border bg-muted/50 px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={`border-b border-border px-4 py-3 text-sm text-foreground ${className ?? ""}`}>
      {children}
    </td>
  );
}

export function Tr({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors hover:bg-muted/40 ${onClick ? "cursor-pointer" : ""}`}
    >
      {children}
    </tr>
  );
}