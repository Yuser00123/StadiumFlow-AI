import { useState } from "react";
import { MapPin, Users, Clock, Flame, Shield, HelpCircle } from "lucide-react";
import { Facility, LanguageCode } from "../types";
import { t } from "../lib/translations";

interface StadiumVisualizerProps {
  activeStadium: string;
  facilities: Facility[];
  onSelectFacility: (facility: Facility) => void;
  selectedFacility: Facility | null;
  accessibleOnly: boolean;
  highContrast: boolean;
  language: LanguageCode;
}

export default function StadiumVisualizer({
  activeStadium,
  facilities,
  onSelectFacility,
  selectedFacility,
  accessibleOnly,
  highContrast,
  language
}: StadiumVisualizerProps) {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  // Filter facilities if accessibleOnly is set
  const displayedFacilities = accessibleOnly 
    ? facilities.filter(f => f.isAccessible)
    : facilities;

  const getCrowdBadgeColor = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "low": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "medium": return "bg-amber-100 text-amber-800 border-amber-200";
      case "high": return "bg-rose-100 text-rose-800 border-rose-200";
    }
  };

  const getStatusBorder = (status: "normal" | "congested" | "closed") => {
    switch (status) {
      case "normal": return "border-emerald-500 bg-emerald-500/20";
      case "congested": return "border-rose-500 bg-rose-500/30 animate-pulse";
      case "closed": return "border-slate-400 bg-slate-300";
    }
  };

  const getFacilityEmoji = (type: string) => {
    switch (type) {
      case "gate": return "🚪";
      case "concession": return "🌭";
      case "restroom": return "🚻";
      case "medical": return "🚑";
      case "transit": return "🚌";
      default: return "📍";
    }
  };

  return (
    <div 
      id="stadium-visualizer-container"
      className={`p-4 rounded-2xl border shadow-xs flex flex-col h-full transition-colors ${
        highContrast ? "bg-black text-white border-white" : "bg-white border-slate-200/80 text-slate-800"
      }`}
    >
      {/* Header & Meta */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="font-display font-extrabold text-base sm:text-lg flex items-center space-x-1.5">
            <span>{t("visualizer_title", language)}</span>
            <span className="text-[10px] py-0.5 px-1.5 font-bold uppercase rounded-md bg-emerald-600 text-white tracking-widest animate-pulse">
              {t("live_telemetry", language)}
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            {accessibleOnly ? t("visualizer_subtitle", language) : t("select_pin_prompt", language)}
          </p>
        </div>
      </div>

      {/* Main Grid: SVG Map and Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[380px]">
        
        {/* SVG Map Section */}
        <div className="lg:col-span-8 flex items-center justify-center bg-slate-50 rounded-xl p-2 relative border border-slate-100 min-h-[300px]">
          
          {/* Wheelchair legend indicator */}
          {accessibleOnly && (
            <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center space-x-1 shadow-sm z-10">
              <span>♿</span> <span>{t("accessible_paths_highlighted", language)}</span>
            </div>
          )}

          {/* Interactive SVG Diagram */}
          <svg 
            id="stadium-svg"
            viewBox="0 0 500 400" 
            className="w-full max-w-[420px] h-auto drop-shadow-md transition-all"
          >
            {/* Background grid or layout */}
            <circle cx="250" cy="200" r="190" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="5,5" />
            
            {/* Outer Ring - Public Gates / Transit Areas */}
            <circle 
              cx="250" cy="200" r="170" 
              fill="none" 
              stroke={highContrast ? "#ffffff" : "#cbd5e1"} 
              strokeWidth="22" 
              className="opacity-70"
            />
            
            {/* Stadium Seating Sections (Interactive path sectors) */}
            {/* North Tier */}
            <path 
              d="M 120 70 A 180 180 0 0 1 380 70 L 340 110 A 130 130 0 0 0 160 110 Z" 
              fill={hoveredSection === "North Tier" ? "#10b981" : "#e2e8f0"} 
              stroke={highContrast ? "#ffffff" : "#94a3b8"} 
              strokeWidth="1.5"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredSection("North Tier")}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => onSelectFacility({
                id: "sec-north",
                name: "North Tier Seating",
                type: "transit",
                crowdLevel: "medium",
                waitTimeMinutes: 8,
                section: "Sec 101-112",
                isAccessible: true,
                coordinates: { x: 250, y: 90 },
                status: "normal"
              })}
            />
            {/* South Tier */}
            <path 
              d="M 120 330 A 180 180 0 0 0 380 330 L 340 290 A 130 130 0 0 1 160 290 Z" 
              fill={hoveredSection === "South Tier" ? "#10b981" : "#e2e8f0"} 
              stroke={highContrast ? "#ffffff" : "#94a3b8"} 
              strokeWidth="1.5"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredSection("South Tier")}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => onSelectFacility({
                id: "sec-south",
                name: "South Tier Seating",
                type: "transit",
                crowdLevel: "high",
                waitTimeMinutes: 18,
                section: "Sec 124-136",
                isAccessible: true,
                coordinates: { x: 250, y: 310 },
                status: "congested"
              })}
            />
            {/* East Tier */}
            <path 
              d="M 380 70 A 180 180 0 0 1 380 330 L 340 290 A 130 130 0 0 0 340 110 Z" 
              fill={hoveredSection === "East Tier" ? "#10b981" : "#cbd5e1"} 
              stroke={highContrast ? "#ffffff" : "#94a3b8"} 
              strokeWidth="1.5"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredSection("East Tier")}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => onSelectFacility({
                id: "sec-east",
                name: "East VIP Tier & Suites",
                type: "transit",
                crowdLevel: "low",
                waitTimeMinutes: 3,
                section: "Sec 201-215",
                isAccessible: true,
                coordinates: { x: 360, y: 200 },
                status: "normal"
              })}
            />
            {/* West Tier */}
            <path 
              d="M 120 70 A 180 180 0 0 0 120 330 L 160 290 A 130 130 0 0 1 160 110 Z" 
              fill={hoveredSection === "West Tier" ? "#10b981" : "#cbd5e1"} 
              stroke={highContrast ? "#ffffff" : "#94a3b8"} 
              strokeWidth="1.5"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredSection("West Tier")}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => onSelectFacility({
                id: "sec-west",
                name: "West Supporter Stand",
                type: "transit",
                crowdLevel: "high",
                waitTimeMinutes: 14,
                section: "Sec 113-123",
                isAccessible: false,
                coordinates: { x: 140, y: 200 },
                status: "normal"
              })}
            />

            {/* Central Football Pitch (Field of Play) */}
            <rect x="180" y="140" width="140" height="120" rx="4" fill="#15803d" stroke="#ffffff" strokeWidth="2" />
            <line x1="180" y1="200" x2="320" y2="200" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="250" cy="200" r="25" fill="none" stroke="#ffffff" strokeWidth="1.5" />

            {/* Accessible Pathways Visual Layer (Wheelchair routes connecting Transit to VIP elevator / seating) */}
            {accessibleOnly && (
              <g id="accessible-routes-overlay">
                {/* Pathway from Transit (Bottom Left) to Gate C (Elevator Section 118) */}
                <path 
                  d="M 70 340 Q 150 360 160 290 Q 180 200 210 180" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="4.5" 
                  strokeDasharray="4,3" 
                  className="animate-[dash_1s_linear_infinite]"
                />
                {/* Pathway from Parking (Top Right) to Gate A (Ramp entry) */}
                <path 
                  d="M 430 70 Q 360 60 340 110 Q 280 120 250 140" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="4.5" 
                  strokeDasharray="4,3"
                />
                {/* Special glowing elevator icon markers */}
                <circle cx="160" cy="290" r="8" fill="#3b82f6" className="animate-ping opacity-75" />
                <circle cx="160" cy="290" r="6" fill="#1d4ed8" />
              </g>
            )}

            {/* Render Facility Nodes on Map Grid */}
            {displayedFacilities.map((fac) => {
              const isSelected = selectedFacility?.id === fac.id;
              return (
                <g 
                  key={fac.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFacility(fac);
                  }}
                  className="cursor-pointer"
                >
                  {/* Outer Pulsing Indicator for Selected or Congested Nodes */}
                  <circle 
                    cx={fac.coordinates.x} 
                    cy={fac.coordinates.y} 
                    r={isSelected ? 16 : 11} 
                    className={`transition-all duration-200 ${
                      isSelected 
                        ? "fill-emerald-400/40 stroke-emerald-600 stroke-2" 
                        : fac.status === "congested" 
                          ? "fill-rose-400/30 stroke-rose-600 stroke-[1.5]" 
                          : "fill-transparent stroke-transparent"
                    }`}
                  />
                  {/* Base Core Node */}
                  <circle 
                    cx={fac.coordinates.x} 
                    cy={fac.coordinates.y} 
                    r="8.5" 
                    className="fill-white shadow-md stroke-slate-400 stroke-1 hover:stroke-emerald-500 hover:stroke-2"
                  />
                  {/* Emoji symbol centered */}
                  <text 
                    x={fac.coordinates.x} 
                    y={fac.coordinates.y + 3} 
                    textAnchor="middle" 
                    fontSize="9px"
                  >
                    {getFacilityEmoji(fac.type)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Info & Telemetry Sidebar */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          
          {/* Legend Selector */}
          <div className="bg-slate-50/65 dark:bg-zinc-900 p-2.5 rounded-xl border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("facility_legend", language)}</h3>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              <span className="flex items-center space-x-1"><span>🚪</span> <span>{t("legend_gates", language)}</span></span>
              <span className="flex items-center space-x-1"><span>🌭</span> <span>{t("legend_food", language)}</span></span>
              <span className="flex items-center space-x-1"><span>🚻</span> <span>{t("legend_restrooms", language)}</span></span>
              <span className="flex items-center space-x-1"><span>🚑</span> <span>{t("legend_medical", language)}</span></span>
              <span className="flex items-center space-x-1"><span>🚌</span> <span>{t("legend_transit", language)}</span></span>
              <span className="flex items-center space-x-1"><span>♿</span> <span>{t("legend_lift", language)}</span></span>
            </div>
          </div>

          {/* Selected Facility Detailed Card */}
          {selectedFacility ? (
            <div 
              id="selected-facility-card"
              className={`p-4 rounded-xl border transition-all duration-300 ${
                selectedFacility.status === "congested" 
                  ? "bg-rose-50 border-rose-200 text-rose-950" 
                  : "bg-emerald-50/70 border-emerald-100 text-emerald-950"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/85 shadow-xs border border-slate-100 mr-2">
                    {getFacilityEmoji(selectedFacility.type)} {selectedFacility.type}
                  </span>
                  {selectedFacility.isAccessible && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 mr-2">
                      ♿ ADA
                    </span>
                  )}
                  <h3 className="font-extrabold text-sm sm:text-base mt-2">{selectedFacility.name}</h3>
                  <p className="text-xs text-slate-400">Sector Location: {selectedFacility.section}</p>
                </div>
              </div>

              {/* Stats Indicators */}
              <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-slate-200/50">
                <div className="bg-white/80 p-2 rounded-lg border border-slate-100">
                  <div className="flex items-center space-x-1 text-slate-500">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t("crowd_density", language)}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md inline-block mt-1 ${getCrowdBadgeColor(selectedFacility.crowdLevel)}`}>
                    {selectedFacility.crowdLevel}
                  </span>
                </div>

                <div className="bg-white/80 p-2 rounded-lg border border-slate-100">
                  <div className="flex items-center space-x-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t("wait_time", language)}</span>
                  </div>
                  <span className="text-xs sm:text-sm font-black text-slate-700 block mt-1">
                    {selectedFacility.waitTimeMinutes} {t("minutes_abbr", language)}
                  </span>
                </div>
              </div>

              {/* Real-time Dynamic Rerouting Action Tip */}
              <div className="mt-3 bg-white/90 p-2.5 rounded-lg text-xs border border-slate-100 flex items-start space-x-2">
                <span className="text-sm">💡</span>
                <div>
                  <p className="font-bold text-slate-700">{t("arena_ops_routing_advise", language)}</p>
                  <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">
                    {selectedFacility.status === "congested" 
                      ? "This zone is currently crowded. Consider using identical facilities in neighboring Tier sectors." 
                      : "Flow is optimal. Pathways clear for standard and wheelchair navigation."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center flex flex-col items-center justify-center min-h-[160px] bg-slate-50/45">
              <span className="text-2xl mb-1 text-slate-300">🗺️</span>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Telemetry Station</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                {t("select_pin_prompt", language)}
              </p>
            </div>
          )}

          {/* Core Telemetry Health Metrics (Operations Summary) */}
          <div className="bg-slate-50/60 dark:bg-zinc-900 p-3 rounded-xl border border-slate-200/50">
            <h3 className="text-[10px] font-black text-slate-400 tracking-wider uppercase mb-2">{t("stadium_metrics", language)}</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{t("stadium_capacity_flow", language)}</span>
                <span className="font-mono font-bold text-slate-600">89% Filled</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{t("ticketing_gates", language)}</span>
                <span className="font-mono font-bold text-emerald-600">{t("gate_a_c_normal", language)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{t("total_active_staff", language)}</span>
                <span className="font-mono font-bold text-slate-600">412 {t("dispatched", language)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
