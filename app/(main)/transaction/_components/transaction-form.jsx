"use client";

import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTransaction, updateTransaction, getTransaction } from "@/actions/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema } from "@/app/lib/schema";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useFetch from "@/hooks/use-fetch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ReceiptScanner } from "./receipt-scanner";
import { convertCurrency, formatCurrencyAmount } from "@/lib/currency";

const AddTransactionForm = ({ accounts, categories }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userCurrency, setUserCurrency] = useState("INR");
  const [isEditing, setIsEditing] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState(null);

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
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      amount: "",
      description: "",
      accountId: accounts.find((ac) => ac.isDefault)?.id,
      date: new Date(),
      isRecurring: false,
    },
  });

  // Load transaction data if editing
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId) {
      setEditingTransactionId(editId);
      setIsEditing(true);

      const fetchTransactionData = async () => {
        try {
          const result = await getTransaction(editId);
          if (result.success) {
            const txData = result.data;
            // Populate form with existing data
            setValue("type", txData.type);
            setValue("amount", txData.amount.toString());
            setValue("description", txData.description || "");
            setValue("accountId", txData.accountId);
            setValue("category", txData.category);
            setValue("date", new Date(txData.date));
            setValue("isRecurring", txData.isRecurring);
            if (txData.recurringInterval) {
              setValue("recurringInterval", txData.recurringInterval);
            }
          } else {
            toast.error("Failed to load transaction");
          }
        } catch (error) {
          console.error("Error loading transaction:", error);
          toast.error("Failed to load transaction");
        }
      };

      fetchTransactionData();
    }
  }, [searchParams, setValue]);

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(isEditing ? updateTransaction : createTransaction);

  const onSubmit = (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };
    if (isEditing && editingTransactionId) {
      transactionFn(editingTransactionId, formData);
    } else {
      transactionFn(formData);
    }
  };

  useEffect(() => {
    if (transactionResult && !transactionLoading) {
      const message = isEditing ? "Transaction updated successfully" : "Transaction created successfully";
      toast.success(message);
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading, isEditing]);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  // Handle receipt data extraction
  const handleReceiptExtracted = (receiptData, allCategories) => {
    // Set amount
    setValue("amount", receiptData.total.toString());

    // Set type to EXPENSE (receipts are always expenses)
    setValue("type", "EXPENSE");

    // Set date
    const receiptDate = new Date(receiptData.date);
    setValue("date", receiptDate);

    // Set description to vendor name
    setValue("description", receiptData.vendor);

    // Find and set category based on extracted category
    const extractedCategory = allCategories.find(
      (cat) =>
        cat.type === "EXPENSE" &&
        cat.name.toLowerCase() === receiptData.category.toLowerCase()
    ) || allCategories.find((cat) => cat.type === "EXPENSE" && cat.name === "Food");

    if (extractedCategory) {
      setValue("category", extractedCategory.id);
    }

    toast.info(`Receipt data populated. Please review and submit.`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* AI Receipt Scanner */}
      <ReceiptScanner
        onDataExtracted={handleReceiptExtracted}
        categories={categories}
      />

      {/* Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <Select
          onValueChange={(value) => setValue("type", value)}
          defaultValue={type}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>
      {/* Amount and Account */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount")}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Account</label>
          <Select
            onValueChange={(value) => setValue("accountId", value)}
            defaultValue={getValues("accountId")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} ({formatCurrencyAmount(
                    convertCurrency(parseFloat(account.balance), userCurrency),
                    userCurrency
                  )})
                </SelectItem>
              ))}
              <CreateAccountDrawer>
                <Button
                  variant="ghost"
                  className="w-full select-none items-center text-sm outline-none"
                >
                  Create Account
                </Button>
              </CreateAccountDrawer>
            </SelectContent>
          </Select>
          {errors.accountId && (
            <p className="text-sm text-red-500">{errors.accountId.message}</p>
          )}
        </div>
      </div>
      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select
          onValueChange={(value) => setValue("category", value)}
          defaultValue={getValues("category")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>
      {/* Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full pl-3 text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => setValue("date", date)}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>
      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Input placeholder="Enter description" {...register("description")} />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Recurring Toggle */}
      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <label className="text-base font-medium">Recurring Transaction</label>
          <div className="text-sm text-muted-foreground">
            Set up a recurring schedule for this transaction
          </div>
        </div>
        <Switch
          checked={isRecurring}
          onCheckedChange={(checked) => setValue("isRecurring", checked)}
        />
      </div>
      {/* Recurring Interval */}
      {isRecurring && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Recurring Interval</label>
          <Select
            onValueChange={(value) => setValue("recurringInterval", value)}
            defaultValue={getValues("recurringInterval")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.recurringInterval && (
            <p className="text-sm text-red-500">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}
      {/* Actions */}
      <div className="flex gap-4 items-center justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          className="w-[200px]"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="w-[200px]"
          disabled={transactionLoading}
        >
          {isEditing ? "Update Transaction" : "Create Transaction"}
        </Button>
      </div>
    </form>
  );
};

export default AddTransactionForm;
