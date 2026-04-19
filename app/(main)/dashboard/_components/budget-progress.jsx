"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X, AlertCircle } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { convertCurrency, formatCurrencyAmount } from "@/lib/currency";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBudget } from "@/actions/budget";

export function BudgetProgress({ initialBudget, currentExpenses }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );
  const [userCurrency, setUserCurrency] = useState("INR");

  // Fetch user's preferred currency
  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const response = await fetch("/api/user/currency");
        if (response.ok) {
          const data = await response.json();
          setUserCurrency(data.currency);
        }
      } catch (error) {
        console.error("Failed to fetch currency:", error);
      }
    };
    fetchCurrency();
  }, []);

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);

  const percentUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0;

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    await updateBudgetFn(amount);
  };

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

  useEffect(() => {
    if (updatedBudget?.success) {
      setIsEditing(false);
      toast.success("Budget updated successfully");
    }
  }, [updatedBudget]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update budget");
    }
  }, [error]);

  return (
    <Card className="my-5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-sm font-medium">
            Monthly Budget (Default Account)
          </CardTitle>
          <div className="flex items-center gap-2 mt-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-32"
                  placeholder="Enter amount"
                  autoFocus
                  disabled={isLoading}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUpdateBudget}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <>
                <CardDescription>
                  {initialBudget
                    ? `${formatCurrencyAmount(convertCurrency(currentExpenses, userCurrency), userCurrency)} of ${formatCurrencyAmount(convertCurrency(initialBudget.amount, userCurrency), userCurrency)} spent`
                    : "No budget set"}
                </CardDescription>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-6 w-6"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
  {initialBudget && (
    <div className="space-y-3">
      {percentUsed <= 100 ? (
        <>
          <Progress
            value={percentUsed}
            extraStyles={
              percentUsed >= 90
                ? "bg-red-500"
                : percentUsed >= 75
                ? "bg-orange-500"
                : percentUsed >= 50
                ? "bg-yellow-500"
                : "bg-green-500"
            }
          />
          <p className="text-xs text-muted-foreground text-right">
            {percentUsed.toFixed(1)}% used
          </p>
        </>
      ) : (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 flex gap-2">
          <AlertCircle size={20} /> Budget exceeded by{" "}
          <span className="font-semibold">
            {(percentUsed - 100).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  )}
</CardContent>

    </Card>
  );
}