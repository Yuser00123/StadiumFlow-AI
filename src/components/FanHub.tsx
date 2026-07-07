import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Compass, Bus, HelpCircle, Heart, Trash2, ArrowRight } from "lucide-react";
import { LanguageCode, Message, Facility } from "../types";
import { t } from "../lib/translations";

interface FanHubProps {
  language: LanguageCode;
  facilities: Facility[];
  onSelectFacility: (facility: Facility) => void;
  textSize: "normal" | "lg";
  highContrast: boolean;
}

// Custom Markdown-to-HTML parser for safety and speed
function SimpleMarkdown({ text }: { text: string }) {
  if (!text) return null;
  
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
      {lines.map((line, idx) => {
        let content = line.trim();
        
        // Headers
        if (content.startsWith("###")) {
          return <h4 key={idx} className="font-extrabold text-slate-800 mt-2 text-xs sm:text-sm uppercase tracking-wider">{content.replace("###", "").trim()}</h4>;
        }
        if (content.startsWith("##")) {
          return <h3 key={idx} className="font-extrabold text-slate-800 mt-3 text-sm sm:text-base border-b pb-0.5">{content.replace("##", "").trim()}</h3>;
        }
        if (content.startsWith("#")) {
          return <h2 key={idx} className="font-black text-emerald-800 mt-4 text-base sm:text-lg">{content.replace("#", "").trim()}</h2>;
        }

        // Bullet points
        if (content.startsWith("-") || content.startsWith("*")) {
          const formatted = content.substring(1).trim().replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
          return (
            <li key={idx} className="ml-4 list-disc text-slate-600" dangerouslySetInnerHTML={{ __html: formatted }} />
          );
        }

        // Numbered lists
        if (/^\d+\./.test(content)) {
          const formatted = content.replace(/^\d+\./, "").trim().replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
          return (
            <li key={idx} className="ml-4 list-decimal text-slate-600" dangerouslySetInnerHTML={{ __html: formatted }} />
          );
        }

        // Bold formatting
        const boldFormatted = content.replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-slate-900'>$1</strong>");
        
        if (content === "") {
          return <div key={idx} className="h-1.5" />;
        }

        return <p key={idx} className="text-slate-600" dangerouslySetInnerHTML={{ __html: boldFormatted }} />;
      })}
    </div>
  );
}

