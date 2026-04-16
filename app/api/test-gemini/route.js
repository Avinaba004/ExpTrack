import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * GET /api/test-gemini
 * Test endpoint to verify Gemini 1.5 Flash multimodal API configuration
 */
export async function GET(request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          status: "error",
          message: "GOOGLE_GENERATIVE_AI_API_KEY is not set in environment",
          configured: false,
        },
        { status: 400 }
      );
    }

    // Initialize Gemini client
    const client = new GoogleGenerativeAI(apiKey);

    // Try Gemini 3 Flash models first
    const modelsToTest = [
      "gemini-3-flash",
      "gemini-3-flash-preview",
      "gemini-3-flash-latest",
      "gemini-3.1-pro",
      "gemini-3.1-pro-latest",
      "gemini-3.1-pro-preview",
      "gemini-2.0-flash",
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
    ];

    let workingModel = null;
    let textTestPassed = false;
    let multimodalTestPassed = false;

    for (const modelName of modelsToTest) {
      console.log(`\nTesting model: ${modelName}`);

      // Test 1: Text-only
      try {
        console.log(`  Test 1: Text-only request with ${modelName}...`);
        const textModel = client.getGenerativeModel({ model: modelName });
        const textResult = await textModel.generateContent(
          "Say 'Text API works' in 3 words"
        );
        const textResponse = await textResult.response;
        const textOutput = textResponse.text();
        console.log(`  ✓ Text test passed: ${textOutput}`);
        textTestPassed = true;
      } catch (err) {
        console.error(
          `  ✗ Text test failed for ${modelName}:`,
          err.message.substring(0, 100)
        );
        continue;
      }

      // Test 2: Multimodal with image
      try {
        console.log(`  Test 2: Multimodal image support with ${modelName}...`);
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
        const imageModel = client.getGenerativeModel({ model: modelName });

        const imageResult = await imageModel.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                { text: "Is there an image in this message?" },
                {
                  inlineData: {
                    data: base64Image,
                    mimeType: "image/png",
                  },
                },
              ],
            },
          ],
        });

        const imageResponse = await imageResult.response;
        const imageOutput = imageResponse.text();
        console.log(
          `  ✓ Multimodal test passed: ${imageOutput.substring(0, 50)}...`
        );
        multimodalTestPassed = true;
        workingModel = modelName;
        break; // Exit loop if this model works
      } catch (err) {
        console.error(
          `  ✗ Multimodal test failed for ${modelName}:`,
          err.message.substring(0, 100)
        );
      }
    }

    if (!workingModel || !textTestPassed || !multimodalTestPassed) {
      return NextResponse.json(
        {
          status: "error",
          message: "No Gemini models passed all tests",
          configured: false,
          testsResults: {
            text: textTestPassed ? "✓ Passed" : "✗ Failed",
            multimodal: multimodalTestPassed ? "✓ Passed" : "✗ Failed",
          },
          attemptedModels: modelsToTest,
          suggestion:
            "Ensure your API key has access to Gemini 3 Flash or Gemini 3.1 Pro models",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: `Gemini multimodal API is working correctly with ${workingModel}`,
        configured: true,
        workingModel: workingModel,
        capabilities: ["text", "multimodal-images", "receipt-scanning"],
        apiKeyLength: apiKey.length,
        apiKeyPrefix: apiKey.substring(0, 10) + "...",
        testsResults: {
          text: "✓ Passed",
          multimodal: "✓ Passed",
        },
        nextSteps: "Ready to scan receipts!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Gemini test error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: error.message,
        configured: false,
        model: "gemini-1.5-flash",
        errorType: error.constructor.name,
        suggestion:
          "Ensure your API key has access to gemini-1.5-flash model and Generative AI API is enabled in Google Cloud Console",
      },
      { status: 500 }
    );
  }
}
