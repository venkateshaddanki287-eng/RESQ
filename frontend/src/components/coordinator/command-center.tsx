"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AlertTriangle, BellDot } from "lucide-react";
import Link from "next/link";
import { getIncidents, getResources } from "@/lib/api";
import { MetricCard, PriorityBadge, StatusBadge } from "@/components/shared/resq-ui";
import type { Incident, Resource } from "@/types/incident";

const ResQMap = dynamic(
  () => import("@/components/map/resq-map").then((mod) => mod.ResQMap),
  { ssr: false }
);

export function CommandCenter() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [incidentData, resourceData] = await Promise.all([getIncidents(), getResources()]);
      setIncidents(incidentData);
      setResources(resourceData);
      setIsLoading(false);
    }

    loadData();
  }, []);

  const byPriority = {
    CRITICAL: incidents.filter((incident) => incident.priority === "CRITICAL").length,
    HIGH: incidents.filter((incident) => incident.priority === "HIGH").length,
    MEDIUM: incidents.filter((incident) => incident.priority === "MEDIUM").length,
    LOW: incidents.filter((incident) => incident.priority === "LOW").length,
  };

  const mapPoints = incidents.map((incident) => ({
    id: incident.id,
    label: `${incident.id} • ${incident.title}`,
    lat: incident.location.lat,
    lng: incident.location.lng,
    color: incident.priority === "CRITICAL" ? "red" : incident.priority === "HIGH" ? "orange" : "green",
  }));

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4 rounded-2xl border border-[#2B2E31] bg-[#111315] p-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">RESQ Command Center</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#F2EFE7]">SYSTEM OPERATIONAL</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#3FB6A8]/30 bg-[#1A1D1F] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#3FB6A8]">
          <span className="h-2 w-2 rounded-full bg-[#3FB6A8]" /> Live
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-5 rounded-2xl border border-[#2B2E31] bg-[#111315] p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">Incidents</div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <MetricCard label="Critical" value={String(byPriority.CRITICAL)} tone="critical" />
            <MetricCard label="High" value={String(byPriority.HIGH)} tone="warning" />
            <MetricCard label="Medium" value={String(byPriority.MEDIUM)} tone="neutral" />
            <MetricCard label="Low" value={String(byPriority.LOW)} tone="stable" />
          </div>

          <div className="space-y-3">
            {isLoading && <div className="text-sm text-[#7E858B]">Loading incidents...</div>}
            {!isLoading && incidents.map((incident) => (
              <Link
                key={incident.id}
                href={`/coordinator/incidents/${incident.id}`}
                className="block rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-3 transition hover:border-[#3FB6A8]/30"
              >
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-[#F2EFE7]">{incident.id}</div>
                  <PriorityBadge priority={incident.priority} />
                </div>
                <div className="mt-3 text-sm text-[#F2EFE7]">{incident.title}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {incident.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-[#2B2E31] bg-[#111315] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#7E858B]">{tag}</span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-[#7E858B]">
                  <span>{incident.location.city}</span>
                  <span>{incident.affectedPeople} affected</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-[#7E858B]">{incident.createdAt}</span>
                  <StatusBadge status={incident.status} />
                </div>
              </Link>
            ))}
          </div>
        </aside>

        <section className="space-y-6 ">
          <div className="rounded-2xl border border-[#2B2E31] bg-[#111315] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">Live map</div>
              <div className="flex items-center gap-2 rounded-full border border-[#E5484D]/30 bg-[#1A1D1F] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#E5484D]">
                <AlertTriangle className="h-3 w-3" /> {byPriority.CRITICAL} critical
              </div>
            </div>
            <ResQMap points={mapPoints} />
          </div>

          <div className="rounded-2xl border border-[#2B2E31] bg-[#111315] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">Available resources</div>
              <BellDot className="h-4 w-4 text-[#E5A93D]" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {resources.map((resource) => (
                <div key={resource.id} className="rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-[#F2EFE7]">{resource.name}</div>
                    <span className="rounded-full border border-[#3FB6A8]/30 bg-[#111315] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#3FB6A8]">{resource.status}</span>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-[#7E858B]">
                    <div>{resource.distanceKm} km</div>
                    <div>Capacity: {resource.capacity}</div>
                    <div>Current load: {resource.currentLoad}</div>
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
