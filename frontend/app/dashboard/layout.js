"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {HomeIcon,UserGroupIcon,ChartBarIcon,ArrowRightOnRectangleIcon,Bars3Icon,XMarkIcon} from "@heroicons/react/24/outline";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Leads", href: "/dashboard/leads", icon: UserGroupIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex flex-col w-72 bg-white shadow-2xl">
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-100">

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-md shadow-violet-200">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-slate-900 text-xl font-bold tracking-tight">CoachAssist</h1>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 -mr-2 text-slate-400 hover:text-slate-500 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

          </div>
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${isActive
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`mr-4 h-5 w-5 ${isActive ? "text-violet-600" : "text-slate-400 group-hover:text-slate-500"}`} />
                  {item.name}
                </Link>

              );
            })}
          </nav>
          <div className="border-t border-slate-100 p-4 space-y-4">
            <div className="flex items-center px-4 py-3 bg-slate-50 rounded-xl">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center border border-violet-200">
                  <span className="text-violet-700 font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 truncate">
                <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs font-medium text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5" />
              Sign out
            </button>
          </div>

        </div>
      </div>

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-slate-100 shadow-sm">
          <div className="flex items-center h-20 px-8 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-md shadow-violet-200">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-slate-900 text-xl font-bold tracking-tight">CoachAssist</h1>
            </div>
          </div>

          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href || (item.name === "Dashboard" && typeof window !== 'undefined' && window.location.pathname === "/dashboard");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${isActive
                    ? "bg-violet-50 text-violet-700 shadow-sm shadow-violet-100 border border-violet-100/50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                    }`}
                >
                  <item.icon className={`mr-4 h-5 w-5 transition-colors ${isActive ? "text-violet-600" : "text-slate-400 group-hover:text-slate-500"}`} />
                  {item.name}
                </Link>

              );
            })}
          </nav>
          <div className="border-t border-slate-100 p-4 space-y-4">
            <div className="flex items-center px-4 py-3 bg-slate-50 rounded-xl mb-1 border border-slate-100 border-dashed">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center border border-violet-200 shadow-inner">
                  <span className="text-violet-700 font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 truncate">
                <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs font-medium text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 border border-transparent hover:border-red-100"
            >
              <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5" />
              Sign out
            </button>
          </div>

        </div>
      </div>

      <div className="lg:pl-72 flex flex-col min-h-screen">
        <div className="lg:hidden sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-4 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">CoachAssist</h1>
            </div>
            <div className="w-10"></div>
          </div>
        </div>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
