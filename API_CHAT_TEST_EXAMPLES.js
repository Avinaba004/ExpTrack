/**
 * API Chat - Test Examples
 *
 * Use these examples to test the /api/chat endpoint
 * Run with: curl -X POST http://localhost:3000/api/chat ...
 */

// ============================================
// CURL EXAMPLES
// ============================================

/*
Example 1: Simple spending query
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How much did I spend this month?"
  }'

Expected Response:
{
  "success": true,
  "question": "How much did I spend this month?",
  "answer": "You spent $1,250.00 this month.",
  "context": {
    "total_spend": 1250.00,
    "total_income": 5000.00,
    ...
  },
  "timeRange": "month"
}
*/

/*
Example 2: Category-specific query
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How much did I spend on food?"
  }'
*/

/*
Example 3: Comparison query
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Did I spend more this month than last?"
  }'
*/

/*
Example 4: Insight query
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Where did I spend the most?"
  }'
*/

/*
Example 5: Time-specific query
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What was my spending today?"
  }'
*/

/*
Example 6: Advice query
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Do you have any savings advice?"
  }'
*/

/*
Example 7: Health check (GET)
curl http://localhost:3000/api/chat
*/

// ============================================
// JAVASCRIPT/FETCH EXAMPLES
// ============================================

/*
// Example 1: Basic fetch
async function askQuestion() {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: "How much did I spend this month?"
    })
  });

  const data = await response.json();
  console.log(data.answer);
}

// Example 2: Using the client utility
import { askFinancialAssistant } from "@/lib/chat-client";

async function testAssistant() {
  const result = await askFinancialAssistant(
    "Where did I spend the most?"
  );

  if ("error" in result) {
    console.error("Error:", result.error);
  } else {
    console.log("Answer:", result.answer);
    console.log("Context:", result.context);
  }
}

// Example 3: React component
"use client";
import { askFinancialAssistant } from "@/lib/chat-client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FinancialAssistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    setLoading(true);
    setAnswer("");

    const result = await askFinancialAssistant(question);

    if ("error" in result) {
      setAnswer(`Error: ${result.error}`);
    } else {
      setAnswer(result.answer);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold">Financial Assistant</h2>
      
      <div className="flex gap-2">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about your finances..."
          onKeyPress={(e) => e.key === "Enter" && handleAsk()}
        />
        <Button onClick={handleAsk} disabled={loading || !question.trim()}>
          {loading ? "Thinking..." : "Ask"}
        </Button>
      </div>

      {answer && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm">{answer}</p>
        </div>
      )}
    </div>
  );
}
*/

// ============================================
// SUPPORTED QUESTION PATTERNS
// ============================================

/*
SPENDING SUMMARIES:
- "How much did I spend this month?"
- "What's my total spending today?"
- "How much have I spent all year?"
- "What have I spent so far this week?"

CATEGORY-SPECIFIC:
- "How much did I spend on food?"
- "What was my travel expense?"
- "Show me my entertainment spending"
- "How much on utilities this month?"

COMPARISONS:
- "Did I spend more this month than last?"
- "Am I spending more on food compared to last week?"
- "How does my spending compare to last year?"
- "Spent more or less than yesterday?"

INSIGHTS:
- "Where did I spend the most?"
- "What's my biggest expense category?"
- "What's my average daily spending?"
- "Which category had the most transactions?"

ADVICE:
- "Should I reduce my spending?"
- "Do you have any savings advice?"
- "What categories should I focus on?"
- "How can I improve my finances?"

INCOME:
- "How much income did I have?"
- "What's my total earnings this month?"
- "What's my net balance?"
*/

// ============================================
// ERROR HANDLING TEST CASES
// ============================================

/*
Test Case 1: Missing question
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{}'

Expected: 400 error with "question field is required"

---

Test Case 2: Empty question
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "   "}'

Expected: 400 error with "question field is required"

---

Test Case 3: No transactions in period
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "How much did I spend on xyz?"}'

Expected: 200 response with message about no data

---

Test Case 4: Invalid JSON
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d 'invalid json'

Expected: 400 error
*/

// ============================================
// INTEGRATION TEST CHECKLIST
// ============================================

/*
Before deploying, verify:

✅ User Authentication
   - Only authenticated users can access
   - Different users see only their data

✅ Data Accuracy
   - Totals match database sums
   - Categories correctly grouped
   - Date ranges accurately calculated

✅ Gemini Integration
   - API key properly configured
   - Responses are grounded in provided data
   - No hallucinations in answers
   - Rate limits not exceeded

✅ Error Handling
   - 400: Invalid requests handled
   - 401: Unauthorized users rejected
   - 404: Non-existent users handled
   - 500: Server errors logged properly

✅ Performance
   - Queries complete within reasonable time
   - No N+1 query problems
   - Response times under 5 seconds

✅ Security
   - API key never exposed
   - User data properly isolated
   - No SQL injection vectors
   - Rate limiting functional
*/

// ============================================
// MONITORING & DEBUGGING
// ============================================

/*
Enable debugging in your Next.js app:

// In route.ts, add console logging:
console.log("Parsed Query:", parsedQuery);
console.log("Financial Context:", financialContext);
console.log("Gemini Response:", answer);

// Monitor performance:
const startTime = performance.now();
// ... API logic ...
const duration = performance.now() - startTime;
console.log(`API took ${duration}ms`);

// Check database queries:
Set DEBUG environment variable:
DEBUG=prisma:* npm run dev
*/

// ============================================
// SUCCESS RESPONSE STRUCTURE
// ============================================

const exampleSuccessResponse = {
  success: true,
  question: "How much did I spend on food this month?",
  answer: "You spent $245.50 on food this month, which is about 20% of your total spending.",
  context: {
    total_spend: 1234.56,
    total_income: 5000.00,
    net_balance: 3765.44,
    category_breakdown: {
      "Food": 245.50,
      "Travel": 300.00,
      "Entertainment": 150.00,
      "Shopping": 200.00,
      "Utilities": 338.56,
    },
    monthly_data: {
      current_month_spend: 1234.56,
      previous_month_spend: 1100.00,
      change_percentage: 12.23,
    },
    average_daily_spend: 41.15,
    currency: "USD",
  },
  timeRange: "month",
};

export default exampleSuccessResponse;
