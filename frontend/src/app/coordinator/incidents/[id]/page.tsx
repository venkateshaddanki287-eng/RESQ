"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, ShieldAlert } from "lucide-react";
import { addResponseBranch, dispatchResource } from "@/lib/api";
import { useAppStore } from "@/store/app-store";
import { PriorityBadge, StatusBadge } from "@/components/shared/resq-ui";
import { DemoNav } from "@/components/shared/demo-nav";
import type { Incident, Resource, ResponseType } from "@/types/incident";

const branchDefaults: Record<ResponseType, { label: string; situation: string }> = {
  FIRE: { label: "FIRE RESPONSE", situation: "Coordinator assessment required" },
  RESCUE: { label: "RESCUE REQUIRED", situation: "Coordinator assessment required" },
  MEDICAL: { label: "MEDICAL RESPONSE", situation: "Coordinator assessment required" },
  NGO: { label: "NGO SUPPORT", situation: "Coordinator assessment required" },
  SHELTER: { label: "SHELTER SUPPORT", situation: "Coordinator assessment required" },
  FOOD: { label: "FOOD SUPPORT", situation: "Coordinator assessment required" },
  WATER: { label: "WATER SUPPORT", situation: "Coordinator assessment required" },
  CLOTHING: { label: "CLOTHING SUPPORT", situation: "Coordinator assessment required" },
  VOLUNTEER: { label: "VOLUNTEER SUPPORT", situation: "Coordinator assessment required" },
};

function resourceMatchesBranch(resource: Resource, branchId: ResponseType) {
  if (["FOOD", "WATER", "SHELTER", "CLOTHING", "VOLUNTEER"].includes(branchId)) {
    return resource.category === "NGO";
  }
  return resource.category === branchId;
}

