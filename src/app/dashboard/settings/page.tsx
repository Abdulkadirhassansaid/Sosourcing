
"use client"

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  companyName: z.string().min(2, { message: "Company name must be at least 2 characters." }),
  avatar: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
    const { toast } = useToast();
    const [user, setUser] = React.useState<FirebaseUser | null>(null);
    const [userEmail, setUserEmail] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const form = useForm<ProfileFormData>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            fullName: '',
            companyName: '',
            avatar: '',
        },
    });

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setUserEmail(currentUser.email || '');
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    form.reset({
                        fullName: data.fullName || '',
                        companyName: data.profile?.companyName || '',
                        avatar: data.profile?.avatar || '',
                    });
                }
            }
        });
        return () => unsubscribe();
    }, [form]);
    
    const onSubmit = async (data: ProfileFormData) => {
        if (!user) {
            toast({ variant: 'destructive', description: "You are not logged in." });
            return;
        }
        setLoading(true);
        try {
            const userDocRef = doc(db, "users", user.uid);
            // This will merge the new profile data with any existing profile data.
            await setDoc(userDocRef, {
                fullName: data.fullName,
                profile: {
                    companyName: data.companyName,
                    avatar: data.avatar,
                }
            }, { merge: true });
            
            toast({ description: "Your profile has been updated successfully." });
            form.reset(data); // This will mark the form as not dirty
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', description: "Failed to update profile." });
        } finally {
            setLoading(false);
        }
    }
    
    const getAvatarFallback = () => {
        const fullName = form.watch('fullName');
        return fullName ? fullName.charAt(0).toUpperCase() : '';
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                form.setValue('avatar', dataUrl, { shouldDirty: true });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
            </header>

            <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-6">
                <TabsList className="flex flex-row overflow-x-auto md:flex-col h-auto md:h-full w-full md:w-48 bg-transparent p-0">
                    <TabsTrigger value="profile" className="w-full justify-start">Profile</TabsTrigger>
                    <TabsTrigger value="security" className="w-full justify-start">Security</TabsTrigger>
                    <TabsTrigger value="notifications" className="w-full justify-start">Notifications</TabsTrigger>
                </TabsList>
                <div className="flex-1">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <TabsContent value="profile">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Profile</CardTitle>
                                        <CardDescription>This is how others will see you on the site.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="avatar"
                                            render={({ field }) => (
                                                 <FormItem>
                                                    <FormLabel>Profile Picture</FormLabel>
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-16 w-16">
                                                            <AvatarImage src={field.value} />
                                                            <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                                                        </Avatar>
                                                        <FormControl>
                                                            <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                                        </FormControl>
                                                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                                            <Upload className="mr-2 h-4 w-4" /> Upload
                                                        </Button>
                                                         {field.value && (
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => form.setValue('avatar', '', { shouldDirty: true })}>
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
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
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" value={userEmail} disabled />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="companyName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Company Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="security">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Security</CardTitle>
                                        <CardDescription>Update your password and manage account security.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="current-password">Current Password</Label>
                                            <Input id="current-password" type="password" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new-password">New Password</Label>
                                            <Input id="new-password" type="password" />
                                        </div>
                                        <Separator />
                                        <div>
                                            <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                                            <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account.</p>
                                            <Button disabled type="button">Enable 2FA (Coming Soon)</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="notifications">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Notifications</CardTitle>
                                        <CardDescription>Manage how you receive notifications.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="font-medium">Email Notifications</h3>
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="sourcing-updates">Sourcing Updates</Label>
                                                <Switch id="sourcing-updates" defaultChecked />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="order-status">Order Status</Label>
                                                <Switch id="order-status" defaultChecked />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="promotions">Promotions & News</Label>
                                                <Switch id="promotions" />
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="space-y-4">
                                            <h3 className="font-medium">Push Notifications</h3>
                                             <div className="flex items-center justify-between">
                                                <Label htmlFor="push-all">Everything</Label>
                                                <Switch id="push-all" disabled />
                                            </div>
                                            <p className="text-sm text-muted-foreground">Push notifications are managed in your browser or device settings (Coming Soon).</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                             <div className="flex justify-end gap-2 mt-6">
                                <Button type="submit" disabled={loading || !form.formState.isDirty}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </Tabs>
        </div>
    );
}
