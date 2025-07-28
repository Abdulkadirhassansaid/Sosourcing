
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  companyName: z.string().min(2, 'Company name is required'),
  industry: z.string().min(1, 'Please select an industry'),
  country: z.string().min(2, 'Country is required'),
  city: z.string().min(2, 'City is required'),
  employeeCount: z.number().min(1, 'Please specify the number of employees'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const industries = ["Retail", "Wholesale", "E-commerce", "Construction", "Hospitality", "Restaurant", "Other"];

export default function BusinessProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      companyName: '',
      industry: '',
      country: 'Somalia',
      city: '',
      employeeCount: 10,
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().fullName) {
            form.setValue('fullName', docSnap.data().fullName);
        }
        if (docSnap.exists() && docSnap.data().profile) {
            const profile = docSnap.data().profile;
            form.setValue('companyName', profile.companyName);
            form.setValue('industry', profile.industry);
            form.setValue('country', profile.country);
            form.setValue('city', profile.city);
            form.setValue('employeeCount', profile.employeeCount);
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router, form]);

 const onSubmit = async (data: ProfileFormData) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }
    setLoading(true);
    try {
      await setDoc(doc(db, "users", user.uid), { 
        fullName: data.fullName,
        profile: data 
      }, { merge: true });
      toast({
          title: 'Profile Saved!',
          description: "Your business profile has been created.",
      });
      router.push('/onboarding/preferences');
    } catch (error: any) {
       toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was an issue saving your profile. Please check your network and try again. If the problem persists, contact support.",
      });
    } finally {
        setLoading(false);
    }
  };
  
  if (!user) {
    return <div className="flex h-screen items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-secondary/50 p-4 sm:p-8 flex items-center justify-center">
        <div className="max-w-2xl mx-auto w-full">
            <header className="mb-8">
              <Progress value={33} className="mb-2" />
              <p className="text-sm text-muted-foreground text-center">Step 1 of 3</p>
            </header>
            <Card className="shadow-lg w-full">
                <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Tell us about your business</CardTitle>
                <CardDescription className="text-center">This one-time setup helps us tailor our service for you.</CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="fullName" render={({ field }) => (
                        <FormItem><FormLabel>Your Full Name</FormLabel><FormControl><Input {...field} placeholder="e.g. John Doe" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="companyName" render={({ field }) => (
                        <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} placeholder="e.g. Global Imports Inc." /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="industry" render={({ field }) => (
                            <FormItem><FormLabel>Industry</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger></FormControl>
                                <SelectContent>{industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                            </Select><FormMessage />
                            </FormItem>
                        )} />
                        <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="country" render={({ field }) => (
                            <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} placeholder="e.g. Somalia" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="city" render={({ field }) => (
                            <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} placeholder="e.g. Mogadishu" /></FormControl><FormMessage /></FormItem>
                        )} />
                        </div>

                        <Controller
                            control={form.control}
                            name="employeeCount"
                            render={({ field: { onChange, value } }) => (
                                <FormItem>
                                    <FormLabel>
                                        Number of Employees: <span className="text-primary font-bold">{value}</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Slider
                                            min={1}
                                            max={500}
                                            step={1}
                                            value={[value]}
                                            onValueChange={(vals) => onChange(vals[0])}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    
                    <div className="pt-6">
                        <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'Saving...' : 'Save & Continue'}
                        </Button>
                    </div>
                    </form>
                </Form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
