
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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

const ADMIN_EMAIL = "mahir@gmail.com";

export default function SignUpPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(data: FormData) {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                fullName: data.fullName,
                email: data.email,
            });

            toast({
                title: "Account Created!",
                description: "You have successfully created your account.",
            });
            
            if (user.email === ADMIN_EMAIL) {
                router.push("/admin/dashboard");
            } else {
                router.push("/onboarding");
            }

        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    }

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
                <Card className="w-full max-w-lg shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">Create Your SomImports Account</CardTitle>
                        <CardDescription>Join us to simplify your product sourcing.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid md:grid-cols-2 gap-4">
                                     <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white group" disabled={loading}>
                                    {loading ? "Creating Account..." : "Create Account"} <MoveRight className="ml-2 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex justify-center text-center text-sm">
                        <p>Already have an account? <Link href="/login" className="underline font-semibold">Sign In</Link></p>
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}

    