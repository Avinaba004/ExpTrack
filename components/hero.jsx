"use client";
import { useRef, useEffect } from "react"
import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";

const HeroSection = () => {

    const imageRef=useRef();

    useEffect(()=>{
    const imageElement=imageRef.current;
    
    const handleScroll=()=>{
        const scrollPosition= window.scrollY;
        const scrollThreshold=100;

        if(scrollPosition>scrollThreshold){
            imageElement.classList.add("scrolled")
        }
        else{
            imageElement.classList.remove("scrolled")
        }
    }
    window.addEventListener("scroll",handleScroll)
    return ()=>window.removeEventListener("scroll",handleScroll)
    },[])
  return (
    <div className="w-full pb-20 px-4">
    <div className="container mx-auto text-center">
      <h1 className="font-bold text-6xl text-blue-800 text-center">Manage your Finances <br /> with Intelligence ֎🇦🇮</h1>
      <p className="text-center mt-5 text-3xl text-blue-700">A smart expense tracking app that helps users manage and analyze <br />their finances easily.</p>
     </div>
      <div className="flex space-x-4 justify-center mt-5 pb-4">
        <Link href="/dashboard">
           <Button size="lg" className="px-8">Get Started</Button>
        </Link>
        <Link href="/dashboard">
           <Button size="lg" className="px-8" variant="outline">Get Demo</Button>
        </Link>
      </div>
      <div className="hero-image-wrapper">
      <div ref={imageRef} className="hero-image">
        <Image
        src="/banner.png"
        alt="banner"
        height={400}
        width={900}
        className="rounded-lg shadow-4xl border mx-auto w-full max-w-[900px]"
        priority
         />
         </div>
      </div>
    </div>
  )
}

export default HeroSection
