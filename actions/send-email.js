import { render } from "@react-email/render";
import { brevoEmailService } from "@/lib/brevo/email-service";

export async function sendEmail({ to, subject, react }) {
  console.log("➡️ sendEmail called", { to, subject });

  try {
    if (!react) {
      throw new Error("A React email template is required.");
    }

    const html = await render(react);
    const text = await render(react, { plainText: true });

    const result = await brevoEmailService.sendTransactionalEmail({
      to,
      subject,
      htmlContent: html,
      textContent: text,
      tags: ["app-email"],
    });

    console.log("✅ Brevo email result:", result);
    return result;
  } catch (error) {
    console.error("Brevo email send failed:", error);
    return { success: false, error: error.message };
  }
}
