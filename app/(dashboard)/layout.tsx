"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { X } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Navigation Overlay & Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative flex flex-col w-72 bg-white dark:bg-slate-800 h-full shadow-2xl z-10">
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 p-1"
              aria-label="Close Mobile Navigation"
            >
              <X className="h-5 w-5" />
            </button>
            <Sidebar onClose={() => setMobileNavOpen(false)} className="w-full border-r-0" />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
