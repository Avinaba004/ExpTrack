import { getAccountWithTransactions } from "@/actions/accounts";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";
import TransactionsTable from "../_components/transaction-table";
import { BarLoader } from "react-spinners";
import AccountChart from "../_components/account-chart";
import { AccountBalance } from "../_components/account-balance";

const AccountsPage = async ({ params }) => {
  const { id } = await params;
  const accountData = await getAccountWithTransactions(id);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;

  return (
    <div className="space-y-8 px-5">
      <div className=" flex gap-4 items-end justify-between">
        <div>
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 bg-clip-text text-transparent">
            {account.name.toUpperCase()}
          </h1>

          <p className="text-muted-foreground">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
            Account
          </p>
        </div>

        <div className="text-right pb-2">
          <AccountBalance balance={account.balance} />
          <p className="text-sm text-muted-foreground">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <Suspense
        fallback={
          <BarLoader
            className="mt-4"
            width="100%"
            cssOverride={{
              background: "linear-gradient(90deg, #a855f7, #facc15)",
            }}
          />
        }
      >
        <AccountChart transactions={transactions} />
      </Suspense>

      {/* Transactions table */}
      <Suspense
        fallback={
          <BarLoader
            className="mt-4"
            width="100%"
            cssOverride={{
              background: "linear-gradient(90deg, #a855f7, #facc15)",
            }}
          />
        }
      >
        <TransactionsTable transactions={transactions} />
      </Suspense>
    </div>
  );
};

export default AccountsPage;
