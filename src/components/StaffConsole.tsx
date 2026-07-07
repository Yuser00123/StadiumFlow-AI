import React, { useState } from "react";
import { AlertOctagon, Activity, FileText, Megaphone, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";
import { Incident, LanguageCode } from "../types";

interface StaffConsoleProps {
  language: LanguageCode;
  onAlertSections: (sections: string[]) => void;
  highContrast: boolean;
}

const PRESET_INCIDENTS = [
  {
    id: "inc-1",
    title: "Concourse B Ticket Gate Backlog",
    location: "Gate B / East Concourse",
    severity: "high" as const,
    category: "crowd" as const,
    description: "Digital ticket scanners at Gate B have experienced a temporary connection outage. Ticket queue wait times are rising quickly (currently 25 mins) and crowding is starting to spill into the road perimeters.",
    status: "active" as const,
    reportedAt: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString()
  },
  {
    id: "inc-2",
    title: "Extreme Shuttle Queue Backup",
    location: "Lot K Transit Hub",
    severity: "medium" as const,
    category: "transit" as const,
    description: "High fan congestion at Lot K shuttle platform. Waiting passengers exceed 1,500. Road construction nearby is slowing down shuttle loop turnarounds.",
    status: "active" as const,
    reportedAt: new Date(Date.now() - 1000 * 60 * 30).toLocaleTimeString()
  },
  {
    id: "inc-3",
    title: "Suspected Heat Exhaustion Section 212",
    location: "Section 212 / Tier 2",
    severity: "high" as const,
    category: "medical" as const,
    description: "An elderly fan has collapsed due to suspected heat exhaustion during the mid-game break. Immediate medical escort and wheelchair evacuation required.",
    status: "active" as const,
    reportedAt: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString()
  }
];

export default function StaffConsole({
  language,
  onAlertSections,
  highContrast
}: StaffConsoleProps) {
  const [incidents, setIncidents] = useState<Incident[]>(PRESET_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  
  // Custom Incident form state
  const [formTitle, setFormTitle] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formSeverity, setFormSeverity] = useState<"low" | "medium" | "high">("medium");
  const [formCategory, setFormCategory] = useState<"crowd" | "security" | "medical" | "transit" | "facilities">("facilities");
  const [formDescription, setFormDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDescription || !formLocation) return;

    const newInc: Incident = {
      id: `inc-${Date.now()}`,
      title: formTitle,
      location: formLocation,
      severity: formSeverity,
      category: formCategory,
      description: formDescription,
      status: "active",
      reportedAt: new Date().toLocaleTimeString()
    };

    setIncidents(prev => [newInc, ...prev]);
    setSelectedIncident(newInc);
    
    // Clear form
    setFormTitle("");
    setFormLocation("");
    setFormDescription("");
  };

  const handleResolveIncident = (id: string) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === id ? { ...inc, status: "resolved" as const } : inc
    ));
    if (selectedIncident?.id === id) {
      setSelectedIncident(prev => prev ? { ...prev, status: "resolved" as const } : null);
    }
  };

  const handleGeneratePlan = async (inc: Incident) => {
    setIsLoadingPlan(true);
    try {
      const res = await fetch("/api/incident-resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: inc.title,
          location: inc.location,
          severity: inc.severity,
          category: inc.category,
          description: inc.description,
          language: language
        })
      });
      const data = await res.json();
      
      const updatedInc = {
        ...inc,
        responsePlan: data.responsePlan,
        announcementScript: data.announcementScript,
        affectedSections: data.affectedSections
      };

      setIncidents(prev => prev.map(i => i.id === inc.id ? updatedInc : i));
      setSelectedIncident(updatedInc);

      // Trigger section alert in visualizer
      if (data.affectedSections && data.affectedSections.length > 0) {
        onAlertSections(data.affectedSections);
      }
    } catch (err) {
      console.error("Failed to generate incident resolution plan:", err);
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const getSeverityBadge = (sev: "low" | "medium" | "high") => {
    switch (sev) {
      case "low": return "bg-blue-100 text-blue-800 border-blue-200";
      case "medium": return "bg-amber-100 text-amber-800 border-amber-200";
      case "high": return "bg-rose-100 text-rose-800 border-rose-200 animate-pulse";
    }
  };

  const getCategoryEmoji = (cat: string) => {
    switch (cat) {
      case "crowd": return "👥";
      case "security": return "🛡️";
      case "medical": return "🚑";
      case "transit": return "🚌";
      case "facilities": return "🔧";
      default: return "⚠️";
    }
  };

  return (
    <div id="staff-console-root" className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-full">
      
      {/* COLUMN 1: Active Log & Incident Entry (5 cols) */}
      <div className="xl:col-span-5 flex flex-col space-y-4">
        
        {/* Telemetry Dashboard Stats */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-xs sm:text-sm text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Operations Dispatch Desk</span>
            </h3>
            <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md">
              COMMAND MODE
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3.5">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Unresolved</p>
              <p className="text-xl font-black text-rose-600 mt-1">
                {incidents.filter(i => i.status === "active").length}
              </p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Resolved Today</p>
              <p className="text-xl font-black text-emerald-600 mt-1">
                {incidents.filter(i => i.status === "resolved").length}
              </p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Actions</p>
              <p className="text-xl font-black text-slate-700 mt-1">
                {incidents.length}
              </p>
            </div>
          </div>
        </div>

        {/* Live Active Incident list */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex-1">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Incident Logs</h3>
          
          <div className="space-y-2.5 overflow-y-auto max-h-[220px]">
            {incidents.map((inc) => (
              <div 
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedIncident?.id === inc.id 
                    ? "bg-slate-50 border-emerald-600 ring-2 ring-emerald-500/10" 
                    : "bg-white hover:bg-slate-50 border-slate-100"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{getCategoryEmoji(inc.category)}</span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800">{inc.title}</h4>
                  </div>
                  <span className={`text-[9px] font-bold border rounded px-1.5 py-0.5 ${getSeverityBadge(inc.severity)}`}>
                    {inc.severity}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
                  <span>📍 {inc.location} • {inc.reportedAt}</span>
                  <span className={`font-bold flex items-center space-x-1 ${
                    inc.status === "active" ? "text-amber-600" : "text-emerald-600"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${inc.status === "active" ? "bg-amber-600 animate-pulse" : "bg-emerald-600"}`} />
                    <span className="uppercase">{inc.status}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dispatch New Incident Form */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Report New Incident</h3>
          
          <form onSubmit={handleCreateIncident} className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken Scanner Gate A"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gate A East Lobby"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Severity</label>
                <select
                  value={formSeverity}
                  onChange={(e) => setFormSeverity(e.target.value as any)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High Emergency</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
                >
                  <option value="crowd">👥 Crowd Flow</option>
                  <option value="security">🛡️ Security Alert</option>
                  <option value="medical">🚑 First Aid / Med</option>
                  <option value="transit">🚌 Transportation</option>
                  <option value="facilities">🔧 Facility Repairs</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Incident Details</label>
              <textarea
                required
                rows={2}
                placeholder="Describe current crowd levels, volunteer availability, accessibility blockages..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-emerald-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Dispatch Incident Stewards
            </button>
          </form>
        </div>

      </div>

      {/* COLUMN 2: Decision Support (7 cols) */}
      <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between h-[640px]">
        
        {selectedIncident ? (
          <div className="flex-1 flex flex-col justify-between h-full space-y-4">
            
            {/* Incident Header */}
            <div>
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getCategoryEmoji(selectedIncident.category)}</span>
                    <h2 className="font-display font-extrabold text-base sm:text-lg text-slate-800">{selectedIncident.title}</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">📍 Located: {selectedIncident.location} • Reported At: {selectedIncident.reportedAt}</p>
                </div>

                <div className="flex space-x-2">
                  {selectedIncident.status === "active" && (
                    <button
                      onClick={() => handleResolveIncident(selectedIncident.id)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Resolve</span>
                    </button>
                  )}
                  <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg border flex items-center ${getSeverityBadge(selectedIncident.severity)}`}>
                    {selectedIncident.severity}
                  </span>
                </div>
              </div>

              {/* Description Body */}
              <div className="mt-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p className="font-bold text-slate-700 mb-1">Ground Dispatch Assessment:</p>
                {selectedIncident.description}
              </div>
            </div>

            {/* Generated AI response plan */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 rounded-xl border border-slate-100 p-4 relative min-h-[160px]">
              
              {isLoadingPlan ? (
                <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center space-y-3 z-10">
                  <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-emerald-800 animate-pulse">Gemini-3.5-flash synthesizing resolution plan...</p>
                </div>
              ) : selectedIncident.responsePlan ? (
                <div className="space-y-4">
                  {/* Step by step protocols */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>Operational Action Plan</span>
                    </h4>
                    
                    {/* Render action plan lines */}
                    <div className="space-y-2 text-xs sm:text-sm">
                      {selectedIncident.responsePlan.split("\n").map((line, idx) => (
                        <p key={idx} className="text-slate-600">{line}</p>
                      ))}
                    </div>
                  </div>

                  {/* Public announcement script */}
                  {selectedIncident.announcementScript && (
                    <div className="bg-amber-50/60 border border-amber-200/85 p-3.5 rounded-xl shadow-xs">
                      <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider mb-2 flex items-center space-x-1">
                        <Megaphone className="w-4 h-4" />
                        <span>Fan Announcement Script (PA)</span>
                      </h4>
                      <p className="font-serif italic text-xs sm:text-sm text-amber-900 leading-relaxed">
                        &ldquo;{selectedIncident.announcementScript}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Alerted zones */}
                  {selectedIncident.affectedSections && selectedIncident.affectedSections.length > 0 && (
                    <div className="flex items-center space-x-2 text-xs bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-rose-800">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span><strong>Alerted Sectors:</strong> {selectedIncident.affectedSections.join(", ")}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-full text-slate-400 p-4">
                  <Sparkles className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-wider">Awaiting Dispatch Instruction</p>
                  <p className="text-[11px] max-w-[280px] mt-1 text-slate-400">
                    Click "Generate AI Resolution Plan" below to query Gemini for emergency protocols and PA scripts.
                  </p>
                </div>
              )}
            </div>

            {/* AI Action Trigger Button */}
            {!selectedIncident.responsePlan && (
              <button
                onClick={() => handleGeneratePlan(selectedIncident)}
                disabled={isLoadingPlan}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3.5 rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
                <span>Generate GenAI Resolution Plan & PA Script</span>
              </button>
            )}

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400">
            <AlertOctagon className="w-12 h-12 text-slate-200 mb-2" />
            <p className="font-extrabold text-sm uppercase tracking-wider">No Incident Selected</p>
            <p className="text-xs max-w-[280px] mt-1 text-slate-400">
              Select an active log from the left sidebar or create a custom incident to trigger AI operations.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
