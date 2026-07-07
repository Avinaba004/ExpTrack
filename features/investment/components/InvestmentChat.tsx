"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { useRiskProfile } from "../hooks/useRiskProfile";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function InvestmentChat() {
  const { profile } = useRiskProfile();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI Investment Advisor. I have access to your current financial health, risk profile, and live market data. How can I help you plan your investments today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/investment/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          riskProfile: profile,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages([...newMessages, { role: "assistant", content: data.answer }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: `Error: ${data.error}` }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I couldn't process your request right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "Am I financially ready to invest?",
    "Should I increase my emergency fund?",
    "What is the best mutual fund for me right now?",
    "How does PPF compare to an Index Fund?"
  ];

  return (
    <Card className="flex flex-col h-[600px] shadow-sm bg-card/60 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300">
      <CardHeader className="border-b border-border/40 bg-primary/5 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Investment Assistant
        </CardTitle>
        <CardDescription>Ask personalized questions based on your actual data</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-background/50">
        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm shadow-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border border-border/40 rounded-tl-sm prose prose-sm dark:prose-invert max-w-none text-foreground"}`}>
                {msg.role === "assistant" ? (
                  <div dangerouslySetInnerHTML={{ 
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
                      .replace(/\n\n/g, '<br/><br/>')
                      .replace(/\n- (.*?)/g, '<br/>• $1')
                  }} />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 animate-in fade-in zoom-in duration-300">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 shadow-sm">
                <Bot size={14} />
              </div>
              <div className="bg-card border border-border/40 rounded-2xl rounded-tl-sm px-5 py-3.5 text-sm flex items-center gap-2 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-muted-foreground font-medium">Analyzing your data...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background/80 backdrop-blur-md border-t border-border/40">
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="text-xs bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors px-4 py-2 rounded-full border border-border/40 text-muted-foreground shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Ask about your investments..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1 rounded-full px-5 bg-muted/30 focus-visible:ring-primary/20"
            />
            <Button onClick={() => handleSend()} disabled={!input.trim() || isLoading} size="icon" className="rounded-full h-10 w-10 shrink-0 shadow-sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
