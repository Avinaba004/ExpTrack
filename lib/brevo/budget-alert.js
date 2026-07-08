import { db } from "@/lib/prisma";
import { sendBudgetLimitEmail } from "./email-service";

// This module contains the budget-breach notification workflow.
// It is separate from the transaction action so the business flow remains clean and testable.

function getMonthWindow(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function isNewMonth(lastAlertDate, currentDate) {
  return !lastAlertDate || lastAlertDate.getMonth() !== currentDate.getMonth() || lastAlertDate.getFullYear() !== currentDate.getFullYear();
}

export async function maybeSendBudgetBreachNotification({ userId, accountId, transactionDate }) {
  try {
    console.log(`[BUDGET-ALERT] Checking budget breach for userId=${userId}, accountId=${accountId}`);
    
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.warn(`[BUDGET-ALERT] User not found: ${userId}`);
      return { success: false, reason: "user-not-found" };
    }

    const budget = await db.budget.findUnique({ where: { userId } });
    if (!budget || !budget.amount) {
      console.warn(`[BUDGET-ALERT] Budget not found or no amount set for userId=${userId}`);
      return { success: false, reason: "budget-not-found" };
    }

    const monthWindow = getMonthWindow(transactionDate || new Date());
    console.log(`[BUDGET-ALERT] Month window: ${monthWindow.start} to ${monthWindow.end}`);

    const expenses = await db.transaction.aggregate({
      where: {
        userId,
        accountId,
        type: "EXPENSE",
        date: {
          gte: monthWindow.start,
          lte: monthWindow.end,
        },
      },
      _sum: { amount: true },
    });

    const totalSpent = Number(expenses._sum.amount?.toNumber() || 0);
    const monthlyLimit = Number(budget.amount.toNumber());

    console.log(`[BUDGET-ALERT] Total spent: ₹${totalSpent}, Monthly limit: ₹${monthlyLimit}, Last alert sent: ${budget.lastAlertSent}, isAlertActive: ${budget.isAlertActive}`);

    // New behavior:
    // - Send an email each time totalSpent >= monthlyLimit while `isAlertActive` is false.
    // - Once an alert is sent, set `isAlertActive` = true to avoid duplicate emails on subsequent expenses.
    // - When the budget is increased such that monthlyLimit > totalSpent, reset `isAlertActive` = false.

    // If an alert is active but the budget has been increased above current spending, clear the alert flag.
    if (budget.isAlertActive && monthlyLimit > totalSpent) {
      console.log(`[BUDGET-ALERT] Clearing isAlertActive for budget=${budget.id} because monthlyLimit > totalSpent`);
      await db.budget.update({ where: { id: budget.id }, data: { isAlertActive: false } });
      // continue; do not send an email in this run
      return { success: true, notified: false, reason: "alert-cleared" };
    }

    // Determine if we should notify now
    const shouldNotify = totalSpent >= monthlyLimit && !budget.isAlertActive;
    console.log(`[BUDGET-ALERT] Should notify: ${shouldNotify} (totalSpent >= limit: ${totalSpent >= monthlyLimit}, isAlertActive: ${budget.isAlertActive})`);

    if (!shouldNotify) {
      return { success: true, notified: false, reason: "no-alert-needed" };
    }

    console.log(`[BUDGET-ALERT] Sending email to ${user.email}`);
    const emailResult = await sendBudgetLimitEmail(user.email, user.name || "there", totalSpent, monthlyLimit);

    console.log(`[BUDGET-ALERT] Email result:`, emailResult);

    if (emailResult.success) {
      console.log(`[BUDGET-ALERT] Setting isAlertActive=true for budget=${budget.id}`);
      await db.budget.update({ where: { id: budget.id }, data: { isAlertActive: true, lastAlertSent: new Date() } });
    }

    return {
      success: true,
      notified: emailResult.success,
      emailResult,
      totalSpent,
      monthlyLimit,
    };
  } catch (error) {
    console.error("[BUDGET-ALERT] Budget breach notification failed:", error);
    return { success: false, reason: "notification-error", error: error.message };
  }
}
