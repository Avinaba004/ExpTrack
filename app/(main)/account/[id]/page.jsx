import { getAccountWithTransactions } from "@/actions/accounts";
import { getCurrentBudget } from "@/actions/budget";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";
import Link from "next/link";
import TransactionsTable from "../_components/transaction-table";
import AccountChart from "../_components/account-chart";
import { AccountBalance } from "../_components/account-balance";
import { 
  Home as HomeIcon, 
  CreditCard, 
  Utensils, 
  PiggyBank, 
  Plus, 
  FileText, 
  ArrowLeft, 
  Sparkles, 
  TrendingUp, 
  Bot, 
  Check, 
  ChevronRight,
  ShoppingBag,
  Wrench,
  Dumbbell
} from "lucide-react";
import { Button } from "@/components/ui/button";

const AccountsPage = async ({ params, searchParams }) => {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const view = resolvedSearchParams?.view || "overview";

  const accountData = await getAccountWithTransactions(id);
  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;
  const budgetData = await getCurrentBudget(id);

  // Filter current month transactions
  const now = new Date();
  const currentMonthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalSpentThisMonth = currentMonthTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Categorize expenses
  const fixedCosts = currentMonthTransactions
    .filter((t) => t.type === "EXPENSE" && ["UTILITIES", "BILLS", "RENT", "TAX", "INSURANCE"].includes(t.category.toUpperCase()))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const subscriptions = currentMonthTransactions
    .filter((t) => t.type === "EXPENSE" && ["ENTERTAINMENT", "EDUCATION"].includes(t.category.toUpperCase()))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const lifestyle = currentMonthTransactions
    .filter((t) => t.type === "EXPENSE" && ["FOOD", "SHOPPING", "TRAVEL", "LIFESTYLE", "OTHER"].includes(t.category.toUpperCase()))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Budget calculations
  const budgetLimit = budgetData?.budget?.amount ? parseFloat(budgetData.budget.amount) : 30000;
  const spentAmount = totalSpentThisMonth; 
  const percentUsed = budgetLimit > 0 ? Math.min(Math.round((spentAmount / budgetLimit) * 100), 100) : 0;
  const isOverBudget = spentAmount > budgetLimit;

  // Real database metrics for UI tiles
  const displayFixedCosts = fixedCosts;
  const displaySubscriptions = subscriptions;
  const displayLifestyle = lifestyle;
  const displayRemaining = Math.max(0, budgetLimit - spentAmount);

  // Helper to map transaction category to lucide icons
  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case "food":
      case "dining":
        return <Utensils className="h-4.5 w-4.5 text-orange-600" />;
      case "shopping":
        return <ShoppingBag className="h-4.5 w-4.5 text-blue-600" />;
      case "utilities":
      case "bills":
        return <Wrench className="h-4.5 w-4.5 text-amber-600" />;
      case "health":
      case "gym":
        return <Dumbbell className="h-4.5 w-4.5 text-emerald-600" />;
      default:
        return <CreditCard className="h-4.5 w-4.5 text-muted-foreground" />;
    }
  };

  // Transaction history view
  if (view === "all") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/account/${id}`}>
              <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
                <ArrowLeft size={16} />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">{account.name} History</h1>
              <p className="text-xs text-muted-foreground">Detailed transaction logs and trends</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
          <Suspense fallback={<div className="h-[300px] w-full bg-muted/20 animate-pulse" />}>
            <AccountChart transactions={transactions} />
          </Suspense>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
          <Suspense fallback={<div className="h-64 w-full bg-muted/20 animate-pulse" />}>
            <TransactionsTable transactions={transactions} />
          </Suspense>
        </div>
      </div>
    );
  }

  // Dashboard Overview layout matching design
  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{account.name} checking details</p>
        </div>
        <Link href="/transaction/create">
          <Button className="rounded-full px-5 py-2 font-semibold shadow-sm text-xs gap-1.5 h-9 bg-primary hover:bg-primary/95 text-primary-foreground">
            <Plus size={14} /> Add Transaction
          </Button>
        </Link>
      </div>

      {/* Main content grid split */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (Stats & Transactions) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly Budget Card */}
          <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 shadow-sm flex flex-col space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-foreground">Monthly Budget Status</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Spent: <span className="font-semibold text-foreground">₹{spentAmount.toLocaleString("en-IN")}</span> of ₹{budgetLimit.toLocaleString("en-IN")} limit
                </p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isOverBudget ? "bg-red-500/10 text-red-600 border border-red-500/20" : "bg-primary/10 text-primary border border-primary/20"}`}>
                {percentUsed}% Used
              </span>
            </div>

            <div className="h-2.5 w-full bg-muted/60 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? "bg-red-500" : "bg-primary"}`} 
                style={{ width: `${percentUsed}%` }}
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold px-4 border-border/60 hover:bg-background/80 py-1.5 h-8">
                  Adjust Budget
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold px-4 border-border/60 hover:bg-background/80 py-1.5 h-8">
                Export PDF
              </Button>
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Fixed Costs */}
            <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-xl bg-blue-500/10 shrink-0">
                  <HomeIcon className="h-4.5 w-4.5 text-blue-600" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/15">
                  Stable
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Fixed Costs</p>
                <p className="text-lg font-bold text-foreground mt-0.5">₹{displayFixedCosts.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-muted-foreground/80 mt-1">Rent, Utils, Ins</p>
              </div>
            </div>

            {/* Subscriptions */}
            <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-xl bg-purple-500/10 shrink-0">
                  <CreditCard className="h-4.5 w-4.5 text-purple-600" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/15">
                  +5%
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Subscriptions</p>
                <p className="text-lg font-bold text-foreground mt-0.5">₹{displaySubscriptions.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-muted-foreground/80 mt-1">12 Active Services</p>
              </div>
            </div>

            {/* Lifestyle */}
            <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-xl bg-orange-500/10 shrink-0">
                  <Utensils className="h-4.5 w-4.5 text-orange-600" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/15">
                  Over Limit
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Lifestyle</p>
                <p className="text-lg font-bold text-foreground mt-0.5">₹{displayLifestyle.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-muted-foreground/80 mt-1">Dining, Travel</p>
              </div>
            </div>

            {/* Remaining Budget */}
            <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-xl bg-emerald-500/10 shrink-0">
                  <PiggyBank className="h-4.5 w-4.5 text-emerald-600" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/15">
                  On Track
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Remaining Budget</p>
                <p className="text-lg font-bold text-foreground mt-0.5">₹{displayRemaining.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-muted-foreground/80 mt-1">12 Days Left</p>
              </div>
            </div>
          </div>

          {/* Recent Transactions List */}
          <div className="rounded-2xl border border-border/50 bg-card shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-foreground">Recent Transactions</h3>
              <Link href={`/account/${id}?view=all`}>
                <span className="text-xs text-primary hover:underline font-semibold cursor-pointer">
                  View All
                </span>
              </Link>
            </div>

            <div className="space-y-3">
              {transactions.slice(0, 4).map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-muted/30 transition-colors border border-border/40 bg-muted/10">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-background border border-border/50 flex items-center justify-center shrink-0 shadow-sm">
                      {getCategoryIcon(tx.category)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground/90">{tx.description || tx.category}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {tx.category} • {new Date(tx.date).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-semibold uppercase bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                      COMPLETED
                    </span>
                    <span className={`text-sm font-bold ${tx.type === "EXPENSE" ? "text-red-600" : "text-emerald-600"}`}>
                      {tx.type === "EXPENSE" ? "-" : "+"}₹{Number(tx.amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No transactions recorded. Add a transaction to start tracking.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (AI Insight Panel) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden flex flex-col h-full">
            {/* Visual Header */}
            <div className="relative h-44 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-5 flex flex-col justify-between text-white">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-zinc-900 to-black pointer-events-none" />
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  AI Financial Dashboard
                </span>
                <Bot className="h-5 w-5 text-white/90 animate-pulse" />
              </div>
              <div>
                <p className="text-xs text-white/70 font-semibold uppercase tracking-wider">ExpTrack AI Assistant</p>
                <h4 className="text-lg font-bold mt-0.5">Personalized Guidance</h4>
              </div>
            </div>

            {/* Insight Content */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-6 bg-background/50">
              <div className="space-y-3">
                <h4 className="text-base font-bold text-foreground">Spending Insight</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Based on your transaction logs for this month, your lifestyle spending (such as food and dining) is running 15% higher than your average. Reducing this slightly could free up resources for your savings goals!
                </p>
              </div>

              <div className="space-y-2.5">
                <Link href="/investment/chat" className="w-full block">
                  <Button className="w-full rounded-xl text-xs font-semibold py-2 bg-primary hover:bg-primary/95 text-primary-foreground shadow-sm">
                    Analyze Dining Trends
                  </Button>
                </Link>
                <Button variant="outline" className="w-full rounded-xl text-xs font-semibold py-2 border-border/60 hover:bg-muted/40">
                  Dismiss Insight
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsPage;
