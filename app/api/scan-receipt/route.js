import { NextResponse } from "next/server";
import { extractReceiptData } from "@/lib/gemini/receipt-extractor";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];

/**
 * POST /api/scan-receipt
 * Accepts a receipt image and returns structured expense data
 */
export async function POST(request) {
  try {
    // Validate content type
    const contentType = request.headers.get("content-type");

    if (!contentType || !contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        {
          error: "Invalid content type. Expected multipart/form-data",
        },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("receipt");

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Expected 'receipt' field in form data" },
        { status: 400 }
      );
    }

    // Validate file type
    const mimeType = file.type;
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        {
          error: `Invalid file type: ${mimeType}. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 413 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract receipt data using Gemini
    const extractedData = await extractReceiptData(buffer, mimeType);

    // Validate the extracted data structure
    validateExtractedData(extractedData);

    return NextResponse.json(extractedData, { status: 200 });
  } catch (error) {
    console.error("Receipt scan error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Return appropriate error response
    let statusCode = 500;
    let errorMessage = "Failed to process receipt";

    if (!error.message.includes("API key")) {
      statusCode = 500;
      errorMessage = "Server configuration error: Gemini API key not configured properly";
    } else if (error.message.includes("Gemini API") || error.message.includes("GoogleGenerativeAI")) {
      statusCode = 502;
      errorMessage = `Gemini API error: ${error.message}`;
    } else if (error.message.includes("Failed to parse receipt")) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.message.includes("File size")) {
      statusCode = 413;
      errorMessage = error.message;
    } else if (error.message.includes("JSON")) {
      statusCode = 400;
      errorMessage = `Invalid response format: ${error.message}`;
    } else if (error.message.includes("Unsupported file type")) {
      statusCode = 400;
      errorMessage = error.message;
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: statusCode }
    );
  }
}

/**
 * Validate that extracted data has required fields
 * @param {Object} data - Extracted receipt data
 * @throws {Error} if validation fails
 */
function validateExtractedData(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid response format");
  }

  // Check required fields
  if (!data.vendor || typeof data.vendor !== "string") {
    throw new Error("Missing or invalid vendor field");
  }

  if (!data.date || typeof data.date !== "string") {
    throw new Error("Missing or invalid date field");
  }

  if (typeof data.total !== "number") {
    throw new Error("Missing or invalid total field");
  }

  if (!data.currency || typeof data.currency !== "string") {
    throw new Error("Missing or invalid currency field");
  }

  if (!Array.isArray(data.items)) {
    throw new Error("Missing or invalid items field");
  }

  if (!data.category || typeof data.category !== "string") {
    throw new Error("Missing or invalid category field");
  }

  // Validate items structure
  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    if (
      !item.name ||
      typeof item.name !== "string" ||
      typeof item.quantity !== "number" ||
      typeof item.price !== "number"
    ) {
      throw new Error(`Invalid item structure at index ${i}`);
    }
  }
}
