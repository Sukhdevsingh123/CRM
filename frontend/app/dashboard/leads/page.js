"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PhoneIcon,
  UserIcon,
  TagIcon
} from "@heroicons/react/24/outline";

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const fetchLeads = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(`http://localhost:5001/api/leads?${params}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setLeads(data.data.leads);
        setPagination(data.data.pagination);
      } else {
        setError(data.message || "Failed to load leads");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const getStatusColor = (status) => {
    switch (status) {
      case "NEW": return "bg-sky-500/10 text-sky-500 ring-1 ring-inset ring-sky-500/20";
      case "CONTACTED": return "bg-amber-500/10 text-amber-500 ring-1 ring-inset ring-amber-500/20";
      case "INTERESTED": return "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20";
      case "CONVERTED": return "bg-emerald-500/10 text-emerald-500 ring-1 ring-inset ring-emerald-500/20";
      case "LOST": return "bg-rose-500/10 text-rose-500 ring-1 ring-inset ring-rose-500/20";
      default: return "bg-muted text-muted-foreground ring-1 ring-inset ring-border";
    }
  };



  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
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
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Leads Management</h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Track and manage your client acquisition pipeline.</p>
        </div>

        <div>
          <Link
            href="/dashboard/leads/new"
            className="inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl text-primary-foreground bg-primary hover:primary/90 shadow-md shadow-primary/20 transition-all duration-200 transform hover:-translate-y-0.5"
          >

            <PlusIcon className="h-4 w-4 mr-2" />
            Add New Lead
          </Link>
        </div>
      </div>


      {/* Search and Filters */}
      <div className="bg-card p-4 rounded-2xl shadow-sm border border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-96 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />

          <input
            type="text"
            placeholder="Search leads by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-transparent rounded-xl text-sm text-foreground placeholder-muted-foreground focus:bg-card focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
          />

        </div>
        <div className="w-full sm:w-auto flex items-center gap-3">
          <div className="text-sm font-semibold text-muted-foreground shrink-0">Filter By:</div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 px-4 py-2.5 bg-muted/50 border border-transparent rounded-xl text-sm font-semibold text-foreground focus:bg-card focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all outline-none cursor-pointer"
          >

            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="INTERESTED">Interested</option>
            <option value="CONVERTED">Converted</option>
            <option value="LOST">Lost</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">

                  Lead Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Next Follow-up
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">

                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">

              {leads.map((lead) => (
                <tr key={lead._id} className="hover:bg-muted/30 transition-colors group cursor-default">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                          <span className="text-primary font-bold text-sm">
                            {lead.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{lead.name}</div>
                        <div className="text-sm font-medium text-muted-foreground flex items-center mt-0.5">
                          <PhoneIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/60" />
                          {lead.phone}
                        </div>

                        {lead.tags && (
                          <div className="text-xs font-medium text-muted-foreground/50 flex items-center mt-1">
                            <TagIcon className="h-3 w-3 mr-1" />
                            {lead.tags}
                          </div>
                        )}

                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-foreground/80 bg-muted/50 inline-flex px-2.5 py-1 rounded-lg border border-border">
                      {lead.source}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-semibold ${lead.nextFollowUpAt && new Date(lead.nextFollowUpAt) < new Date()
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                      }`}>

                      {lead.nextFollowUpAt
                        ? new Date(lead.nextFollowUpAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                        : "Not specified"
                      }
                      {lead.nextFollowUpAt && new Date(lead.nextFollowUpAt) < new Date() && lead.status !== 'CONVERTED' && lead.status !== 'LOST' && (
                        <span className="ml-2 inline-block w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/dashboard/leads/${lead._id}`}
                        className="text-muted-foreground hover:text-primary font-bold px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/dashboard/leads/${lead._id}/edit`}
                        className="text-muted-foreground hover:text-indigo-500 font-bold px-2 py-1 rounded-lg hover:bg-indigo-500/10 transition-colors"
                      >

                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {leads.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-3 border border-dashed border-border">
                      <UserIcon className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-bold text-foreground">No leads found</p>
                    <p className="text-sm font-medium text-muted-foreground mt-1">Try adjusting your filters or search term.</p>
                  </td>

                </tr>

              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="bg-muted/30 px-6 py-4 flex items-center justify-between border-t border-border">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-border text-sm font-semibold rounded-xl text-foreground bg-card hover:bg-muted disabled:opacity-50 transition-colors"
              >
                Previous
              </button>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-border text-sm font-semibold rounded-xl text-foreground bg-card hover:bg-muted disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>

            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Showing <span className="font-bold text-foreground">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
                  <span className="font-bold text-foreground">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{" "}
                  of <span className="font-bold text-foreground">{pagination.total}</span> leads
                </p>
              </div>

              <div>
                <nav className="relative z-0 inline-flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-3 py-2 rounded-lg border border-border bg-card text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm font-bold text-foreground">
                    {pagination.page} / {pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="relative inline-flex items-center px-3 py-2 rounded-lg border border-border bg-card text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </nav>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
