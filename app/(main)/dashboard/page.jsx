import { getUserAccounts } from "@/actions/dashboard";
import { checkUser } from "@/lib/checkUser";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { CurrencySelector } from "@/components/currency-selector";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import React from "react";
import AccountCard from "./_components/account.card";
import { getCurrentBudget } from "@/actions/budget";
import {BudgetProgress} from "./_components/budget-progress";
import { ChatAssistantWidget } from "./_components/chat-widget";

export default async function DashboardPage() {
  await checkUser();

  const accounts = await getUserAccounts();

  const defaultACcount = accounts.find((account) => account.isDefault);

  let budgetData = null;
  if (defaultACcount) {
    budgetData = await getCurrentBudget(defaultACcount.id);
  }

  return (
    <div className="px-5">
      {/* Budget Progress */}
      {defaultACcount && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses || 0}
        />
      )}
      {/* Overview */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Account Grid */}
        <div className="md:col-span-2 lg:col-span-3">
          <div className="grid gap-4 md:grid-cols-2">
            <CreateAccountDrawer>
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
                <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
                  <Plus className="h-10 w-10 mb-2" />
                  <p className="text-sm font-medium">Add New Account</p>
                </CardContent>
              </Card>
            </CreateAccountDrawer>

            {accounts.length > 0 &&
              accounts?.map((account) => {
                return <AccountCard key={account.id} account={account} />;
              })}
          </div>
        </div>

        {/* Chat Assistant Sidebar */}
        <div className="md:col-span-2 lg:col-span-1 space-y-4">
          <CurrencySelector />
          <ChatAssistantWidget />
        </div>
      </div>
    </div>
  );
}
