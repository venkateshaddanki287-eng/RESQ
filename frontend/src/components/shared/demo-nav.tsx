"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Siren } from "lucide-react";
import { useAppStore } from "@/store/app-store";

const links = [
  { href: "/", label: "Home" },
  { href: "/report", label: "Citizen" },
  { href: "/coordinator", label: "Command center" },
  { href: "/responder", label: "Responder" },
  { href: "/resources", label: "Resources" },
];

export function DemoNav() {
  useEffect(() => {
    function syncDemoState(event: StorageEvent) {
      if (event.key !== "resq-demo-state") return;
      void Promise.resolve(useAppStore.persist.rehydrate()).catch((error: unknown) => {
        console.error("Could not sync RESQ mock state from another tab.", error);
      });
    }

    window.addEventListener("storage", syncDemoState);
    return () => window.removeEventListener("storage", syncDemoState);
  }, []);

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#2B2E31] bg-[#111315] px-4 py-3">
      <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-[0.16em] text-[#F2EFE7]">
        <Siren className="h-4 w-4 text-[#E5A93D]" /> RESQ
      </Link>
      <nav aria-label="Demo navigation" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#7E858B]">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-[#F2EFE7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E5A93D]">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
