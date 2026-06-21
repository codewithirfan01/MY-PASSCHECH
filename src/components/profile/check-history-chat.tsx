import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow, format, isToday, isYesterday, parseISO } from "date-fns";
import {
  Bot,
  Filter,
  KeyRound,
  Loader2,
  Mail,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Trash2,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

interface HistoryRow {
  id: string;
  check_type: "password" | "email";
  result_summary: string;
  created_at: string;
}

type FilterType = "all" | "password" | "email";

function getOutcome(summary: string): "safe" | "risk" | "warning" | "neutral" {
  const lower = summary.toLowerCase();
  if (lower.includes("not breached") || lower.includes("no breach")) return "safe";
  if (lower.includes("breached") || lower.includes("breach") || lower.includes("found")) return "risk";
  if (lower.includes("weak") || lower.includes("fair")) return "warning";
  if (lower.includes("strong")) return "safe";
  return "neutral";
}

function formatGroupDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

function groupByDate(rows: HistoryRow[]): { label: string; rows: HistoryRow[] }[] {
  const groups: Map<string, HistoryRow[]> = new Map();
  for (const row of rows) {
    const key = format(parseISO(row.created_at), "yyyy-MM-dd");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }
  return Array.from(groups.entries()).map(([, rows]) => ({
    label: formatGroupDate(rows[0].created_at),
    rows,
  }));
}

function OutcomeIcon({ outcome }: { outcome: ReturnType<typeof getOutcome> }) {
  if (outcome === "safe") return <ShieldCheck className="size-4 text-safe" />;
  if (outcome === "risk") return <ShieldX className="size-4 text-risk" />;
  if (outcome === "warning") return <ShieldAlert className="size-4 text-warning" />;
  return <Shield className="size-4 text-muted-foreground" />;
}

function UserBubble({ row }: { row: HistoryRow }) {
  return (
    <div className="flex justify-end">
      <div className="flex items-end gap-2">
        <div className="max-w-[75%]">
          <div className="rounded-2xl rounded-br-sm bg-primary/20 px-4 py-2.5 text-sm text-foreground border border-primary/20">
            <p className="font-medium">
              {row.check_type === "password" ? "Check my password" : "Check my email"}
            </p>
          </div>
          <p className="mt-1 text-right text-[10px] text-muted-foreground">
            {formatDistanceToNow(parseISO(row.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="mb-5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20">
          {row.check_type === "password" ? (
            <KeyRound className="size-3.5 text-primary" />
          ) : (
            <Mail className="size-3.5 text-primary" />
          )}
        </div>
      </div>
    </div>
  );
}

function BotBubble({ row }: { row: HistoryRow }) {
  const outcome = getOutcome(row.result_summary);

  const bubbleBg = {
    safe: "border-safe/20 bg-safe/5",
    risk: "border-risk/20 bg-risk/5",
    warning: "border-warning/20 bg-warning/5",
    neutral: "border-border bg-card/40",
  }[outcome];

  const badgeClass = {
    safe: "border-safe/30 text-safe",
    risk: "border-risk/30 text-risk",
    warning: "border-warning/30 text-warning",
    neutral: "border-border text-muted-foreground",
  }[outcome];

  const outcomeLabel = {
    safe: "Secure",
    risk: "At Risk",
    warning: "Caution",
    neutral: "Checked",
  }[outcome];

  return (
    <div className="flex justify-start">
      <div className="flex items-end gap-2">
        <div className="mb-5 flex size-7 shrink-0 items-center justify-center rounded-full bg-electric/10 border border-electric/20">
          <Bot className="size-3.5 text-electric" />
        </div>
        <div className="max-w-[75%]">
          <div className={cn("rounded-2xl rounded-bl-sm border px-4 py-3 text-sm", bubbleBg)}>
            <div className="mb-1.5 flex items-center gap-2">
              <OutcomeIcon outcome={outcome} />
              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", badgeClass)}>
                {outcomeLabel}
              </Badge>
            </div>
            <p className="text-foreground leading-snug">{row.result_summary}</p>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            PassCheck · {format(parseISO(row.created_at), "h:mm a")}
          </p>
        </div>
      </div>
    </div>
  );
}

function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

interface CheckHistoryChatProps {
  onHistoryCleared: () => void;
}

export function CheckHistoryChat({ onHistoryCleared }: CheckHistoryChatProps) {
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchHistory = async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    const { data, error } = await supabase
      .from("check_history")
      .select("id, check_type, result_summary, created_at")
      .order("created_at", { ascending: true })
      .limit(200);
    if (!quiet) setLoading(false);
    else setRefreshing(false);
    if (error) {
      toast.error("Failed to load check history");
      return;
    }
    setHistory(data || []);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (!loading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [loading, history.length]);

  const filtered = useMemo(
    () => (filter === "all" ? history : history.filter((r) => r.check_type === filter)),
    [history, filter]
  );

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  const handleClear = async () => {
    setClearing(true);
    const { error } = await supabase
      .from("check_history")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    setClearing(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setHistory([]);
    onHistoryCleared();
    toast.success("History cleared");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-full bg-electric/10 border border-electric/20">
            <Bot className="size-4 text-electric" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">PassCheck Assistant</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Your security audit log</p>
          </div>
          {!loading && (
            <Badge variant="outline" className="ml-1 border-safe/30 text-safe text-[10px]">
              online
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => fetchHistory(true)}
            disabled={refreshing || loading}
            title="Refresh"
          >
            <RotateCcw className={cn("size-3.5", refreshing && "animate-spin")} />
          </Button>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-destructive"
              onClick={handleClear}
              disabled={clearing}
              title="Clear all history"
            >
              {clearing ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 border-b border-border px-4 py-2">
        <Filter className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
        {(["all", "password", "email"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors capitalize",
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {f === "all" ? "All" : f === "password" ? "Password" : "Email"}
          </button>
        ))}
        {history.length > 0 && (
          <span className="ml-auto text-[10px] text-muted-foreground self-center">
            {filtered.length} {filtered.length === 1 ? "check" : "checks"}
          </span>
        )}
      </div>

      {/* Chat messages */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <Spinner className="size-6 text-primary" />
              <p className="text-sm text-muted-foreground">Loading your security history...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-electric/10 border border-electric/20">
                <Bot className="size-7 text-electric" />
              </div>
              <div>
                <p className="font-semibold">No checks yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {filter !== "all"
                    ? `No ${filter} checks found.`
                    : "Run a check from the dashboard and your results will appear here."}
                </p>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link to="/dashboard">Go to dashboard</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Opening message from bot */}
              <div className="flex justify-start pb-4">
                <div className="flex items-end gap-2">
                  <div className="mb-5 flex size-7 shrink-0 items-center justify-center rounded-full bg-electric/10 border border-electric/20">
                    <Bot className="size-3.5 text-electric" />
                  </div>
                  <div className="max-w-[75%]">
                    <div className="rounded-2xl rounded-bl-sm border border-border bg-card/40 px-4 py-3 text-sm">
                      <p className="text-foreground">
                        Hi! I&apos;m your security assistant. Here&apos;s a full log of every check you&apos;ve run. Each entry shows what you checked and the result I found.
                      </p>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">PassCheck Assistant</p>
                  </div>
                </div>
              </div>

              {groups.map((group) => (
                <div key={group.label} className="space-y-3">
                  <DateDivider label={group.label} />
                  {group.rows.map((row) => (
                    <div key={row.id} className="space-y-2 animate-fade-in-up">
                      <UserBubble row={row} />
                      <BotBubble row={row} />
                    </div>
                  ))}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Typing indicator footer */}
      {!loading && filtered.length > 0 && (
        <div className="border-t border-border px-4 py-2">
          <p className="text-center text-[10px] text-muted-foreground">
            All results are anonymized — passwords are never stored.
          </p>
        </div>
      )}
    </div>
  );
}
