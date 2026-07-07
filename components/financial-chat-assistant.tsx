/**
 * Financial Assistant Chat Component
 *
 * A ready-to-use React component that integrates with the /api/chat endpoint
 * Place this in your app/(main) or any page where you want the chat assistant
 *
 * Usage:
 * import { FinancialChatAssistant } from "@/components/financial-chat-assistant";
 *
 * export default function Dashboard() {
 *   return (
 *     <div>
 *       <FinancialChatAssistant />
 *     </div>
 *   );
 * }
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { askFinancialAssistant } from "@/lib/chat-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Send, AlertCircle, TrendingUp, Bot, User as UserIcon } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ----------------------------------------------------
// CUSTOM LIGHTWEIGHT MARKDOWN PARSER FOR CHAT BUBBLES
// ----------------------------------------------------
const MessageContent = ({ content }: { content: string }) => {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  const flushList = (key: string | number) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="list-disc pl-5 mb-3 space-y-1 text-gray-700 dark:text-zinc-300">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-sm">
              {parseInlineFormatting(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const flushTable = (key: string | number) => {
    if (tableHeaders.length > 0 || tableRows.length > 0) {
      elements.push(
        <div key={`table-wrapper-${key}`} className="my-3 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-full">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left border-collapse">
            {tableHeaders.length > 0 && (
              <thead className="bg-zinc-50 dark:bg-zinc-850">
                <tr>
                  {tableHeaders.map((header, idx) => (
                    <th key={idx} className="px-4 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider border-b border-zinc-250 dark:border-zinc-750">
                      {parseInlineFormatting(header)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800 bg-white dark:bg-zinc-900/50">
              {tableRows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-2 text-sm text-zinc-650 dark:text-zinc-350 whitespace-nowrap">
                      {parseInlineFormatting(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeaders = [];
      tableRows = [];
    }
  };

  // Parse inline formatting like bold (**text**) and code (`code`)
  const parseInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={idx} className="font-semibold text-zinc-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={idx} className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-xs text-rose-600 dark:text-rose-450">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect Markdown Tables
    if (line.startsWith("|")) {
      flushList(i);
      
      const cells = line.split("|").map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      const isSeparator = cells.every(c => /^:-{1,}:?|:-{1,}|-{1,}:?$/.test(c));
      
      if (isSeparator) {
        continue;
      }

      if (tableHeaders.length === 0 && tableRows.length === 0) {
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else {
      flushTable(i);
    }

    // Detect Bullet/Numbered Lists
    if (line.startsWith("- ") || line.startsWith("* ")) {
      listItems.push(line.substring(2));
      continue;
    } else if (/^\d+\.\s/.test(line)) {
      listItems.push(line.replace(/^\d+\.\s/, ""));
      continue;
    } else {
      flushList(i);
    }

    // Detect Headers
    if (line.startsWith("### ")) {
      elements.push(<h4 key={i} className="text-sm font-semibold text-zinc-900 dark:text-white mt-3 mb-1">{parseInlineFormatting(line.substring(4))}</h4>);
    } else if (line.startsWith("## ")) {
      elements.push(<h3 key={i} className="text-md font-bold text-zinc-900 dark:text-white mt-4 mb-2">{parseInlineFormatting(line.substring(3))}</h3>);
    } else if (line.startsWith("# ")) {
      elements.push(<h2 key={i} className="text-lg font-extrabold text-zinc-900 dark:text-white mt-4 mb-2">{parseInlineFormatting(line.substring(2))}</h2>);
    } else if (line !== "") {
      elements.push(<p key={i} className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 mb-2">{parseInlineFormatting(line)}</p>);
    }
  }

  // Flush remainders
  flushList(lines.length);
  flushTable(lines.length);

  return <div className="space-y-0.5">{elements}</div>;
};

// ----------------------------------------------------
// FINANCIAL CHAT ASSISTANT COMPONENT
// ----------------------------------------------------
export function FinancialChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "👋 Hey! I'm your AI financial assistant. Ask me anything about your spending, income, or overall budget. I analyze your transactions directly to give you accurate insights.\n\nTry questions like:\n- How much did I spend this month?\n- What was my highest spending category?\n- Did I spend more than last month?\n- Do you have any savings advice?",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Core Send Message function
  const sendMessage = async (text: string) => {
    const trimmedInput = text.trim();
    if (!trimmedInput) return;

    // Add user message to state
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: trimmedInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      // Build context history (exclude initial system message and error notes)
      const history = messages
        .filter((msg) => msg.id !== "1" && !msg.content.startsWith("❌ Error:"))
        .map((msg) => ({
          role: msg.type,
          content: msg.content,
        }));

      // Call assistant API
      const result = await askFinancialAssistant(trimmedInput, history);

      if ("error" in result) {
        const errorMsg = result.error;
        toast.error(errorMsg);
        setError(errorMsg);

        const assistantError: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: `❌ Error: ${errorMsg}`,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantError]);
      } else {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: result.answer,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to get response";
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    const textToSend = input;
    setInput("");
    sendMessage(textToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    const cleanedSuggestion = suggestion.replace(/^[^\s]+\s/, "");
    await sendMessage(cleanedSuggestion);
  };

  return (
    <div className="flex flex-col h-[600px] max-w-2xl w-full mx-auto bg-white/70 dark:bg-zinc-950/40 backdrop-blur-xl rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-zinc-250/60 dark:border-zinc-800/60 p-5 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-md font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              AI Financial Assistant
            </h2>
            <p className="text-xs text-zinc-550 dark:text-zinc-400">
              Interactive chatbot powered by Gemini
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
        {messages.map((message) => {
          const isUser = message.type === "user";
          return (
            <div
              key={message.id}
              className={`flex gap-3 items-start ${isUser ? "justify-end" : "justify-start"}`}
            >
              {/* Assistant Avatar */}
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                  <Bot className="w-4.5 h-4.5" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[80%] px-4.5 py-3 rounded-2xl shadow-sm ${
                  isUser
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none"
                    : "bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 text-zinc-850 dark:text-zinc-105 rounded-tl-none"
                }`}
              >
                {isUser ? (
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                ) : (
                  <MessageContent content={message.content} />
                )}

                <p className={`text-[10px] mt-1.5 ${isUser ? "text-blue-100" : "text-zinc-400 dark:text-zinc-500"} text-right`}>
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* User Avatar */}
              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-650 dark:text-zinc-350 shadow-sm flex-shrink-0">
                  <UserIcon className="w-4.5 h-4.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div
            className="flex gap-3 items-start justify-start animate-pulse"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 px-4.5 py-3 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4.5 h-4.5 animate-spin text-blue-500" />
                <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Assistant is thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            className="flex justify-center"
          >
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-zinc-250/60 dark:border-zinc-850 p-4 bg-zinc-50/50 dark:bg-zinc-900/20 space-y-3">
        {/* Quick suggestion buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            "💰 Spending this month?",
            "📊 Highest spending category?",
            "📈 vs Last month?",
            "💡 Savings advice?",
          ].map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={loading}
              className="text-xs rounded-full border-zinc-250 dark:border-zinc-850 hover:bg-blue-55 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 transition-all duration-200 font-medium py-1 px-3 shadow-none bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
            >
              {suggestion}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your finances..."
            disabled={loading}
            className="flex-1 rounded-2xl border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus-visible:ring-blue-500 shadow-none px-4 py-3 h-11"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="rounded-2xl px-5 h-11 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-750 hover:to-indigo-750 text-white font-medium shadow-md shadow-blue-500/10 border-0 flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </Button>
        </div>

        <p className="text-[10px] text-zinc-450 dark:text-zinc-500 text-center font-medium">
          Powered by Gemini AI · Data-grounded answers
        </p>
      </div>
    </div>
  );
}
