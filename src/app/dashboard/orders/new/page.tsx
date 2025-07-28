
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, Link as LinkIcon, X, File as FileIcon, Phone, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrders } from '@/hooks/use-orders';
import Image from 'next/image';

const orderSchema = z.object({
  productName: z.string().min(3, 'Please provide a product name (min. 3 characters).'),
  category: z.string().min(1, 'Please select a category.'),
  specifications: z.string().min(10, 'Please provide some key specifications (min. 10 characters).'),
  productLink: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  referenceImage: z.any().optional(),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
  targetPrice: z.coerce.number().optional(),
  city: z.string().min(2, 'Please enter a city.'),
  phoneNumber: z.string().min(9, 'Please enter a valid phone number.'),
  deliveryAddress: z.string().min(10, 'Please provide a detailed delivery address.'),
});

type OrderFormData = z.infer<typeof orderSchema>;

const categories = ["Electronics", "Fashion & Apparel", "Home Goods & Furniture", "Building Materials", "Automotive Parts", "Food & Beverage", "Other"];

export default function NewOrderPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { addOrder } = useOrders();
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [fileName, setFileName] = React.useState<string | null>(null);

    const form = useForm<OrderFormData>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            productName: '',
            category: '',
            specifications: '',
            productLink: '',
            quantity: 100,
            targetPrice: '' as any,
            referenceImage: null,
            city: '',
            phoneNumber: '',
            deliveryAddress: '',
        },
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setImagePreview(dataUrl);
                fieldChange(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (fieldChange: (value: null) => void) => {
        setImagePreview(null);
        setFileName(null);
        fieldChange(null);
    };

    const processForm = async (data: OrderFormData) => {
        try {
            await addOrder(data);
            toast({
                title: "Order Submitted!",
                description: "Your order has been received. Our team will begin sourcing and get back to you with a quote shortly.",
            });
            router.push('/dashboard/orders');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: "Submission Failed",
                description: error.message,
            });
        }
    }
    
    return (
        <div className="flex flex-col gap-6 items-center">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Create a New Order</CardTitle>
                    <CardDescription>Tell us what you need. The more details you provide, the better we can source for you.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(processForm)} className="space-y-6">
                            <h3 className="text-lg font-medium border-b pb-2">Product Details</h3>
                            <FormField control={form.control} name="productLink" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Link (Optional)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input {...field} placeholder="https://example.com/product-page" className="pl-10" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div className="flex items-center gap-4">
                                <Separator className="flex-1" />
                                <span className="text-xs text-muted-foreground">OR</span>
                                <Separator className="flex-1" />
                            </div>

                             <FormField control={form.control} name="productName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="e.g. High-Quality Leather Handbags" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                             <FormField control={form.control} name="category" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Category</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="specifications" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Key Specifications</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} rows={4} placeholder="Describe the key features. e.g., Genuine Calf Leather, Gold-plated hardware, Multiple color options..." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            
                             <FormField control={form.control} name="referenceImage" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reference Image/File (Optional)</FormLabel>
                                    <FormControl>
                                        {imagePreview ? (
                                            <div className="w-full relative">
                                                <div className="w-full h-40 relative rounded-lg overflow-hidden border">
                                                     <Image src={imagePreview} alt="Preview" fill className="object-contain" />
                                                </div>
                                                <div className="mt-2 text-sm text-muted-foreground flex items-center justify-between">
                                                    <span className="flex items-center gap-2"><FileIcon className="w-4 h-4"/>{fileName}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeImage(field.onChange)}>
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center w-full">
                                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                        <p className="text-xs text-muted-foreground">Image, PDF, or Spec Sheet</p>
                                                    </div>
                                                    <Input id="dropzone-file" type="file" className="hidden" onChange={(e) => handleFileChange(e, field.onChange)} />
                                                </label>
                                            </div> 
                                        )}
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="quantity" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity Required</FormLabel>
                                        <FormControl><Input type="number" {...field} placeholder="e.g. 1000" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="targetPrice" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Target Price Per Unit (USD, Optional)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                                <Input type="number" {...field} className="pl-8" placeholder="e.g. 15.00" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <Separator />
                            <h3 className="text-lg font-medium border-b pb-2">Delivery Information</h3>
                             <div className="grid md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="city" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Delivery City</FormLabel>
                                        <FormControl><Input {...field} placeholder="e.g. Mogadishu" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input type="tel" {...field} className="pl-10" placeholder="e.g. 61xxxxxxx" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                             <FormField control={form.control} name="deliveryAddress" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Detailed Delivery Address</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} rows={3} placeholder="e.g. Bakaro Market, Main Road, Shop #123" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />


                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Submitting...' : 'Submit Order'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
