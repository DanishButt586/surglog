"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer on navigation so it never lingers over the new page.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Escape closes the drawer; page scroll is locked while it is open.
  useEffect(() => {
    if (!mobileNavOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 transition-colors dark:bg-slate-900">
      {/* Desktop sidebar — hidden below md, where the drawer takes over. */}
      <div className="hidden shrink-0 md:flex">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-50 flex md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 flex h-full w-[17rem] max-w-[85vw] flex-col bg-white shadow-2xl animate-slide-in-left dark:bg-slate-800">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-3 top-3 z-20"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </Button>
            <Sidebar onNavigate={() => setMobileNavOpen(false)} className="w-full border-r-0" />
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {/* Every route shares this container: same max width, same gutters,
              matched to the navbar's container so headings line up vertically. */}
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