export default function IncidentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const incident = useAppStore((state) => state.incidents.find((item) => item.id === id));
  const resources = useAppStore((state) => state.resources);
  const [branchType, setBranchType] = useState<ResponseType>("FIRE");
  const [resourceChoices, setResourceChoices] = useState<Record<string, string>>({});
  const [busyBranch, setBusyBranch] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const availableResources = useMemo(
    () => resources.filter((resource) => resource.status === "AVAILABLE"),
    [resources]
  );

  if (!incident) {
    return (
      <main className="min-h-screen bg-[#111315] px-4 py-8 text-[#F2EFE7]">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[#2B2E31] p-6">
          <h1 className="text-xl font-semibold">Incident not found</h1>
          <Link href="/coordinator" className="mt-4 inline-block text-sm text-[#3FB6A8]">
            Back to command center
          </Link>
        </div>
      </main>
    );
  }

  const incidentView: Incident = incident;
  const unassignedResources = (branchId: ResponseType) =>
    availableResources.filter((resource) => resourceMatchesBranch(resource, branchId));

  async function handleAddBranch() {
    setError(null);
    const defaults = branchDefaults[branchType];
    const candidate = unassignedResources(branchType)[0];
    try {
      await addResponseBranch(id, {
        id: branchType,
        label: defaults.label,
        situation: defaults.situation,
        recommendedResource: candidate?.name ?? "No suitable resource available",
        availability: candidate ? "AVAILABLE" : "UNAVAILABLE",
        distanceKm: candidate?.distanceKm ?? 0,
        status: "OPEN",
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not add the response branch.");
    }
  }

  async function handleDispatch(branch: Incident["branches"][number]) {
    setError(null);
    const resourceId =
      resourceChoices[branch.id] ??
      unassignedResources(branch.id)[0]?.id;
    if (!resourceId) {
      setError(`No available resource matches ${branch.label.toLowerCase()}.`);
      return;
    }

    setBusyBranch(branch.id);
    try {
      await dispatchResource(id, branch.id, resourceId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Dispatch could not be completed.");
    } finally {
      setBusyBranch(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#111315] px-4 py-8 text-[#F2EFE7]">
      <div className="mx-auto max-w-5xl space-y-6">
        <DemoNav />
        <Link
          href="/coordinator"
          className="inline-flex items-center gap-2 text-sm text-[#7E858B] hover:text-[#F2EFE7]"
        >
          <ArrowLeft className="h-4 w-4" /> Command center
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#2B2E31] bg-[#111315] p-5">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">
              Incident detail · mock mode
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#F2EFE7]">
              {incidentView.id}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={incidentView.priority} />
            <StatusBadge status={incidentView.status} />
          </div>
        </div>

        <section className="rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">
            Original citizen report
          </div>
          <p className="mt-3 text-base leading-7 text-[#F2EFE7]">
            &ldquo;{incidentView.description}&rdquo;
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#7E858B]">
            <span>{incidentView.location.label}</span>
            <span>{incidentView.affectedPeople} affected</span>
            <span>{incidentView.createdAt}</span>
          </div>
        </section>

        <section className="rounded-2xl border border-[#2B2E31] bg-[#111315] p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">
                Response coordination
              </div>
              <h2 className="mt-1 text-xl font-semibold text-[#F2EFE7]">Response branches</h2>
            </div>
            <span className="rounded-full border border-[#E5A93D]/30 bg-[#1A1D1F] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#E5A93D]">
              Coordinator approval required
            </span>
          </div>

          <div className="mb-5 rounded-xl border border-[#2B2E31] bg-[#1A1D1F] p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex-1">
                <span className="sr-only">Response branch type</span>
                <select
                  value={branchType}
                  onChange={(event) => setBranchType(event.target.value as ResponseType)}
                  className="w-full rounded-lg border border-[#2B2E31] bg-[#111315] px-3 py-3 text-sm text-[#F2EFE7]"
                >
                  {Object.entries(branchDefaults).map(([type, branch]) => (
                    <option key={type} value={type}>{branch.label}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={handleAddBranch}
                disabled={incidentView.branches.some((branch) => branch.id === branchType)}
                className="rounded-lg bg-[#F2EFE7] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#111315] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Add coordinator assessment
              </button>
            </div>
            <p className="mt-2 text-xs leading-5 text-[#7E858B]">
              Demo triage only: choose a branch based on the report. No automated analysis or dispatch is being represented.
            </p>
          </div>

          {error && (
            <div role="alert" className="mb-4 rounded-xl border border-[#E5484D]/30 bg-[#1A1D1F] p-3 text-sm text-[#E5484D]">
              {error}
            </div>
          )}

          {incidentView.branches.length === 0 && (
            <div className="rounded-xl border border-dashed border-[#2B2E31] p-5 text-sm text-[#7E858B]">
              No response branch has been assessed yet. The coordinator decides which teams are needed.
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {incidentView.branches.map((branch) => {
              const branchResources = unassignedResources(branch.id);
              const assignedResource = resources.find(
                (resource) => resource.id === branch.assignedResourceId
              );
              const isAssigned = Boolean(assignedResource);
              const selectedResource =
                resourceChoices[branch.id] ??
                branchResources[0]?.id ??
                "";

              return (
                <article
                  key={branch.id}
                  className="rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-[#F2EFE7]">{branch.label}</h3>
                      <p className="mt-2 text-sm text-[#7E858B]">{branch.situation}</p>
                    </div>
                    <StatusBadge status={branch.status} />
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-[#7E858B]">Recommendation</span>
                      <span className="text-right text-[#F2EFE7]">{branch.recommendedResource}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-[#7E858B]">Distance</span>
                      <span className="text-[#F2EFE7]">{branch.distanceKm || "—"}{branch.distanceKm ? " km" : ""}</span>
                    </div>
                    {assignedResource && (
                      <div className="flex justify-between gap-3">
                        <span className="text-[#7E858B]">Assigned to</span>
                        <span className="text-right text-[#3FB6A8]">{assignedResource.name}</span>
                      </div>
                    )}
                  </div>

                  {!isAssigned && (
                    <div className="mt-4 space-y-3">
                      <label className="block">
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7E858B]">
                          Coordinator resource selection
                        </span>
                        <select
                          value={selectedResource}
                          onChange={(event) =>
                            setResourceChoices((choices) => ({
                              ...choices,
                              [branch.id]: event.target.value,
                            }))
                          }
                          disabled={branchResources.length === 0}
                          className="w-full rounded-lg border border-[#2B2E31] bg-[#111315] px-3 py-2 text-sm text-[#F2EFE7] disabled:opacity-50"
                        >
                          {branchResources.length === 0 ? (
                            <option value="">No resources available</option>
                          ) : (
                            branchResources.map((resource) => (
                              <option key={resource.id} value={resource.id}>
                                {resource.name} · {resource.distanceKm} km
                              </option>
                            ))
                          )}
                        </select>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleDispatch(branch)}
                        disabled={!selectedResource || busyBranch === branch.id}
                        className="w-full rounded-xl bg-[#F2EFE7] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#111315] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {busyBranch === branch.id
                          ? "Dispatching…"
                          : selectedResource
                            ? "Dispatch selected resource"
                            : "No suitable resource available"}
                      </button>
                    </div>
                  )}

                  {isAssigned && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#3FB6A8]/20 bg-[#111315] px-3 py-2 text-xs text-[#3FB6A8]">
                      <Check className="h-4 w-4" />
                      Dispatch approved by coordinator
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <div className="flex items-start gap-3 rounded-xl border border-[#E5A93D]/25 bg-[#1A1D1F] p-4 text-sm leading-6 text-[#7E858B]">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#E5A93D]" />
          AI recommendations are advisory. Only a coordinator can select and dispatch a resource.
        </div>
      </div>
    </main>
  );
}
