
"use client"

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Banknote, PlusCircle, Trash2, MoreHorizontal, CreditCard, Edit, ArrowDown, ArrowUp } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { usePayoutMethods, PayoutMethod } from '@/hooks/use-payout-methods';
import { EvcPlusIcon, WaafiIcon, EDahabIcon } from '@/components/ui/payment-icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTransactions, Transaction } from '@/hooks/use-transactions';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const PayoutMethodIcon = ({ type, className }: { type: PayoutMethod['type'], className?: string }) => {
    switch (type) {
        case 'EVC Plus': return <EvcPlusIcon className={className} />;
        case 'Waafi': return <WaafiIcon className={className} />;
        case 'E-Dahab': return <EDahabIcon className={className} />;
        case 'Bank Account': return <CreditCard className={className} />;
        default: return <Banknote className={className} />;
    }
}

function AddMethodDialog() {
    const { addMethod } = usePayoutMethods();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = React.useState(false);

    // Common state
    const [nickname, setNickname] = React.useState('');
    const [methodType, setMethodType] = React.useState<PayoutMethod['type'] | ''>('');

    // Mobile money state
    const [phoneNumber, setPhoneNumber] = React.useState('');

    // Bank account state
    const [accountHolderName, setAccountHolderName] = React.useState('');
    const [accountNumber, setAccountNumber] = React.useState('');
    const [bankName, setBankName] = React.useState('');

    const resetForm = () => {
        setNickname('');
        setMethodType('');
        setPhoneNumber('');
        setAccountHolderName('');
        setAccountNumber('');
        setBankName('');
    }

    const handleAdd = async () => {
        if (!nickname || !methodType) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please fill all required fields.' });
            return;
        }

        let newMethod: Omit<PayoutMethod, 'id' | 'createdAt' | 'adminId'>;

        if (methodType === 'Bank Account') {
            if (!accountHolderName || !accountNumber || !bankName) {
                toast({ variant: 'destructive', title: 'Error', description: 'Please fill all bank account details.' });
                return;
            }
            newMethod = { nickname, type: methodType, details: { accountHolderName, accountNumber, bankName } };
        } else {
             if (!phoneNumber) {
                toast({ variant: 'destructive', title: 'Error', description: 'Please provide the phone number.' });
                return;
            }
            newMethod = { nickname, type: methodType, details: { phoneNumber } };
        }
        
        await addMethod(newMethod);
        toast({ title: 'Success', description: 'New payout method added.' });
        setIsOpen(false);
        resetForm();
    };

    return (
         <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Method</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Payout Method</DialogTitle>
                    <DialogDescription>Enter the details for your new payout account.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="nickname">Nickname</Label>
                        <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="e.g., My Main Business Account" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Method Type</Label>
                        <Select onValueChange={(value) => setMethodType(value as PayoutMethod['type'])}>
                             <SelectTrigger id="type">
                                <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
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
                                    <div className="space-y-2">
                                        <Label htmlFor="accountHolderName">Account Holder Name</Label>
                                        <Input id="accountHolderName" value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} placeholder="e.g., John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="accountNumber">Account Number</Label>
                                        <Input id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="e.g., 1234567890" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bankName">Bank Name</Label>
                                        <Input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g., Premier Bank" />
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleAdd}>Add Method</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


