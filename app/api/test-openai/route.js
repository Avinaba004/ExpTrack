import { NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * GET /api/test-openai
 * Test endpoint to verify OpenAI Vision API configuration
 */
export async function GET(request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          status: "error",
          message: "OPENAI_API_KEY is not set in environment",
          configured: false,
        },
        { status: 400 }
      );
    }

    // Initialize OpenAI client
    const client = new OpenAI({ apiKey });

    // Test 1: Text-only to verify API key works
    console.log("Test 1: Testing text-only request with OpenAI...");
    try {
      const textResult = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 50,
        messages: [
          {
            role: "user",
            content: "Say 'Text API works' in 3 words",
          },
        ],
      });

      const textOutput = textResult.choices?.[0]?.message?.content;
      console.log("✓ Text test passed:", textOutput);
    } catch (err) {
      console.error("✗ Text test failed:", err.message);
      throw err;
    }

    // Test 2: Multimodal with image
    console.log("Test 2: Testing multimodal image support with OpenAI...");
    try {
      // Create a simple 1x1 pixel PNG (smallest valid PNG)
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00,
        0x0d, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00,
        0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde,
        0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63,
        0xf8, 0xcf, 0xc0, 0x00, 0x00, 0x00, 0x03, 0x00, 0x01, 0x0e, 0x1c,
        0x4b, 0x34, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
        0x42, 0x60, 0x82,
      ]);

      const base64Image = pngBuffer.toString("base64");

      const imageResult = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Is there an image in this message?",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
      });

      const imageOutput = imageResult.choices?.[0]?.message?.content;
      console.log("✓ Multimodal test passed:", imageOutput.substring(0, 50) + "...");
    } catch (err) {
      console.error("✗ Multimodal test failed:", err.message);
      throw err;
    }

    return NextResponse.json(
      {
        status: "success",
        message: "OpenAI Vision API is working correctly",
        configured: true,
        model: "gpt-4o-mini",
        capabilities: ["text", "vision", "multimodal-images", "receipt-scanning"],
        apiKeyLength: apiKey.length,
        apiKeyPrefix: apiKey.substring(0, 10) + "...",
        testsResults: {
          text: "✓ Passed",
          vision: "✓ Passed",
        },
        nextSteps: "Ready to scan receipts!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("OpenAI test error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: error.message,
        configured: false,
        model: "gpt-4o-mini",
        errorType: error.constructor.name,
        suggestion:
          "Ensure your OPENAI_API_KEY is correctly set in .env and has access to gpt-4o-mini model",
      },
      { status: 500 }
    );
  }
}
