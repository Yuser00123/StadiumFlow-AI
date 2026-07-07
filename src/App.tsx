import { useState, useEffect } from "react";
import { Role, LanguageCode, Facility, Stadium } from "./types";
import Navbar from "./components/Navbar";
import StadiumVisualizer from "./components/StadiumVisualizer";
import FanHub from "./components/FanHub";
import StaffConsole from "./components/StaffConsole";
import DiagnosticConsole from "./components/DiagnosticConsole";
import { Terminal, Shield, Sparkles, MapPin, Radio, Heart } from "lucide-react";
import { t } from "./lib/translations";

// Predefined Facility Datasets for each Stadium
const STADIUM_FACILITIES: Record<string, Facility[]> = {
  metlife: [
    { id: "ml-gate-a", name: "Gate A General Public Entry", type: "gate", crowdLevel: "medium", waitTimeMinutes: 8, section: "North Plaza", isAccessible: true, coordinates: { x: 250, y: 50 }, status: "normal" },
    { id: "ml-gate-b", name: "Gate B Ticket Lanes", type: "gate", crowdLevel: "high", waitTimeMinutes: 24, section: "South Plaza", isAccessible: true, coordinates: { x: 250, y: 350 }, status: "congested" },
    { id: "ml-gate-c", name: "Gate C VIP & Accessible Entry", type: "gate", crowdLevel: "low", waitTimeMinutes: 2, section: "East Concourse", isAccessible: true, coordinates: { x: 420, y: 200 }, status: "normal" },
    { id: "ml-concession-1", name: "Taco World Cup", type: "concession", crowdLevel: "low", waitTimeMinutes: 4, section: "Lower Concourse Sec 112", isAccessible: true, coordinates: { x: 210, y: 110 }, status: "normal" },
    { id: "ml-concession-2", name: "Burger Goal", type: "concession", crowdLevel: "high", waitTimeMinutes: 18, section: "Upper Concourse Sec 324", isAccessible: true, coordinates: { x: 310, y: 290 }, status: "congested" },
    { id: "ml-restroom-1", name: "Concourse ADA Restroom", type: "restroom", crowdLevel: "medium", waitTimeMinutes: 5, section: "Sec 104 Elevator Hub", isAccessible: true, coordinates: { x: 160, y: 150 }, status: "normal" },
    { id: "ml-medical", name: "Section 110 First Aid", type: "medical", crowdLevel: "low", waitTimeMinutes: 1, section: "Lower Level 1 West", isAccessible: true, coordinates: { x: 100, y: 200 }, status: "normal" },
    { id: "ml-transit-shuttle", name: "Lot K Transit Bus Terminal", type: "transit", crowdLevel: "medium", waitTimeMinutes: 6, section: "External Lot K", isAccessible: true, coordinates: { x: 80, y: 340 }, status: "normal" }
  ],
  sofi: [
    { id: "sf-gate-n", name: "North General Entrance", type: "gate", crowdLevel: "low", waitTimeMinutes: 3, section: "North Plaza", isAccessible: true, coordinates: { x: 250, y: 50 }, status: "normal" },
    { id: "sf-gate-s", name: "South Ticketing Gate", type: "gate", crowdLevel: "high", waitTimeMinutes: 28, section: "South Concourse", isAccessible: true, coordinates: { x: 250, y: 350 }, status: "congested" },
    { id: "sf-concession-1", name: "Hollywood Burgers", type: "concession", crowdLevel: "high", waitTimeMinutes: 22, section: "Level 2 Sec 206", isAccessible: true, coordinates: { x: 310, y: 110 }, status: "congested" },
    { id: "sf-concession-2", name: "Angeles Vegan Corner", type: "concession", crowdLevel: "low", waitTimeMinutes: 2, section: "Level 1 Sec 115", isAccessible: true, coordinates: { x: 160, y: 290 }, status: "normal" },
    { id: "sf-restroom-sensory", name: "ADA Restroom & Sensory Room", type: "restroom", crowdLevel: "low", waitTimeMinutes: 0, section: "Level 1 Sec 118", isAccessible: true, coordinates: { x: 160, y: 150 }, status: "normal" },
    { id: "sf-medical", name: "Stadium Medical Suite", type: "medical", crowdLevel: "low", waitTimeMinutes: 1, section: "Level 2 South East", isAccessible: true, coordinates: { x: 380, y: 260 }, status: "normal" },
    { id: "sf-transit-rideshare", name: "Rideshare Zone Yellow", type: "transit", crowdLevel: "medium", waitTimeMinutes: 8, section: "External Zone Yellow", isAccessible: true, coordinates: { x: 420, y: 340 }, status: "normal" }
  ],
  azteca: [
    { id: "az-gate-main", name: "Entrada Principal", type: "gate", crowdLevel: "high", waitTimeMinutes: 35, section: "Calzada de Tlalpan", isAccessible: false, coordinates: { x: 250, y: 350 }, status: "congested" },
    { id: "az-gate-vip", name: "Entrada Familiar VIP & ADA", type: "gate", crowdLevel: "low", waitTimeMinutes: 3, section: "Zona Poniente", isAccessible: true, coordinates: { x: 250, y: 50 }, status: "normal" },
    { id: "az-concession-tacos", name: "Tacos de la Cancha", type: "concession", crowdLevel: "high", waitTimeMinutes: 15, section: "Tercer Nivel", isAccessible: false, coordinates: { x: 310, y: 290 }, status: "congested" },
    { id: "az-concession-tortas", name: "Tortas y Refrescos Azteca", type: "concession", crowdLevel: "low", waitTimeMinutes: 4, section: "Primer Concurso", isAccessible: true, coordinates: { x: 160, y: 110 }, status: "normal" },
    { id: "az-restroom", name: "Baños Públicos Adaptados", type: "restroom", crowdLevel: "medium", waitTimeMinutes: 8, section: "Rampa Acceso Sur", isAccessible: true, coordinates: { x: 160, y: 290 }, status: "normal" },
    { id: "az-medical", name: "Unidad Médica de Emergencia", type: "medical", crowdLevel: "low", waitTimeMinutes: 1, section: "Sección 120", isAccessible: true, coordinates: { x: 100, y: 200 }, status: "normal" },
    { id: "az-transit-tren", name: "Estación Tren Ligero Estadio Azteca", type: "transit", crowdLevel: "high", waitTimeMinutes: 14, section: "Salida Principal Este", isAccessible: true, coordinates: { x: 420, y: 200 }, status: "congested" }
  ]
};

