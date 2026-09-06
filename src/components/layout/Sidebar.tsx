"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Calendar, BarChart2, Book, Table } from "lucide-react";
import clsx from "clsx";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Task Board", href: "/tasks", icon: CheckSquare },
  { name: "Kalender Konten", href: "/calendar", icon: Calendar },
  { name: "KPI", href: "/kpi", icon: BarChart2 },
  { name: "Wiki", href: "/wiki", icon: Book },
  { name: "Tabel Custom", href: "/tables", icon: Table },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-bold text-slate-800">Tabia Team</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon
                className={clsx(
                  "mr-3 h-5 w-5 shrink-0",
                  isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
