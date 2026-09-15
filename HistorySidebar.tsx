import { useState } from "react";
import { VictimHistoryItem, ThemeMode } from "../types";
import { Search, Trash2, Calendar, FileText, ChevronRight, HelpCircle, Code, Briefcase, User, Sparkles } from "lucide-react";

interface HistorySidebarProps {
  items: VictimHistoryItem[];
  selectedId: string | null;
  onSelectItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  theme?: ThemeMode;
}

export default function HistorySidebar({
  items,
  selectedId,
  onSelectItem,
  onDeleteItem,
  onClearAll,
  theme = "dark",
}: HistorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const isClinical = theme === "clinical";

  const filteredItems = items.filter((item) => {
    const textMatch =
      item.result.verdict.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.result.killerQuote.toLowerCase().includes(searchQuery.toLowerCase());
    return textMatch;
  });

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "brand":
        return <Sparkles className="h-4 w-4" />;
      case "code":
        return <Code className="h-4 w-4" />;
      case "resume":
        return <Briefcase className="h-4 w-4" />;
      case "profile":
        return <User className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Just now";
    }
  };

  const getScoreBadgeClass = (score: number) => {
    if (score < 30) return "bg-[#ff451a]/10 text-[#ff451a] border-[#ff451a]/20";
    if (score < 60) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent">
      {/* Search Header */}
      <div className="p-4 shrink-0 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
          <input
            type="text"
            id="search-archive"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past victims..."
            className={`w-full border rounded-lg pl-9 pr-4 py-2 text-xs font-mono transition-all focus:outline-none focus:border-[#ff451a]/50 ${
              isClinical
                ? "bg-neutral-100 border-neutral-200 text-neutral-900 placeholder-neutral-500"
                : "bg-black/20 border-neutral-800 text-white placeholder-neutral-600"
            }`}
          />
        </div>

        <div className="flex items-center justify-between px-1">
          <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${isClinical ? "text-neutral-500" : "text-neutral-500"}`}>
            Recent History
          </span>
          {items.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[10px] font-mono hover:text-[#ff451a] text-neutral-500 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1 pb-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-10 px-4">
            <p className="text-xs text-neutral-500 font-mono">No history found</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={`group flex items-center justify-between p-2.5 rounded-lg transition-all cursor-pointer border ${
                  isSelected
                    ? isClinical 
                      ? "bg-neutral-100 border-neutral-300 text-neutral-900 shadow-sm"
                      : "bg-neutral-800/80 border-neutral-700 text-white shadow-sm"
                    : isClinical
                      ? "border-transparent text-neutral-600 hover:bg-neutral-50"
                      : "border-transparent text-neutral-400 hover:bg-neutral-900/40"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`h-6 w-6 shrink-0 rounded border flex items-center justify-center transition-colors duration-200 ${
                    isSelected ? "border-[#ff451a]/30 text-[#ff451a]" : "border-transparent opacity-50"
                  }`}>
                    {getCategoryIcon(item.victimType)}
                  </div>
                  <div className="flex flex-col overflow-hidden min-w-0">
                    <span className="text-xs font-semibold truncate block">
                      {item.title}
                    </span>
                    <span className="text-[10px] opacity-70 font-mono truncate block">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(item.id);
                  }}
                  aria-label="Delete Record"
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-neutral-500 hover:text-red-500 rounded transition-all shrink-0"
                  title="Delete Record"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
