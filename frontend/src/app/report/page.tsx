import { CitizenFlow } from "@/components/citizen/citizen-flow";
import { DemoNav } from "@/components/shared/demo-nav";

export default function ReportPage() {
  return (
    <main className="min-h-screen bg-[#111315] px-4 py-8 text-[#F2EFE7]">
      <div className="mx-auto max-w-2xl">
        <DemoNav />
        <CitizenFlow />
      </div>
    </main>
  );
}
