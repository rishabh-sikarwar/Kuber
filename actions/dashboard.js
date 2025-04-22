"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }

  if (obj.ammount) {
    serialized.ammount = obj.ammount.toNumber();
    }
    return serialized
};

export async function createAccount(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    //convert the balance to float before saving the data
    const floatBalance = parseFloat(data.balance);

    if (isNaN(floatBalance)) throw new Error("Invalid balance value");

    //check if this is the first account and if yes then set it to default
    const existingAccount = await db.account.findMany({
      where: { userId: user.id },
    });
    const shouldBeDefault =
      existingAccount.length === 0 ? true : data.isDefault;

    //if the account is default then set all other accounts to not default
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true }, //first see if there is any default account
        data: { isDefault: false }, //if yes then set it to false
      });
    }

    //create the account
    const account = await db.account.create({
      data: {
        ...data,
        balance: floatBalance,
        userId: user.id,
        isDefault: shouldBeDefault,
      },
    });

    //as nextjs does not support the decimal value therefore before saving the data we need to convert it to number
    const serializedAccount = serializeTransaction(account);

    revalidatePath("/dashboard"); //this basically helps us to refetch the values of a page without refreshing the page

    return { success: true, data: serializedAccount };
  } catch (error) {
    console.log(error.message);
  }
}

export async function getUserAccount() {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const accounts = await db.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  const serializedAccounts = accounts.map(serializeTransaction);

  return serializedAccounts;
}
