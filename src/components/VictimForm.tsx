import React, { useState, useRef, useEffect } from "react";
import { VictimType, BrutalityLevel, ThemeMode } from "../types";
import { Upload, X, Code, Briefcase, User, Sparkles, HelpCircle, Send, Plus, Zap, HeartPulse, Flame } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { soundFX } from "../utils/sound";

interface VictimFormProps {
  onSubmit: (data: {
    victimType: VictimType;
    content: string;
    brutality: BrutalityLevel;
    image: string | null;
  }) => void;
  isLoading: boolean;
  theme?: ThemeMode;
  defaultBrutality?: BrutalityLevel;
}

const typeConfig: Record<VictimType, { icon: any; label: string; placeholder: string }> = {
  brand: { icon: Sparkles, label: "Brand", placeholder: "Paste your landing page, pitch, or value proposition..." },
  code: { icon: Code, label: "Code", placeholder: "Paste your beautiful spaghetti code..." },
  resume: { icon: Briefcase, label: "Resume", placeholder: "Paste your corporate buzzwords..." },
  profile: { icon: User, label: "Profile", placeholder: "Paste your dating bio or description..." },
  custom: { icon: HelpCircle, label: "Custom", placeholder: "Write down your grand strategy..." },
};

const brutalityConfig: Record<BrutalityLevel, { icon: any; label: string }> = {
  sarcastic: { icon: Zap, label: "Sarcastic" },
  doctor: { icon: HeartPulse, label: "Doctor" },
  absolute: { icon: Flame, label: "Absolute" },
};

export default function VictimForm({ 
  onSubmit, 
  isLoading, 
  theme = "dark", 
  defaultBrutality = "doctor"
}: VictimFormProps) {
  const [victimType, setVictimType] = useState<VictimType>("brand");
  const [content, setContent] = useState("");
  const [brutality, setBrutality] = useState<BrutalityLevel>(defaultBrutality);
  const [image, setImage] = useState<string | null>(null);
  
  useEffect(() => {
    if (defaultBrutality) {
      setBrutality(defaultBrutality);
    }
  }, [defaultBrutality]);
  
  // Dropdown toggles
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showBrutalitySelector, setShowBrutalitySelector] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isClinical = theme === "clinical";
  const isCyber = theme === "cyberpunk";
  const isRoyal = theme === "royal";
  const isAmber = theme === "amber";
  const isOled = theme === "oled";

  const getContainerBg = () => {
    if (isClinical) return "bg-white border-neutral-300 shadow-sm focus-within:border-neutral-400";
    if (isCyber) return "bg-[#080808] border-[#10b981]/30 focus-within:border-[#10b981]/60 shadow-[0_0_15px_rgba(16,185,129,0.05)]";
    if (isRoyal) return "bg-[#180a2d] border-[#d946ef]/30 focus-within:border-[#d946ef]/60 shadow-[0_0_15px_rgba(217,70,239,0.05)]";
    if (isAmber) return "bg-[#150e02] border-[#f59e0b]/30 focus-within:border-[#f59e0b]/60 shadow-[0_0_15px_rgba(245,158,11,0.05)]";
    if (isOled) return "bg-black border-neutral-800 focus-within:border-[#ff451a]/60 shadow-none";
    return "bg-[#1f1f23] border-neutral-700 focus-within:border-neutral-500 shadow-md";
  };

  const getTextColor = () => {
    if (isClinical) return "text-neutral-900";
    if (isCyber) return "text-[#10b981]";
    if (isRoyal) return "text-[#fdf6e2]";
    if (isAmber) return "text-[#f59e0b]";
    return "text-white";
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG/JPG)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    soundFX.playLaser();
    onSubmit({ victimType, content, brutality, image });
    // Reset form after submit
    setContent("");
    setImage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const ActiveTypeIcon = typeConfig[victimType].icon;
  const ActiveBrutalityIcon = brutalityConfig[brutality].icon;

  return (
    <form onSubmit={handleSubmit} className="w-full relative">
      <div className={`transition-all duration-300 border rounded-3xl p-3 flex flex-col ${getContainerBg()}`}>
        
        {/* Preview Area for uploaded images */}
        <AnimatePresence>
          {image && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="px-2 pt-2 relative w-fit"
            >
              <div className="relative group">
                <img
                  src={image}
                  alt="Evidence"
                  className="h-20 w-auto rounded-lg border border-neutral-500/30 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute -top-2 -right-2 p-1 bg-neutral-900 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-neutral-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={typeConfig[victimType].placeholder}
          className={`w-full max-h-[30vh] min-h-[50px] resize-none bg-transparent px-3 py-2 outline-none text-sm font-sans placeholder-neutral-500 ${getTextColor()}`}
          rows={Math.min(6, Math.max(1, content.split('\n').length))}
          autoFocus
        />

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex items-center gap-2 relative">
            
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-full hover:bg-neutral-500/10 text-neutral-500 transition-colors cursor-pointer"
              title="Attach Image"
            >
              <Plus className="h-5 w-5" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

            {/* Victim Type Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setShowTypeSelector(!showTypeSelector); setShowBrutalitySelector(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  isClinical ? "bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200" 
                  : "bg-neutral-800/50 border-neutral-700/50 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                <ActiveTypeIcon className="h-3.5 w-3.5" />
                <span>{typeConfig[victimType].label}</span>
              </button>

              <AnimatePresence>
                {showTypeSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute bottom-full left-0 mb-2 w-40 rounded-xl border shadow-xl p-1 z-50 ${
                      isClinical ? "bg-white border-neutral-200" : "bg-neutral-900 border-neutral-800"
                    }`}
                  >
                    {(Object.keys(typeConfig) as VictimType[]).map((type) => {
                      const Icon = typeConfig[type].icon;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => { setVictimType(type); setShowTypeSelector(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors text-left ${
                            victimType === type 
                              ? "bg-black/5 text-[#ff451a] font-bold" 
                              : isClinical ? "text-neutral-700 hover:bg-neutral-100" : "text-neutral-300 hover:bg-neutral-800"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {typeConfig[type].label}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Brutality Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setShowBrutalitySelector(!showBrutalitySelector); setShowTypeSelector(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  isClinical ? "bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200" 
                  : "bg-neutral-800/50 border-neutral-700/50 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                <ActiveBrutalityIcon className="h-3.5 w-3.5" />
                <span>{brutalityConfig[brutality].label}</span>
              </button>

              <AnimatePresence>
                {showBrutalitySelector && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute bottom-full left-0 mb-2 w-40 rounded-xl border shadow-xl p-1 z-50 ${
                      isClinical ? "bg-white border-neutral-200" : "bg-neutral-900 border-neutral-800"
                    }`}
                  >
                    {(Object.keys(brutalityConfig) as BrutalityLevel[]).map((level) => {
                      const Icon = brutalityConfig[level].icon;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => { setBrutality(level); setShowBrutalitySelector(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors text-left ${
                            brutality === level 
                              ? "bg-black/5 text-[#ff451a] font-bold" 
                              : isClinical ? "text-neutral-700 hover:bg-neutral-100" : "text-neutral-300 hover:bg-neutral-800"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {brutalityConfig[level].label}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || (!content.trim() && !image)}
            className={`p-2 rounded-full flex items-center justify-center transition-all ${
              isLoading || (!content.trim() && !image)
                ? "bg-neutral-500/20 text-neutral-500 cursor-not-allowed"
                : "bg-black text-white dark:bg-white dark:text-black hover:scale-105"
            }`}
          >
            {isLoading ? (
               <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
               </svg>
            ) : (
              <Send className="h-5 w-5 ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
