import { useEffect, useState } from "react";
import { Terminal, ShieldCheck, ShieldAlert, Sun, Moon, Sparkles, MessageSquare, Flame } from "lucide-react";
import brutalAiLogo from "../assets/images/brutal_ai_logo_1786859451107.jpg";
import { ThemeMode } from "../types";

interface HeaderProps {
  theme: ThemeMode;
  toggleTheme: () => void;
  onOpenFeedback: () => void;
}

export default function Header({ theme, toggleTheme, onOpenFeedback }: HeaderProps) {
  const [apiStatus, setApiStatus] = useState<{ status: string; geminiConfigured: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setApiStatus(data))
      .catch(() => setApiStatus({ status: "error", geminiConfigured: false }));
  }, []);

  const isClinical = theme === "clinical";
  const isAmber = theme === "amber";

  const getHeaderBg = () => {
    if (isClinical) return "bg-white border-neutral-200 text-neutral-900";
    if (isAmber) return "bg-[#0d0900] border-[#f59e0b]/20 text-[#f59e0b]";
    return "bg-[#0a0a0c] border-neutral-800 text-white";
  };

  return (
    <header className={`border-b px-6 py-4 hidden md:flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-300 ${getHeaderBg()}`}>
      <div className="flex items-center gap-3">
        <img 
          src={brutalAiLogo} 
          alt="Brutal AI Logo" 
          className="h-11 w-11 rounded-xl object-cover shadow-md border border-[#ff451a]/30"
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-xl font-extrabold tracking-tight font-mono transition-colors duration-300 ${
              isClinical ? "text-neutral-900" : isAmber ? "text-[#f59e0b]" : "text-white"
            }`}>
              BRUTAL<span className="text-[#ff451a]">.AI</span>
            </h1>
            <span className={`text-[10px] font-mono border px-1.5 py-0.5 uppercase tracking-wider rounded transition-colors duration-300 ${
              isClinical 
                ? "bg-neutral-100 border-neutral-300 text-neutral-600" 
                : "bg-neutral-900 border-neutral-800 text-neutral-400"
            }`}>
              v2.5 PRO
            </span>
          </div>
          <p className={`text-xs font-sans mt-0.5 transition-colors duration-300 ${
            isClinical ? "text-neutral-600" : "text-neutral-400"
          }`}>
            Elite Cultural Critic, Master Strategist, &amp; Tough-Love Brand Doctor.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Dark / Light Theme"
          className={`p-2 rounded-lg border transition-all flex items-center justify-center hover:scale-105 active:scale-95 ${
            isClinical 
              ? "bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700 shadow-sm" 
              : "bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white"
          }`}
          title={isClinical ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {isClinical ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        {/* Feedback Button */}
        <button
          onClick={onOpenFeedback}
          aria-label="Submit Feedback"
          className={`p-2 rounded-lg border transition-all flex items-center justify-center hover:scale-105 active:scale-95 ${
            isClinical 
              ? "bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700 shadow-sm" 
              : "bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white"
          }`}
          title="Submit Feedback"
        >
          <MessageSquare className="h-4 w-4" />
        </button>

        {apiStatus ? (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-mono uppercase tracking-widest ${
              isClinical
                ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                : "bg-blue-950/25 border-blue-800/60 text-blue-400"
            }`}>
              <ShieldCheck className="h-3.5 w-3.5 text-[#ff451a]" />
              <span className="font-bold hidden xl:inline">UNVULNERABLE GUARD</span>
            </div>

            {apiStatus.geminiConfigured ? (
              <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-mono uppercase tracking-widest ${
                isClinical
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-emerald-950/40 border-emerald-900 text-emerald-400"
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Online</span>
              </div>
            ) : (
              <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-mono uppercase tracking-widest ${
                isClinical
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-amber-950/40 border-amber-900 text-amber-400"
              }`}>
                <ShieldAlert className="h-3 w-3" />
                <span>API Key</span>
              </div>
            )}
          </div>
        ) : (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-mono animate-pulse ${
            isClinical
              ? "bg-neutral-100 border-neutral-300 text-neutral-400"
              : "bg-neutral-900 border-neutral-800 text-neutral-500"
          }`}>
            <Terminal className="h-3.5 w-3.5" />
            <span>Connecting...</span>
          </div>
        )}
      </div>
    </header>
  );
}