export default function App() {
  const [role, setRole] = useState<Role>("fan");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [activeStadium, setActiveStadium] = useState<string>("metlife");
  const [activeTab, setActiveTab] = useState<"visualizer" | "diagnostics">("visualizer");

  // Accessibility parameters
  const [textSize, setTextSize] = useState<"normal" | "lg">("normal");
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [accessibleOnly, setAccessibleOnly] = useState<boolean>(false);

  // Facility state
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>(STADIUM_FACILITIES.metlife);

  // Sync facilities data when stadium changes
  useEffect(() => {
    const data = STADIUM_FACILITIES[activeStadium] || STADIUM_FACILITIES.metlife;
    setFacilities(data);
    setSelectedFacility(null);
  }, [activeStadium]);

  const handleAlertSectionsInVisualizer = (sections: string[]) => {
    // Locate the first facility located in the alerted sections and select it to highlight
    const matchedFac = facilities.find(f => sections.some(sec => f.section.toLowerCase().includes(sec.toLowerCase())));
    if (matchedFac) {
      setSelectedFacility(matchedFac);
    }
  };

  return (
    <div 
      id="root-app-container"
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        highContrast ? "bg-black text-white" : "bg-slate-50/50 text-slate-800"
      } ${textSize === "lg" ? "text-size-lg" : ""}`}
    >
      {/* Dynamic Scoreboard ticker */}
      <div className="bg-slate-900 text-white py-1 px-4 text-[10px] sm:text-xs font-mono font-bold flex items-center justify-between overflow-hidden whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse inline-block" />
          <span className="text-red-400 font-extrabold uppercase tracking-wide">{t("matchday_ticker", language)}</span>
        </div>
        <div className="flex space-x-8 animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused]">
          <span>{t("ticker_text_1", language)}</span>
          <span>{t("ticker_text_2", language)}</span>
          <span>{t("ticker_text_3", language)}</span>
          <span>{t("ticker_text_4", language)}</span>
        </div>
        <span className="hidden sm:inline-block text-emerald-400">● {t("live_feed", language)}</span>
      </div>

      {/* Navigation Header */}
      <Navbar
        role={role}
        setRole={setRole}
        language={language}
        setLanguage={setLanguage}
        activeStadium={activeStadium}
        setActiveStadium={setActiveStadium}
        textSize={textSize}
        setTextSize={setTextSize}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        accessibleOnly={accessibleOnly}
        setAccessibleOnly={setAccessibleOnly}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-16 sm:pb-20 lg:pb-24 space-y-5">
        
        {/* Module Tab Selector (Diagnostics vs Visualizer) */}
        <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-200/50 shadow-xs">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("visualizer")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "visualizer"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>🏟️</span>
              <span>{t("tournament_center", language)}</span>
            </button>
            <button
              id="diagnostic-tab-btn"
              onClick={() => setActiveTab("diagnostics")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "diagnostics"
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{t("diagnostic_console_tab", language)}</span>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-2 text-xs font-semibold text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t("grid_coords_active", language)}</span>
          </div>
        </div>

        {activeTab === "visualizer" ? (
          <div className="space-y-5">
            {/* Split Grid: Map Visualizer (top or left) and Hubs (bottom or right) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              
              {/* Stadium Visualizer Section (7 columns) */}
              <div className="xl:col-span-7">
                <StadiumVisualizer
                  activeStadium={activeStadium}
                  facilities={facilities}
                  onSelectFacility={setSelectedFacility}
                  selectedFacility={selectedFacility}
                  accessibleOnly={accessibleOnly}
                  highContrast={highContrast}
                  language={language}
                />
              </div>

              {/* Dynamic User Experience Hub depending on selected role (5 columns) */}
              <div className="xl:col-span-5">
                {role === "fan" ? (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center space-x-2 border-b pb-3.5 mb-4">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h3 className="font-display font-extrabold text-base text-slate-800">{t("fan_assistance_title", language)}</h3>
                        <p className="text-[11px] text-slate-400">{t("fan_assistance_subtitle", language)}</p>
                      </div>
                    </div>
                    <FanHub
                      language={language}
                      facilities={facilities}
                      onSelectFacility={setSelectedFacility}
                      textSize={textSize}
                      highContrast={highContrast}
                    />
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center space-x-2 border-b pb-3.5 mb-4">
                      <Shield className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h3 className="font-display font-extrabold text-base text-slate-800">{t("incident_command_desk", language)}</h3>
                        <p className="text-[11px] text-slate-400">{t("incident_subtitle", language)}</p>
                      </div>
                    </div>
                    <StaffConsole
                      language={language}
                      onAlertSections={handleAlertSectionsInVisualizer}
                      highContrast={highContrast}
                    />
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          <div className="animate-[fade-in_0.3s_ease]">
            <DiagnosticConsole />
          </div>
        )}

      </main>

      {/* Aesthetic Footer */}
      <footer className={`mt-auto py-5 border-t text-center transition-colors text-xs text-slate-400 ${
        highContrast ? "bg-black text-white border-white" : "bg-slate-50 border-slate-200"
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p className="flex items-center justify-center space-x-1">
            <span>⚽ {t("official_stadium_system", language)}</span>
          </p>
          <p className="flex items-center space-x-1">
            <span>{t("powered_by", language)}</span>
            <span className="font-extrabold text-emerald-600">Gemini-3.5-flash</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
