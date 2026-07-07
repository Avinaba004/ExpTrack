"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X, AlertCircle, TrendingUp, Target } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { convertCurrency, formatCurrencyAmount } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBudget } from "@/actions/budget";

export function BudgetProgress({ initialBudget, currentExpenses }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );
  const [userCurrency, setUserCurrency] = useState("INR");

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
    ? Math.min((currentExpenses / initialBudget.amount) * 100, 100)
    : 0;
  const isOverBudget = initialBudget && currentExpenses > initialBudget.amount;
  const remaining = initialBudget ? initialBudget.amount - currentExpenses : 0;
  const daysLeft = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();

  const progressColor = isOverBudget
    ? "bg-red-500"
    : percentUsed >= 75
    ? "bg-amber-500"
    : "bg-primary";

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

  if (!initialBudget) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 p-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Target className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">No monthly budget set</p>
          <p className="text-sm text-muted-foreground">Set a budget to track your spending habits</p>
        </div>
        <Button
          size="sm"
          className="rounded-xl"
          onClick={() => setIsEditing(true)}
        >
          {isEditing ? null : "Set Budget"}
        </Button>
        {isEditing && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
              className="w-32 h-9"
              placeholder="Amount"
              autoFocus
              disabled={isLoading}
            />
            <Button variant="ghost" size="icon" onClick={handleUpdateBudget} disabled={isLoading}>
              <Check className="h-4 w-4 text-emerald-600" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCancel} disabled={isLoading}>
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm p-6 space-y-5">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">Monthly Budget Status</p>
            <p className="text-xs text-muted-foreground">Default account · {new Date().toLocaleString('default', { month: 'long' })}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${
            isOverBudget ? "bg-red-500/10 text-red-600" 
            : percentUsed >= 75 ? "bg-amber-500/10 text-amber-600"
            : "bg-emerald-500/10 text-emerald-600"
          }`}>
            {percentUsed.toFixed(0)}% Used
          </span>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="w-32 h-8 text-sm rounded-lg"
                placeholder="Enter amount"
                autoFocus
                disabled={isLoading}
              />
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleUpdateBudget} disabled={isLoading}>
                <Check className="h-4 w-4 text-emerald-600" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancel} disabled={isLoading}>
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-semibold border-border/60 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-3 w-3 mr-1.5" />
              Adjust Budget
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-3 w-full bg-muted/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${progressColor}`}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Spent: <span className="font-semibold text-foreground">
              {formatCurrencyAmount(convertCurrency(currentExpenses, userCurrency), userCurrency)}
            </span>
          </span>
          <span>
            Total Budget: <span className="font-semibold text-foreground">
              {formatCurrencyAmount(convertCurrency(initialBudget.amount, userCurrency), userCurrency)}
            </span>
          </span>
        </div>
      </div>

      {/* Stats Row */}
      {isOverBudget ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={16} />
          <span>Budget exceeded by <span className="font-bold">{(percentUsed - 100).toFixed(1)}%</span>. Consider reviewing your expenses.</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/30 rounded-xl p-3 text-center border border-border/40">
            <p className="text-xs text-muted-foreground font-medium mb-1">Remaining</p>
            <p className="text-lg font-bold text-emerald-600">
              {formatCurrencyAmount(convertCurrency(Math.max(0, remaining), userCurrency), userCurrency)}
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-3 text-center border border-border/40">
            <p className="text-xs text-muted-foreground font-medium mb-1">Days Left</p>
            <p className="text-lg font-bold text-primary">{daysLeft} days</p>
          </div>
        </div>
      )}
    </div>
  );
}