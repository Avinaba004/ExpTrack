"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";
import { accountSchema } from "@/app/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { createAccount } from "@/actions/dashboard";
import { Loader } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

const CreateAccountDrawer = ({ children }) => {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  const {
    data: newAccount,
    loading: createAccountLoading,
    error,
    fn: createAccountFn,
  } = useFetch(createAccount);

  useEffect(() => {
    if (newAccount && !createAccountLoading) {
      toast.success("Account created successfully!");
      reset();
      setOpen(false);
    }
  }, [newAccount, createAccountLoading]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to create account");
    }
  }, [error]);

  const onSubmit = async (data) => {
    await createAccountFn(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px] p-6 bg-card/95 backdrop-blur-md border border-border/60 rounded-2xl shadow-xl">
        <DialogHeader className="space-y-1.5 mb-2">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Create New Account
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Add a new bank account, credit card, or digital wallet.
          </p>
        </DialogHeader>
        
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Account Name
            </label>
            <Input
              id="name"
              placeholder="e.g., Chase Checking, Cash Wallet"
              className="rounded-xl border-border/60 focus-visible:ring-primary/20 h-10 text-sm"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-500 font-medium mt-0.5">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="type" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Account Type
              </label>
              <Select
                defaultValue={watch("type")}
                onValueChange={(value) => setValue("type", value)}
              >
                <SelectTrigger id="type" className="rounded-xl border-border/60 focus:ring-primary/20 h-10 text-sm">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/60">
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-xs text-red-500 font-medium mt-0.5">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="balance" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Initial Balance
              </label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="rounded-xl border-border/60 focus-visible:ring-primary/20 h-10 text-sm"
                {...register("balance")}
              />
              {errors.balance && (
                <p className="text-xs text-red-500 font-medium mt-0.5">{errors.balance.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-muted/20 p-4 mt-2">
            <div className="space-y-0.5 pr-4">
              <label
                htmlFor="isDefault"
                className="text-xs font-semibold text-foreground cursor-pointer"
              >
                Set as Default
              </label>
              <p className="text-[11px] text-muted-foreground leading-normal">
                This account will be selected by default for new transactions.
              </p>
            </div>
            <Switch
              id="isDefault"
              onCheckedChange={(checked) => setValue("isDefault", checked)}
              checked={watch("isDefault")}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1 rounded-xl h-10 font-semibold border-border/60 hover:bg-muted/40 text-xs">
                Cancel
              </Button>
            </DialogClose>

            <Button type="submit" disabled={createAccountLoading} className="flex-1 rounded-xl h-10 font-semibold text-xs bg-primary hover:bg-primary/95 text-primary-foreground shadow-sm">
              {createAccountLoading ? (
                <>
                  <Loader className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAccountDrawer;
