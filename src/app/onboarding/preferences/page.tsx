
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Building, Home, Shirt, Smartphone, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const preferencesSchema = z.object({
  productCategories: z.array(z.string()).min(1, 'Please select at least one category.'),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

const categories = [
    { id: 'electronics', label: 'Electronics', icon: Smartphone, hint: 'smartphones gadgets', image: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxtb2JpbGV8ZW58MHx8fHwxNzUzNjAwNjIyfDA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 'fashion', label: 'Fashion & Apparel', icon: Shirt, hint: 'clothing fashion', image: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNXx8ZmFzaGlvbnxlbnwwfHx8fDE3NTM2MDA2Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 'home-goods', label: 'Home Goods & Furniture', icon: Home, hint: 'sofa furniture', image: 'https://images.unsplash.com/photo-1693051896613-44b268a984bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNXx8aG9tZSUyMGdvb2RzfGVufDB8fHx8MTc1MzYwMDc1M3ww&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 'building-materials', label: 'Building Materials', icon: Building, hint: 'construction materials', image: 'https://images.unsplash.com/photo-1631856956423-2b95dae0ba74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxidWlsZGluZyUyMG1hdGVyaWFsc3xlbnwwfHx8fDE3NTM2MDA4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080' },
];

export default function PreferencesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      productCategories: [],
    },
  });

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

  const onSubmit = async (data: PreferencesFormData) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
    setLoading(true);
    try {
      await setDoc(doc(db, "users", user.uid), { preferences: data }, { merge: true });
      toast({
        title: 'Preferences Saved!',
        description: "Your setup is complete.",
      });
      router.push('/onboarding/complete');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const currentCategories = form.getValues('productCategories');
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(g => g !== categoryId)
      : [...currentCategories, categoryId];
    form.setValue('productCategories', newCategories, { shouldValidate: true });
  };
  
  if (!user) {
    return <div className="flex h-screen items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-secondary/50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Progress value={66} className="mb-2" />
          <p className="text-sm text-muted-foreground text-center">Step 2 of 3</p>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">What are you looking for?</CardTitle>
            <CardDescription className="text-center">Select the product categories you are most interested in sourcing.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <FormField control={form.control} name="productCategories" render={() => (
                  <FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categories.map(category => {
                        const isSelected = form.watch('productCategories').includes(category.id);
                        return (
                        <Card key={category.id} onClick={() => toggleCategory(category.id)} className={cn('cursor-pointer transition-all hover:shadow-md relative overflow-hidden', isSelected && 'ring-2 ring-primary border-primary')}>
                           {isSelected && (
                              <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground rounded-full p-1">
                                <CheckCircle className="w-5 h-5" />
                              </div>
                            )}
                          <CardContent className="p-0 flex flex-col items-center text-center">
                            <div className="relative w-full aspect-[4/3]">
                                <Image src={category.image} alt={category.label} className={cn('object-cover transition-transform duration-300', isSelected && 'scale-110')} fill data-ai-hint={category.hint} />
                                <div className={cn("absolute inset-0 bg-black/20 transition-opacity", isSelected && "bg-black/40")}></div>
                            </div>
                            <div className="p-4 flex items-center gap-3">
                                <category.icon className="w-8 h-8 text-primary" />
                                <p className="font-semibold text-lg">{category.label}</p>
                            </div>
                          </CardContent>
                        </Card>
                        )
                      })}
                    </div>
                    <FormMessage className="text-center pt-2" />
                  </FormItem>
                )} />
                
                <div className="text-center text-sm text-muted-foreground pt-4">
                    Almost done! One last step to get you started.
                </div>

                <div className="flex justify-between pt-6">
                  <Button type="button" variant="outline" onClick={() => router.back()}>Previous</Button>
                  <Button type="submit" disabled={loading}>{loading ? 'Finishing...' : 'Finish Setup'}</Button>
                </div>

              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
