import { useState } from "react";
import { Shield, Sparkles, Languages, Accessibility, Maximize, Check, CheckSquare } from "lucide-react";
import { Role, LanguageCode, Language } from "../types";

interface NavbarProps {
  role: Role;
  setRole: (role: Role) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  activeStadium: string;
  setActiveStadium: (stadium: string) => void;
  textSize: "normal" | "lg";
  setTextSize: (size: "normal" | "lg") => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  accessibleOnly: boolean;
  setAccessibleOnly: (val: boolean) => void;
}

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇲🇽" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" }
];

export const STADIUMS = [
  { id: "metlife", name: "MetLife Stadium", city: "New York/New Jersey", capacity: "82,500" },
  { id: "sofi", name: "SoFi Stadium", city: "Los Angeles", capacity: "70,240" },
  { id: "azteca", name: "Estadio Azteca", city: "Mexico City", capacity: "87,523" }
];

export default function Navbar({
  role,
  setRole,
  language,
  setLanguage,
  activeStadium,
  setActiveStadium,
  textSize,
  setTextSize,
  highContrast,
  setHighContrast,
  accessibleOnly,
  setAccessibleOnly
}: NavbarProps) {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [accMenuOpen, setAccMenuOpen] = useState(false);
  const [stadiumMenuOpen, setStadiumMenuOpen] = useState(false);

  const selectedLanguage = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];
  const selectedStadium = STADIUMS.find(s => s.id === activeStadium) || STADIUMS[0];

  return (
    <nav 
      id="app-navbar"
      className={`border-b shadow-sm sticky top-0 z-50 transition-colors duration-200 ${
        highContrast ? "bg-black text-white border-white border-b-2" : "bg-white text-slate-800 border-slate-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* DESKTOP NAVBAR (Visible on large screens) */}
        <div className="hidden lg:flex justify-between h-16 items-center">
          
          {/* Logo / Brand Info */}
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 text-white p-2 rounded-lg flex items-center justify-center font-bold">
              ⚽ 
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-emerald-600">
                  FIFA 2026
                </span>
                <span className="font-mono text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  ArenaOps
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                Stadium Command & Fan Assistant
              </p>
            </div>
          </div>

          {/* Core Navigation Controls */}
          <div className="flex items-center space-x-4">
            
            {/* Stadium Selector */}
            <div className="relative">
              <button
                id="stadium-selector-btn"
                onClick={() => {
                  setStadiumMenuOpen(!stadiumMenuOpen);
                  setLangMenuOpen(false);
                  setAccMenuOpen(false);
                }}
                className={`flex items-center space-x-1 text-sm font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
                  highContrast 
                    ? "border-white hover:bg-zinc-800 text-white" 
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <span>📍 {selectedStadium.name}</span>
                <span className="text-[10px] text-slate-400">▼</span>
              </button>
              
              {stadiumMenuOpen && (
                <div 
                  id="stadium-dropdown"
                  className={`absolute right-0 mt-2 w-56 rounded-lg border shadow-xl z-50 ${
                    highContrast ? "bg-zinc-900 border-white text-white" : "bg-white border-slate-100 text-slate-800"
                  }`}
                >
                  <div className="p-2 border-b border-slate-100 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    Select Host Stadium
                  </div>
                  <div className="p-1 space-y-1">
                    {STADIUMS.map(stad => (
                      <button
                        key={stad.id}
                        onClick={() => {
                          setActiveStadium(stad.id);
                          setStadiumMenuOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded text-xs transition-colors flex justify-between items-center ${
                          activeStadium === stad.id 
                            ? "bg-emerald-50 text-emerald-700 font-bold" 
                            : highContrast ? "hover:bg-zinc-800 text-white" : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{stad.name}</p>
                          <p className="text-[10px] text-slate-400">{stad.city} • Cap: {stad.capacity}</p>
                        </div>
                        {activeStadium === stad.id && <span className="text-emerald-600">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-inner">
              <button
                id="role-fan-btn"
                onClick={() => setRole("fan")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  role === "fan"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fan Hub</span>
              </button>
              
              <button
                id="role-staff-btn"
                onClick={() => setRole("staff")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  role === "staff"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Ops Control</span>
              </button>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                id="lang-selector-btn"
                onClick={() => {
                  setLangMenuOpen(!langMenuOpen);
                  setAccMenuOpen(false);
                  setStadiumMenuOpen(false);
                }}
                className={`p-2 rounded-lg border transition-colors flex items-center space-x-1 ${
                  highContrast 
                    ? "border-white hover:bg-zinc-800 text-white" 
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
                title="Select Language"
              >
                <Languages className="w-4 h-4" />
                <span className="text-xs font-bold">{selectedLanguage.flag} {selectedLanguage.name}</span>
              </button>
              
              {langMenuOpen && (
                <div 
                  id="lang-dropdown"
                  className={`absolute right-0 mt-2 w-48 rounded-lg border shadow-xl z-50 ${
                    highContrast ? "bg-zinc-900 border-white text-white" : "bg-white border-slate-100 text-slate-800"
                  }`}
                >
                  <div className="p-2 border-b border-slate-100 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    Translate Assistant
                  </div>
                  <div className="p-1 space-y-0.5">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex justify-between items-center ${
                          language === lang.code 
                            ? "bg-emerald-50 text-emerald-700 font-bold" 
                            : highContrast ? "hover:bg-zinc-800 text-white" : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span>{lang.flag} {lang.name}</span>
                        {language === lang.code && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Accessibility Selector */}
            <div className="relative">
              <button
                id="accessibility-settings-btn"
                onClick={() => {
                  setAccMenuOpen(!accMenuOpen);
                  setLangMenuOpen(false);
                  setStadiumMenuOpen(false);
                }}
                className={`p-2 rounded-lg border transition-colors flex items-center space-x-1 ${
                  highContrast || accessibleOnly
                    ? "bg-emerald-600 text-white border-emerald-500" 
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
                title="Accessibility Preferences"
              >
                <Accessibility className="w-4 h-4" />
              </button>
              
              {accMenuOpen && (
                <div 
                  id="accessibility-dropdown"
                  className={`absolute right-0 mt-2 w-64 rounded-lg border shadow-xl p-3 z-50 ${
                    highContrast ? "bg-zinc-900 border-white text-white" : "bg-white border-slate-100 text-slate-800"
                  }`}
                >
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2 border-b pb-1">
                    Accessibility Services
                  </h4>
                  <div className="space-y-3.5">
                    
                    {/* Text Size Scale */}
                    <div>
                      <span className="text-xs font-semibold block mb-1 text-slate-600 dark:text-slate-300">Text Scaling</span>
                      <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
                        <button
                          onClick={() => setTextSize("normal")}
                          className={`flex-1 text-[11px] font-bold py-1 rounded-md transition-all ${
                            textSize === "normal" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500"
                          }`}
                        >
                          Standard (1x)
                        </button>
                        <button
                          onClick={() => setTextSize("lg")}
                          className={`flex-1 text-[11px] font-bold py-1 rounded-md transition-all ${
                            textSize === "lg" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500"
                          }`}
                        >
                          Large (1.2x)
                        </button>
                      </div>
                    </div>

                    {/* High Contrast */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">High Contrast UI</span>
                        <span className="text-[10px] text-slate-400">Pure black background</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={highContrast}
                        onChange={(e) => setHighContrast(e.target.checked)}
                        className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                      />
                    </div>

                    {/* Wheelchair Paths Filter */}
                    <div className="flex items-center justify-between border-t pt-2.5">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Accessible Routes Only</span>
                        <span className="text-[10px] text-slate-400">Highlight lifts & ramps</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={accessibleOnly}
                        onChange={(e) => setAccessibleOnly(e.target.checked)}
                        className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                      />
                    </div>

                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* MOBILE & TABLET NAVBAR (Visible on medium/small screens) */}
        <div className="lg:hidden flex flex-col py-3 space-y-3">
          
          {/* Top Row: Brand & Stadium Selector */}
          <div className="flex justify-between items-center w-full">
            {/* Brand Logo & Compact Badge */}
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-600 text-white p-1.5 rounded-lg flex items-center justify-center font-bold text-sm">
                ⚽
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <span className="font-display font-black text-sm tracking-tight text-emerald-600 leading-none">
                    FIFA 2026
                  </span>
                  <span className="font-mono text-[8px] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 animate-pulse">
                    Ops
                  </span>
                </div>
                <p className="text-[9px] font-medium text-slate-400 leading-none mt-0.5">
                  Stadium Command
                </p>
              </div>
            </div>

            {/* Stadium Dropdown & Accessibility Trigger */}
            <div className="flex items-center space-x-1.5">
              
              {/* Stadium Selector */}
              <div className="relative">
                <button
                  id="stadium-selector-btn-mobile"
                  onClick={() => {
                    setStadiumMenuOpen(!stadiumMenuOpen);
                    setLangMenuOpen(false);
                    setAccMenuOpen(false);
                  }}
                  className={`flex items-center space-x-1 text-xs font-bold px-2 py-1.5 rounded-lg border transition-colors ${
                    highContrast 
                      ? "border-white hover:bg-zinc-800 text-white" 
                      : "border-slate-200 hover:bg-slate-50 text-slate-700 bg-slate-50/50"
                  }`}
                >
                  <span className="max-w-[100px] truncate">
                    📍 {selectedStadium.name.replace(" Stadium", "")}
                  </span>
                  <span className="text-[8px] text-slate-400">▼</span>
                </button>
                
                {stadiumMenuOpen && (
                  <div 
                    id="stadium-dropdown-mobile"
                    className={`absolute right-0 mt-2 w-52 rounded-lg border shadow-xl z-50 ${
                      highContrast ? "bg-zinc-900 border-white text-white" : "bg-white border-slate-100 text-slate-800"
                    }`}
                  >
                    <div className="p-2 border-b border-slate-100 text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                      Select Stadium
                    </div>
                    <div className="p-1 space-y-0.5">
                      {STADIUMS.map(stad => (
                        <button
                          key={stad.id}
                          onClick={() => {
                            setActiveStadium(stad.id);
                            setStadiumMenuOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded text-xs transition-colors flex justify-between items-center ${
                            activeStadium === stad.id 
                              ? "bg-emerald-50 text-emerald-700 font-bold" 
                              : highContrast ? "hover:bg-zinc-800 text-white" : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-xs">{stad.name}</p>
                            <p className="text-[9px] text-slate-400">{stad.city}</p>
                          </div>
                          {activeStadium === stad.id && <span className="text-emerald-600 text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Accessibility Settings Trigger */}
              <div className="relative">
                <button
                  id="accessibility-settings-btn-mobile"
                  onClick={() => {
                    setAccMenuOpen(!accMenuOpen);
                    setLangMenuOpen(false);
                    setStadiumMenuOpen(false);
                  }}
                  className={`p-1.5 rounded-lg border transition-colors flex items-center ${
                    highContrast || accessibleOnly
                      ? "bg-emerald-600 text-white border-emerald-500" 
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                  title="Accessibility Preferences"
                >
                  <Accessibility className="w-4 h-4" />
                </button>
                
                {accMenuOpen && (
                  <div 
                    id="accessibility-dropdown-mobile"
                    className={`absolute right-0 mt-2 w-60 rounded-lg border shadow-xl p-3 z-50 ${
                      highContrast ? "bg-zinc-900 border-white text-white" : "bg-white border-slate-100 text-slate-800"
                    }`}
                  >
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2 border-b pb-1">
                      Accessibility Services
                    </h4>
                    <div className="space-y-3">
                      
                      {/* Text Scaling */}
                      <div>
                        <span className="text-xs font-semibold block mb-1 text-slate-600 dark:text-slate-300">Text Scaling</span>
                        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
                          <button
                            onClick={() => setTextSize("normal")}
                            className={`flex-1 text-[10px] font-bold py-1 rounded-md transition-all ${
                              textSize === "normal" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500"
                            }`}
                          >
                            Standard
                          </button>
                          <button
                            onClick={() => setTextSize("lg")}
                            className={`flex-1 text-[10px] font-bold py-1 rounded-md transition-all ${
                              textSize === "lg" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500"
                            }`}
                          >
                            Large
                          </button>
                        </div>
                      </div>

                      {/* High Contrast */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">High Contrast UI</span>
                        <input
                          type="checkbox"
                          checked={highContrast}
                          onChange={(e) => setHighContrast(e.target.checked)}
                          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                        />
                      </div>

                      {/* Wheelchair Paths */}
                      <div className="flex items-center justify-between border-t pt-2">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Accessible Routes</span>
                        <input
                          type="checkbox"
                          checked={accessibleOnly}
                          onChange={(e) => setAccessibleOnly(e.target.checked)}
                          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                        />
                      </div>

                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Bottom Row: Role Switcher & Language Selector */}
          <div className="flex items-center justify-between w-full pt-2.5 border-t border-slate-100 dark:border-zinc-800">
            
            {/* Role Switcher */}
            <div className="flex bg-slate-100 dark:bg-zinc-900 p-0.5 rounded-xl border border-slate-200/60 shadow-inner">
              <button
                id="role-fan-btn-mobile"
                onClick={() => setRole("fan")}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  role === "fan"
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fan Hub</span>
              </button>
              
              <button
                id="role-staff-btn-mobile"
                onClick={() => setRole("staff")}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  role === "staff"
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Ops Control</span>
              </button>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                id="lang-selector-btn-mobile"
                onClick={() => {
                  setLangMenuOpen(!langMenuOpen);
                  setAccMenuOpen(false);
                  setStadiumMenuOpen(false);
                }}
                className={`px-2.5 py-1.5 rounded-lg border transition-colors flex items-center space-x-1 text-xs font-bold ${
                  highContrast 
                    ? "border-white hover:bg-zinc-800 text-white" 
                    : "border-slate-200 hover:bg-slate-50 text-slate-600 bg-slate-50/50"
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{selectedLanguage.flag} {selectedLanguage.name}</span>
              </button>
              
              {langMenuOpen && (
                <div 
                  id="lang-dropdown-mobile"
                  className={`absolute right-0 mt-2 w-44 rounded-lg border shadow-xl z-50 ${
                    highContrast ? "bg-zinc-900 border-white text-white" : "bg-white border-slate-100 text-slate-800"
                  }`}
                >
                  <div className="p-2 border-b border-slate-100 text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                    Select Language
                  </div>
                  <div className="p-1 max-h-48 overflow-y-auto space-y-0.5">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex justify-between items-center ${
                          language === lang.code 
                            ? "bg-emerald-50 text-emerald-700 font-bold" 
                            : highContrast ? "hover:bg-zinc-800 text-white" : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span className="text-xs">{lang.flag} {lang.name}</span>
                        {language === lang.code && <span className="text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </nav>
  );
}
