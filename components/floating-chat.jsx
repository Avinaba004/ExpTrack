"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FinancialChatAssistant } from "./financial-chat-assistant";

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Chat Window Panel */}
      {isOpen && (
        <div
          className="w-[420px] max-w-[calc(100vw-2rem)] h-[600px] shadow-2xl rounded-3xl overflow-hidden border border-border bg-background flex flex-col relative transition-all duration-300 transform scale-100 translate-y-0 opacity-100"
        >
          {/* Close Button Header overlay if needed */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-5 right-5 z-50 h-8 w-8 rounded-full bg-muted/65 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors border border-border/40"
          >
            <X size={16} />
          </button>
          <div className="flex-1 flex flex-col h-full">
            <FinancialChatAssistant />
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <div className="relative group transition-all duration-200 hover:scale-105 active:scale-95">
        {/* Glow rings */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-70 blur-md group-hover:opacity-100 transition-opacity animate-pulse" />
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="relative h-14 w-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg flex items-center justify-center border-none"
        >
          {isOpen ? (
            <X size={24} className="transition-transform duration-300 rotate-90" />
          ) : (
            <Sparkles size={24} className="transition-transform duration-300 animate-bounce" />
          )}
        </Button>

        {/* Hover Tooltip */}
        {!isOpen && (
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground border border-border px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Ask AI Assistant
          </div>
        )}
      </div>
    </div>
  );
}
