# Receipt Scanning Module - Documentation

## Overview

The receipt scanning module uses Google Gemini's multimodal AI capabilities to extract structured expense data from receipt images. The module handles image processing, OCR, data extraction, and validation automatically.

## Setup

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key" in a new project
3. Copy your API key

### 2. Configure Environment

Add your API key to `.env`:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_actual_api_key_here
```

### 3. Dependencies

The required package is already installed:
```bash
npm install @google/generative-ai
```

## API Endpoint

**POST** `/api/scan-receipt`

### Request

**Content-Type**: `multipart/form-data`

**Request Body**:
```
receipt: File (image/jpeg, image/png, or application/pdf)
```

**File Size Limit**: 20MB

**Accepted Formats**:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- PDF (.pdf)

### Response

**Success (200)**:
```json
{
  "vendor": "Starbucks",
  "date": "2026-04-17",
  "total": 12.45,
  "currency": "USD",
  "items": [
    {
      "name": "Venti Caramel Macchiato",
      "quantity": 2,
      "price": 6.25
    },
    {
      "name": "Blueberry Muffin",
      "quantity": 1,
      "price": 3.95
    }
  ],
  "category": "Food"
}
```

**Error (400/500)**:
```json
{
  "error": "Failed to parse receipt"
}
```

## Usage Example

### JavaScript/Frontend

```javascript
// Submit receipt image
async function scanReceipt(file) {
  const formData = new FormData();
  formData.append("receipt", file);

  try {
    const response = await fetch("/api/scan-receipt", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const receiptData = await response.json();
    console.log("Extracted receipt:", receiptData);

    // Use receiptData to populate expense form
    return receiptData;
  } catch (error) {
    console.error("Receipt scan failed:", error);
    throw error;
  }
}

// Usage
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  const receipt = await scanReceipt(file);
  // Populate form with receipt data
});
```

### React/Next.js Component Example

```jsx
"use client";

import { useState } from "react";
import { toast } from "sonner";

export function ReceiptScanner() {
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const handleFileUpload = async (file) => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("receipt", file);

    try {
      const response = await fetch("/api/scan-receipt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      setReceiptData(data);
      toast.success("Receipt scanned successfully!");

      return data;
    } catch (error) {
      toast.error(error.message);
      console.error("Scan error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="receipt-scanner">
      <input
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        onChange={(e) => handleFileUpload(e.target.files?.[0])}
        disabled={loading}
      />
      {receiptData && (
        <div className="receipt-preview">
          <p>Vendor: {receiptData.vendor}</p>
          <p>Date: {receiptData.date}</p>
          <p>Total: {receiptData.currency} {receiptData.total}</p>
          <p>Category: {receiptData.category}</p>
        </div>
      )}
    </div>
  );
}
```

## File Structure

```
lib/gemini/
  ├── receipt-extractor.js      # Gemini API integration
app/api/
  ├── scan-receipt/
      └── route.js              # API endpoint
```

## Key Features

### Intelligent Parsing
- Handles blurry, tilted, or low-quality receipt images
- Automatically detects vendor name, date, and total
- Extracts itemized list where possible
- Infers missing fields intelligently

### Robust Data Extraction
- Normalizes dates to ISO format (YYYY-MM-DD)
- Converts prices to numbers (removes currency symbols)
- Detects and preserves currency type (USD, EUR, INR, etc.)
- Automatically classifies expense categories

### Error Handling
- Validates file type and size before processing
- Validates API response structure
- Returns clear error messages
- Gracefully handles malformed receipts

### Data Cleaning
- Removes duplicate items
- Sanitizes strings (trimming, length limits)
- Ensures numerical fields are valid
- Validates all required fields

## Data Validation

The extracted data must contain:

| Field | Type | Description |
|-------|------|-------------|
| `vendor` | string | Store/merchant name |
| `date` | string | Transaction date (YYYY-MM-DD) |
| `total` | number | Total amount (positive number) |
| `currency` | string | 3-letter currency code (USD, EUR, etc.) |
| `items` | array | List of purchased items |
| `category` | string | Expense category classification |

Each item in `items` must have:
- `name` (string): Item description
- `quantity` (number): Quantity purchased (≥ 1)
- `price` (number): Price per unit

## Category Classification

The module automatically classifies receipts into:
- **Food**: Restaurants, groceries, cafes
- **Travel**: Gas, parking, tolls, transit
- **Shopping**: Retail, online purchases
- **Utilities**: Bills, subscriptions
- **Entertainment**: Movies, events, subscriptions
- **Healthcare**: Medical, pharmacy
- **Education**: Books, courses, tuition
- **Other**: Miscellaneous

## Integration with Expense Tracker

Once you receive the extracted data from the API, you can directly use it to:

1. **Pre-fill forms** in your expense creation UI
2. **Create transactions** via your existing transaction creation API
3. **Categorize expenses** automatically
4. **Track receipts** by storing the raw image and extracted data

Example flow:
```
User uploads receipt 
  → /api/scan-receipt processes it
  → Returns structured data
  → Frontend pre-fills expense form
  → User submits form
  → Expense is saved to database
```

## Troubleshooting

### API Key Error
**Error**: "Server configuration error: Gemini API not configured"
**Solution**: Ensure `GOOGLE_GENERATIVE_AI_API_KEY` is set in `.env`

### File Size Error
**Error**: "File size exceeds maximum allowed size"
**Solution**: Compress the image or use a smaller file (max 20MB)

### Invalid File Type
**Error**: "Invalid file type"
**Solution**: Use JPEG, PNG, or PDF files

### Poor Extraction Quality
**If the AI struggles with a receipt**:
1. Ensure good lighting in the photo
2. Take the photo straight-on (not tilted)
3. Ensure the receipt text is clearly visible
4. Try removing reflections/glare

### Malformed JSON Response
**If Gemini returns invalid JSON**:
- The API will attempt parsing and sanitization
- If it still fails, check the error logs
- Try re-uploading the receipt

## Advanced Options

### Customizing the Extraction Prompt

Edit the `RECEIPT_EXTRACTION_PROMPT` in `receipt-extractor.js` to adjust:
- Extraction logic
- Category definitions
- Field requirements
- Special handling rules

### Changing the Model

Update the model name in `receipt-extractor.js`:
```javascript
const model = client.getGenerativeModel({ model: "gemini-1.5-pro" });
```

Available models:
- `gemini-1.5-flash`: Faster, good for most receipts
- `gemini-1.5-pro`: More accurate but slower
- `gemini-2.0-flash`: Latest model (when available)

### Adding Rate Limiting

Consider adding rate limiting to the API route:
```javascript
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"),
});

