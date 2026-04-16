import OpenAI from "openai";

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

IMPORTANT: Return ONLY valid JSON (no markdown, no code blocks, no explanation) with this exact structure:
{
  "vendor": "store name",
  "date": "YYYY-MM-DD",
  "total": 123.45,
  "currency": "USD",
  "items": [
    {"name": "item name", "quantity": 1, "price": 10.50}
  ],
  "category": "Food"
}`;

/**
 * Extract structured data from a receipt image using OpenAI Vision API
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {string} mimeType - MIME type of the image (image/jpeg, image/png, etc.)
 * @returns {Promise<Object>} - Structured receipt data
 */
export async function extractReceiptData(imageBuffer, mimeType) {
  try {
    if (!imageBuffer || !mimeType) {
      throw new Error("Image buffer and MIME type are required");
    }

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY is not set in environment variables"
      );
    }

    // Initialize OpenAI client inside function
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!client) {
      throw new Error("Failed to initialize OpenAI client");
    }

    // Convert buffer to base64
    const base64Image = imageBuffer.toString("base64");

    console.log("Processing receipt with image info:", {
      size: `${(imageBuffer.length / 1024).toFixed(2)}KB`,
      mimeType: mimeType,
      base64Length: base64Image.length,
      model: "gpt-4o-mini",
    });

    // Map MIME types to OpenAI image media types
    const mimeToMediaType = {
      "image/jpeg": "image/jpeg",
      "image/png": "image/png",
      "image/gif": "image/gif",
      "image/webp": "image/webp",
    };

    const mediaType = mimeToMediaType[mimeType];
    if (!mediaType) {
      throw new Error(
        `Unsupported image type: ${mimeType}. Supported types: JPEG, PNG, GIF, WebP`
      );
    }

    // Send request to OpenAI Vision API
    let result;
    try {
      result = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: RECEIPT_EXTRACTION_PROMPT,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mediaType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
      });
    } catch (apiError) {
      console.error("OpenAI API Error Details:", {
        message: apiError.message,
        status: apiError.status,
        type: apiError.type,
      });
      throw new Error(
        `OpenAI API failed: ${apiError.message || "Unknown error"}`
      );
    }

    // Extract response text
    const responseText = result.choices?.[0]?.message?.content;

    if (!responseText) {
      throw new Error("OpenAI API returned empty response");
    }

    console.log("OpenAI Response:", responseText.substring(0, 100) + "...");

    // Clean response - remove markdown code blocks if present
    let cleanedResponse = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Parse JSON response
    let extractedData;
    try {
      extractedData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Response:", cleanedResponse);
      throw new Error(
        `Failed to parse OpenAI response as JSON: ${parseError.message}`
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
