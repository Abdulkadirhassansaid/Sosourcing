
"use client"

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { collection, doc, writeBatch, onSnapshot } from 'firebase/firestore';
import { ArrowDown, ArrowUp, DollarSign, Wallet, CheckCircle, PlusCircle, CreditCard, Banknote, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { EvcPlusIcon, WaafiIcon, EDahabIcon } from '@/components/ui/payment-icons';
import { useTransactions, Transaction } from '@/hooks/use-transactions';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { usePaymentMethods, PaymentMethod } from '@/hooks/use-payment-methods';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PaymentMethodIcon = ({ type, className }: { type: PaymentMethod['type'], className?: string }) => {
    switch (type) {
        case 'EVC Plus': return <EvcPlusIcon className={className} />;
        case 'Waafi': return <WaafiIcon className={className} />;
        case 'E-Dahab': return <EDahabIcon className={className} />;
        case 'Bank Account': return <CreditCard className={className} />;
        default: return <Banknote className={className} />;
    }
}

function AddPaymentMethodDialog() {
    const { addMethod } = usePaymentMethods();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = React.useState(false);

    // Form state
    const [nickname, setNickname] = React.useState('');
    const [methodType, setMethodType] = React.useState<PaymentMethod['type'] | ''>('');
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [accountHolderName, setAccountHolderName] = React.useState('');
    const [accountNumber, setAccountNumber] = React.useState('');
    const [bankName, setBankName] = React.useState('');

    const resetForm = () => {
        setNickname(''); setMethodType(''); setPhoneNumber('');
        setAccountHolderName(''); setAccountNumber(''); setBankName('');
    }

    const handleAdd = async () => {
        if (!nickname || !methodType) return;
        let newMethod: Omit<PaymentMethod, 'id' | 'createdAt' | 'userId'>;

        if (methodType === 'Bank Account') {
            if (!accountHolderName || !accountNumber || !bankName) {
                toast({ variant: 'destructive', description: 'Please fill all bank details.' }); return;
            }
            newMethod = { nickname, type: methodType, details: { accountHolderName, accountNumber, bankName } };
        } else {
            if (!phoneNumber) {
                toast({ variant: 'destructive', description: 'Please provide the phone number.' }); return;
            }
            newMethod = { nickname, type: methodType, details: { phoneNumber } };
        }
        
        await addMethod(newMethod);
        toast({ title: 'Success', description: 'New payment method added.' });
        setIsOpen(false);
        resetForm();
    };

    return (
         <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4" /> Add New</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Payment Method</DialogTitle>
                    <DialogDescription>Enter the details for your new payment account.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="nickname">Nickname</Label>
                        <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="e.g., My Business Account" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Method Type</Label>
                        <Select onValueChange={(value) => setMethodType(value as PaymentMethod['type'])}>
                             <SelectTrigger id="type"><SelectValue placeholder="Select a type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EVC Plus">EVC Plus</SelectItem>
                                <SelectItem value="Waafi">Waafi</SelectItem>
                                <SelectItem value="E-Dahab">E-Dahab</SelectItem>
                                <SelectItem value="Bank Account">Bank Account</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {methodType && (
                        <div className="border-t pt-4 mt-4 space-y-4">
                            {['EVC Plus', 'Waafi', 'E-Dahab'].includes(methodType) && (
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Phone Number</Label>
                                    <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g., 61xxxxxxx" />
                                </div>
                            )}
                            {methodType === 'Bank Account' && (
                                <>
                                    <div className="space-y-2"><Label htmlFor="accName">Account Holder Name</Label><Input id="accName" value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} /></div>
                                    <div className="space-y-2"><Label htmlFor="accNumber">Account Number</Label><Input id="accNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} /></div>
                                    <div className="space-y-2"><Label htmlFor="bankName">Bank Name</Label><Input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} /></div>
                                </>
                            )}
                        </div>
                    )}
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button onClick={handleAdd}>Add Method</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function BillingPage() {
    const { transactions } = useTransactions();
    const { methods: paymentMethods, loading: methodsLoading, deleteMethod } = usePaymentMethods();
    const paymentTransactions = transactions.filter(t => t.type === 'payment');

    return (
        <div className="space-y-6">
            <header><h1 className="text-3xl font-bold tracking-tight">Billing</h1><p className="text-muted-foreground mt-1">Manage your payment methods and view your transaction history.</p></header>
            
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                               <CardTitle>Payment Methods</CardTitle>
                               <CardDescription>Your saved accounts for payments.</CardDescription>
                            </div>
                            <AddPaymentMethodDialog />
                        </CardHeader>
                        <CardContent>
                             {methodsLoading ? <p>Loading...</p> : paymentMethods.length > 0 ? (
                                <ul className="divide-y divide-border">
                                    {paymentMethods.map(method => (
                                        <li key={method.id} className="flex items-center justify-between py-3">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                                                    <PaymentMethodIcon type={method.type} className="h-6 w-auto text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{method.nickname}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {method.type === 'Bank Account' ? `${method.details.bankName} • ****${method.details.accountNumber.slice(-4)}` : `****${method.details.phoneNumber.slice(-4)}`}
                                                    </p>
                                                </div>
                                            </div>
                                             <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem disabled><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem></AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this payment method.</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteMethod(method.id!)} className="bg-destructive hover:bg-destructive/90">Yes, Delete</AlertDialogAction></AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-8 flex flex-col items-center"><Banknote className="mx-auto h-12 w-12 text-muted-foreground" /><h3 className="mt-4 text-lg font-medium">No Payment Methods</h3><p className="mt-1 text-sm text-muted-foreground">Add a payment method to pay for your orders.</p></div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                 <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction History</CardTitle>
                            <CardDescription>A record of all your payments.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Type</TableHead><TableHead>Description</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Amount</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paymentTransactions.length > 0 ? (
                                        paymentTransactions.map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", 'bg-red-100')}>
                                                        <ArrowUp className="w-4 h-4 text-red-600" />
                                                    </div>
                                                    <span className="capitalize font-medium hidden sm:inline">{t.type}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{t.description}</TableCell>
                                            <TableCell className="text-muted-foreground whitespace-nowrap">{format(new Date(t.createdAt), "PPp")}</TableCell>
                                            <TableCell className={cn("text-right font-semibold whitespace-nowrap", 'text-red-600')}>
                                                ${Math.abs(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                        ))
                                    ) : (<TableRow><TableCell colSpan={4} className="h-24 text-center">No transactions yet.</TableCell></TableRow>)}
                                </TableBody>
                            </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );

    
}