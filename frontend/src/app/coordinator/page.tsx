import { CommandCenter } from "@/components/coordinator/command-center";
import { DemoNav } from "@/components/shared/demo-nav";

export default function CoordinatorPage() {
  return (
    <main className="min-h-screen bg-[#111315] px-4 py-8 text-[#F2EFE7]">
      <div className="mx-auto max-w-7xl">
        <DemoNav />
        <CommandCenter />
      </div>
    </main>
  );
}
