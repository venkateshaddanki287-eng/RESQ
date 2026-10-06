"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BellDot, RotateCcw } from "lucide-react";
import { subscribeToRealtime } from "@/lib/realtime";
import { useAppStore } from "@/store/app-store";
import { MetricCard, PriorityBadge, StatusBadge } from "@/components/shared/resq-ui";
import type { Incident, Priority, Resource } from "@/types/incident";

const ResQMap = dynamic(
  () => import("@/components/map/resq-map").then((mod) => mod.ResQMap),
  { ssr: false }
);

const priorityOrder: Record<Priority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export function CommandCenter() {
  const incidents = useAppStore((state) => state.incidents);
  const resources = useAppStore((state) => state.resources);
  const resetDemoData = useAppStore((state) => state.resetDemoData);
  const [notification, setNotification] = useState<string | null>(null);
  const [resourceFilter, setResourceFilter] = useState<Resource["category"] | "ALL">("ALL");

  useEffect(() => {
    return subscribeToRealtime((event) => {
      if (event.type === "NEW_INCIDENT") {
        setNotification(`New incident received · ${event.payload.id}`);
      } else if (event.type === "ASSIGNMENT") {
        setNotification(`Resource assignment updated · ${event.payload.id}`);
      } else {
        setNotification(`Incident status updated · ${event.payload.id}`);
      }
      window.setTimeout(() => setNotification(null), 5000);
    });
  }, []);

  const sortedIncidents = useMemo(
    () =>
      [...incidents].sort((left, right) => {
        const leftPriority = left.priority ? priorityOrder[left.priority] : -1;
        const rightPriority = right.priority ? priorityOrder[right.priority] : -1;
        const priorityDiff = leftPriority - rightPriority;
        return priorityDiff || right.id.localeCompare(left.id);
      }),
    [incidents]
  );

  const byPriority = {
    CRITICAL: incidents.filter((incident) => incident.priority === "CRITICAL").length,
    HIGH: incidents.filter((incident) => incident.priority === "HIGH").length,
    MEDIUM: incidents.filter((incident) => incident.priority === "MEDIUM").length,
    LOW: incidents.filter((incident) => incident.priority === "LOW").length,
  };

  const incidentPoints = incidents
    .filter(
      (incident): incident is Incident & {
        location: Incident["location"] & { lat: number; lng: number };
      } => incident.location.lat !== null && incident.location.lng !== null
    )
    .map((incident) => ({
      id: incident.id,
      label: `${incident.id} · ${incident.title}`,
      lat: incident.location.lat,
      lng: incident.location.lng,
      color:
        incident.priority === "CRITICAL"
          ? "red"
          : incident.priority === "HIGH"
            ? "orange"
            : "grey",
    }));
  const responderPoints = resources
    .filter(
      (resource): resource is Resource & { location: { lat: number; lng: number } } =>
        resource.status !== "AVAILABLE" && Boolean(resource.location)
    )
    .map((resource) => ({
      id: `resource-${resource.id}`,
      label: `${resource.name} · en route`,
      lat: resource.location.lat,
      lng: resource.location.lng,
      color: "green",
    }));
  const mapPoints = [...incidentPoints, ...responderPoints];

  const filteredResources =
    resourceFilter === "ALL"
      ? resources
      : resources.filter((resource) => resource.category === resourceFilter);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#2B2E31] bg-[#111315] p-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">
            RESQ Command Center
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#F2EFE7]">
            SYSTEM OPERATIONAL
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-[#E5A93D]/30 bg-[#1A1D1F] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#E5A93D]">
            Mock mode
          </span>
          <div className="flex items-center gap-2 rounded-full border border-[#3FB6A8]/30 bg-[#1A1D1F] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#3FB6A8]">
            <span className="h-2 w-2 rounded-full bg-[#3FB6A8]" /> Connected
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Reset all local demo incidents and assignments?")) resetDemoData();
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-[#2B2E31] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7E858B] hover:text-[#F2EFE7]"
          >
            <RotateCcw className="h-3 w-3" /> Reset demo
          </button>
        </div>
      </header>

      {notification && (
        <div
          role="status"
          className="rounded-xl border border-[#E5A93D]/30 bg-[#1A1D1F] px-4 py-3 text-sm text-[#F2EFE7]"
        >
          {notification}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-5 rounded-2xl border border-[#2B2E31] bg-[#111315] p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">
            Incidents · {incidents.length}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Critical" value={String(byPriority.CRITICAL)} tone="critical" />
            <MetricCard label="High" value={String(byPriority.HIGH)} tone="warning" />
            <MetricCard label="Medium" value={String(byPriority.MEDIUM)} tone="neutral" />
            <MetricCard label="Low" value={String(byPriority.LOW)} tone="stable" />
          </div>

          <div className="space-y-3">
            {sortedIncidents.map((incident) => (
              <Link
                key={incident.id}
                href={`/coordinator/incidents/${incident.id}`}
                className="block rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-3 transition hover:border-[#3FB6A8]/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E5A93D]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-lg font-semibold text-[#F2EFE7]">{incident.id}</div>
                  <PriorityBadge priority={incident.priority} />
                </div>
                <div className="mt-3 text-sm text-[#F2EFE7]">{incident.title}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {incident.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#2B2E31] bg-[#111315] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#7E858B]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-[#7E858B]">
                  <span>{incident.location.label}</span>
                  <span>{incident.affectedPeople} affected</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-[#7E858B]">{incident.createdAt}</span>
                  <StatusBadge status={incident.status} />
                </div>
              </Link>
            ))}
            {sortedIncidents.length === 0 && (
              <p className="rounded-xl border border-[#2B2E31] p-4 text-sm text-[#7E858B]">
                No incidents are currently in the queue.
              </p>
            )}
          </div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-2xl border border-[#2B2E31] bg-[#111315] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">
                Live map
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[#E5484D]/30 bg-[#1A1D1F] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#E5484D]">
                <AlertTriangle className="h-3 w-3" /> {byPriority.CRITICAL} critical
              </div>
            </div>
            <ResQMap points={mapPoints} />
            <div className="mt-3 flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.14em] text-[#7E858B]">
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#E5484D]" /> Critical incident</span>
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#E5A93D]" /> High priority</span>
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#3FB6A8]" /> Responder en route</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#2B2E31] bg-[#111315] p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">
                Resource availability
              </div>
              <div className="flex items-center gap-2">
                <BellDot className="h-4 w-4 text-[#E5A93D]" />
                <select
                  aria-label="Filter resources by response type"
                  value={resourceFilter}
                  onChange={(event) =>
                    setResourceFilter(event.target.value as Resource["category"] | "ALL")
                  }
                  className="rounded-lg border border-[#2B2E31] bg-[#1A1D1F] px-2 py-1 text-xs text-[#F2EFE7]"
                >
                  <option value="ALL">All teams</option>
                  <option value="FIRE">Fire</option>
                  <option value="RESCUE">Rescue</option>
                  <option value="MEDICAL">Medical</option>
                  <option value="NGO">NGO</option>
                </select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  className="rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-[#F2EFE7]">{resource.name}</div>
                    <span
                      className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                        resource.status === "AVAILABLE"
                          ? "border-[#3FB6A8]/30 text-[#3FB6A8]"
                          : "border-[#E5A93D]/30 text-[#E5A93D]"
                      }`}
                    >
                      {resource.status === "EN_ROUTE" ? "Assigned" : resource.status}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-[#7E858B]">
                    <div>{resource.distanceKm} km away</div>
                    <div>Capacity: {resource.capacity ?? "—"}</div>
                    <div>Current load: {resource.currentLoad ?? 0}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
