"use client";

import { updateDefaultAccount } from "@/actions/accounts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
      <Card className="hover:shadow-md transition-shadow group relative">
        <Link href={`/account/${id}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">
              {name.toUpperCase()}
            </CardTitle>
            <Switch
              checked={isDefault}
              onClick={handleDefaultChange}
              disabled={updateDefaultLoading}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrencyAmount(
                convertCurrency(parseFloat(balance), userCurrency),
                userCurrency
              )}
            </div>
            <p className="text-xs text-muted-foreground">{type} ACCOUNT</p>
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-muted-foreground mt-2">
            <div className="flex items-center">
              <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
              Income
            </div>
            <div className="flex items-center">
              <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
              Expense
            </div>
          </CardFooter>
        </Link>
      </Card>
    </>
  );
};

export default AccountCard;
