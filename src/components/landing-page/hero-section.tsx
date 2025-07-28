
"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from 'next/link';
import { useLanguage } from "@/contexts/language-context";

export default function HeroSection() {
  const { content } = useLanguage();
  return (
    <section className="relative w-full h-[90vh] min-h-[600px] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-700 to-accent opacity-75 z-10"></div>
      <Image
        src="https://plus.unsplash.com/premium_photo-1661306453900-188317d3eb78?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Delivery driver"
        data-ai-hint="delivery driver"
        fill
        className="object-cover object-center"
        priority
      />
      <div className="relative container mx-auto px-4 md:px-6 z-20 h-full flex flex-col items-center justify-end pb-8 text-center">
        <div className="flex flex-col items-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in-down">
                {content.hero.headline}
            </h1>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-500">
                <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transform transition-transform hover:scale-105">
                    <Link href="/signup">{content.hero.cta1}</Link>
                </Button>
                <Button size="lg" asChild variant="outline" className="bg-transparent border-white text-white hover:bg-white/20 shadow-lg transform transition-transform hover:scale-105">
                    <Link href="#how-it-works">{content.hero.cta2}</Link>
                </Button>
            </div>
        </div>
      </div>
    </section>
  );
}
