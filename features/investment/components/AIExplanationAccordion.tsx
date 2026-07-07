"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AIExplanationAccordionProps {
  content: string;
}

export function AIExplanationAccordion({ content }: AIExplanationAccordionProps) {
  // Parse the markdown string into sections based on H3 headers (### )
  const sections = content.split("### ").filter(Boolean).map((section) => {
    const lines = section.split("\n");
    const title = lines[0].trim();
    // The rest is content. We'll do some basic formatting.
    const bodyText = lines.slice(1).join("\n").trim();
    return { title, bodyText };
  });

  const [openIndex, setOpenIndex] = useState<number>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <div className="space-y-3">
      {sections.map((section, index) => {
        const isOpen = openIndex === index;
        return (
          <div 
            key={index} 
            className={`border rounded-xl transition-all duration-200 overflow-hidden ${
              isOpen ? "border-primary/30 shadow-sm bg-card" : "border-border/50 bg-card/40 hover:bg-card/80"
            }`}
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between p-4 text-left font-semibold text-foreground"
            >
              <span className="flex items-center gap-2">
                {section.title}
              </span>
              <ChevronDown 
                size={18} 
                className={`text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
              />
            </button>
            
            <div 
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100 pb-4" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden px-4">
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: section.bodyText
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/\n\n/g, '</p><p class="mt-3">')
                      .replace(/\n- (.*?)/g, '<li class="ml-4 mt-1 list-disc">$1</li>')
                      .replace(/(<li.*<\/li>)/g, '<ul class="mb-3">$1</ul>')
                      .replace(/^(.+?)$/gm, (match) => {
                        if (match.startsWith('<') || match.trim() === '') return match;
                        return `<p>${match}</p>`;
                      })
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
