import type { ReactNode } from "react";
import type { Incident, Priority } from "@/types/incident";

export function StatusBadge({ status }: { status: Incident["status"] }) {
  const styles: Record<Incident["status"], string> = {
    OPEN: "bg-[#1A1D1F] text-[#F2EFE7] border border-[#7E858B]/50",
    CLAIMED: "bg-[#1A1D1F] text-[#3FB6A8] border border-[#3FB6A8]/40",
    DISPATCHED: "bg-[#1A1D1F] text-[#E5A93D] border border-[#E5A93D]/40",
    RESPONDING: "bg-[#1A1D1F] text-[#3FB6A8] border border-[#3FB6A8]/40",
    ON_SCENE: "bg-[#1A1D1F] text-[#F2EFE7] border border-[#F2EFE7]/40",
    RESOLVED: "bg-[#1A1D1F] text-[#3FB6A8] border border-[#3FB6A8]/40",
    ESCALATED: "bg-[#1A1D1F] text-[#E5484D] border border-[#E5484D]/40",
    REVIEWING: "bg-[#1A1D1F] text-[#E5A93D] border border-[#E5A93D]/40",
    REPORT_RECEIVED: "bg-[#1A1D1F] text-[#F2EFE7] border border-[#F2EFE7]/40",
    RESOURCE_ASSIGNED: "bg-[#1A1D1F] text-[#3FB6A8] border border-[#3FB6A8]/40",
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${styles[status]}`}>{status.replaceAll("_", " ")}</span>;
}

export function PriorityBadge({ priority }: { priority: Priority | null }) {
  const styles: Record<Priority, string> = {
    LOW: "bg-[#1A1D1F] text-[#F2EFE7] border border-[#7E858B]/40",
    MEDIUM: "bg-[#1A1D1F] text-[#E5A93D] border border-[#E5A93D]/40",
    HIGH: "bg-[#1A1D1F] text-[#E5484D] border border-[#E5484D]/40",
    CRITICAL: "bg-[#E5484D] text-[#111315] border border-[#E5484D]",
  };

  const style = priority
    ? styles[priority]
    : "bg-[#1A1D1F] text-[#7E858B] border border-[#7E858B]/40";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${style}`}>{priority ?? "UNASSESSED"}</span>;
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7E858B]">{children}</h2>
      {right}
    </div>
  );
}

export function MetricCard({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "critical" | "stable" | "warning" }) {
  const toneStyles = {
    neutral: "border-[#1F2326] bg-[#1A1D1F] text-[#F2EFE7]",
    critical: "border-[#E5484D]/30 bg-[#1A1D1F] text-[#E5484D]",
    stable: "border-[#3FB6A8]/30 bg-[#1A1D1F] text-[#3FB6A8]",
    warning: "border-[#E5A93D]/30 bg-[#1A1D1F] text-[#E5A93D]",
  };

  return (
    <div className={`rounded-xl border p-4 ${toneStyles[tone]}`}>
      <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#7E858B]">{label}</div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-[#F2EFE7]">{value}</div>
    </div>
  );
}
