"use client";
import { updateBudget as updateBudgetAction } from "@/actions/budget";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import useFetch from "@/hooks/use-fetch";
import { Check, Pencil, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const BudgetProgress = ({ initialBudget, currentExpense }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const percentageUsed = initialBudget
    ? (currentExpense / initialBudget.amount) * 100
    : 0;

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updateBudget,
    error,
  } = useFetch(updateBudgetAction);

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    await updateBudgetFn(amount);
  };

  useEffect(() => {
    if (updateBudget?.success) {
      setIsEditing(false);
      toast.success("Budget Updated Successfully");
    }
  }, [updateBudget]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "failed to update budget");
    }
  }, [error]);

  const handleCancel = () => {
    setIsEditing(false);
    setNewBudget(initialBudget?.amount?.toString() || "");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="flex-1">
          <CardTitle>Monthly Budget for you Default Account</CardTitle>
          <div className="flex items-center gap-2 mt-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  autoFocus
                  placeholder="Enter Amount"
                  className="w-32"
                  disabled={isLoading}
                />
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  onClick={handleUpdateBudget}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <>
                <CardDescription>
                  {initialBudget
                    ? `₹${currentExpense.toFixed(
                        2
                      )} of ₹${initialBudget.amount.toFixed(2)} spent`
                    : "No Budget Set"}
                </CardDescription>
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  onClick={() => setIsEditing(true)}
                  className="h-6 w-6"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {initialBudget && (
          <div className="space-y-2">
            <Progress
              value={percentageUsed}
              extraStyles={`
                ${
                  percentageUsed >= 90
                    ? "bg-red-500"
                    : percentageUsed >= 75
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }
                        `}
                      />
                      <p className="text-right text-xs text-muted-foreground">
                          {percentageUsed.toFixed(1)}% used
                      </p>

          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetProgress;
