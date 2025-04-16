import React from 'react'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const Header = () => {
  return (
    <div>
      <header className="flex justify-end items-center p-4 gap-4 h-16">
        <SignedOut>
          <SignInButton className='bg-blue-200 text-gray-600 py-2 px-4 rounded-md hover:bg-blue-300 transition duration-300 ease-in-out cursor-pointer'  />
          <SignUpButton className='bg-blue-200 text-gray-600 py-2 px-4 rounded-md hover:bg-blue-300 transition duration-300 ease-in-out cursor-pointer' />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
    </div>
  );
}

export default Header