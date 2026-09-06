"use client";

import Link from "next/link";
import { ExternalLink, UserCircle, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function Navbar({ userName }: { userName?: string }) {
  return (
    <div className="flex h-16 w-full items-center justify-between border-b bg-white px-6">
      <div className="flex items-center">
        {/* Breadcrumbs or page title could go here */}
      </div>
      <div className="flex items-center space-x-4">
        <a
          href="https://rumahtahfidztabia.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Lihat Web Utama
        </a>
        <div className="h-6 w-px bg-slate-200"></div>
        <div className="flex items-center space-x-2 cursor-pointer text-slate-600 hover:text-slate-900">
          <UserCircle className="h-6 w-6" />
          <span className="text-sm font-medium">{userName || "Admin User"}</span>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })} 
          className="text-slate-500 hover:text-slate-700 ml-4 cursor-pointer"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
