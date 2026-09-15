import { useState, useEffect } from "react";
import { 
  VictimHistoryItem, 
  CritiqueResult, 
  VictimType, 
  BrutalityLevel, 
  ThemeMode 
} from "./types";
import Header from "./components/Header";
import VictimForm from "./components/VictimForm";
import ReportCard from "./components/ReportCard";
import HistorySidebar from "./components/HistorySidebar";
import FeedbackModal from "./components/FeedbackModal";
import { 
  Skull, 
  AlertCircle, 
  X, 
  Menu, 
  ExternalLink 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
const brutalAiLogo = "/assets/images/brutal_ai_logo_1786859451107.jpg";
import { soundFX } from "./utils/sound";

export default function App() {
  const [history, setHistory] = useState<VictimHistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<VictimHistoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Theme & Modal States
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [showFeedback, setShowFeedback] = useState(false);

  const isClinical = theme === "clinical";

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("brutal_ai_theme");
      if (savedTheme) {
        setTheme(savedTheme as ThemeMode);
      }

      const stored = localStorage.getItem("brutal_ai_archive");
      if (stored) {
        setHistory(JSON.parse(stored));
      }

      const params = new URLSearchParams(window.location.search);
      const shareData = params.get("share");
      if (shareData) {
        try {
          const decoded = JSON.parse(decodeURIComponent(escape(atob(shareData))));
          if (decoded && decoded.result) {
            const sharedItem: VictimHistoryItem = {
              id: "shared-item",
              timestamp: new Date().toISOString(),
              victimType: decoded.victimType,
              title: decoded.result.verdict,
              content: decoded.content || "",
              image: decoded.image || null,
              brutality: decoded.brutality || "harsh",
              result: decoded.result,
            };
            setSelectedItem(sharedItem);
            return; 
          }
        } catch (shareErr) {
          console.error("Failed to parse shared item from URL", shareErr);
        }
      }
    } catch (e) {
      console.error("Initialization error", e);
    }
  }, []);

  const saveHistoryToStorage = (updated: VictimHistoryItem[]) => {
    localStorage.setItem("brutal_ai_archive", JSON.stringify(updated));
    setHistory(updated);
  };

  const changeTheme = (nextTheme: ThemeMode) => {
    setTheme(nextTheme);
    localStorage.setItem("brutal_ai_theme", nextTheme);
  };

  const toggleTheme = () => {
    soundFX.playSwitch();
    const next = theme === "dark" ? "clinical" : "dark";
    changeTheme(next);
  };

  const handleDiagnose = async (formData: {
    victimType: VictimType;
    content: string;
    brutality: BrutalityLevel;
    image: string | null;
  }) => {
    setIsLoading(true);
    setError(null);
    setSelectedItem(null);

    try {
      const res = await fetch("/api/critique", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "The server failed to withstand this level of cringe.");
      }

      const critiqueResult: CritiqueResult = await res.json();

      const newItem: VictimHistoryItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        timestamp: new Date().toISOString(),
        victimType: formData.victimType,
        title: critiqueResult.verdict,
        content: formData.content,
        image: formData.image,
        brutality: formData.brutality,
        result: critiqueResult,
      };

      const updatedHistory = [newItem, ...history];
      saveHistoryToStorage(updatedHistory);
      setSelectedItem(newItem);
      soundFX.playChime();
    } catch (err: any) {
      console.error("Analysis failed", err);
      setError(err.message || "BrutalAI's circuits shorted out trying to understand this content.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectItem = (id: string) => {
    soundFX.playClick();
    const found = history.find((item) => item.id === id);
    if (found) {
      setSelectedItem(found);
      setError(null);
    }
  };

  const handleDeleteItem = (id: string) => {
    soundFX.playClick();
    const updated = history.filter((item) => item.id !== id);
    saveHistoryToStorage(updated);
    if (selectedItem?.id === id) {
      setSelectedItem(updated.length > 0 ? updated[0] : null);
    }
  };

  const handleClearAll = () => {
    soundFX.playClick();
    saveHistoryToStorage([]);
    setSelectedItem(null);
  };

  const handleNewDiagnosis = () => {
    soundFX.playClick();
    if (window.location.search.includes("share=")) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setSelectedItem(null);
    setError(null);
  };

  const getThemeClasses = () => {
    if (isClinical) {
      return "bg-[#fafafc] text-neutral-900 border-neutral-200";
    }
    return "bg-[#0a0a0c] text-neutral-100 border-neutral-800";
  };

  const getSidebarBg = () => {
    if (isClinical) return "bg-white border-r border-neutral-200";
    return "bg-[#121214] border-r border-neutral-800";
  };

  const getTextColorPrimary = () => {
    if (isClinical) return "text-neutral-900";
    return "text-white";
  };

  const getTextColorSecondary = () => {
    if (isClinical) return "text-neutral-500";
    return "text-neutral-400";
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans selection:bg-[#ff451a] selection:text-white transition-colors duration-300 ${getThemeClasses()}`}>
      
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-50 w-[280px] shrink-0 transform transition-transform duration-300 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${getSidebarBg()}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-inherit">
          <button 
            onClick={handleNewDiagnosis}
            className={`flex flex-1 items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm font-bold border transition-all active:scale-95 ${
              isClinical 
                ? "bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-900 shadow-sm" 
                : "bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-white shadow-sm"
            }`}
          >
            <img src={brutalAiLogo} alt="Brutal AI" className="h-6 w-6 rounded border border-[#ff451a]/30 object-cover" />
            New Diagnosis
          </button>
          <button 
            onClick={() => setSidebarOpen(false)} 
            aria-label="Close Sidebar" 
            className="md:hidden ml-2 p-2 text-neutral-500 hover:text-[#ff451a] transition-colors rounded-lg border border-transparent hover:border-[#ff451a]/30 hover:bg-[#ff451a]/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto w-full">
          <HistorySidebar
            items={history}
            selectedId={selectedItem ? selectedItem.id : null}
            onSelectItem={(id) => { handleSelectItem(id); setSidebarOpen(false); }}
            onDeleteItem={handleDeleteItem}
            onClearAll={handleClearAll}
            theme={theme}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        
        {/* Desktop Header */}
        <Header 
          theme={theme} 
          toggleTheme={toggleTheme} 
          onOpenFeedback={() => setShowFeedback(true)}
        />

        {/* Mobile Header Topbar */}
        <div className="md:hidden flex items-center justify-between p-4 z-10 border-b border-inherit">
          <button 
            onClick={() => setSidebarOpen(true)} 
            aria-label="Open Sidebar" 
            className={`p-2 rounded-md ${getTextColorSecondary()}`}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className={`font-mono font-black text-sm tracking-widest uppercase ${getTextColorPrimary()}`}>
            Brutal<span className="text-[#ff451a]">.AI</span>
          </div>
          <div className="w-8" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-48 pt-8 sm:pt-14 flex flex-col items-center">
          <div className="w-full max-w-4xl flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex flex-col items-center justify-center py-20 space-y-6"
                >
                  <div className="relative flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full border-4 border-neutral-200/20 border-t-[#ff451a] animate-spin" />
                    <Skull className="h-6 w-6 text-[#ff451a] absolute animate-pulse" />
                  </div>
                  <h3 className={`text-sm font-mono font-black uppercase tracking-wider animate-pulse ${getTextColorPrimary()}`}>
                    Analyzing Vulnerabilities...
                  </h3>
                </motion.div>
              ) : selectedItem ? (
                <motion.div
                  key={selectedItem.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {/* User Prompt Bubble */}
                  <div className="flex justify-end mb-8">
                     <div className={`max-w-[85%] rounded-2xl rounded-tr-sm px-5 py-4 ${
                       isClinical 
                         ? "bg-neutral-100 text-neutral-900 border border-neutral-200" 
                         : "bg-neutral-800 text-white border border-neutral-700"
                     }`}>
                        {selectedItem.image && (
                          <img src={selectedItem.image} alt="User Evidence" className="max-h-40 rounded-lg mb-3 border border-neutral-600/30 object-contain" />
                        )}
                        <p className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{selectedItem.content}</p>
                     </div>
                  </div>

                  {/* AI Response Bubble */}
                  <div className="flex justify-start mb-8 w-full">
                     <div className="w-full">
                        <ReportCard
                          result={selectedItem.result}
                          victimType={selectedItem.victimType}
                          brutality={selectedItem.brutality}
                          isSaved={selectedItem.id !== "shared-item"}
                          theme={isClinical ? "clinical" : "dark"}
                        />
                     </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center flex-1 py-8"
                >
                  <img 
                    src={brutalAiLogo} 
                    alt="Brutal AI Logo" 
                    className="h-20 w-20 rounded-2xl shadow-[0_0_40px_rgba(255,69,26,0.2)] mb-6 object-cover border border-[#ff451a]/30"
                  />
                  <h1 className={`text-3xl sm:text-4xl font-sans font-medium text-center mb-2 tracking-tight ${getTextColorPrimary()}`}>
                    How can I <span className="text-[#ff451a] font-bold">roast</span> you today?
                  </h1>
                  <p className={`text-center text-sm font-sans max-w-md mt-2 ${getTextColorSecondary()}`}>
                    BrutalAI is an elite strategy director trained on top-tier design matrices and enterprise standards. Submit your code, startup pitch, or bio for zero-filter surgery.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Toast */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-950/80 border border-red-900 text-red-200 rounded-xl p-4 flex items-start gap-3 mt-4"
                >
                  <AlertCircle className="h-5 w-5 text-[#ff451a] shrink-0" />
                  <div>
                    <h4 className="text-xs font-mono font-black uppercase text-[#ff451a]">Circuit Disruption</h4>
                    <p className="text-sm font-sans leading-relaxed">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input Form Box (Fixed to Bottom Center) */}
        <div className={`absolute bottom-0 left-0 w-full pt-8 pb-4 px-4 sm:px-8 bg-gradient-to-t pointer-events-none ${
          isClinical 
            ? "from-[#fafafc] via-[#fafafc]/90 to-transparent" 
            : "from-[#0a0a0c] via-[#0a0a0c]/90 to-transparent"
        }`}>
          <div className="max-w-4xl mx-auto w-full flex flex-col pointer-events-auto relative z-20">
            <VictimForm 
              onSubmit={handleDiagnose} 
              isLoading={isLoading} 
              theme={theme} 
            />
            
            <div className={`text-center mt-3 text-[10px] sm:text-xs font-sans transition-colors ${getTextColorSecondary()}`}>
              BrutalAI can make mistakes. Designed and Securely Hardened by{" "}
              <a 
                href="https://vedantpandey.netlify.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-bold text-[#ff451a] hover:underline inline-flex items-center gap-0.5"
                title="Vedant Pandey Portfolio (vedantpandey.netlify.app)"
              >
                Vedant Pandey <ExternalLink className="h-2.5 w-2.5 ml-0.5 inline opacity-80" />
              </a>.
            </div>
          </div>
        </div>

      </div>

      {showFeedback && (
        <FeedbackModal onClose={() => setShowFeedback(false)} theme={theme} />
      )}
    </div>
  );
}
