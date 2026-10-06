import { notFound } from "next/navigation";
import { incidentSeed } from "@/lib/mock-data";

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const incident = incidentSeed.find((item) => item.id === id);

  if (!incident) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#111315] px-4 py-8 text-[#F2EFE7]">
      <div className="mx-auto max-w-5xl space-y-6 rounded-[28px] border border-[#2B2E31] bg-[#111315] p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">Incident detail</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#F2EFE7]">{incident.id}</h1>
          </div>
          <span className="rounded-full border border-[#E5484D]/30 bg-[#1A1D1F] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E5484D]">{incident.priority}</span>
        </div>

        <div className="rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">Original report</div>
          <p className="mt-3 text-base leading-7 text-[#F2EFE7]">&ldquo;{incident.description}&rdquo;</p>
        </div>

        <div className="rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">AI response analysis</div>
          <div className="mt-4 space-y-4">
            {incident.branches.map((branch) => (
              <div key={branch.id} className="rounded-2xl border border-[#2B2E31] bg-[#111315] p-4">
                <div className="text-lg font-semibold text-[#F2EFE7]">{branch.label}</div>
                <div className="mt-2 text-sm text-[#7E858B]">Situation: {branch.situation}</div>
                <div className="mt-3 flex items-center justify-between gap-3 text-sm text-[#F2EFE7]">
                  <span>Recommended resource</span>
                  <span>{branch.recommendedResource}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-sm text-[#F2EFE7]">
                  <span>Availability</span>
                  <span>{branch.availability}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-sm text-[#F2EFE7]">
                  <span>Distance</span>
                  <span>{branch.distanceKm} km</span>
                </div>
                <button className="mt-4 w-full rounded-xl bg-[#F2EFE7] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#111315]">Dispatch {branch.label.replace(" RESPONSE", "")}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
