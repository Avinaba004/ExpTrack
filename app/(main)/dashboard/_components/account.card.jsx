"use client";

import { updateDefaultAccount } from "@/actions/accounts";
import { Card, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/use-fetch";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { convertCurrency, formatCurrencyAmount } from "@/lib/currency";

const AccountCard = ({ account }) => {
  const { name, type, balance, id, isDefault } = account;
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
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async () => {
    event.preventDefault();

    if (isDefault) {
      toast.warning("You need atleast one default account!");
      return;
    }
    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated!");
    }
  }, [updatedAccount, updateDefaultLoading]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update the default account!");
    }
  }, [error]);

  return (
    <>
      <Card className="hover:shadow-xl hover:border-primary/40 transition-all duration-300 group relative overflow-hidden bg-card/60 backdrop-blur-sm border-border/50 rounded-2xl flex flex-col justify-between h-full">
        <div className="p-6 pb-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold tracking-tight">
                {name}
              </CardTitle>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                {type}
              </span>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={isDefault}
                onCheckedChange={handleDefaultChange}
                disabled={updateDefaultLoading}
              />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-3xl font-bold tracking-tight text-foreground/95">
              {formatCurrencyAmount(
                convertCurrency(parseFloat(balance), userCurrency),
                userCurrency
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Available Balance</p>
          </div>
        </div>

        <div>
          {/* Card Footer Balance Summary */}
          <div className="flex justify-between text-xs text-muted-foreground px-6 py-3 border-t border-border/40 bg-muted/10">
            <div className="flex items-center">
              <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center mr-1.5">
                <ArrowUpRight className="h-3 w-3 text-emerald-600" />
              </div>
              <span className="font-semibold text-emerald-600">Income</span>
            </div>
            <div className="flex items-center">
              <div className="h-5 w-5 rounded-full bg-red-500/10 flex items-center justify-center mr-1.5">
                <ArrowDownRight className="h-3 w-3 text-red-600" />
              </div>
              <span className="font-semibold text-red-600">Expense</span>
            </div>
          </div>

          {/* Explicit Navigation Buttons */}
          <div className="p-4 bg-muted/20 border-t border-border/40 grid grid-cols-2 gap-2">
            <Link href={`/account/${id}`} className="w-full">
              <Button size="sm" className="w-full rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm py-2">
                Dashboard Preview
              </Button>
            </Link>
            <Link href={`/account/${id}?tab=transactions`} className="w-full">
              <Button size="sm" variant="outline" className="w-full rounded-xl text-xs font-semibold border-border/60 hover:bg-background/80 py-2">
                Transactions
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </>
  );
};

export default AccountCard;
