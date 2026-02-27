"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {ArrowLeftIcon,PhoneIcon,UserIcon, TagIcon,CalendarIcon,ChatBubbleLeftRightIcon, PencilIcon,rashIcon, SparklesIcon,ClockIcon, ExclamationTriangleIcon} from "@heroicons/react/24/outline";

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [aiContent, setAiContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [newActivity, setNewActivity] = useState({ type: "NOTE", description: "" });
  const [generatingAI, setGeneratingAI] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMoreActivities, setHasMoreActivities] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  console.log('Params:', params);

  useEffect(() => {
    if (params.id !== 'new') {
      fetchLeadDetails();
      fetchActivities();
      fetchAIContent();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchLeadDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5001/api/leads/${params.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setLead(data.data.lead);
      } else {
        setError(data.message || "Failed to load lead details");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    }
  };
  const fetchActivities = async (cursor = null) => {
    try {
      if (cursor) setLoadingMore(true);
      const token = localStorage.getItem("token");
      const url = cursor
        ? `http://localhost:5001/api/activities/${params.id}/timeline?cursor=${cursor}`
        : `http://localhost:5001/api/activities/${params.id}/timeline`;

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        if (cursor) {
          setActivities(prev => [...prev, ...data.data.activities]);
        } else {
          setActivities(data.data.activities);
        }
        setNextCursor(data.data.pagination.nextCursor);
        setHasMoreActivities(data.data.pagination.hasMore);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchAIContent = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5001/api/ai/${params.id}/ai-content`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setAiContent(data.data.aiContent);
      }
    } catch (error) {
      console.error("Failed to fetch AI content:", error);
    }
  };

  const generateAIFollowUp = async () => {
    setGeneratingAI(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5001/api/ai/${params.id}/ai-followup`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setAiContent(data.data.aiContent);
        setLead(data.data.lead);
        // Refresh activities
        fetchActivities();
      } else {
        setError(data.message || "Failed to generate AI follow-up");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setGeneratingAI(false);
    }
  };

  const addActivity = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5001/api/activities/${params.id}/activity`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newActivity),
      });

      const data = await response.json();

      if (data.success) {
        setActivities([data.data.activity, ...activities]);
        setNewActivity({ type: "NOTE", description: "" });
        setShowActivityForm(false);
      } else {
        setError(data.message || "Failed to add activity");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "NEW": return "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20";
      case "CONTACTED": return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20";
      case "INTERESTED": return "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/20";
      case "CONVERTED": return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20";
      case "LOST": return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20";
      default: return "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/20";
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "CALL": return <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><PhoneIcon className="h-4 w-4" /></div>;
      case "WHATSAPP": return <div className="p-2 rounded-xl bg-sky-50 text-sky-600"><ChatBubbleLeftRightIcon className="h-4 w-4" /></div>;
      case "NOTE": return <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><PencilIcon className="h-4 w-4" /></div>;
      case "STATUS_CHANGE": return <div className="p-2 rounded-xl bg-violet-50 text-violet-600"><ArrowLeftIcon className="h-4 w-4" /></div>;
      case "AI_MESSAGE_GENERATED": return <div className="p-2 rounded-xl bg-orange-50 text-orange-600"><SparklesIcon className="h-4 w-4" /></div>;
      default: return <div className="p-2 rounded-xl bg-slate-50 text-slate-600"><ClockIcon className="h-4 w-4" /></div>;
    }
  };



  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }



  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Lead not found</h2>
          <Link
            href="/dashboard/leads"
            className="text-violet-600 hover:text-violet-700 font-semibold"
          >
            Back to leads
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/leads"
            className="p-2 text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>

          <div>
            <div className="flex justify-between items-center sm:justify-start gap-4">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{lead.name}</h1>
              <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md ${getStatusColor(lead.status)}`}>
                {lead.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-1">
              <span className="text-sm font-medium text-slate-500 flex items-center">
                <PhoneIcon className="h-4 w-4 mr-1.5 text-slate-400" />
                {lead.phone}
              </span>
            </div>
          </div>

        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/leads/${lead._id}/edit`}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all flex items-center justify-center"
          >
            <PencilIcon className="h-4 w-4 mr-2 text-slate-400" />
            Edit Profile
          </Link>
        </div>

      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Lead Details & AI */}
        <div className="lg:col-span-1 space-y-6">
          {/* Lead Details Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50/50 bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-900">Lead Attributes</h2>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Acquisition Source</label>
                <div className="text-sm font-semibold text-slate-700 bg-slate-50 inline-flex px-2.5 py-1 rounded border border-slate-100">{lead.source}</div>
              </div>


              {lead.tags && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {lead.tags.split(',').map((tag, idx) => (
                      <span key={idx} className="text-xs font-semibold text-violet-700 bg-violet-50 inline-flex items-center px-2 py-1 rounded-md border border-violet-100">
                        <TagIcon className="h-3 w-3 mr-1" />
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}


              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Next Follow-up</label>
                <p className={`text-sm font-semibold flex items-center ${lead.nextFollowUpAt && new Date(lead.nextFollowUpAt) < new Date()
                  ? 'text-rose-600'
                  : 'text-slate-700'
                  }`}>
                  <CalendarIcon className="h-4 w-4 mr-1.5 opacity-70" />
                  {lead.nextFollowUpAt
                    ? new Date(lead.nextFollowUpAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                    : "Not scheduled"
                  }
                </p>
              </div>


              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Profile Created</label>
                <p className="text-sm font-medium text-slate-500">
                  {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-400"></div>
            <div className="px-6 py-5 border-b border-slate-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2 text-violet-500" />
                  AI Intelligence
                </h2>
              </div>

              <button
                onClick={generateAIFollowUp}
                disabled={generatingAI}
                className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors disabled:opacity-50"
              >
                {generatingAI ? "Analyzing..." : "Regenerate"}
              </button>
            </div>


            <div className="p-6">
              {aiContent ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Suggested WhatsApp Message</label>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400 to-emerald-400 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                      <div className="relative bg-slate-50 p-4 rounded-xl text-sm font-medium text-slate-800 leading-relaxed border border-slate-200/50 shadow-sm">
                        {aiContent.whatsappMessage}
                        <button className="absolute top-2 right-2 p-1.5 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-sky-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" title="Copy to clipboard">
                          <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>


                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recommended Call Script</label>
                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
                      <div className="text-sm font-medium text-slate-700 space-y-2">
                        {(aiContent.callScript || "").split('\n').map((line, index) => (
                          <p key={index} className={line.trim().startsWith('-') ? 'ml-3 flex items-start' : ''}>
                            {line.trim().startsWith('-') && <span className="mr-2 text-amber-500">•</span>}
                            {line.replace(/^-/, '').trim()}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>


                  {aiContent.objectionHandling && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Objection Handling</label>
                      <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100/50">
                        <p className="text-sm font-medium text-slate-700 italic">" {aiContent.objectionHandling} "</p>
                      </div>
                    </div>
                  )}


                  {aiContent.lastGeneratedAt && (
                    <div className="pt-2 flex items-center text-xs font-medium text-slate-400">
                      <ClockIcon className="h-3.5 w-3.5 mr-1" />
                      Generated {new Date(aiContent.lastGeneratedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}

                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <div className="mx-auto w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mb-4 border border-violet-100">
                    <SparklesIcon className="h-8 w-8 text-violet-400" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">No AI Intelligence Yet</h3>
                  <p className="text-sm font-medium text-slate-500 mb-5">Generate smart follow-ups and call scripts tailored to this lead.</p>
                  <button
                    onClick={generateAIFollowUp}
                    disabled={generatingAI}
                    className="inline-flex items-center px-4 py-2 text-sm font-bold rounded-xl text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-200 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none"
                  >
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    {generatingAI ? "Analyzing profile..." : "Generate Insights"}
                  </button>
                </div>

              )}
            </div>
          </div>

        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50/50 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-900">Activity Timeline</h2>
              <button
                onClick={() => setShowActivityForm(!showActivityForm)}
                className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-colors"
              >
                {showActivityForm ? 'Cancel' : 'Log Activity'}
              </button>
            </div>


            {showActivityForm && (
              <form onSubmit={addActivity} className="p-6 bg-white border-b border-slate-100 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-1/3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Activity Type</label>
                    <div className="relative">
                      <select
                        value={newActivity.type}
                        onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-300 transition-all appearance-none cursor-pointer"
                      >
                        <option value="NOTE">Quick Note</option>
                        <option value="CALL">Phone Call</option>
                        <option value="WHATSAPP">WhatsApp Msg</option>
                      </select>
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        {newActivity.type === 'CALL' && <PhoneIcon className="h-4 w-4 text-slate-400" />}
                        {newActivity.type === 'WHATSAPP' && <ChatBubbleLeftRightIcon className="h-4 w-4 text-slate-400" />}
                        {newActivity.type === 'NOTE' && <PencilIcon className="h-4 w-4 text-slate-400" />}
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-2/3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Details</label>
                    <input
                      type="text"
                      value={newActivity.description}
                      onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-300 transition-all"
                      placeholder="What happened? e.g. Left a voicemail"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 shadow-md shadow-slate-200 transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    Save Activity
                  </button>
                </div>

              </form>
            )}
            <div className="p-6 sm:p-8">
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">

                {activities.map((activity, index) => (
                  <div key={activity._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-110">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">

                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {activity.type.replace('_', ' ')}
                        </span>
                        <time className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                          {new Date(activity.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(activity.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                        </time>
                      </div>
                      <p className="text-sm font-medium text-slate-700 leading-snug">{activity.description}</p>

                      {activity.createdBy?.name && (
                        <div className="mt-2 text-xs font-medium text-slate-400 flex items-center">
                          <span className="w-4 h-4 rounded-full bg-slate-100 inline-flex items-center justify-center mr-1.5 text-[8px] font-bold text-slate-500 border border-slate-200">
                            {activity.createdBy.name.charAt(0)}
                          </span>
                          by {activity.createdBy.name}
                        </div>
                      )}

                    </div>
                  </div>
                ))}


                {activities.length === 0 && !showActivityForm && (
                  <div className="text-center py-12 px-4 relative z-10 bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                      <ChatBubbleLeftRightIcon className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">No Activity History</h3>
                    <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">Track calls, messages, and notes to stay on top of your relationship with this lead.</p>
                  </div>
                )}

              </div>

              {hasMoreActivities && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={() => fetchActivities(nextCursor)}
                    disabled={loadingMore}
                    className="px-5 py-2.5 border border-slate-200 text-sm font-bold rounded-xl text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all disabled:opacity-50 flex items-center"
                  >

                    {loadingMore ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </>
                    ) : (
                      "View Older History"
                    )}
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
