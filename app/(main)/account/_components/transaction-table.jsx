"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { categoryColors } from "@/data/categories";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  MoreHorizontal,
  RefreshCcw,
  Search,
  Trash2,
  X,
  Filter,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useMemo, useState } from "react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { bulkDeleteTransactions } from "@/actions/accounts";

const ITEMS_PER_PAGE = 10;

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const TransactionsTable = ({ transactions }) => {
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ field: "date", direction: "desc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deletedData,
    error: deleteError,
  } = useFetch(bulkDeleteTransactions);

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((t) =>
        t.description?.toLowerCase().includes(searchLower)
      );
    }
    if (recurringFilter) {
      filtered = filtered.filter((t) =>
        recurringFilter === "recurring" ? t.isRecurring : !t.isRecurring
      );
    }
    if (typeFilter) {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.field) {
        case "date": comparison = new Date(a.date) - new Date(b.date); break;
        case "amount": comparison = a.amount - b.amount; break;
        case "category": comparison = a.category.localeCompare(b.category); break;
        default: comparison = 0;
      }
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedTransactions, currentPage]);

  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction: current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((cid) => cid !== id) : [...current, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === paginatedTransactions.length
        ? []
        : paginatedTransactions.map((t) => t.id)
    );
  };

  const handleBulkDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} transactions?`
    );
    if (!confirmed) return;
    await deleteFn(selectedIds);
  };

  useEffect(() => {
    if (!deleteLoading && deletedData) {
      toast.success("Transactions deleted successfully!");
      setSelectedIds([]);
    }
    if (!deleteLoading && deleteError) {
      toast.error(deleteError.message || "Failed to delete transactions!");
    }
  }, [deletedData, deleteError, deleteLoading]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setSelectedIds([]);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSelectedIds([]);
  };

  const SortIcon = ({ field }) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === "asc"
      ? <ChevronUp className="ml-1 h-3.5 w-3.5" />
      : <ChevronDown className="ml-1 h-3.5 w-3.5" />;
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-4 border-b border-border/40 bg-muted/10">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 rounded-xl bg-background border-border/50 focus-visible:ring-primary/20 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 rounded-xl text-sm w-[130px] bg-background border-border/50">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={recurringFilter} onValueChange={(v) => setRecurringFilter(v)}>
            <SelectTrigger className="h-9 rounded-xl text-sm w-[160px] bg-background border-border/50">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">Recurring Only</SelectItem>
              <SelectItem value="non-recurring">One-Time Only</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="h-9 rounded-xl text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete ({selectedIds.length})
            </Button>
          )}

          {(searchTerm || typeFilter || recurringFilter) && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearFilters}
              className="h-9 w-9 rounded-xl border-border/50"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader className="bg-muted/20">
          <TableRow className="hover:bg-transparent border-border/40">
            <TableHead className="w-[44px] pl-4">
              <Checkbox
                onCheckedChange={handleSelectAll}
                checked={
                  selectedIds.length === paginatedTransactions.length &&
                  paginatedTransactions.length > 0
                }
              />
            </TableHead>
            <TableHead
              className="cursor-pointer select-none text-xs font-semibold uppercase tracking-wider py-3"
              onClick={() => handleSort("date")}
            >
              <div className="flex items-center">Date <SortIcon field="date" /></div>
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider py-3">Description</TableHead>
            <TableHead
              className="cursor-pointer select-none text-xs font-semibold uppercase tracking-wider py-3"
              onClick={() => handleSort("category")}
            >
              <div className="flex items-center">Category <SortIcon field="category" /></div>
            </TableHead>
            <TableHead
              className="cursor-pointer select-none text-xs font-semibold uppercase tracking-wider py-3 text-right"
              onClick={() => handleSort("amount")}
            >
              <div className="flex items-center justify-end">Amount <SortIcon field="amount" /></div>
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider py-3">Recurring</TableHead>
            <TableHead className="w-[44px] pr-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedTransactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Search className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm font-medium">No transactions found</p>
                  <p className="text-xs">Try adjusting your filters</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            paginatedTransactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                className={`border-border/40 transition-colors group ${
                  selectedIds.includes(transaction.id) ? "bg-primary/5" : "hover:bg-muted/20"
                }`}
              >
                <TableCell className="pl-4">
                  <Checkbox
                    onCheckedChange={() => handleSelect(transaction.id)}
                    checked={selectedIds.includes(transaction.id)}
                  />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground font-medium py-4">
                  {format(new Date(transaction.date), "dd MMM yyyy")}
                </TableCell>
                <TableCell className="py-4">
                  <span className="font-medium text-sm text-foreground">{transaction.description}</span>
                </TableCell>
                <TableCell className="py-4">
                  <span
                    style={{ background: categoryColors[transaction.category] }}
                    className="px-2.5 py-1 text-white text-[11px] font-semibold rounded-full uppercase tracking-wide"
                  >
                    {transaction.category}
                  </span>
                </TableCell>
                <TableCell className="text-right font-bold text-sm py-4">
                  <span className={transaction.type === "EXPENSE" ? "text-red-600" : "text-emerald-600"}>
                    {transaction.type === "EXPENSE" ? "−" : "+"}₹{Number(transaction.amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  {transaction.isRecurring ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant="outline"
                            className="gap-1.5 cursor-pointer bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 rounded-full text-[11px]"
                          >
                            <RefreshCcw className="h-3 w-3" />
                            {RECURRING_INTERVALS[transaction.recurringInterval]}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="bg-popover text-popover-foreground border shadow-md rounded-xl">
                          <p className="text-xs font-medium">Next: {format(new Date(transaction.nextRecurringDate), "dd MMM yyyy")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Badge
                      variant="outline"
                      className="gap-1.5 cursor-default bg-muted/30 text-muted-foreground border-border/40 rounded-full text-[11px]"
                    >
                      <Clock className="h-3 w-3" />
                      One-Time
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="pr-4 py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="h-8 w-8 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        variant="ghost"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/transaction/create?edit=${transaction.id}`)
                        }
                        className="cursor-pointer text-primary"
                      >
                        Edit Transaction
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive cursor-pointer"
                        onClick={() => deleteFn([transaction.id])}
                      >
                        Delete Transaction
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-border/40 bg-muted/10">
          <p className="text-xs text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedTransactions.length)} of {filteredAndSortedTransactions.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-border/50"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium text-muted-foreground px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-border/50"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsTable;
