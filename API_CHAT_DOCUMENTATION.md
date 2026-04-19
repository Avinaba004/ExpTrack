# 🤖 Financial Assistant Chat API

## Overview

The `/api/chat` endpoint is an AI-powered financial assistant that answers user questions about their expenses and income using **real data from your database**. It leverages Google's Gemini 1.5 Flash API to provide accurate, data-grounded responses.

### Key Features

- ✅ **Data-Grounded Answers** - All responses are based on your actual financial data
- ✅ **Smart Question Parsing** - Automatically detects categories, time ranges, and query types
- ✅ **Multi-Modal Analysis** - Supports spending summaries, comparisons, insights, and advice
- ✅ **No Hallucination** - Returns "I don't have that information" when data is missing
- ✅ **Secure** - API key never exposed, user authentication required

---

## 🚀 Quick Start

### 1. **Make a Request**

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "How much did I spend on food this month?"}'
```

### 2. **Use from React Component**

```tsx
"use client";

import { askFinancialAssistant } from "@/lib/chat-client";
import { useState } from "react";

export function ChatAssistant() {
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    setLoading(true);
    const result = await askFinancialAssistant(
      "How much did I spend this month?"
    );

    if ("error" in result) {
      setAnswer(`Error: ${result.error}`);
    } else {
      setAnswer(result.answer);
    }
    setLoading(false);
  };

  return (
    <div>
      <button onClick={handleAsk} disabled={loading}>
        {loading ? "Thinking..." : "Ask"}
      </button>
      {answer && <p>{answer}</p>}
    </div>
  );
}
```

---

## 📋 API Documentation

### **Endpoint**

```
POST /api/chat
```

### **Authentication**

- Requires Clerk authentication (automatic via middleware)
- User must be logged in

### **Request Body**

```json
{
  "question": "How much did I spend on food this month?"
}
```

| Field      | Type   | Required | Description                                |
| ---------- | ------ | -------- | ------------------------------------------ |
| `question` | string | ✅ Yes   | Your financial question to the assistant  |

### **Success Response (200 OK)**

```json
{
  "success": true,
  "question": "How much did I spend on food this month?",
  "answer": "You spent $245.50 on food this month.",
  "context": {
    "total_spend": 245.50,
    "total_income": 5000.00,
    "net_balance": 4754.50,
    "category_breakdown": {
      "Food": 245.50
    },
    "monthly_data": {
      "current_month_spend": 1250.00,
      "previous_month_spend": 1100.00,
      "change_percentage": 13.64
    },
    "average_daily_spend": 41.67,
    "currency": "USD"
  },
  "timeRange": "month"
}
```

### **Error Responses**

```json
// 400 - Bad Request
{ "error": "Invalid request: 'question' field is required" }

// 401 - Unauthorized
{ "error": "Unauthorized" }

// 404 - Not Found
{ "error": "User not found" }

// 500 - Server Error
{ "error": "Failed to process query" }
```

---

## 🧠 Question Examples

The API automatically detects your intent from natural language questions:

### **Spending Summaries**
- "How much did I spend this month?"
- "What's my total spending today?"
- "How much have I spent all year?"

### **Category-Specific Queries**
- "How much did I spend on food?"
- "What was my travel expense this week?"
- "Show me my entertainment spending"

### **Comparisons**
- "Did I spend more this month than last?"
- "Am I spending more on food compared to last week?"
- "How much did I spend vs. last year?"

### **Insights & Analysis**
- "Where did I spend the most?"
- "What's my biggest expense category?"
- "What's my average daily spending?"

### **Advice**
- "Should I reduce my spending?"
- "Do you have any savings advice?"
- "What categories should I focus on?"

---

## 🔄 How It Works

### **Query Flow**

```
User Question
    ↓
[1] Parse Query
    ├─ Extract category (Food, Travel, etc.)
    ├─ Detect time range (day, week, month, year)
    └─ Identify query type (summary, comparison, insight, advice)
    ↓
[2] Query Database
    ├─ Fetch transactions from Prisma
    ├─ Calculate totals and breakdowns
    ├─ Compute monthly comparisons
    └─ Generate financial context
    ↓
[3] Send to Gemini
    ├─ Include financial context (JSON)
    ├─ Set system instructions
    └─ Ask the question
    ↓
[4] Return Response
    ├─ AI-generated answer
    ├─ Financial context used
    └─ Detected time range
