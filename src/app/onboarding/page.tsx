
"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { MoveRight, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const OnboardingStep = ({ step, label, active }: { step: number; label: string; active?: boolean }) => (
  <div className="flex items-center gap-2">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${active ? 'bg-white text-primary' : 'bg-white/20 text-white'}`}>
      {active ? step : <div className="w-3 h-3 rounded-full bg-white/50"></div>}
    </div>
    <span className={`font-medium ${active ? 'text-white' : 'text-white/70'}`}>{label}</span>
  </div>
);

export default function OnboardingPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (!user) {
        return (
             <div className="flex h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        )
    }

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-primary to-accent text-white">
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-8 w-8 text-white"
            >
                <path d="M12 2L1 9l4 1v9h3v-6h4v6h3v-9l4-1-11-7z" />
            </svg>
            <span className="text-xl font-bold">SomImports</span>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <X className="mr-2" />
            Skip
          </Link>
        </Button>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative w-full h-64 md:h-80 mb-8">
            <Image
              src="https://images.unsplash.com/photo-1521295121783-8a321d551ad2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxnbG9iYWwlMjB0cmFkZSUyMHxlbnwwfHx8fDE3NTM3MTI4NTV8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Global Trade Illustration"
              data-ai-hint="global trade"
              fill
              className="object-contain"
            />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Ahlan wa Sahlan! Welcome to SomImports
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12">
            Let's set up your import business profile in just 2 easy steps.
          </p>

          <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg transform transition-transform hover:scale-105 group" asChild>
            <Link href="/onboarding/profile">
              Get Started <MoveRight className="ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </main>

      <footer className="p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center justify-center gap-4 md:gap-8">
                <OnboardingStep step={1} label="Profile" active />
                <div className="h-0.5 w-16 bg-white/30 rounded-full"></div>
                <OnboardingStep step={2} label="Preferences" />
                <div className="h-0.5 w-16 bg-white/30 rounded-full"></div>
                <OnboardingStep step={3} label="Complete" />
            </div>
            <p className="text-sm text-white/70">
                Trusted by 500+ Somali businesses worldwide
            </p>
        </div>
      </footer>
    </div>
  );
}
