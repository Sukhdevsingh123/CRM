"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function EditLeadPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        source: "Instagram",
        status: "NEW",
        tags: "",
        nextFollowUpAt: "",
    });

    const fetchLeadDetails = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5001/api/leads/${params.id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.success) {
                const lead = data.data.lead;
                setFormData({
                    name: lead.name || "",
                    phone: lead.phone || "",
                    source: lead.source || "Instagram",
                    status: lead.status || "NEW",
                    tags: lead.tags || "",
                    nextFollowUpAt: lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toISOString().split('T')[0] : "",
                });
            } else {
                setError(data.message || "Failed to load lead details");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        fetchLeadDetails();
    }, [params.id, fetchLeadDetails]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const token = localStorage.getItem("token");

            const payload = { ...formData };
            if (!payload.nextFollowUpAt) {
                delete payload.nextFollowUpAt;
            }

            const response = await fetch(`http://localhost:5001/api/leads/${params.id}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                router.push(`/dashboard/leads/${params.id}`);
            } else {
                setError(data.message || "Failed to update lead");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
            return;
        }

        setSaving(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5001/api/leads/${params.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.success) {
                router.push("/dashboard/leads");
            } else {
                setError(data.message || "Failed to delete lead");
                setSaving(false);
            }
        } catch (err) {
            setError("Network error. Please try again.");
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
                    <div className="bg-card p-8 rounded-2xl shadow-sm border border-border space-y-4">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-10 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-1/4 mt-4"></div>
                        <div className="h-10 bg-muted rounded w-full"></div>
                    </div>
                </div>
            </div>
        );
    }



    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href={`/dashboard/leads/${params.id}`}
                    className="p-2 text-muted-foreground hover:text-foreground bg-card border border-border rounded-xl transition-all shadow-sm hover:bg-muted"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                </Link>

                <div>
                    <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Edit Lead</h1>
                    <p className="mt-1 text-sm font-medium text-muted-foreground">Update information for {formData.name}</p>
                </div>

            </div>


            {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center shadow-sm font-semibold">
                    <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{error}</span>
                </div>
            )}



            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                <form onSubmit={handleSubmit} className="divide-y divide-border">
                    <div className="p-6 sm:p-8 space-y-8">
                        <div>
                            <h3 className="text-base font-bold text-foreground">Personal Information</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Basic contact details for the lead.</p>
                        </div>


                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="name" className="block text-sm font-bold text-foreground/80 mb-1.5">
                                    Full Name <span className="text-destructive">*</span>
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-foreground placeholder-muted-foreground/60 focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all sm:text-sm"
                                />
                            </div>



                            <div>
                                <label htmlFor="phone" className="block text-sm font-bold text-foreground/80 mb-1.5">
                                    Phone Number <span className="text-destructive">*</span>
                                </label>

                                <input
                                    type="text"
                                    name="phone"
                                    id="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-foreground placeholder-muted-foreground/60 focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all sm:text-sm"
                                />
                            </div>


                        </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-8">
                        <div>
                            <h3 className="text-base font-bold text-foreground">Lead Details</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Source, status, and tracking information.</p>
                        </div>


                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="source" className="block text-sm font-bold text-foreground/80 mb-1.5">
                                    Acquisition Source
                                </label>

                                <select
                                    id="source"
                                    name="source"
                                    value={formData.source}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-foreground focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all sm:text-sm appearance-none cursor-pointer"
                                >

                                    <option value="Instagram">Instagram</option>
                                    <option value="Referral">Referral</option>
                                    <option value="Ads">Ads</option>
                                    <option value="Website">Website</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>


                            <div>
                                <label htmlFor="status" className="block text-sm font-bold text-foreground/80 mb-1.5">
                                    Current Status
                                </label>

                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-foreground focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all sm:text-sm appearance-none cursor-pointer"
                                >

                                    <option value="NEW">New Lead</option>
                                    <option value="CONTACTED">Contacted</option>
                                    <option value="INTERESTED">Interested</option>
                                    <option value="CONVERTED">Converted</option>
                                    <option value="LOST">Lost</option>
                                </select>
                            </div>


                            <div>
                                <label htmlFor="nextFollowUpAt" className="block text-sm font-bold text-foreground/80 mb-1.5">
                                    Next Follow-up Date
                                </label>

                                <input
                                    type="date"
                                    name="nextFollowUpAt"
                                    id="nextFollowUpAt"
                                    value={formData.nextFollowUpAt}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-foreground focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all sm:text-sm"
                                />
                            </div>



                            <div className="sm:col-span-2">
                                <label htmlFor="tags" className="block text-sm font-bold text-foreground/80 mb-1.5">
                                    Tags & Keywords
                                </label>

                                <input
                                    type="text"
                                    name="tags"
                                    id="tags"
                                    placeholder="e.g. yoga, meditation, morning-routine (comma separated)"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-foreground placeholder-muted-foreground/60 focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all sm:text-sm"
                                />
                            </div>


                        </div>
                    </div>

                    <div className="px-6 py-5 bg-muted/30 sm:px-8 flex flex-col-reverse sm:flex-row justify-between gap-4 items-center border-t border-border">

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={saving}
                            className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-destructive bg-destructive/10 border border-transparent rounded-xl hover:bg-destructive/20 transition-colors disabled:opacity-50 text-center cursor-pointer"
                        >
                            Delete Lead
                        </button>


                        <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto gap-3 sm:gap-4 items-center">
                            <Link
                                href={`/dashboard/leads/${params.id}`}
                                className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-muted-foreground bg-card border border-border rounded-xl hover:bg-muted hover:text-foreground transition-colors text-center shadow-sm"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 shadow-md shadow-primary/20 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none flex justify-center items-center cursor-pointer"
                            >

                                {saving ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : "Save Changes"}
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}