```

### **What Gets Parsed?**

| Component | Detection | Examples |
|-----------|-----------|----------|
| **Category** | Keyword matching | "food", "travel", "entertainment", "utilities" |
| **Time Range** | Temporal keywords | "today", "this week", "this month", "this year" |
| **Query Type** | Intent detection | "summary", "comparison", "insight", "advice" |

---

## 🛡️ Security & Best Practices

### **What We Protect**

✅ **API Keys** - Never exposed to client  
✅ **User Data** - Only query authenticated user's data  
✅ **No Hallucination** - Gemini only explains provided data  
✅ **Data Validation** - All inputs validated  
✅ **Error Handling** - Generic error messages, no leaks  

### **How Gemini Queries Work**

1. Backend calculates all numbers first
2. Data is serialized to JSON
3. JSON + question sent to Gemini
4. Gemini explains using ONLY that data
5. Response returned to user

**Gemini CANNOT**:
- Access database directly
- Modify transactions
- Calculate raw totals
- Invent data

---

## 📊 Response Context Details

The `context` object contains all financial data used to answer your question:

```typescript
context: {
  // Total spending and income in the queried period
  total_spend: number;          // Sum of all expenses
  total_income: number;         // Sum of all income
  net_balance: number;          // income - spend

  // Breakdown by category
  category_breakdown: {
    "Food": 245.50,
    "Travel": 150.00,
    // ... more categories
  },

  // Month-over-month comparison (if applicable)
  monthly_data?: {
    current_month_spend: 1250.00,
    previous_month_spend: 1100.00,
    change_percentage: 13.64      // positive = spending increased
  },

  // Average spent per day in the period
  average_daily_spend?: 41.67,

  // Currency used in all amounts
  currency?: "USD"
}
```

---

## 🔧 Implementation Details

### **Database Integration**

The API uses Prisma to query:

```prisma
model Transaction {
  id        String
  type      TransactionType     // INCOME or EXPENSE
  amount    Decimal
  category  String              // Food, Travel, etc.
  date      DateTime            // When transaction occurred
  userId    String              // Owner of transaction
  status    TransactionStatus   // COMPLETED, PENDING, FAILED
}
```

### **Supported Categories**

Categories are dynamically detected from your transaction data:

- Food
- Travel
- Entertainment
- Utilities
- Shopping
- Health
- Education
- (Custom categories supported)

### **Time Range Support**

- `day` - Current calendar day
- `week` - Current week (Sunday-Saturday)
- `month` - Current month
- `year` - Current year
- `all` - All time (entire history)

---

## 🚨 Troubleshooting

### **Problem: "I don't have that information"**

This means:
- No transactions exist for the queried period/category
- The question is too specific or ambiguous
- **Solution**: Add more transactions or ask differently

### **Problem: 401 Unauthorized**

- User not logged in
- **Solution**: Ensure Clerk authentication is working

### **Problem: 500 Server Error**

- Database connection issue
- Gemini API key not configured
- Rate limit exceeded
- **Solution**: Check logs, verify .env configuration

### **Problem: Slow Responses**

- Large transaction volume
- Network latency
- **Solution**: Query more specific time ranges

---

## 🧪 Testing

### **GET Request (Health Check)**

```bash
curl http://localhost:3000/api/chat
```

Response:
```json
{
  "message": "Chat API is running",
  "endpoint": "/api/chat",
  "method": "POST",
  "examples": [...]
}
```

### **Test with cURL**

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: __Secure-next-auth.session-token=..." \
  -d '{
    "question": "How much did I spend on food this month?"
  }'
```

### **Environment Setup**

```env
# Required in .env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key
DATABASE_URL=your_database_url
CLERK_SECRET_KEY=your_clerk_key
```

---

## 📈 Future Enhancements

Possible extensions to the chat API:

- [ ] Streaming responses (real-time token generation)
- [ ] Multi-turn conversations (chat history)
- [ ] Budget alerts & notifications
- [ ] Recurring transaction analysis
- [ ] Predictive spending insights
- [ ] Receipt upload & auto-categorization
- [ ] Custom financial goals tracking
- [ ] Export reports to PDF

---

## 📞 Support

For issues or questions:

1. Check the error message carefully
2. Verify environment variables are set
3. Review database for transaction data
4. Check Gemini API quota/limits
5. Review application logs

---

**Created**: April 18, 2026  
**API Version**: 1.0  
**Model**: Gemini 1.5 Flash  
**Status**: Production Ready ✅
