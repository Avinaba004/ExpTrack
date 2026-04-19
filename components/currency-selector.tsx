"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Globe } from "lucide-react";
import { getSupportedCurrencies } from "@/lib/currency";

interface CurrencySelectorProps {
  onCurrencyChange?: (currency: string) => void;
}

export function CurrencySelector({ onCurrencyChange }: CurrencySelectorProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>("INR");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const currencies = getSupportedCurrencies();

  // Fetch current currency on mount
  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const response = await fetch("/api/user/currency");
        if (response.ok) {
          const data = await response.json();
          setSelectedCurrency(data.currency);
        }
      } catch (error) {
        console.error("Failed to fetch currency:", error);
        toast.error("Failed to load currency preference");
      } finally {
        setInitializing(false);
      }
    };

    fetchCurrency();
  }, []);

  const handleCurrencyChange = async (currency: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/currency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency }),
      });

      if (!response.ok) {
        throw new Error("Failed to update currency");
      }

      setSelectedCurrency(currency);
      toast.success(`Currency changed to ${currency}`);
      
      if (onCurrencyChange) {
        onCurrencyChange(currency);
      }

      // Refresh the page to update all currency displays
      window.location.reload();
    } catch (error) {
      toast.error("Failed to update currency");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold">Preferred Currency</h3>
        </div>

        <div className="flex gap-2 items-center">
          <Select value={selectedCurrency} onValueChange={handleCurrencyChange} disabled={loading}>
            <SelectTrigger className="w-full max-w-[200px]">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs text-gray-500">
          All amounts will be converted to {selectedCurrency} for display
        </p>
      </div>
    </Card>
  );
}
