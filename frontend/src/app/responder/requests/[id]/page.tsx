import { incidentSeed } from "@/lib/mock-data";
import { notFound } from "next/navigation";

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const incident = incidentSeed.find((item) => item.id === id);

  if (!incident) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#111315] px-4 py-8 text-[#F2EFE7]">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-[#2B2E31] bg-[#111315] p-6">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">Request accepted</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#F2EFE7]">{incident.id}</h1>
        <div className="mt-6 rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-4">
          <div className="text-sm text-[#7E858B]">Status</div>
          <div className="mt-2 text-xl font-semibold text-[#F2EFE7]">Responding</div>
          <div className="mt-4 text-sm text-[#F2EFE7]">Assigned to: Fire Team Alpha</div>
        </div>
      </div>
    </main>
  );
}
