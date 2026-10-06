"use client";

import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { StatusBadge } from "@/components/shared/resq-ui";
import { DemoNav } from "@/components/shared/demo-nav";
import type { IncidentStatus } from "@/types/incident";

const lifecycle: Array<{ label: string; statuses: IncidentStatus[] }> = [
  { label: "Report received", statuses: ["REPORT_RECEIVED", "OPEN"] },
  { label: "Coordinator reviewing", statuses: ["REVIEWING"] },
  { label: "Resource assigned", statuses: ["CLAIMED", "DISPATCHED", "RESOURCE_ASSIGNED"] },
  { label: "Responding", statuses: ["RESPONDING"] },
  { label: "On scene", statuses: ["ON_SCENE"] },
  { label: "Resolved", statuses: ["RESOLVED"] },
];

function currentStep(status: IncidentStatus) {
  const index = lifecycle.findIndex((step) => step.statuses.includes(status));
  return index < 0 ? 0 : index;
}

export function CitizenStatus({ id }: { id: string }) {
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const incident = useAppStore((state) => state.incidents.find((item) => item.id === id));
  const resources = useAppStore((state) => state.resources);

  if (!hasHydrated) {
    return (
      <main className="min-h-screen bg-[#111315] px-4 py-8 text-[#F2EFE7]">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#2B2E31] p-6 text-sm text-[#7E858B]">
          Loading saved report status…
        </div>
      </main>
    );
  }

  if (!incident) {
    return (
      <main className="min-h-screen bg-[#111315] px-4 py-8 text-[#F2EFE7]">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#2B2E31] p-6">
          <h1 className="text-2xl font-semibold">Report not found on this device</h1>
          <p className="mt-3 text-sm text-[#7E858B]">
            Demo reports are stored locally in this browser. Submit a new report or open it from the same browser profile.
          </p>
          <Link href="/report" className="mt-5 inline-block text-sm text-[#3FB6A8]">
            Start a new report
          </Link>
        </div>
      </main>
    );
  }

  const activeStep = currentStep(incident.status);
  const assignedBranches = incident.branches.filter(
    (branch) => branch.assignedResourceId || branch.status !== "OPEN"
  );

  return (
    <main className="min-h-screen bg-[#111315] px-4 py-8 text-[#F2EFE7]">
      <div className="mx-auto max-w-3xl space-y-6">
        <DemoNav />
        <Link
          href="/report"
          className="inline-flex items-center gap-2 text-sm text-[#7E858B] hover:text-[#F2EFE7]"
        >
          <ArrowLeft className="h-4 w-4" /> Report flow
        </Link>

        <section className="rounded-2xl border border-[#2B2E31] bg-[#111315] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">
                Response status · mock mode
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{incident.id}</h1>
            </div>
            <StatusBadge status={incident.status} />
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm text-[#7E858B]">
            <MapPin className="h-4 w-4 text-[#3FB6A8]" /> {incident.location.label}
          </div>

          <div className="mt-6 space-y-4">
            {lifecycle.map((step, index) => {
              const complete = index < activeStep;
              const current = index === activeStep;
              return (
                <div key={step.label} className="flex items-center gap-3">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                      complete
                        ? "border-[#3FB6A8] bg-[#3FB6A8] text-[#111315]"
                        : current
                          ? "border-[#E5A93D] bg-[#E5A93D] text-[#111315]"
                          : "border-[#2B2E31] text-[#7E858B]"
                    }`}
                  >
                    {complete ? "✓" : index + 1}
                  </div>
                  <span
                    className={`text-sm ${
                      current ? "font-semibold text-[#F2EFE7]" : complete ? "text-[#3FB6A8]" : "text-[#7E858B]"
                    }`}
                  >
                    {step.label}
                  </span>
                  {current && <span className="ml-auto text-[10px] uppercase tracking-[0.16em] text-[#E5A93D]">Current</span>}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-[#2B2E31] bg-[#111315] p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">
            Response plan
          </h2>
          {incident.branches.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-[#2B2E31] p-4 text-sm text-[#7E858B]">
              A coordinator is reviewing the report. Response needs have not yet been assigned.
            </p>
          ) : assignedBranches.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-[#2B2E31] p-4 text-sm text-[#7E858B]">
              The coordinator is assessing response needs. You will see assignments here when they are made.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {assignedBranches.map((branch) => {
                const resource = resources.find(
                  (item) => item.id === branch.assignedResourceId
                );
                return (
                  <div key={branch.id} className="rounded-xl border border-[#2B2E31] bg-[#1A1D1F] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-semibold">{branch.label}</div>
                      <StatusBadge status={branch.status} />
                    </div>
                    <div className="mt-2 text-sm text-[#7E858B]">{branch.situation}</div>
                    <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
                      <span className="text-[#7E858B]">Assigned response</span>
                      <span>{resource?.name ?? branch.recommendedResource}</span>
                    </div>
                    {branch.status === "RESPONDING" && (
                      <div className="mt-2 flex justify-between text-sm">
                        <span className="text-[#7E858B]">Estimated arrival</span>
                        <span>About {Math.max(3, Math.round(branch.distanceKm * 2))} min</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
        <div className="rounded-xl border border-[#E5A93D]/20 bg-[#1A1D1F] p-4 text-xs leading-5 text-[#7E858B]">
          Demo mode · Status shown here is local mock data and does not contact emergency services.
        </div>
      </div>
    </main>
  );
}
