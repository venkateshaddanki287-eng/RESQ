"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame, HandCoins, HeartPulse, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { claimRequest, updateBranchStatus } from "@/lib/api";
import { useAppStore } from "@/store/app-store";
import { PriorityBadge, StatusBadge } from "@/components/shared/resq-ui";
import type { Incident, Resource, ResponderType, ResponseType } from "@/types/incident";

const responderMeta: Record<ResponderType, { label: string; icon: LucideIcon }> = {
  FIRE: { label: "Fire", icon: Flame },
  RESCUE: { label: "Rescue", icon: Truck },
  MEDICAL: { label: "Medical", icon: HeartPulse },
  NGO: { label: "NGO", icon: HandCoins },
};

function branchMatchesResponder(branchId: ResponseType, responderType: ResponderType) {
  if (responderType === "NGO") {
    return ["NGO", "SHELTER", "FOOD", "WATER", "CLOTHING", "VOLUNTEER"].includes(branchId);
  }
  return branchId === responderType;
}

function branchMatchesResource(resource: Resource, branchId: ResponseType) {
  if (["NGO", "SHELTER", "FOOD", "WATER", "CLOTHING", "VOLUNTEER"].includes(branchId)) {
    return resource.category === "NGO";
  }
  return resource.category === branchId;
}

const nextAction: Partial<Record<Incident["status"], { label: string; status: Incident["status"] }>> = {
  CLAIMED: { label: "Start responding", status: "RESPONDING" },
  DISPATCHED: { label: "Start responding", status: "RESPONDING" },
  RESPONDING: { label: "Mark on scene", status: "ON_SCENE" },
  ON_SCENE: { label: "Mark resolved", status: "RESOLVED" },
};

