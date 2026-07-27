"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  BarChart3,
  Target,
  Bot,
  LogOut,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const baseNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Case Logbook", href: "/cases", icon: ClipboardList },
  { name: "Log New Case", href: "/cases/new", icon: PlusCircle },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Target Settings", href: "/targets", icon: Target },
  { name: "AI Study Assistant", href: "/ai-assistant", icon: Bot, badge: "AI" },
];

export function Sidebar({ className, onClose }: { className?: string; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Surgical Resident");
  const [userEmail, setUserEmail] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, is_admin")
          .eq("id", user.id)
          .single();

        if (profile) {
          if (profile.full_name) setUserName(profile.full_name);
          if (profile.is_admin) setIsAdmin(true);
        } else if (user.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name);
        }
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const getInitials = (nameStr: string) => {
    const parts = nameStr.replace(/^Dr\.\s*/i, "").trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (parts[0]?.[0] || "DR").toUpperCase();
  };

  const navItems = [...baseNavItems];
  if (isAdmin) {
    navItems.push({
      name: "Admin Panel",
      href: "/admin",
      icon: ShieldCheck,
      badge: "Admin",
    });
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-white dark:bg-slate-800/95 border-r border-slate-200 dark:border-slate-800 w-64 p-4 transition-colors",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-3 mb-6 border-b border-slate-100 dark:border-slate-700/60">
        <div className="h-10 w-10 rounded-xl bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-900 flex items-center justify-center shadow-md">
          <Stethoscope className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
            SurgLog
            <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
              {isAdmin ? "Admin" : "Pro"}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Surgical Case Logbook</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href) && item.href !== "/cases/new");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                )}
              />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white",
                    item.badge === "Admin"
                      ? "bg-amber-500 dark:bg-amber-400 dark:text-slate-950"
                      : "bg-teal-600 dark:bg-teal-400 dark:text-slate-900"
                  )}
                >
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight className="h-4 w-4 text-teal-600 dark:text-teal-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout Footer */}
      <div className="pt-4 mt-auto border-t border-slate-100 dark:border-slate-700/60 space-y-3">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60">
          <div className="h-9 w-9 rounded-full bg-teal-600 text-white font-semibold text-xs flex items-center justify-center flex-shrink-0">
            {getInitials(userName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{userName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail || "Logged in"}</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-slate-200 dark:border-slate-700 cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>
    </aside>
  );
}
