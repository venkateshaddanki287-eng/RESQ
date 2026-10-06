import Link from "next/link";
import { AlertTriangle, ChevronRight, ShieldCheck, Siren } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#111315] px-4 py-6 text-[#F2EFE7] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between rounded-full border border-[#2B2E31] bg-[#111315]/80 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2B2E31] bg-[#1A1D1F] text-[#F2EFE7]">
              <Siren className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7E858B]">RESQ</div>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-[#7E858B] md:flex">
            <Link href="/report" className="hover:text-[#F2EFE7]">Report</Link>
            <Link href="/coordinator" className="hover:text-[#F2EFE7]">Command center</Link>
            <Link href="/responder" className="hover:text-[#F2EFE7]">Responder</Link>
          </nav>
        </header>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E5484D]/20 bg-[#1A1D1F] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E5484D]">
              <span className="h-2 w-2 rounded-full bg-[#E5484D]" /> Emergency coordination
            </div>

            <div className="space-y-5">
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-[#F2EFE7] sm:text-5xl lg:text-6xl">
                When every second matters,
                <span className="mt-2 block text-[#F2EFE7]">get the right response to the right place.</span>
              </h1>
              <p className="max-w-lg text-lg leading-8 text-[#7E858B]">
                Report an emergency using your own words. RESQ identifies what is needed and helps coordinate the right response teams.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/report" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F2EFE7] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#111315]">
                Report an emergency <ChevronRight className="h-4 w-4" />
              </Link>
              <Link href="/coordinator" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#2B2E31] bg-[#111315] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#F2EFE7]">
                Open command center
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#2B2E31] bg-[#111315] p-5">
            <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7E858B]">
              <span className="h-2 w-2 rounded-full bg-[#3FB6A8]" /> System Operational
            </div>
            <div className="space-y-3 border-t border-[#2B2E31] pt-4">
              <div className="flex items-center justify-between rounded-xl border border-[#2B2E31] bg-[#1A1D1F] p-3">
                <span className="text-sm text-[#F2EFE7]">Emergency reports</span>
                <span className="text-[#3FB6A8]">LIVE</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[#2B2E31] bg-[#1A1D1F] p-3">
                <span className="text-sm text-[#F2EFE7]">Response coordination</span>
                <span className="text-[#E5A93D]">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[#2B2E31] bg-[#1A1D1F] p-3">
                <span className="text-sm text-[#F2EFE7]">Live responder status</span>
                <span className="text-[#3FB6A8]">SYNCED</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-5">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A1D1F] text-[#E5484D]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="text-sm uppercase tracking-[0.18em] text-[#7E858B]">Rapid triage</div>
            <div className="mt-3 text-lg font-medium text-[#F2EFE7]">Natural language emergency intake</div>
          </div>
          <div className="rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-5">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A1D1F] text-[#E5A93D]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-sm uppercase tracking-[0.18em] text-[#7E858B]">Human control</div>
            <div className="mt-3 text-lg font-medium text-[#F2EFE7]">Coordinator approves every dispatch</div>
          </div>
          <div className="rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-5">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A1D1F] text-[#3FB6A8]">
              <Siren className="h-5 w-5" />
            </div>
            <div className="text-sm uppercase tracking-[0.18em] text-[#7E858B]">Real-time updates</div>
            <div className="mt-3 text-lg font-medium text-[#F2EFE7]">Clear status flow from report to resolution</div>
          </div>
        </section>
      </div>
    </main>
  );
}
