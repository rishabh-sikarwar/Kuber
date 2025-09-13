import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) return null;

  try {
    // Use upsert to find the user by email or create them if they don't exist
    const loggedInUser = await db.user.upsert({
      where: {
        // Find the user based on their email, which is always unique
        email: user.emailAddresses[0].emailAddress,
      },
      update: {
        // If they exist, update their details just in case they changed
        clerkUserId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        imageUrl: user.imageUrl,
      },
      create: {
        // If they don't exist, create a new user record
        clerkUserId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`,
        imageUrl: user.imageUrl,
      },
    });

    return loggedInUser;
  } catch (error) {
    console.error("Error in checkUser:", error.message);
    // Return null or handle the error appropriately
    return null;
  }
};
