import { GoogleGenerativeAI } from "@google/generative-ai";


// System prompt engineered for receipt extraction
const RECEIPT_EXTRACTION_PROMPT = `You are an expert receipt analyzer. Analyze the provided receipt image and extract structured data.

Your task:
1. Extract vendor/store name
2. Extract transaction date (format as YYYY-MM-DD)
3. Extract total amount (numerical value only, no currency symbols)
4. Detect currency (USD, EUR, INR, etc.)
5. Extract itemized list (name, quantity, price for each item)
6. Classify the expense category (Food, Travel, Shopping, Utilities, Entertainment, Healthcare, Education, Other)

Guidelines:
- Handle noisy/blurry receipts gracefully
- For dates, infer format if unclear (use current year if needed)
- Convert all prices to numbers (remove symbols like $, €, ₹)
- If multiple totals exist, use the final payable amount (after taxes/discounts)
- For quantity, default to 1 if not specified
- Remove duplicate items
- If items are not clearly itemized, create reasonable entries from visible text

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "vendor": "store name",
  "date": "YYYY-MM-DD",
  "total": 123.45,
  "currency": "USD",
  "items": [
    {"name": "item name", "quantity": 1, "price": 10.50}
  ],
  "category": "Food"
}

If you cannot parse this as a receipt, still attempt extraction with best guesses for missing fields.`;

/**
 * Extract structured data from a receipt image using Gemini API
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {string} mimeType - MIME type of the image (image/jpeg, image/png, etc.)
 * @returns {Promise<Object>} - Structured receipt data
 */
export async function extractReceiptData(imageBuffer, mimeType) {
  try {
    if (!imageBuffer || !mimeType) {
      throw new Error("Image buffer and MIME type are required");
    }

    // Convert buffer to base64
    const base64Image = imageBuffer.toString("base64");

    // Validate API key
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error(
        "GOOGLE_GENERATIVE_AI_API_KEY is not set in environment variables"
      );
    }
    
    // Initialize Gemini client inside the function
    const client = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

    // Try stable multimodal models
    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-flash-latest",
      "gemini-3.1-pro-preview",
      "gemini-3-flash-preview",
    ];

    let model;
    let modelUsed = null;

    for (const modelName of modelsToTry) {
      try {
        model = client.getGenerativeModel({ model: modelName });
        modelUsed = modelName;
        console.log(`Successfully initialized model: ${modelUsed}`);
        break;
      } catch (err) {
        console.warn(
          `Model ${modelName} initialization failed, trying next...`
        );
      }
    }

    if (!modelUsed) {
      throw new Error(
        "No available Gemini models found. Tried: " + modelsToTry.join(", ")
      );
    }

    console.log(`Using model: ${modelUsed}`);

    // Prepare the image part with proper base64 encoding
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    console.log("Processing receipt with image info:", {
      size: `${(imageBuffer.length / 1024).toFixed(2)}KB`,
      mimeType: mimeType,
      base64Length: base64Image.length,
      model: modelUsed,
    });

    // Send request to Gemini
    let result;
    try {
      result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              { text: RECEIPT_EXTRACTION_PROMPT },
              imagePart,
            ],
          },
        ],
      });
    } catch (apiError) {
      console.error("Gemini API Error Details:", {
        message: apiError.message,
        status: apiError.status,
        model: modelUsed,
      });
      throw new Error(
        `Gemini API (${modelUsed}) failed: ${apiError.message || "Unknown error"}`
      );
    }

    const response = await result.response;
    let responseText = response.text();

    if (!responseText) {
      throw new Error("Gemini API returned empty response");
    }

    // Clean response - remove markdown code blocks if present
    responseText = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Parse JSON response
    let extractedData;
    try {
      extractedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Response:", responseText);
      throw new Error(
        `Failed to parse Gemini response as JSON: ${parseError.message}`
      );
    }

    // Validate and sanitize the response
    extractedData = sanitizeReceiptData(extractedData);

    return extractedData;
  } catch (error) {
    console.error("Receipt extraction error:", error);
    throw error;
  }
}

/**
 * Validate and sanitize receipt data
 * @param {Object} data - Raw extracted data
 * @returns {Object} - Sanitized data
 */
function sanitizeReceiptData(data) {
  const sanitized = {
    vendor: String(data.vendor || "Unknown Vendor").trim().substring(0, 255),
    date: validateDate(data.date) || new Date().toISOString().split("T")[0],
    total: Number(data.total) || 0,
    currency: String(data.currency || "USD")
      .toUpperCase()
      .substring(0, 3),
    items: Array.isArray(data.items) ? data.items.map(sanitizeItem) : [],
    category: String(data.category || "Other")
      .trim()
      .substring(0, 50),
  };

  // Remove duplicate items
  sanitized.items = removeDuplicateItems(sanitized.items);

  // Ensure total is reasonable
  if (sanitized.total < 0) sanitized.total = 0;

  return sanitized;
}

/**
 * Validate and format date to YYYY-MM-DD
 * @param {string|Date} date - Date to validate
 * @returns {string|null} - Formatted date or null
 */
function validateDate(date) {
  if (!date) return null;

  const dateObj = new Date(date);

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return null;
  }

  // Format as YYYY-MM-DD
  return dateObj.toISOString().split("T")[0];
}

/**
 * Sanitize individual item
 * @param {Object} item - Item to sanitize
 * @returns {Object} - Sanitized item
 */
function sanitizeItem(item) {
  return {
    name: String(item.name || "Item").trim().substring(0, 255),
    quantity: Math.max(1, Number(item.quantity) || 1),
    price: Math.max(0, Number(item.price) || 0),
  };
}

/**
 * Remove duplicate items from list
 * @param {Array} items - Items array
 * @returns {Array} - Deduplicated items
 */
function removeDuplicateItems(items) {
  const seen = new Set();
  const unique = [];

  for (const item of items) {
    const key = `${item.name.toLowerCase()}-${item.price}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }

  return unique;
}
