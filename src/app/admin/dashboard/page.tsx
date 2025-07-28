
"use client"

import * as React from 'react';
import { useOrders, Order, Transaction } from '@/hooks/use-orders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Users, DollarSign, ShoppingCart, Banknote, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { EvcPlusIcon, WaafiIcon, EDahabIcon } from '@/components/ui/payment-icons';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { usePayoutMethods, PayoutMethod } from '@/hooks/use-payout-methods';

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Shipped': return 'default';
    case 'Delivered': return 'secondary';
    case 'Sourcing': return 'outline';
    case 'Quote Ready': return 'default';
    case 'Payment Confirmed': return 'secondary';
    case 'Payment Pending': return 'destructive';
    case 'Cancelled': return 'destructive';
    default: return 'outline';
  }
};

const orderStatuses: Order['status'][] = ['Sourcing', 'Quote Ready', 'Payment Confirmed', 'Payment Pending', 'Shipped', 'Delivered', 'Cancelled'];

const PayoutMethodIcon = ({ type, className }: { type: PayoutMethod['type'], className?: string }) => {
    switch (type) {
        case 'EVC Plus': return <EvcPlusIcon className={className} />;
        case 'Waafi': return <WaafiIcon className={className} />;
        case 'E-Dahab': return <EDahabIcon className={className} />;
        case 'Bank Account': return <CreditCard className={className} />;
        default: return <Banknote className={className} />;
    }
}

function WithdrawDialog({ availableForPayout, onWithdraw }: { availableForPayout: number; onWithdraw: (amount: number) => void; }) {
    const { methods: payoutMethods, loading } = usePayoutMethods();
    const [payoutAmount, setPayoutAmount] = React.useState(0);
    const [selectedMethod, setSelectedMethod] = React.useState('');
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    const handleConfirmWithdrawal = () => {
        onWithdraw(payoutAmount);
        setIsDialogOpen(false);
        setPayoutAmount(0);
        setSelectedMethod('');
    }
    
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" onClick={() => setPayoutAmount(availableForPayout)}>Withdraw</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                    <DialogDescription>Select a method to withdraw your earnings.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Amount (USD)</Label>
                        <Input type="number" value={payoutAmount} onChange={(e) => setPayoutAmount(Number(e.target.value))} max={availableForPayout} />
                    </div>
                    
                    <Label>Select Payout Method</Label>
                    {loading ? (
                        <p>Loading methods...</p>
                    ) : payoutMethods.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground p-4 border rounded-md">
                            <p>No payout methods found.</p>
                            <Button variant="link" asChild><Link href="/admin/billing">Add a method</Link></Button>
                        </div>
                    ) : (
                        <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {payoutMethods.map(method => (
                                <div key={method.id}>
                                    <RadioGroupItem value={method.id!} id={method.id!} className="peer sr-only" />
                                    <Label htmlFor={method.id!} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                        <PayoutMethodIcon type={method.type} className="mb-3 h-8 w-auto" />
                                        {method.nickname}
                                        <span className="text-xs text-muted-foreground mt-1">{method.type}</span>
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    )}
                    
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button className="w-full" disabled={payoutAmount <= 0 || payoutAmount > availableForPayout || !selectedMethod}>Confirm Withdrawal</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Withdrawal</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to withdraw ${payoutAmount.toLocaleString()}? This action cannot be undone.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmWithdrawal}>Yes, Withdraw</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default function AdminDashboardPage() {
  const { orders, updateOrderStatus } = useOrders();
  const { toast } = useToast();
  const [withdrawnAmount, setWithdrawnAmount] = React.useState(0);

  const totalRevenue = React.useMemo(() => {
    return orders
        .filter(o => ['Payment Confirmed', 'Shipped', 'Delivered'].includes(o.status))
        .reduce((acc, order) => acc + (order.totalAmount || 0), 0);
  }, [orders]);
  
  const totalSourcingFees = React.useMemo(() => {
     return orders
        .filter(o => ['Payment Confirmed', 'Shipped', 'Delivered'].includes(o.status))
        .reduce((acc, order) => acc + (order.sourcingFee || 0), 0);
  }, [orders]);

  const availableForPayout = totalRevenue - withdrawnAmount;

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
  };
  
  const handleWithdraw = (amount: number) => {
    setWithdrawnAmount(prev => prev + amount);
    toast({
        title: "Withdrawal Successful",
        description: `$${amount.toLocaleString()} has been scheduled for payout.`,
        action: <CheckCircle className="text-green-500" />
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage all customer orders and their statuses.</p>
      </header>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">from {orders.filter(o => ['Payment Confirmed', 'Shipped', 'Delivered'].includes(o.status)).length} orders</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{orders.length}</div>
              <p className="text-xs text-muted-foreground">in the system</p>
            </CardContent>
          </Card>
           <Card className="border-l-4 border-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sourcing Fees</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSourcingFees.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">earned from all orders</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available for Payout</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">${availableForPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <WithdrawDialog availableForPayout={availableForPayout} onWithdraw={handleWithdraw} />
              </div>
              <p className="text-xs text-muted-foreground">from confirmed orders</p>
            </CardContent>
          </Card>
        </div>


      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>A complete list of all orders in the system.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Update Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline" title={order.id}>
                        {order.id.substring(0, 8)}...
                      </Link>
                    </TableCell>
                    <TableCell>{order.productName}</TableCell>
                    <TableCell>{format(new Date(order.createdAt), "PPP")}</TableCell>
                     <TableCell>${(order.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Select
                        value={order.status}
                        onValueChange={(newStatus: Order['status']) => handleStatusChange(order.id, newStatus)}
                        disabled
                      >
                        <SelectTrigger className="w-full md:w-[180px]">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          {orderStatuses.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                     <div className="flex flex-col items-center gap-4">
                        <Users className="h-12 w-12 text-muted-foreground" />
                        <h3 className="text-xl font-semibold">No Orders Found</h3>
                        <p className="text-muted-foreground">As customers create orders, they will appear here for management.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
