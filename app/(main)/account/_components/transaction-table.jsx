"use client";
import { bulkDeleteTransactions } from "@/actions/accounts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip } from "@/components/ui/tooltip";
import { categoryColors } from "@/data/categories";
import useFetch from "@/hooks/use-fetch";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { format, set } from "date-fns";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { BarLoader } from "react-spinners";
import { toast } from "sonner";

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const TransactionTable = ({ transactions, currentPage, totalPages, accountId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
  } = useFetch(bulkDeleteTransactions);

  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    //Apply the search  filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((transactions) =>
        transactions.description?.toLowerCase().includes(searchLower)
      );
    }

    //Apply recurring filter
    if (recurringFilter) {
      result = result.filter((transactions) => {
        if (recurringFilter === "recurring") return transactions.isRecurring;
        return !transactions.isRecurring;
      });
    }

    //filter for the type
    if (typeFilter) {
      result = result.filter(
        (transactions) => transactions.type === typeFilter
      );
    }

    //Results for the sorting
    result.sort((a, b) => {
      let comparision = 0;
      switch (sortConfig.field) {
        case "date":
          comparision = new Date(a.date) - new Date(b.date);
          break;

        case "amount":
          comparision = a.amount - b.amount;
          break;

        case "category":
          comparision = a.category.localeCompare(b.category);
          break;

        default:
          comparision = 0;
      }
      return sortConfig.direction === "asc" ? comparision : -comparision;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);
  const handlesort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field == field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item != id)
        : [...current, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === filteredAndSortedTransactions.length
        ? []
        : filteredAndSortedTransactions.map((t) => t.id)
    );
  };

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Ary you sure you want to delete ${selectedIds.length} transactions?`
      )
    ) {
      return;
    }

    deleteFn(selectedIds);
  };

  useEffect(() => {
    if (deleted && !deleteLoading) {
      toast.error("Transactions Deleted Successfully!");
    }
  }, [deleted, deleteLoading]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setRecurringFilter("");
    setTypeFilter("");
    setSelectedIds([]);
  };

  return (
    <div className="space-y-4">
      {deleteLoading && (
        <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 ">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search Transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={recurringFilter}
            onValueChange={(value) => setRecurringFilter(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">Recurring Only</SelectItem>
              <SelectItem value="non-recurring">Non-Recurring Only</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Selected [{selectedIds.length}]
              </Button>
            </div>
          )}

          {(searchTerm ||
            typeFilter ||
            recurringFilter ||
            selectedIds.length > 0) && (
            <div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleClearFilters}
                title="Clear Filters"
                className=""
              >
                <X className="h-4 w-5" />{" "}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Transactions  */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  onCheckedChange={handleSelectAll}
                  checked={
                    selectedIds.length ===
                      filteredAndSortedTransactions.length &&
                    filteredAndSortedTransactions.length > 0
                  }
                />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handlesort("date")}
              >
                {" "}
                <div className="flex items-center">
                  Date
                  {sortConfig.field === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>{" "}
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handlesort("category")}
              >
                <div className="flex items-center">
                  Category
                  {sortConfig.field === "category" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handlesort("amount")}
              >
                <div className="flex items-center justify-end">
                  Amount
                  {sortConfig.field === "amount" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No Transactions Found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Checkbox
                      onCheckedChange={() => handleSelect(transaction.id)}
                      checked={selectedIds.includes(transaction.id)}
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(transaction.date), "PP")}{" "}
                  </TableCell>
                  <TableCell>{transaction.description} </TableCell>
                  <TableCell className="capitalize ">
                    <span
                      style={{
                        background: categoryColors[transaction.category],
                      }}
                      className="px-2 rounded py-1 text-white text-sm "
                    >
                      {transaction.category}
                    </span>
                  </TableCell>
                  <TableCell
                    className="text-right font-medium"
                    style={{
                      color: transaction.type === "EXPENSE" ? "red" : "green",
                    }}
                  >
                    {transaction.type === "EXPENSE" ? "-" : "+"}₹
                    {Number(transaction.amount).toFixed(2)}
                    {/* Here some issue is occcuring which is only in the console not in the web , to check further */}
                  </TableCell>
                  <TableCell>
                    {transaction.isRecurring ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant={"outline"}
                              className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200"
                            >
                              <RefreshCw className="h-3 w-3" />
                              {
                                RECURRING_INTERVALS[
                                  transaction.recurringInterval
                                ]
                              }
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="bg-gray-800 text-white rounded px-2 py-1 text-sm">
                              <div className="font-medium">Next Date:</div>
                              <div>
                                {format(
                                  new Date(transaction.nextRecurringDate),
                                  "PP"
                                )}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Badge variant={"outline"} className="gap-1">
                        <Clock className="h-3 w-3" />
                        One-Time
                      </Badge>
                    )}{" "}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant={"ghost"} className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/transaction/create?edit=${transaction.id}`
                            )
                          }
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteFn([transaction.id])}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-center gap-2  mt-4">
        {currentPage > 1 && (
          <div className="flex gap-2">
            <Link
              href={`/account/${accountId}?page=1`}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Start
            </Link>
            <Link
              href={`/account/${accountId}?page=${currentPage - 1}`}
              className="px-3 py-1 rounded hover:bg-gray-200"
            >
              <ChevronLeft/>
            </Link>
          </div>
        )}

        {[...Array(5)].map((_, i) => {
          const offset = i - 2;
          const page = currentPage + offset;
          if (page < 1 || page > totalPages) return null;

          const distance = Math.abs(offset);
          let fontSize = "text-sm";
          if (distance === 0) fontSize = "text-lg font-bold";
          else if (distance === 1) fontSize = "text-base";
          // else keep text-sm for distance === 2  which is default as provided

          const colorClass =
            distance === 0 ? "bg-purple-600 text-white" :
              distance === 1 ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800";
          
          return (
            <Link
              key={page}
              href={`/account/${accountId}?page=${page}`}
              className={`px-3 py-1 rounded ${colorClass} ${fontSize} transition-all duration-200 hover:bg-gray-300 rounded-full`}
            >
              {page}
            </Link>
          )

        })}
        {currentPage < totalPages && (
          <div className="flex gap-2">
            <Link
              href={`/account/${accountId}?page=${currentPage + 1}`}
              className="px-3 py-1 rounded hover:bg-gray-200"
            >
              <ChevronRight className="" />
            </Link>
            <Link
              href={`/account/${accountId}?page=${totalPages}`}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              End
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionTable;
