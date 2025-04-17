"use client";
import React from "react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox } from "lucide-react";

const Header = () => {
  return (
    <div className="flex justify-center items-center p-4 gap-4 h-16 fixed top-0 bg-white/80 backdrop-blur-xs z-50 border-b mt-3 w-full ">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <Image
            src={
              "https://res.cloudinary.com/dsrx8ljlr/image/upload/v1744826515/RupiTrack/yyhguyx8ibtocvghmkyp.png"
            }
            alt="LOGO"
            height={60}
            width={200}
            className="object-contain w-auto h-20 mb-3"
          />
        </Link>

        <div className="flex items-center space-x-4">
          <SignedOut>
            <SignInButton className="bg-blue-200 text-gray-600 py-2 px-4 rounded-md hover:bg-blue-300 transition duration-300 ease-in-out cursor-pointer">
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
              <Button variant="outline">
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>
            <Link href="/transaction/create">
              <Button variant="outline" className='flex items-center gap-2'>
                <PenBox size={18} />
                <span className="hidden md:inline">Add Transactions</span>
              </Button>
            </Link>
            <UserButton appearance={{
              elements: {
                avatarBox: "h-10 w-10",
              }
            }} />
          </SignedIn>
        </div>
      </nav>
    </div>
  );
};

export default Header;