export default function FanHub({
  language,
  facilities,
  onSelectFacility,
  textSize,
  highContrast
}: FanHubProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync welcome message on language change
  useEffect(() => {
    setMessages(prev => {
      const hasWelcome = prev.some(m => m.id === "welcome-msg");
      if (!hasWelcome) {
        return [
          {
            id: "welcome-msg",
            role: "model",
            text: t("welcome_msg", language),
            timestamp: new Date().toLocaleTimeString(),
            category: "general"
          },
          ...prev
        ];
      }
      return prev.map(m => {
        if (m.id === "welcome-msg") {
          return { ...m, text: t("welcome_msg", language) };
        }
        return m;
      });
    });
  }, [language]);

  // Suggested Prompts based on Language
  const SUGGESTED_PROMPTS: Record<LanguageCode, string[]> = {
    en: [
      "Where are wheelchair accessible restrooms?",
      "How do transit shuttles to Lot K operate?",
      "Where can I refund my reusable tournament cup?",
      "Which food concessions have shortest wait times?"
    ],
    es: [
      "¿Dónde hay baños accesibles para sillas de ruedas?",
      "¿Cómo funcionan los transbordadores al Lote K?",
      "¿Dónde puedo reembolsar mi vaso reutilizable?",
      "¿Qué concesiones de comida tienen menos fila?"
    ],
    fr: [
      "Où se trouvent les toilettes accessibles aux fauteuils ?",
      "Comment fonctionnent les navettes vers le parking K ?",
      "Où puis-je me faire rembourser mon gobelet réutilisable ?",
      "Quels stands de nourriture ont le moins d'attente ?"
    ],
    pt: [
      "Onde ficam os banheiros acessíveis?",
      "Como funcionam os ônibus de traslado para o Lote K?",
      "Onde posso devolver meu copo ecológico?",
      "Quais barracas de comida têm menor fila?"
    ],
    ar: [
      "أين توجد دورات المياه المخصصة للكراسي المتحركة؟",
      "كيف تعمل حافلات النقل إلى الموقف K؟",
      "أين يمكنني استرجاع مبلغ الكوب القابل لإعادة الاستخدام؟",
      "ما هي منافذ الطعام التي بها أقل وقت انتظار؟"
    ],
    ja: [
      "車椅子対応のトイレはどこにありますか？",
      "駐車場K行きのシャトルバスの運行方法を教えてください。",
      "リユースカップの返金場所はどこですか？",
      "最も待ち時間の短いフードスタンドはどれですか？"
    ],
    de: [
      "Wo sind die rollstuhlgerechten Toiletten?",
      "Wie funktionieren die Busse zum Parkplatz K?",
      "Wo kann ich meinen Becher zurückgeben?",
      "Welche Essensstände haben die kürzesten Wartezeiten?"
    ]
  };

  const phrases = SUGGESTED_PROMPTS[language] || SUGGESTED_PROMPTS["en"];

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages,
          role: "fan",
          language: language
        })
      });

      const data = await response.json();
      
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "model",
        text: data.text,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("Failed to query AI assistant:", err);
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "model",
        text: "⚠️ I encountered an error connecting to my server. Please verify your internet connection or check the Diagnostic console.",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Find lowest wait-time food concessions
  const foodConcessions = facilities
    .filter(f => f.type === "concession")
    .sort((a, b) => a.waitTimeMinutes - b.waitTimeMinutes);

  return (
    <div id="fan-hub-root" className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
      
      {/* Column 1: AI Assistant (8 cols) */}
      <div className="lg:col-span-8 flex flex-col h-[540px] bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="bg-white/10 p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm sm:text-base">{t("ai_fan_ambassador", language)}</h3>
              <p className="text-[10px] text-emerald-200/90 font-medium">{t("multilingual_support", language)}</p>
            </div>
          </div>
          <span className="text-xs bg-emerald-900/50 px-2.5 py-1 rounded-md border border-emerald-600/30 font-mono font-bold uppercase tracking-wider">
            {language.toUpperCase()} {t("status_active", language)}
          </span>
        </div>

        {/* Chat Message Window */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div 
                key={msg.id} 
                className={`flex ${isUser ? "justify-end" : "justify-start"} items-start space-x-2`}
              >
                {!isUser && (
                  <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold border border-emerald-200 text-emerald-800">
                    🤖
                  </div>
                )}
                <div 
                  className={`max-w-[85%] p-3.5 rounded-xl border ${
                    isUser 
                      ? "bg-emerald-600 text-white border-emerald-500 rounded-tr-none" 
                      : "bg-white text-slate-800 border-slate-200 rounded-tl-none shadow-xs"
                  }`}
                >
                  {isUser ? (
                    <p className="text-xs sm:text-sm">{msg.text}</p>
                  ) : (
                    <SimpleMarkdown text={msg.text} />
                  )}
                  <span className={`block text-[9px] mt-1.5 text-right ${isUser ? "text-emerald-100" : "text-slate-400"}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-start items-center space-x-2.5 p-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">⚽</div>
              <div className="flex space-x-1.5 bg-white border border-slate-100 px-3 py-2.5 rounded-xl shadow-xs">
                <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Prompt Rails */}
        <div className="p-2 border-t border-slate-100 bg-white overflow-x-auto flex space-x-2 whitespace-nowrap scrollbar-none">
          {phrases.map((phrase, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(phrase)}
              className="text-[11px] font-semibold bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 rounded-full px-3.5 py-1.5 transition-colors cursor-pointer"
            >
              💡 {phrase}
            </button>
          ))}
        </div>

        {/* Input Controls */}
        <div className="p-3 border-t border-slate-100 bg-white flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
            placeholder={t("ask_placeholder", language)}
            className="flex-1 text-xs border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Column 2: Side Panels (4 cols) */}
      <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
        
        {/* Real-time Transportation Widget */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="font-display font-bold text-xs sm:text-sm text-slate-800 flex items-center space-x-1.5">
            <Bus className="w-4 h-4 text-emerald-600" />
            <span>{t("transit_planner", language)}</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{t("transit_subtitle", language)}</p>
          
          <div className="mt-3.5 space-y-3">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-700">Lot K High-Occupancy Bus</p>
                <p className="text-[10px] text-slate-400">Intervals: 5 mins • Gate A Route</p>
              </div>
              <span className="text-[11px] font-black font-mono text-emerald-600 px-2 py-0.5 rounded bg-emerald-50">
                Arriving 1m
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-700">Central Light Rail Service</p>
                <p className="text-[10px] text-slate-400">Direct Express • Headway: 3m</p>
              </div>
              <span className="text-[11px] font-black font-mono text-emerald-600 px-2 py-0.5 rounded bg-emerald-50">
                Arriving 3m
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-700">Rideshare Dropoff East</p>
                <p className="text-[10px] text-slate-400">Zone Blue • Stewards active</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">
                {t("status_active", language)}
              </span>
            </div>
          </div>
        </div>

        {/* Sustainability Goals Panel */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex-1">
          <h3 className="font-display font-bold text-xs sm:text-sm text-slate-800 flex items-center space-x-1.5">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>{t("sustainability_corner", language)}</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{t("sustainability_subtitle", language)}</p>

          <div className="mt-3.5 space-y-3 text-xs">
            {/* Color Coded Bins */}
            <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <p className="font-bold text-emerald-800 flex items-center space-x-1">
                <span>🟢</span> <span>{t("green_container_title", language)}</span>
              </p>
              <p className="text-[10px] text-emerald-700/80 mt-0.5">{t("green_container_desc", language)}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
              <p className="font-bold text-blue-800 flex items-center space-x-1">
                <span>🔵</span> <span>{t("blue_container_title", language)}</span>
              </p>
              <p className="text-[10px] text-blue-700/80 mt-0.5">{t("blue_container_desc", language)}</p>
            </div>

            {/* Reusable cup return */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start space-x-2">
              <span className="text-base">♻️</span>
              <div>
                <p className="font-bold text-slate-700">{t("cup_reusability_title", language)}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{t("cup_reusability_desc", language)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Under-utilized Concessions suggestions */}
        <div className="bg-emerald-800 text-white p-4 rounded-2xl shadow-xs">
          <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300">{t("concession_optimizer", language)}</h4>
          <p className="text-[10px] text-emerald-100/90 mt-0.5">{t("concession_subtitle", language)}</p>
          
          <div className="mt-3 space-y-2">
            {foodConcessions.slice(0, 2).map((conc, idx) => (
              <div 
                key={conc.id}
                onClick={() => onSelectFacility(conc)}
                className="flex justify-between items-center bg-white/10 hover:bg-white/20 p-2 rounded-lg cursor-pointer transition-colors"
              >
                <div>
                  <p className="text-xs font-bold">🍔 {conc.name}</p>
                  <p className="text-[9px] text-emerald-200">Sector: {conc.section} • Wait: {conc.waitTimeMinutes}{t("minutes_abbr", language)}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
