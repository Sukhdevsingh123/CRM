"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HomeIcon, UserGroupIcon, ChartBarIcon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { ThemeToggle } from "../components/ThemeToggle";

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Leads", href: "/dashboard/leads", icon: UserGroupIcon },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex flex-col w-72 bg-card shadow-2xl">
          <div className="flex items-center justify-between h-20 px-6 border-b border-border">

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-foreground text-xl font-bold tracking-tight">CoachAssist</h1>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 -mr-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
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
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`mr-4 h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                  {item.name}
                </Link>

              );
            })}
          </nav>
          <div className="border-t border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1 max-w-[200px] gap-3 bg-muted/50 p-2 rounded-xl">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <span className="text-primary font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
            >
              <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5" />
              Sign out
            </button>
          </div>

        </div>
      </div>

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-card border-r border-border shadow-sm">
          <div className="flex items-center h-20 px-8 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-foreground text-xl font-bold tracking-tight">CoachAssist</h1>
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
                    ? "bg-primary/10 text-primary shadow-sm shadow-primary/5 border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                    }`}
                >
                  <item.icon className={`mr-4 h-5 w-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                  {item.name}
                </Link>

              );
            })}
          </nav>
          <div className="border-t border-border p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center flex-1 min-w-0 px-3 py-2 bg-muted/30 rounded-xl border border-border border-dashed">
                <div className="flex-shrink-0">
                  <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shadow-inner">
                    <span className="text-primary font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                  <p className="text-[10px] font-medium text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-200 border border-transparent hover:border-destructive/20"
            >
              <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5" />
              Sign out
            </button>
          </div>

        </div>
      </div>

      <div className="lg:pl-72 flex flex-col min-h-screen">
        <div className="lg:hidden sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-4 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-base font-bold text-foreground tracking-tight">CoachAssist</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
