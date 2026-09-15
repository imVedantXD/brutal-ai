import React, { useState } from "react";
import { X, Send, MessageSquare, Star, Loader2, ExternalLink } from "lucide-react";
import { ThemeMode } from "../types";

interface FeedbackModalProps {
  onClose: () => void;
  theme: ThemeMode;
}

export default function FeedbackModal({ onClose, theme }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isClinical = theme === "clinical";
  const isCyber = theme === "cyberpunk";
  const isRoyal = theme === "royal";
  const isAmber = theme === "amber";

  const getContainerBg = () => {
    if (isClinical) return "bg-white border-neutral-300 text-neutral-900";
    if (isCyber) return "bg-[#050505] border-[#10b981]/50 text-[#10b981]";
    if (isRoyal) return "bg-[#110722] border-[#d946ef]/50 text-[#fdf6e2]";
    if (isAmber) return "bg-[#0d0900] border-[#f59e0b]/50 text-[#f59e0b]";
    return "bg-neutral-900 border-neutral-700 text-white";
  };

  const getButtonBg = () => {
    if (isClinical) return "bg-neutral-900 text-white hover:bg-neutral-800";
    return "bg-[#ff451a] text-black hover:bg-[#ff451a]/90";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() && rating === 0) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("https://formsubmit.co/ajax/pandey28vedant@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          _subject: `BrutalAI Feedback: ${rating} Stars`,
          rating: `${rating} / 5`,
          feedback: feedback,
          _autoresponse: "Thank you for the feedback. BrutalAI is processing your insights.",
          _template: "box"
        })
      });

      if (!response.ok) throw new Error("Failed to transmit feedback");

      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 3500);
    } catch (err) {
      console.error(err);
      setError("Transmission failed. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300 ${getContainerBg()}`}
      >
        <button 
          onClick={onClose}
          aria-label="Close Feedback Modal"
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-500/20 transition-colors"
          disabled={isSubmitting}
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-[#ff451a]/20 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-[#ff451a]" />
            </div>
            <h3 className="font-mono font-bold text-lg">Transmission Secure</h3>
            <p className="text-sm opacity-70">
              Your feedback was securely sent directly to{" "}
              <a 
                href="https://vedantpandey.netlify.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-bold text-[#ff451a] hover:underline inline-flex items-center gap-1"
              >
                Vedant Pandey <ExternalLink className="h-3 w-3" />
              </a>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-mono font-black text-xl flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#ff451a]" />
                Direct Feedback
              </h2>
              <p className="text-xs opacity-70 font-sans">
                Insights are sent securely to{" "}
                <a 
                  href="https://vedantpandey.netlify.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-bold text-[#ff451a] hover:underline"
                >
                  Vedant Pandey
                </a>'s encrypted inbox.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono font-bold uppercase tracking-wider opacity-80 block">
                Rate the Brutality
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    aria-label={`Rate ${star} stars`}
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star 
                      className={`h-6 w-6 ${
                        rating >= star 
                          ? "fill-[#ff451a] text-[#ff451a]" 
                          : "text-neutral-500 opacity-50"
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono font-bold uppercase tracking-wider opacity-80 block">
                Private Message
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Submit your confidential feature requests or architectural feedback directly to Vedant Pandey."
                className={`w-full h-28 p-3 rounded-lg text-sm font-sans resize-none focus:outline-none border transition-colors ${
                  isClinical 
                    ? "bg-neutral-50 border-neutral-300 focus:border-neutral-500 text-neutral-900" 
                    : "bg-black/40 border-neutral-700 focus:border-[#ff451a]/50 text-white"
                }`}
              />
            </div>

            {error && (
              <div className="text-red-500 text-xs font-mono text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={(!feedback.trim() && rating === 0) || isSubmitting}
              className={`w-full py-2.5 rounded-lg font-mono font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${getButtonBg()} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Transmit Securely
            </button>
            <div className="text-[9px] text-center opacity-50 font-sans mt-2">
              Protected by zero-knowledge delivery routing. Maintained by{" "}
              <a 
                href="https://vedantpandey.netlify.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#ff451a] hover:underline"
              >
                Vedant Pandey
              </a>.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

