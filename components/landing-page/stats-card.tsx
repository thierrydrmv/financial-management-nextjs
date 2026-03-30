import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export default function StatsCard({
  icon: Icon,
  value,
  label,
  hasBorder,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  hasBorder?: boolean;
}) {
  return (
    <div
      className={cn(
        "space-y-2",
        /* Column dividers only in the sm+ grid; hidden when stacked on mobile */
        hasBorder && "sm:border-l sm:border-border/50",
      )}
    >
      <div className="flex items-center justify-center gap-2">
        <Icon className="size-5 text-primary/70" />
        <p className="text-3xl sm:text-5xl font-bold">{value}</p>
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
