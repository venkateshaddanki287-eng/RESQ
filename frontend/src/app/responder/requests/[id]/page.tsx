"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, MapPin } from "lucide-react";
import { updateBranchStatus } from "@/lib/api";
import { useAppStore } from "@/store/app-store";
import { PriorityBadge, StatusBadge } from "@/components/shared/resq-ui";
import { DemoNav } from "@/components/shared/demo-nav";
import type { IncidentStatus, ResponseType } from "@/types/incident";

const progression: Partial<Record<IncidentStatus, { label: string; next: IncidentStatus }>> = {
  CLAIMED: { label: "Start responding", next: "RESPONDING" },
  DISPATCHED: { label: "Start responding", next: "RESPONDING" },
  RESPONDING: { label: "Mark on scene", next: "ON_SCENE" },
  ON_SCENE: { label: "Mark resolved", next: "RESOLVED" },
};

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const branchId = (searchParams.get("branch") ?? "") as ResponseType;
  const incident = useAppStore((state) => state.incidents.find((item) => item.id === id));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!incident) {
    return (
      <main className="min-h-screen bg-[#111315] px-4 py-8 text-[#F2EFE7]">
        <div className="mx-auto max-w-4xl rounded-2xl border border-[#2B2E31] p-6">
          <h1 className="text-xl font-semibold">Request not found on this device</h1>
          <Link href="/responder" className="mt-4 inline-block text-sm text-[#3FB6A8]">
            Back to responder dashboard
          </Link>
        </div>
      </main>
    );
  }

  const branch = incident.branches.find((item) => item.id === branchId) ?? incident.branches[0];
  if (!branch) {
    return (
      <main className="min-h-screen bg-[#111315] px-4 py-8 text-[#F2EFE7]">
        <div className="mx-auto max-w-4xl rounded-2xl border border-[#2B2E31] p-6">
          <p className="text-sm text-[#7E858B]">No responder assignment is available for this report yet.</p>
          <Link href="/responder" className="mt-4 inline-block text-sm text-[#3FB6A8]">
            Back to responder dashboard
          </Link>
        </div>
      </main>
    );
  }

  const activeIncident = incident;
  const activeBranch = branch;
  const action = progression[branch.status];

  async function advanceStatus() {
    if (!action) return;
    setPending(true);
    setError(null);
    try {
      await updateBranchStatus(activeIncident.id, activeBranch.id, action.next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update the request status.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#111315] px-4 py-8 text-[#F2EFE7]">
      <div className="mx-auto max-w-4xl space-y-6">
        <DemoNav />
        <Link
          href="/responder"
          className="inline-flex items-center gap-2 text-sm text-[#7E858B] hover:text-[#F2EFE7]"
        >
          <ArrowLeft className="h-4 w-4" /> Responder dashboard
        </Link>
        <section className="rounded-[28px] border border-[#2B2E31] bg-[#111315] p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">
                Active request · mock mode
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{incident.id}</h1>
            </div>
            <div className="flex gap-2">
              <PriorityBadge priority={incident.priority} />
              <StatusBadge status={branch.status} />
            </div>
          </div>
          <div className="mt-5 text-lg font-semibold">{branch.label}</div>
          <p className="mt-2 leading-7 text-[#7E858B]">{branch.situation}</p>
          <p className="mt-4 rounded-xl border border-[#2B2E31] bg-[#1A1D1F] p-4 text-sm leading-6">
            &ldquo;{incident.description}&rdquo;
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#7E858B]">
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{incident.location.label}</span>
            <span>{branch.distanceKm} km away</span>
            <span>{incident.affectedPeople} affected</span>
          </div>
          {error && (
            <div role="alert" className="mt-4 rounded-xl border border-[#E5484D]/30 bg-[#1A1D1F] p-3 text-sm text-[#E5484D]">
              {error}
            </div>
          )}
          {action && (
            <button
              type="button"
              disabled={pending}
              onClick={advanceStatus}
              className="mt-6 w-full rounded-xl bg-[#F2EFE7] px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#111315] disabled:opacity-50"
            >
              {pending ? "Updating status…" : action.label}
            </button>
          )}
          {branch.status === "RESOLVED" && (
            <div className="mt-6 rounded-xl border border-[#3FB6A8]/30 bg-[#1A1D1F] p-3 text-sm text-[#3FB6A8]">
              Request resolved.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