export function ResponderDashboard() {
  const responderType = useAppStore((state) => state.selectedResponderType);
  const setResponderType = useAppStore((state) => state.setResponderType);
  const selectedResourceId = useAppStore((state) => state.selectedResponderResourceId);
  const setResponderResourceId = useAppStore((state) => state.setResponderResourceId);
  const incidents = useAppStore((state) => state.incidents);
  const resources = useAppStore((state) => state.resources);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { label, icon: Icon } = responderMeta[responderType];
  const responderResources = resources.filter((resource) =>
    responderType === "NGO"
      ? resource.category === "NGO"
      : resource.category === responderType
  );
  const selectedResource = resources.find((resource) => resource.id === selectedResourceId);

  const requests = incidents.flatMap((incident) =>
    incident.branches
      .filter((branch) => branchMatchesResponder(branch.id, responderType))
      .map((branch) => ({ incident, branch }))
  );

  async function handleClaim(incident: Incident, branch: Incident["branches"][number]) {
    if (
      !selectedResource ||
      selectedResource.status !== "AVAILABLE" ||
      !branchMatchesResource(selectedResource, branch.id)
    ) {
      setError("Choose an available responder unit of the matching type before accepting this request.");
      return;
    }

    setError(null);
    setPending(`${incident.id}:${branch.id}`);
    try {
      await claimRequest(incident.id, branch.id, selectedResource.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The request could not be claimed.");
    } finally {
      setPending(null);
    }
  }

  async function handleStatusUpdate(
    incidentId: string,
    branchId: ResponseType,
    status: Incident["status"]
  ) {
    const key = `${incidentId}:${branchId}`;
    setError(null);
    setPending(key);
    try {
      await updateBranchStatus(incidentId, branchId, status);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The request status could not be updated.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#2B2E31] bg-[#111315] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">
            Responder type
          </div>
          <span className="rounded-full border border-[#E5A93D]/30 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#E5A93D]">
            Mock mode
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {(Object.entries(responderMeta) as [ResponderType, (typeof responderMeta)[ResponderType]][]).map(
            ([type, meta]) => {
              const active = type === responderType;
              const TypeIcon = meta.icon;
              return (
                <button
                  key={type}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setResponderType(type)}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium uppercase tracking-[0.18em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E5A93D] ${
                    active
                      ? "border-[#F2EFE7] bg-[#F2EFE7] text-[#111315]"
                      : "border-[#2B2E31] bg-[#1A1D1F] text-[#F2EFE7]"
                  }`}
                >
                  <TypeIcon className="h-4 w-4" /> {meta.label}
                </button>
              );
            }
          )}
        </div>
        <label className="mt-4 block max-w-md">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7E858B]">
            Active responder unit
          </span>
          <select
            value={selectedResourceId ?? ""}
            onChange={(event) => setResponderResourceId(event.target.value)}
            className="w-full rounded-lg border border-[#2B2E31] bg-[#1A1D1F] px-3 py-2 text-sm text-[#F2EFE7]"
          >
            {responderResources.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name} · {resource.status === "EN_ROUTE" ? "Assigned" : resource.status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="rounded-2xl border border-[#2B2E31] bg-[#111315] p-4">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A1D1F] text-[#F2EFE7]">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">
              Active service · {requests.length} requests
            </div>
            <h1 className="text-xl font-semibold text-[#F2EFE7]">{label.toUpperCase()} RESPONSE</h1>
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-4 rounded-xl border border-[#E5484D]/30 bg-[#1A1D1F] p-3 text-sm text-[#E5484D]">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {requests.map(({ incident, branch }) => {
            const key = `${incident.id}:${branch.id}`;
            const assignedResource = resources.find(
              (resource) => resource.id === branch.assignedResourceId
            );
            const activeAction = nextAction[branch.status];
            const canClaim = ["OPEN", "REVIEWING", "REPORT_RECEIVED"].includes(branch.status);
            const isDone = branch.status === "RESOLVED";
            const alreadyAssignedElsewhere =
              Boolean(branch.assignedResourceId) &&
              branch.assignedResourceId !== selectedResourceId;
            const selectedUnitIsAvailable = selectedResource?.status === "AVAILABLE";
            const selectedUnitMatches = Boolean(
              selectedResource && branchMatchesResource(selectedResource, branch.id)
            );

            return (
              <article
                key={key}
                className="rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xl font-semibold text-[#F2EFE7]">{incident.id}</div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={incident.priority} />
                    <StatusBadge status={branch.status} />
                  </div>
                </div>
                <div className="mt-3 text-sm font-medium text-[#F2EFE7]">{branch.situation}</div>
                <div className="mt-1 text-sm text-[#7E858B]">{incident.title}</div>
                <p className="mt-3 text-sm leading-6 text-[#7E858B]">{incident.description}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#7E858B]">
                  <span>{incident.location.label}</span>
                  <span>{branch.distanceKm} km · {incident.affectedPeople} affected</span>
                </div>
                {assignedResource && (
                  <div className="mt-3 rounded-lg border border-[#3FB6A8]/20 bg-[#111315] px-3 py-2 text-sm text-[#3FB6A8]">
                    Assigned to: {assignedResource.name}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/responder/requests/${incident.id}?branch=${branch.id}`}
                    className="rounded-xl border border-[#2B2E31] bg-[#111315] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F2EFE7]"
                  >
                    View request
                  </Link>
                  {canClaim && (
                    <button
                      type="button"
                      disabled={pending === key || !selectedUnitIsAvailable || !selectedUnitMatches}
                      onClick={() => handleClaim(incident, branch)}
                      className="rounded-xl bg-[#F2EFE7] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#111315] disabled:opacity-50"
                    >
                      {pending === key ? "Claiming…" : branch.status === "DISPATCHED" ? "Accept assignment" : "Accept request"}
                    </button>
                  )}
                  {activeAction && !alreadyAssignedElsewhere && (
                    <button
                      type="button"
                      disabled={pending === key}
                      onClick={() => handleStatusUpdate(incident.id, branch.id, activeAction.status)}
                      className="rounded-xl bg-[#3FB6A8] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#111315] disabled:opacity-50"
                    >
                      {pending === key ? "Updating…" : activeAction.label}
                    </button>
                  )}
                  {alreadyAssignedElsewhere && (
                    <span className="rounded-xl border border-[#E5A93D]/30 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E5A93D]">
                      Already assigned · {assignedResource?.name ?? "another unit"}
                    </span>
                  )}
                  {isDone && (
                    <span className="rounded-xl border border-[#3FB6A8]/30 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#3FB6A8]">
                      Resolved
                    </span>
                  )}
                </div>
              </article>
            );
          })}
          {requests.length === 0 && (
            <div className="rounded-xl border border-dashed border-[#2B2E31] p-6 text-sm text-[#7E858B]">
              No requests for this responder type right now. Other categories remain hidden.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
