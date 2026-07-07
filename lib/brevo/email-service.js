import axios from "axios";
import { brevoConfig, isBrevoConfigured } from "./config";

// Reusable service that wraps the official Brevo Transactional Email REST API.
// It is intentionally isolated so the email transport can change without touching business logic.
class EmailService {
  constructor(config = brevoConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        "api-key": config.apiKey,
      },
    });
  }

  async sendTransactionalEmail({ to, subject, htmlContent, textContent, tags = [] }) {
    // Fail softly so email issues never crash the request that triggered them.
    if (!isBrevoConfigured()) {
      console.warn("[BREVO] Email skipped because configuration is incomplete.");
      console.warn(`[BREVO] apiKey present: ${Boolean(this.config.apiKey)}, senderEmail: ${this.config.senderEmail}`);
      return { success: false, skipped: true, reason: "missing-config" };
    }

    const payload = {
      sender: {
        name: this.config.senderName,
        email: this.config.senderEmail,
      },
      to: [{ email: to }],
      subject,
      htmlContent,
      textContent: textContent || this.stripHtml(htmlContent),
      tags,
    };

    console.log(`[BREVO] Sending email to ${to} with subject: "${subject}"`);

    let lastError = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt += 1) {
      try {
        console.log(`[BREVO] Attempt ${attempt}/${this.config.maxRetries}`);
        const response = await this.client.post("/smtp/email", payload);
        console.log(`[BREVO] ✅ Email sent successfully on attempt ${attempt}:`, response.data);
        return { success: true, data: response.data, attempt };
      } catch (error) {
        lastError = error;
        const errorData = error?.response?.data || error?.message;
        console.error(`[BREVO] Attempt ${attempt} failed:`, errorData);

        if (attempt < this.config.maxRetries) {
          await this.wait(this.config.retryDelayMs * attempt);
        }
      }
    }

    console.error(`[BREVO] ❌ All ${this.config.maxRetries} attempts failed. Last error:`, lastError?.response?.data || lastError?.message);
    return { success: false, skipped: false, reason: "send-failed", error: lastError };
  }

  stripHtml(html) {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const brevoEmailService = new EmailService();

export async function sendBudgetLimitEmail(userEmail, userName, totalSpent, monthlyLimit) {
  // Business logic stays simple; rendering and transport are encapsulated here.
  const normalizedBudget = Number(monthlyLimit || 0);
  const normalizedSpent = Number(totalSpent || 0);
  const amountExceeded = Math.max(0, normalizedSpent - normalizedBudget);
  const escapedName = (userName || "there").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const htmlContent = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:640px;margin:0 auto;padding:24px;background:#f9fafb;">
      <div style="background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e5e7eb;">
        <h2 style="margin:0 0 8px;color:#111827;">Budget Limit Reached</h2>
        <p style="margin:0 0 16px;color:#4b5563;">Hello ${escapedName}, your monthly spending has reached or exceeded your budget limit.</p>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 8px;"><strong>Monthly budget:</strong> ₹${normalizedBudget.toLocaleString("en-IN")}</p>
          <p style="margin:0 0 8px;"><strong>Current spending:</strong> ₹${normalizedSpent.toLocaleString("en-IN")}</p>
          <p style="margin:0;"><strong>Amount exceeded:</strong> ₹${amountExceeded.toLocaleString("en-IN")}</p>
        </div>
        <p style="margin:0 0 12px;color:#4b5563;">Review your recent transactions and consider adjusting your spending for the rest of the month.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;">Open ExpTrack</a>
      </div>
    </div>
  `;

  return brevoEmailService.sendTransactionalEmail({
    to: userEmail,
    subject: "Budget limit reached for this month",
    htmlContent,
    textContent: `Hello ${escapedName}, your monthly spending has reached the budget limit. Monthly budget: ₹${normalizedBudget.toLocaleString("en-IN")}. Current spending: ₹${normalizedSpent.toLocaleString("en-IN")}. Amount exceeded: ₹${amountExceeded.toLocaleString("en-IN")}.`,
    tags: ["budget-alert", "transactional"],
  });
}

export default EmailService;
