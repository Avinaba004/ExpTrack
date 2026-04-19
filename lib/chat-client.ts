/**
 * Chat API Client Utility
 * Use this to interact with the /api/chat endpoint from frontend components
 */

interface ChatRequest {
  question: string;
}

interface ChatResponse {
  success: boolean;
  question: string;
  answer: string;
  intent: "spending" | "income" | "comparison" | "insight" | "unknown";
}

interface ChatError {
  error: string;
}

/**
 * Send a question to the financial chat API
 */
export async function askFinancialAssistant(
  question: string
): Promise<ChatResponse | ChatError> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
      } as ChatRequest),
    });

    if (!response.ok) {
      const error = (await response.json()) as ChatError;
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as ChatResponse;
    return data;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to fetch response",
    };
  }
}

/**
 * Example usage in a React component:
 *
 * ```tsx
 * "use client";
 *
 * import { useState } from "react";
 * import { askFinancialAssistant } from "@/lib/chat-client";
 *
 * export function ChatAssistant() {
 *   const [question, setQuestion] = useState("");
 *   const [response, setResponse] = useState<string>("");
 *   const [loading, setLoading] = useState(false);
 *
 *   const handleAsk = async () => {
 *     setLoading(true);
 *     const result = await askFinancialAssistant(question);
 *
 *     if ("error" in result) {
 *       setResponse(`Error: ${result.error}`);
 *     } else {
 *       setResponse(result.answer);
 *     }
 *     setLoading(false);
 *   };
 *
 *   return (
 *     <div className="space-y-4">
 *       <input
 *         value={question}
 *         onChange={(e) => setQuestion(e.target.value)}
 *         placeholder="Ask about your finances..."
 *       />
 *       <button onClick={handleAsk} disabled={loading}>
 *         {loading ? "Thinking..." : "Ask"}
 *       </button>
 *       {response && <p>{response}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
