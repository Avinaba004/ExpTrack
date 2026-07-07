import { getUserAccounts } from "@/actions/dashboard";
import { checkUser } from "@/lib/checkUser";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { CurrencySelector } from "@/components/currency-selector";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Wallet } from "lucide-react";
import React from "react";
import AccountCard from "./_components/account.card";
import { getCurrentBudget } from "@/actions/budget";
import { BudgetProgress } from "./_components/budget-progress";

export default async function DashboardPage() {
  await checkUser();

  const accounts = await getUserAccounts();
  const defaultAccount = accounts.find((account) => account.isDefault);

  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Accounts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your accounts and track your finances.
          </p>
        </div>
        <CurrencySelector />
      </div>

      {/* Budget Progress Banner */}
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses || 0}
        />
      )}

      {/* Account Grid */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Wallet size={14} />
          Your Accounts
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {/* Add Account Card */}
          <CreateAccountDrawer>
            <Card className="h-full border-dashed border-2 border-border/60 hover:border-primary/50 hover:bg-muted/20 transition-all duration-300 cursor-pointer bg-transparent rounded-2xl group">
              <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full min-h-[200px] gap-3">
                <div className="h-14 w-14 rounded-2xl bg-muted/40 group-hover:bg-primary/10 flex items-center justify-center transition-colors duration-300">
                  <Plus className="h-7 w-7 group-hover:text-primary transition-colors duration-300" />
                </div>
                <div className="text-center">
                  <p className="font-semibold group-hover:text-primary transition-colors duration-300">Add New Account</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Connect a bank or wallet</p>
                </div>
              </CardContent>
            </Card>
          </CreateAccountDrawer>

          {accounts.length > 0 &&
            accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
        </div>
      </div>
    </div>
  );
}
