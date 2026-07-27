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
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase/client";

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  /** Sub-routes that should also light this item up. */
  activePaths?: string[];
  /** Sub-routes that must NOT light this item up (they own their own entry). */
  exceptPaths?: string[];
};

const baseNavItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    name: "Case Logbook",
    href: "/cases",
    icon: ClipboardList,
    // /cases/:id/edit belongs to the logbook; /cases/new has its own entry.
    activePaths: ["/cases"],
    exceptPaths: ["/cases/new"],
  },
  { name: "Log New Case", href: "/cases/new", icon: PlusCircle },
  { name: "Analytics", href: "/analytics", icon: BarChart3, activePaths: ["/analytics"] },
  { name: "Target Settings", href: "/targets", icon: Target, activePaths: ["/targets"] },
  {
    name: "AI Study Assistant",
    href: "/ai-assistant",
    icon: Bot,
    badge: "AI",
    activePaths: ["/ai-assistant"],
  },
];

/**
 * Exactly one nav item is active for any given path. `/cases/new` no longer
 * lights up both "Case Logbook" and "Log New Case" the way the previous bare
 * `startsWith` check did.
 */
function isItemActive(item: NavItem, pathname: string) {
  if (pathname === item.href) return true;
  if (item.exceptPaths?.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return false;
  }
  return (item.activePaths ?? []).some((path) => pathname.startsWith(`${path}/`));
}

export function Sidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Surgical Resident");
  const [userEmail, setUserEmail] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loggingOut, setLoggingOut] = useState(false);

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
    setLoggingOut(true);
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

  const navItems: NavItem[] = [...baseNavItems];
  if (isAdmin) {
    navItems.push({
      name: "Admin Panel",
      href: "/admin",
      icon: ShieldCheck,
      badge: "Admin",
      activePaths: ["/admin"],
    });
  }

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        "flex h-full w-64 flex-col border-r border-slate-200 bg-white transition-colors dark:border-slate-700 dark:bg-slate-800",
        className
      )}
    >
      {/* Brand block is exactly navbar height (h-16) so the sidebar header and
          the top bar share one horizontal rule across the whole shell. */}
      <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-4 dark:border-slate-700">
        <Brand tagline="Surgical Case Logbook" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = isItemActive(item, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-800",
                isActive
                  ? "bg-teal-50 font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                )}
              />
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
              {item.badge && (
                <span
                  className={cn(
                    "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                    item.badge === "Admin"
                      ? "bg-amber-500 text-white dark:bg-amber-400 dark:text-slate-900"
                      : "bg-teal-600 text-white dark:bg-teal-400 dark:text-slate-900"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="shrink-0 space-y-3 border-t border-slate-200 p-3 dark:border-slate-700">
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/60">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white dark:bg-teal-500 dark:text-slate-900">
            {getInitials(userName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
              {userName}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {userEmail || "Logged in"}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full justify-start hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:hover:border-rose-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" />
          {loggingOut ? "Logging out…" : "Log Out"}
        </Button>
      </div>
    </nav>
  );
}
