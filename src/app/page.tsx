"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Fleet from "@/components/Fleet";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Stats from "@/components/Stats";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import Quote from "@/components/Quote";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="bg-white text-black overflow-x-hidden">

        <Hero />
        <Stats />
        <Fleet />
        <HowItWorks />
        <Pricing />
        <Quote/>
        <CTA />
        <Footer/>
      </main>
    </>
  );
}