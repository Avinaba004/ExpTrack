// Centralized configuration for the Brevo transactional email integration.
// Keep secrets in environment variables so the application does not hardcode them.

export const brevoConfig = {
  apiKey: process.env.BREVO_API_KEY || "",
  senderEmail: process.env.BREVO_SENDER_EMAIL || "",
  senderName: process.env.BREVO_SENDER_NAME || "ExpTrack",
  baseUrl: "https://api.brevo.com/v3",
  maxRetries: 3,
  retryDelayMs: 1000,
};

export function isBrevoConfigured() {
  return Boolean(brevoConfig.apiKey && brevoConfig.senderEmail);
}
