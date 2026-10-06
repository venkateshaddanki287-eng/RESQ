"use client";

import { useState } from "react";
import { DemoNav } from "@/components/shared/demo-nav";
import { useAppStore } from "@/store/app-store";
import type { Resource } from "@/types/incident";

type ResourceFilter = Resource["category"] | "ALL";

export default function ResourcesPage() {
  const resources = useAppStore((state) => state.resources);
  const [filter, setFilter] = useState<ResourceFilter>("ALL");
  const visibleResources =
    filter === "ALL"
      ? resources
      : resources.filter((resource) => resource.category === filter);

  const groups = [
    { id: "FIRE", label: "Fire teams" },
    { id: "RESCUE", label: "Rescue teams" },
    { id: "MEDICAL", label: "Ambulances" },
    { id: "NGO", label: "NGO units" },
  ] as const;

  return (
    <main className="min-h-screen bg-[#111315] px-4 py-8 text-[#F2EFE7]">
      <div className="mx-auto max-w-6xl">
        <DemoNav />
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">
              Resource coordination · mock mode
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">RESOURCE INVENTORY</h1>
          </div>
          <label className="text-xs text-[#7E858B]">
            <span className="sr-only">Filter resource category</span>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as ResourceFilter)}
              className="rounded-lg border border-[#2B2E31] bg-[#1A1D1F] px-3 py-2 text-sm text-[#F2EFE7]"
            >
              <option value="ALL">All resource groups</option>
              <option value="FIRE">Fire teams</option>
              <option value="RESCUE">Rescue teams</option>
              <option value="MEDICAL">Ambulances</option>
              <option value="NGO">NGO units</option>
            </select>
          </label>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {groups.map((group) => {
            const units = resources.filter((resource) => resource.category === group.id);
            const available = units.filter((unit) => unit.status === "AVAILABLE").length;
            return (
              <div key={group.id} className="rounded-xl border border-[#2B2E31] bg-[#1A1D1F] p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7E858B]">
                  {group.label}
                </div>
                <div className="mt-3 text-2xl font-semibold">{available} available</div>
                <div className="mt-1 text-xs text-[#7E858B]">{units.length} units tracked</div>
              </div>
            );
          })}
        </div>

        {visibleResources.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#2B2E31] p-6 text-sm text-[#7E858B]">
            No resources are listed in this group.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibleResources.map((resource) => (
              <article key={resource.id} className="rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold">{resource.name}</h2>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                      resource.status === "AVAILABLE"
                        ? "border-[#3FB6A8]/30 text-[#3FB6A8]"
                        : "border-[#E5A93D]/30 text-[#E5A93D]"
                    }`}
                  >
                    {resource.status === "EN_ROUTE" ? "Assigned" : resource.status}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-[#7E858B]">Distance</div>
                    <div className="mt-1">{resource.distanceKm} km</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#7E858B]">Capacity</div>
                    <div className="mt-1">{resource.capacity ?? "—"}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-[#7E858B]">Current load</div>
                    <div className="mt-1">
                      {resource.currentLoad ?? 0} / {resource.capacity ?? "—"}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
