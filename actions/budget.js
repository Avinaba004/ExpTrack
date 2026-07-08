"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

//fetching budget
export async function getCurrentBudget(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    //budget of each user
    const budget = await db.budget.findFirst({
      where: { userId: user.id },
    });

    //current month's budget
    const currentDate = new Date();
    //start of the month
    const startOfMonnth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    //end of month
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    //calculating expenses of month
    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: startOfMonnth, //date ta greater than starting date
          lte: endOfMonth, //date ta less than ending date
        },
        accountId,
      },
      _sum: {
        amount: true,
      },
    });

    return {
      budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
      currentExpenses: expenses._sum.amount
        ? expenses._sum.amount.toNumber()
        : 0,
    };
  } catch (error) {
    return { success: false, error: error.message || "An error occurred" };
  }
}

//updating budget
export async function updateBudget(amount) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Coerce amount to Number and validate
    const newAmount = typeof amount === "string" ? parseFloat(amount) : Number(amount);
    if (Number.isNaN(newAmount) || newAmount <= 0) {
      throw new Error("Invalid budget amount");
    }

    // Determine current month's expenses so we can clear any active alert when budget is increased above spending
    const currentDate = new Date();
    const startOfMonnth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: startOfMonnth,
          lte: endOfMonth,
        },
      },
      _sum: { amount: true },
    });

    const currentExpenses = expenses._sum.amount ? expenses._sum.amount.toNumber() : 0;

    // Build update payload conditionally to avoid setting fields to undefined
    const updateData = { amount: newAmount };
    if (newAmount > currentExpenses) {
      updateData.isAlertActive = false;
    }

    const createData = { userId: user.id, amount: newAmount, isAlertActive: newAmount > currentExpenses ? false : false };

    console.log(`[BUDGET] updateBudget: user=${user.id}, newAmount=${newAmount}, currentExpenses=${currentExpenses}, updateData=${JSON.stringify(updateData)}`);

    const budget = await db.budget.upsert({
      where: { userId: user.id },
      update: updateData,
      create: createData,
    });

    revalidatePath("/dashboard"); //revalidating dashboard path after updating budget
    return {
      success: true,
      data: { ...budget, amount: budget.amount.toNumber() },
    };

  } catch (error) {
    return { success: false, error: error.message || "An error occurred" };
  }
}