function EditMethodDialog({ method, children }: { method: PayoutMethod, children: React.ReactNode }) {
    const { updateMethod } = usePayoutMethods();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = React.useState(false);

    const [nickname, setNickname] = React.useState(method.nickname);
    const [phoneNumber, setPhoneNumber] = React.useState(method.type !== 'Bank Account' ? method.details.phoneNumber : '');
    const [accountHolderName, setAccountHolderName] = React.useState(method.type === 'Bank Account' ? method.details.accountHolderName : '');
    const [accountNumber, setAccountNumber] = React.useState(method.type === 'Bank Account' ? method.details.accountNumber : '');
    const [bankName, setBankName] = React.useState(method.type === 'Bank Account' ? method.details.bankName : '');

    const handleUpdate = async () => {
        if (!nickname) {
            toast({ variant: 'destructive', title: 'Error', description: 'Nickname is required.' });
            return;
        }

        let updatedDetails: PayoutMethod['details'];

        if (method.type === 'Bank Account') {
            if (!accountHolderName || !accountNumber || !bankName) {
                toast({ variant: 'destructive', title: 'Error', description: 'Please fill all bank account details.' });
                return;
            }
            updatedDetails = { accountHolderName, accountNumber, bankName };
        } else {
             if (!phoneNumber) {
                toast({ variant: 'destructive', title: 'Error', description: 'Please provide the phone number.' });
                return;
            }
            updatedDetails = { phoneNumber };
        }
        
        await updateMethod(method.id!, { nickname, details: updatedDetails });
        toast({ title: 'Success', description: 'Payout method updated.' });
        setIsOpen(false);
    };

    return (
         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Payout Method</DialogTitle>
                    <DialogDescription>Update the details for "{method.nickname}".</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-nickname">Nickname</Label>
                        <Input id="edit-nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Method Type</Label>
                        <Input value={method.type} disabled />
                    </div>

                    <div className="border-t pt-4 mt-4 space-y-4">
                        {method.type !== 'Bank Account' && (
                            <div className="space-y-2">
                                <Label htmlFor="edit-phoneNumber">Phone Number</Label>
                                <Input id="edit-phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                            </div>
                        )}

                        {method.type === 'Bank Account' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-accountHolderName">Account Holder Name</Label>
                                    <Input id="edit-accountHolderName" value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-accountNumber">Account Number</Label>
                                    <Input id="edit-accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-bankName">Bank Name</Label>
                                    <Input id="edit-bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdate}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminBillingPage() {
    const { methods, loading, deleteMethod } = usePayoutMethods();
    const { transactions: allTransactions, loading: transactionsLoading } = useTransactions({ forAdmin: true });
    const { toast } = useToast();

    const transactions = React.useMemo(() => {
        return allTransactions.filter(t => ['payment', 'withdrawal'].includes(t.type));
    }, [allTransactions]);

    const handleDelete = async (id: string) => {
        await deleteMethod(id);
        toast({ title: "Method Deleted", description: "The payout method has been removed." });
    };

    const getDisplayDetails = (method: PayoutMethod) => {
        if (method.type === 'Bank Account') {
            const last4 = method.details.accountNumber?.slice(-4) || '****';
            return `${method.details.bankName} • **** ${last4}`;
        }
        const last4 = method.details.phoneNumber?.slice(-4) || '****';
        return `${method.type} • **** ${last4}`;
    }

    const getTransactionDescription = (t: Transaction) => {
        if (t.type === 'payment' && t.orderId) {
            return <>Payment for <Link href={`/admin/orders/${t.orderId}`} className="underline hover:text-primary">Order #{t.orderId.substring(0, 6)}</Link></>;
        }
        if (t.type === 'withdrawal') {
            return `Withdrawal to Payout Account`;
        }
        return t.description;
    }

    const isOutflow = (t: Transaction) => t.type === 'withdrawal';
    const isRevenue = (t: Transaction) => ['deposit', 'payment'].includes(t.type);

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                 <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payouts & Billing</h1>
                    <p className="text-muted-foreground mt-1">Manage payout accounts and view transaction history.</p>
                </div>
                <div className="w-full md:w-auto">
                   <AddMethodDialog />
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Payout Accounts</CardTitle>
                            <CardDescription>Accounts you can withdraw earnings to.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <p>Loading methods...</p>
                            ) : methods.length > 0 ? (
                                <ul className="divide-y divide-border">
                                    {methods.map(method => (
                                        <li key={method.id} className="flex items-center justify-between py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                                                    <PayoutMethodIcon type={method.type} className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{method.nickname}</p>
                                                    <p className="text-sm text-muted-foreground">{getDisplayDetails(method)}</p>
                                                </div>
                                            </div>
                                            <div>
                                                 <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                         <EditMethodDialog method={method}>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                                            </DropdownMenuItem>
                                                        </EditMethodDialog>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>This will permanently delete the payout method "{method.nickname}". This action cannot be undone.</AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDelete(method.id!)} className="bg-destructive hover:bg-destructive/90">Yes, Delete</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-12 flex flex-col items-center">
                                    <Banknote className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-medium">No Payout Methods Found</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">Add a payout method to start withdrawing your earnings.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Platform Transaction History</CardTitle>
                            <CardDescription>A record of all payments and withdrawals on the platform.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactionsLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center">Loading transactions...</TableCell>
                                            </TableRow>
                                        ) : transactions.length > 0 ? (
                                            transactions.map(t => (
                                            <TableRow key={t.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", isOutflow(t) ? 'bg-red-100' : 'bg-green-100')}>
                                                            {isOutflow(t) ? <ArrowUp className="w-4 h-4 text-red-600" /> : <ArrowDown className="w-4 h-4 text-green-600" />}
                                                        </div>
                                                        <span className="capitalize font-medium hidden sm:inline">{t.type}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{getTransactionDescription(t)}</TableCell>
                                                <TableCell className="text-muted-foreground whitespace-nowrap">{format(new Date(t.createdAt), "PPp")}</TableCell>
                                                <TableCell className={cn("text-right font-semibold whitespace-nowrap", isOutflow(t) ? 'text-red-600' : 'text-green-600')}>
                                                    {isOutflow(t) ? '-' : '+'}${Math.abs(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </TableCell>
                                            </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center">
                                                    No transactions yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
