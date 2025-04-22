"use client";
import { updateDefaultAccouunt } from "@/actions/accounts";
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
import React, { useEffect } from "react";
import { toast } from "sonner";

const AccountCard = ({ account }) => {
  const { type, name, balance, id, isDefault } = account;

  const {
    loading: updadeDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccouunt);

  const handleDefaultChange = async (event) => {
    event.preventDefault()

    if (isDefault) {
      toast.warning("You need atleast one default account")
      return; //don't allow to toggle off the default account
    }

    await updateDefaultFn(id)

  }

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default Account Updated Successfully")
    }

  }, [updatedAccount, updadeDefaultLoading])
  
  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update User Account")
    }
  }, [error])
  
  

  return (
    <Card className="hover:shadow-md transition-shadow group relative">
      <Link href={`/account/${id}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium capitalize">
            {name}
          </CardTitle>
          <Switch
            checked={isDefault}
            onClick={handleDefaultChange}
            disabled={updadeDefaultLoading}
            className="cursor-pointer hover:scale-105 hover:ring-2 hover:ring-blue-400 transition-all duration-150 rounded-full"
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{parseFloat(balance).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account{" "}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <ArrowUpRight className="text-green-500 mr-1 h-4 w-4" />
            Income
          </div>
          <div className="flex items-center">
            <ArrowDownRight className="text-red-500 mr-1 h-4 w-4" />
            Expense
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default AccountCard;
