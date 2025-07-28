
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function OnboardingCompletePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserName(docSnap.data().fullName || 'Partner');
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-secondary/50 p-4 sm:p-8 flex items-center justify-center">
      <div className="max-w-2xl mx-auto w-full">
        <header className="mb-8">
          <Progress value={100} className="mb-2" />
          <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" /> Setup Complete!
          </p>
        </header>

        <Card className="shadow-lg text-center overflow-hidden">
            <div className="relative h-56 w-full">
                 <Image src="https://images.unsplash.com/photo-1503266980949-bd30d04d0b7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxjZWxlYnJhdGlvbnxlbnwwfHx8fDE3NTM2MDA5OTR8MA&ixlib=rb-4.1.0&q=80&w=1080" data-ai-hint="celebration success" alt="Onboarding Complete" fill className="object-cover" />
            </div>
          <CardHeader className="pt-8">
            <CardTitle className="text-3xl font-bold">You're All Set, {userName.split(' ')[0]}!</CardTitle>
            <CardDescription className="text-lg text-muted-foreground pt-2">
                Your SomImports profile is ready. You can now explore your dashboard, request quotes, and manage your imports all in one place.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Button size="lg" asChild className="bg-gradient-to-r from-primary to-accent text-white group">
                <Link href="/dashboard">
                    Go to Your Dashboard <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-6">
                Need to make changes later? You can always update your profile and preferences from your account settings.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
