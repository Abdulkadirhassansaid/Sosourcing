
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MoveRight } from "lucide-react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

const ADMIN_EMAIL = "mahir@gmail.com";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type FormData = z.infer<typeof formSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (data: FormData) => {
    setLoading(true);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;

        if (user.email !== ADMIN_EMAIL) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists() && userDocSnap.data().isBlocked) {
                await auth.signOut();
                toast({
                    variant: "destructive",
                    title: "Account Blocked",
                    description: "Your account has been blocked. Please contact support.",
                });
                setLoading(false);
                return;
            }
        }
        
        toast({
            title: "Signed In!",
            description: "You have successfully signed in.",
        });

        if (user.email === ADMIN_EMAIL) {
            router.push("/admin/dashboard");
        } else {
            router.push("/dashboard");
        }

    } catch (error: any) {
        let errorMessage = "An unknown error occurred.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            errorMessage = "Invalid email or password. Please try again.";
        } else {
            errorMessage = error.message;
        }
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: errorMessage,
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen auth-bg">
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                <div className="mr-4 flex">
                <Link href="/" className="flex items-center space-x-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-6 w-6 text-primary"
                        >
                        <path d="M12 2L1 9l4 1v9h3v-6h4v6h3v-9l4-1-11-7z" />
                        <path fill="none" d="M0 0h24v24H0z" />
                    </svg>
                    <span className="font-bold">SomImports</span>
                </Link>
                </div>
            </div>
        </header>

        <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
            <CardDescription>Sign in to continue to SomImports.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="m@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Password</FormLabel>
                                        <Link href="#" className="text-sm underline">
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white group" disabled={loading}>
                            {loading ? "Signing In..." : 'Sign In'} <MoveRight className="ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-center text-center text-sm">
                <p>Don't have an account? <Link href="/signup" className="underline font-semibold">Sign Up</Link></p>
            </CardFooter>
        </Card>
        </main>
    </div>
  );
}
