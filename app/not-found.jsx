
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 to-gray-800 text-white px-4">
      <h1 className="text-6xl font-extrabold tracking-tight">404</h1>

      <p className="text-xl mt-4 text-center max-w-md">
        Oops! The page you are looking for doesn’t exist or has been moved.
      </p>

      <div className="mt-8">
        <Link href="/">
          <Button className='cursor-pointer'>Return Home</Button>
        </Link>
      </div>

      <div className="mt-12 animate-spin-slow">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-24 w-24 text-indigo-500 opacity-20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
    </div>
  );
};

export default NotFound;
