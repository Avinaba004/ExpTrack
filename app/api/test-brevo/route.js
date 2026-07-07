// Test endpoint to verify Brevo email integration is working
// DELETE THIS FILE AFTER TESTING

import { brevoConfig, isBrevoConfigured } from "@/lib/brevo/config";
import { sendBudgetLimitEmail } from "@/lib/brevo/email-service";
import { auth } from "@clerk/nextjs/server";

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if Brevo is configured
    const configured = isBrevoConfigured();

    return Response.json({
      status: "brevo-test",
      isConfigured: configured,
      config: {
        apiKeyPresent: Boolean(brevoConfig.apiKey),
        senderEmailPresent: Boolean(brevoConfig.senderEmail),
        apiKeyLength: brevoConfig.apiKey?.length || 0,
        senderEmail: brevoConfig.senderEmail || "NOT SET",
        senderName: brevoConfig.senderName,
      },
      message: configured
        ? "Brevo is configured. Use POST to send a test email."
        : "❌ Brevo is NOT configured. Add BREVO_API_KEY and BREVO_SENDER_EMAIL to .env",
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, name } = await req.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Send a test email
    const result = await sendBudgetLimitEmail(email, name || "Test User", 553.6, 500);

    return Response.json({
      status: "test-email-sent",
      success: result.success,
      result,
      message: result.success ? "✅ Email sent successfully!" : `❌ Email failed: ${result.reason}`,
    });
  } catch (error) {
    return Response.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
