import { ResponderDashboard } from "@/components/responder/responder-dashboard";
import { DemoNav } from "@/components/shared/demo-nav";

export default function ResponderPage() {
  return (
    <main className="min-h-screen bg-[#111315] px-4 py-8 text-[#F2EFE7]">
      <div className="mx-auto max-w-5xl">
        <DemoNav />
        <ResponderDashboard />
      </div>
    </main>
  );
}
