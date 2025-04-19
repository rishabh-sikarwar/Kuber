"use client";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import Image from "next/image";

const HeroSection = () => {
  const imageRef = useRef();

  useEffect(() => {

    const imageElement = imageRef.current

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled")
      } else {
        imageElement.classList.remove("scrolled")
      }
    }

    window.addEventListener('scroll', handleScroll)
    return ()=> window.removeEventListener('scroll' , handleScroll)

  }, [])
  

  return (
    <div className="pb-20 px-4 ">
      <div className="text-center container mx-auto">
        <h1 className="text-5xl md:text-8xl lg:text-[105px] pb-6 gradient-title">
          Smarter Spending <br /> Stronger Savings <br /> Powered by AI
        </h1>
        <p className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto">
          {" "}
          Rupi Tracker analyzes your expenses and reveals where your money goes,
          reduce wasteful spending, and plan ahead with actionable insights.
        </p>
        <div className="flex justify-center space-x-4 pb-4">
          <Link href="/dashboard">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>
          <Link href="/demovideo">
            <Button variant="outline" size="lg" className="px-8">
              Watch Demo
            </Button>
          </Link>
        </div>
        <div className="hero-image-wrapper">
          <div ref={imageRef} className="hero-image">
            <Image
              src="https://res.cloudinary.com/dsrx8ljlr/image/upload/v1744958820/RupiTrack/j2juq9k9ho3kerd6voml.png"
              width={1280}
              height={720}
              alt="Dashboard Preview"
              className="rounded-lg shadow-2xl border mx-auto"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
