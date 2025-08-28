import { Calendar, CheckCircle2, Clock, Info } from "lucide-react";

interface IncidentItem {
  id: string;
  date: string; // ISO or readable
  title: string;
  severity: "info" | "warning" | "critical";
  description?: string;
  resolved?: boolean;
}

interface IncidentTimelineProps {
  items?: IncidentItem[];
}

export default function IncidentTimeline({ items = [] }: IncidentTimelineProps) {
  if (!items.length) {
    return (
      <div className="p-6 rounded-xl border border-border/40 bg-background/30 text-sm text-muted-foreground">
        <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-data-positive" /> No incidents recorded in the last 90 days.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((it) => (
        <div key={it.id} className="relative pl-6">
          <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full"
            style={{
              background: `hsl(var(${it.severity === "critical" ? "--destructive" : it.severity === "warning" ? "--warning" : "--data-neutral"}))`
            }}
          />
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {it.date}
            </span>
            <span className="text-sm font-semibold">{it.title}</span>
            {it.resolved && (
              <span className="text-xs text-data-positive flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Resolved
              </span>
            )}
          </div>
          {it.description && (
            <p className="mt-1 text-xs text-accent-foreground/80 flex items-start gap-2">
              <Info className="h-3.5 w-3.5 mt-0.5" /> {it.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