const { success } = await ratelimit.limit(userId);
if (!success) {
  return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
}
```

## Performance Considerations

- **First request**: ~2-5 seconds (API latency)
- **Subsequent requests**: Similar latency (each image is processed independently)
- **Large images**: May take longer, consider compressing
- **Concurrent requests**: The API handles concurrent requests efficiently

## Security Best Practices

1. **API Key**: Never commit `.env` files to git
2. **File Validation**: Only accept allowed MIME types (enforced)
3. **File Size**: Limit large uploads (20MB max)
4. **Rate Limiting**: Consider implementing rate limiting
5. **User Authentication**: Validate user session before processing (optional)

## Testing

### Test with Sample Receipt

```bash
curl -X POST http://localhost:3000/api/scan-receipt \
  -F "receipt=@/path/to/receipt.jpg"
```

### Expected Output

```json
{
  "vendor": "Whole Foods Market",
  "date": "2026-04-17",
  "total": 45.67,
  "currency": "USD",
  "items": [
    {"name": "Organic Bananas", "quantity": 2, "price": 1.99},
    {"name": "Almond Milk", "quantity": 1, "price": 4.99},
    {"name": "Greek Yogurt", "quantity": 3, "price": 2.99}
  ],
  "category": "Food"
}
```

## Limitations

- PDF support is basic (best with simple receipts)
- Very blurry images may not parse well
- Handwritten receipts are not supported
- Non-English receipts may have reduced accuracy
- Some receipts with unclear formatting may require manual correction

## Future Enhancements

Potential improvements:
- Multi-language support
- Handwriting recognition
- Receipt image enhancement (auto-rotate, de-blur)
- Tax/discount line item extraction
- Payment method detection
- Receipt image storage and linking
- Batch receipt processing
- Receipt fraud detection

## API Response Examples

### Success Response
```json
{
  "vendor": "Target",
  "date": "2026-04-15",
  "total": 89.99,
  "currency": "USD",
  "items": [
    {"name": "T-Shirt", "quantity": 2, "price": 19.99},
    {"name": "Jeans", "quantity": 1, "price": 49.99}
  ],
  "category": "Shopping"
}
```

### Minimal Receipt
```json
{
  "vendor": "Unknown Vendor",
  "date": "2026-04-17",
  "total": 10.0,
  "currency": "USD",
  "items": [{"name": "Item", "quantity": 1, "price": 10.0}],
  "category": "Other"
}
```

### Error Response
```json
{
  "error": "Failed to parse receipt"
}
```

## Support & Issues

For issues or questions:
1. Check `.env` configuration
2. Verify Gemini API key is valid
3. Check file format and size
4. Review server logs
5. Test with different receipt images
