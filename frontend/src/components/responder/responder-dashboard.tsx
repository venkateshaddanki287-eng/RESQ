"use client";

import { Flame, HandCoins, HeartPulse, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { incidentSeed } from "@/lib/mock-data";
import { useAppStore } from "@/store/app-store";
import { PriorityBadge } from "@/components/shared/resq-ui";
import type { ResponderType } from "@/types/incident";

const responderMeta: Record<ResponderType, { label: string; icon: LucideIcon; bg: string; accent: string }> = {
  FIRE: { label: "Fire", icon: Flame, bg: "#1A1D1F", accent: "#E5484D" },
  RESCUE: { label: "Rescue", icon: Truck, bg: "#1A1D1F", accent: "#E5A93D" },
  MEDICAL: { label: "Medical", icon: HeartPulse, bg: "#1A1D1F", accent: "#3FB6A8" },
  NGO: { label: "NGO", icon: HandCoins, bg: "#1A1D1F", accent: "#7E858B" },
};

export function ResponderDashboard() {
  const { selectedResponderType, setResponderType } = useAppStore();

  const activeType = selectedResponderType;
  const { label, icon: Icon } = responderMeta[activeType];

  const visibleIncidents = incidentSeed.filter((incident) => {
    if (activeType === "FIRE") return incident.tags.includes("Fire") || incident.tags.includes("Rescue");
    if (activeType === "RESCUE") return incident.tags.includes("Rescue");
    if (activeType === "MEDICAL") return incident.tags.includes("Medical");
    return incident.tags.includes("NGO") || incident.tags.includes("Food") || incident.tags.includes("Water");
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#2B2E31] bg-[#111315] p-4">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">Responder type</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {Object.entries(responderMeta).map(([type, meta]) => {
            const active = type === activeType;
            const TypeIcon = meta.icon;
            return (
              <button
                key={type}
                onClick={() => setResponderType(type as ResponderType)}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium uppercase tracking-[0.18em] ${active ? "border-[#F2EFE7] bg-[#F2EFE7] text-[#111315]" : "border-[#2B2E31] bg-[#1A1D1F] text-[#F2EFE7]"}`}
              >
                <TypeIcon className="h-4 w-4" /> {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[#2B2E31] bg-[#111315] p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A1D1F] text-[#F2EFE7]">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">Active service</div>
            <div className="text-xl font-semibold text-[#F2EFE7]">{label} RESPONSE</div>
          </div>
        </div>

        <div className="space-y-3">
          {visibleIncidents.map((incident) => (
            <div key={incident.id} className="rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xl font-semibold text-[#F2EFE7]">{incident.id}</div>
                <PriorityBadge priority={incident.priority} />
              </div>
              <div className="mt-3 text-sm text-[#F2EFE7]">{incident.title}</div>
              <div className="mt-2 text-sm text-[#7E858B]">{incident.description}</div>
              <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[#7E858B]">
                <span>{incident.location.city}</span>
                <span>{incident.affectedPeople} affected</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="rounded-xl border border-[#2B2E31] bg-[#111315] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F2EFE7]">VIEW REQUEST</button>
                <button className="rounded-xl bg-[#F2EFE7] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#111315]">ACCEPT REQUEST</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
