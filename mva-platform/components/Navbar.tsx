"use client";

import Link from "next/link";
import { UserButton, useUser, SignInButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Activity } from "lucide-react"; 

export default function Navbar() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();

  const isActive = (path: string) => 
    pathname === path 
      ? "text-sky-700 font-bold bg-sky-50 px-3 py-1 rounded-full" 
      : "text-slate-600 hover:text-sky-600 hover:bg-white/50 px-3 py-1 rounded-full transition-all";

  return (
    <div className="sticky top-4 z-50 flex justify-center px-4 mb-8">
      <nav className="glass w-full max-w-5xl rounded-2xl px-6 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Activity size={20} />
          </div>
          <span className="text-xl font-serif font-bold text-slate-800 tracking-tight">
            MVA<span className="text-sky-600">Health</span>
          </span>
        </Link>

        {/* Desktop Links */}
        {isLoaded && user && (
          <div className="hidden md:flex items-center gap-2 text-sm font-medium">
            {user.publicMetadata?.role === "patient" && (
              <>
                <Link href="/patient/doctors" className={isActive("/patient/doctors")}>Find Doctors</Link>
                <Link href="/patient/dashboard" className={isActive("/patient/dashboard")}>My Health</Link>
              </>
            )}
            {user.publicMetadata?.role === "doctor" && (
              <>
                <Link href="/doctor" className={isActive("/doctor")}>Dashboard</Link>
                <Link href="/doctor/schedule" className={isActive("/doctor/schedule")}>Schedule</Link>
              </>
            )}
             {user.publicMetadata?.role === "admin" && (
              <Link href="/admin" className={isActive("/admin")}>Admin</Link>
            )}
          </div>
        )}

        {/* Auth Actions */}
        <div className="flex items-center gap-4">
          {!isLoaded ? (
            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <span className="text-xs font-bold text-slate-500 hidden sm:block text-right">
                Hello,<br/>
                <span className="text-slate-900">{user.firstName}</span>
              </span>
              <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-slate-300 hover:bg-sky-600 hover:shadow-sky-500/25 transition-all hover:-translate-y-0.5">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </nav>
    </div>
  );
}