"use client";

import { useEffect, useState } from "react";
import { convertCurrency, formatCurrencyAmount } from "@/lib/currency";

export function AccountBalance({ balance }) {
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

  return (
    <div className="text-3xl font-bold tracking-tight text-foreground">
      {formatCurrencyAmount(
        convertCurrency(parseFloat(balance), userCurrency),
        userCurrency
      )}
    </div>
  );
}
