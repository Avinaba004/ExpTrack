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

import { useState, useRef, useEffect } from "react";
import { askFinancialAssistant } from "@/lib/chat-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Send, AlertCircle, TrendingUp, DollarSign } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function FinancialChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "👋 Hey! I'm your financial assistant. Ask me anything about your spending, income, or financial insights. Try questions like:\n\n• How much did I spend this month?\n• Where did I spend the most?\n• Did I spend more than last month?\n• What's my average daily spending?",
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
  }, [messages]);

  const handleSendMessage = async () => {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      toast.error("Please enter a question");
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: trimmedInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const result = await askFinancialAssistant(trimmedInput);

      if ("error" in result) {
        const errorMsg = result.error;
        toast.error(errorMsg);
        setError(errorMsg);

        const assistantError: Message = {
          id: Date.now().toString(),
          type: "assistant",
          content: `❌ Error: ${errorMsg}`,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantError]);
      } else {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          type: "assistant",
          content: result.answer,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        toast.success("Question answered!");
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to get response";
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Financial Assistant</h2>
        </div>
        <p className="text-sm text-gray-600">
          Ask me about your spending, income, and financial insights
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                message.type === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>

              <p className="text-xs mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg rounded-bl-none border border-gray-200">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-gray-50 space-y-2">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your finances... (Enter to send)"
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="gap-2 px-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </Button>
        </div>

        {/* Quick suggestion buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            "💰 Spending this month?",
            "📊 Where most spent?",
            "📈 vs Last month?",
            "💡 Savings advice?",
          ].map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => setInput(suggestion.replace(/^[^\s]+\s/, ""))}
              disabled={loading}
              className="text-xs"
            >
              {suggestion}
            </Button>
          ))}
        </div>

        <p className="text-xs text-gray-500 text-center">
          Powered by AI · Data-grounded responses only
        </p>
      </div>
    </div>
  );
}
