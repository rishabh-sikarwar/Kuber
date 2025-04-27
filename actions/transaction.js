"use server";

import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // We will use arcjet to create rate limiting for the transaction creation

    const req = await request();
    const { headers } = req.headers; // ✅ get headers
    // We will use the headers to identify the user and the request
    const decision = await aj.protect(
      { headers },
      {
        userId,
        requested: 1,
      }
    );

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });
        throw new Error("Too many requests, please try again later");
      }
      throw new Error("Request denied");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) {
      throw new Error("User not found");
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });
    if (!account) {
      throw new Error("Account not found");
    }

    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;
    if (newBalance < 0) {
      throw new Error("Insufficient funds");
    }
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });
      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });
      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    console.error("❌ Error in createTransaction:", error);
    throw new Error(`Error creating transaction: ${error.message}`);
  }
}

//Helper function to calculate the next recurring date based on the interval
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);
  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      throw new Error("Invalid interval");
  }
  return date;
}

export async function scanRecipt(file) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    //Convert the file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    //convert the array buffer to base64 string
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `  Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object`;
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    //in the text we will have text in some /````JSON    {sjdfkjsdfjsjfsdjkl}   JSON````/ format   so to clean it we will use regex to remove unwanted text
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);
      return {
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
      };
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Failed to parse JSON response from Gemini AI");
    }
  } catch (error) {
    console.error("Error scanning receipt:", error.message);
    throw new Error("Failed to scan receipt. Please try again.");
  }
}

export async function getTransaction(id) {
  const { userId } = await auth()
  if(!userId) {
    throw new Error("User not authenticated")
  }

  const user = await db.user.findUnique({
    where:{clerkUserId : userId}
  })
  if(!user) {
    throw new Error("User not found")
  }
  const transaction = await db.transaction.findUnique({
    where: {
      id,
      userId: user.id
    }
  })

  if(!transaction) {
    throw new Error("Transaction not found")
  }
  return serializeAmount(transaction)
}

export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth()
    if(!userId) {
      throw new Error("User not authenticated")
    }
  
    const user = await db.user.findUnique({
      where:{clerkUserId : userId}
    })
    if(!user) {
      throw new Error("User not found")
    }
  
    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id
      },
      include: {
        account: true
      }
    })
  
    if (!originalTransaction) throw new Error("Transaction not found")
    
    //CalculateBalanceChange
    const oldBalanceChange = 
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber()
    
    const newBalanceChange = 
      data.type === "EXPENSE" ? -data.amount : data.amount
    
    const netBalanceChange = newBalanceChange - oldBalanceChange

    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: {
          id, 
          userId: user.id
        },
        data: {
          ...data,
          nextRecurringDate: 
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        }
      })
      //Update the account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: netBalanceChange
          }
        }
      })
      return updated
    })

    revalidatePath("/dashboard")
    revalidatePath(`/account/${data.accountId}`)
    return {success: true, data: serializeAmount(transaction)}
  
  } catch (error) {
    throw new Error(error.message)
  }
}