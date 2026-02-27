"use client";

import { useState, useEffect } from "react";
import {
  UserGroupIcon,
  PhoneIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5001/api/dashboard", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError(data.message || "Failed to load dashboard data");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-12 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl font-medium">
          {error}
        </div>
      </div>
    );
  }

  const { stats, funnel, conversionRate, overdueFollowUps, topSources, activityGraph, recentActivities } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Dashboard Overview</h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-500 ring-1 ring-inset ring-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            System Online
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-primary/20 transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary/10 rounded-xl p-3 ring-1 ring-inset ring-primary/20">
              <UserGroupIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-bold text-foreground tracking-tight">{stats.totalLeads}</p>
            </div>
          </div>
        </div>


        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-emerald-500/20 transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-emerald-500/10 rounded-xl p-3 ring-1 ring-inset ring-emerald-500/20">
              <ArrowTrendingUpIcon className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold text-foreground tracking-tight">{conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>


        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-amber-500/20 transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-amber-500/10 rounded-xl p-3 ring-1 ring-inset ring-amber-500/20">
              <ClockIcon className="h-6 w-6 text-amber-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Overdue Follow-ups</p>
              <p className="text-2xl font-bold text-foreground tracking-tight">{overdueFollowUps}</p>
            </div>
          </div>
        </div>


        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-indigo-500/20 transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500/10 rounded-xl p-3 ring-1 ring-inset ring-indigo-500/20">
              <ChartBarIcon className="h-6 w-6 text-indigo-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Converted Leads</p>
              <p className="text-2xl font-bold text-foreground tracking-tight">{stats.convertedLeads}</p>
            </div>
          </div>
        </div>

      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground tracking-tight">Lead Funnel</h2>
            <div className="p-2 bg-muted rounded-lg text-muted-foreground">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(funnel).map(([status, count], index) => {
              const colorClasses = [
                "bg-sky-500", "bg-indigo-500", "bg-primary", "bg-fuchsia-500", "bg-rose-500"
              ];
              const colorClass = colorClasses[index % colorClasses.length];

              return (
                <div key={status} className="flex items-center group">
                  <div className="w-28 text-sm font-semibold text-muted-foreground truncate">{status}</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className={`${colorClass} h-full rounded-full transition-all duration-500 ease-out group-hover:brightness-110`}
                        style={{ width: `${stats.totalLeads > 0 ? (count / stats.totalLeads) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-8 text-right text-sm font-bold text-foreground">{count}</div>
                </div>

              );
            })}
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground tracking-tight">Top Sources</h2>
            <div className="p-2 bg-muted rounded-lg text-muted-foreground">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            {topSources.map((source, index) => (
              <div key={source._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs mr-4 ${index === 0 ? "bg-amber-500/20 text-amber-500 border border-amber-500/20" :
                    index === 1 ? "bg-slate-400/20 text-slate-400 border border-slate-400/20" :
                      index === 2 ? "bg-amber-600/20 text-amber-600 border border-amber-600/20" :
                        "bg-muted text-muted-foreground"
                    }`}>
                    #{index + 1}
                  </div>
                  <span className="text-sm font-semibold text-foreground/80">{source._id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${(source.count / topSources[0]?.count) * 100}%` }}></div>
                  </div>
                  <span className="text-sm font-bold text-foreground w-8 text-right">{source.count}</span>
                </div>
              </div>
            ))}

            {topSources.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground">No source data available</div>
            )}

          </div>
        </div>

      </div>

      <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
        <div className="flex items-center justify-between mb-8"      >
          <h2 className="text-lg font-bold text-foreground tracking-tight">7-Day Activity Stream</h2>
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">Last 7 Days</span>
        </div>

        <div className="flex items-end justify-between h-40 gap-2 sm:gap-6 px-2">
          {activityGraph.map((day) => {
            const heightPercentage = Math.max((day.count / Math.max(1, ...activityGraph.map(d => d.count))) * 100, 5);
            return (
              <div key={day.date} className="flex flex-col items-center flex-1 group relative">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-foreground text-background text-xs font-bold py-1 px-2 rounded-lg transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
                  {day.count} act.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground"></div>
                </div>
                <div
                  className="w-full max-w-[48px] bg-muted rounded-t-xl overflow-hidden relative"
                  style={{ height: '100%' }}
                >
                  <div
                    className="absolute bottom-0 w-full bg-primary/80 transition-all duration-700 ease-out group-hover:bg-primary"
                    style={{ height: `${heightPercentage}%` }}
                  ></div>
                </div>
                <div className="text-xs font-semibold text-muted-foreground mt-3 text-center hidden sm:block">
                  {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                </div>
                <div className="text-[10px] font-semibold text-muted-foreground mt-2 text-center sm:hidden">
                  {new Date(day.date).toLocaleDateString('en', { weekday: 'narrow' })}
                </div>
              </div>

            );
          })}
        </div>
      </div>

      <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground tracking-tight">Recent Updates</h2>
          <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">View All</button>
        </div>
        <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">

          {recentActivities.map((activity, index) => {
            let IconClass, bgColorClass, ringColorClass;
            switch (activity.type) {
              case 'CALL': IconClass = PhoneIcon; bgColorClass = 'bg-emerald-500'; ringColorClass = 'ring-emerald-500/20'; break;
              case 'WHATSAPP': IconClass = ChatBubbleLeftRightIcon; bgColorClass = 'bg-sky-500'; ringColorClass = 'ring-sky-500/20'; break;
              case 'NOTE': IconClass = ClockIcon; bgColorClass = 'bg-amber-500'; ringColorClass = 'ring-amber-500/20'; break;
              case 'STATUS_CHANGE': IconClass = ArrowTrendingUpIcon; bgColorClass = 'bg-fuchsia-500'; ringColorClass = 'ring-fuchsia-500/20'; break;
              default: IconClass = ClockIcon; bgColorClass = 'bg-primary'; ringColorClass = 'ring-primary/20';
            }
            return (
              <div key={activity._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 border-background ${bgColorClass} ring-4 ${ringColorClass} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 mx-4 md:mx-0 transition-transform duration-300 group-hover:scale-110`}>
                  <IconClass className="h-3 w-3 text-white" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-1.5rem)] bg-card p-4 rounded-xl border border-border shadow-sm group-hover:border-primary/30 group-hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <time className="text-xs font-medium text-primary">{new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(activity.createdAt).toLocaleDateString()}</time>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">{activity.type}</span>
                  </div>

                  <p className="text-sm font-medium text-foreground/90 mb-1 leading-snug">{activity.description}</p>
                  <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <span>Target:</span>
                    <span className="text-foreground/80 font-semibold">{activity.lead?.name || 'Unknown Lead'}</span>
                    <span className="mx-1">•</span>
                    <span>By {activity.createdBy?.name || 'System'}</span>
                  </div>

                </div>
              </div>
            );
          })}
          {recentActivities.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground bg-muted/30 rounded-xl border border-border border-dashed">No recent activities found. Start engaging with your leads!</div>
          )}

        </div>
      </div>

    </div>
  );
}
