"use server"

import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createTransaction(data) { 
    try {
        const { userId } = await auth()
        if(!userId) {
            throw new Error("User not authenticated")
        }

        // We will use arcjet to create rate limiting for the transaction creation
        const req = await request()
        //Check rate limit
        const decision = await aj.protect(req, {
            userId,
            requested: 1, //Specify how many tokens to consume 
        })

        if (decision.isDenied) {
            if (decision.reason.isRateLimit()) {
                const { remaining, reset } = decision.reason
                console.error({
                    code: "RATE_LIMIT_EXCEEDED",
                    details:{
                        remaining,
                        resetInSeconds: reset,
                    }
                })
                throw new Error("Too many requests, please try again later")
            }
            throw new Error("Request denied")
        }



        const user = await db.user.findUnique({
            where:{clerkUserId: userId}
        })
        if(!user) {
            throw new Error("User not found")
        }

        const account = await db.account.findUnique({
            where: {
                id: data.accountId,
                userId: user.id,
            }
        })
        if(!account) {
            throw new Error("Account not found")
        }

        const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount
        const newBalance = account.balance.toNumber() + balanceChange
        if(newBalance < 0) {
            throw new Error("Insufficient funds")
        }
        const transaction = await db.$transaction(async (tx) => {
            const newTransaction = await tx.transaction.create({
                data:{
                    ...data,
                    userId: user.id,
                    nextRecurringDate: data.isRecurring && data.recurringInterval?calculateNextRecurringDate(data.date, data.recurringInterval):null    
                }
            })
            await tx.account.update({
                where: { id: data.accountId },
                data: { balance: newBalance }
            });
            return newTransaction
        })

        revalidatePath("/dashboard")
        revalidatePath(`account/${transaction.accountId}`)

return {success: true, data:serializeAmount(transaction)}

    } catch (error) {
        throw new Error(`Error creating transaction: ${error.message}`)
    }
}
 

//Helper function to calculate the next recurring date based on the interval
function calculateNextRecurringDate(startDate, interval) {
    const date = new Date(startDate)
    switch (interval) {
        case "DAILY":
            date.setDate(date.getDate() + 1)
            break
        case "WEEKLY":
            date.setDate(date.getDate() + 7)
            break
        case "MONTHLY":
            date.setMonth(date.getMonth() + 1)
            break
        case "YEARLY":
            date.setFullYear(date.getFullYear() + 1)
            break
        default:
            throw new Error("Invalid interval")
    }
    return date 
}

const serializeAmount = (obj) => ({
    ...obj,
    amount: obj.amount.toNumber(),
})