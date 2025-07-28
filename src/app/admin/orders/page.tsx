
"use client"

import * as React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileDown, Search, Package, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrders, Order } from '@/hooks/use-orders';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';


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
const countries = ["China", "Turkey"];

function CreateQuoteDialog({ order, onQuoteConfirm }: { order: Order; onQuoteConfirm: (details: any) => void; }) {
    const [productCost, setProductCost] = React.useState<number | ''>('');
    const [shippingFee, setShippingFee] = React.useState<number | ''>('');
    const [sourcedCountry, setSourcedCountry] = React.useState<string>('');
    const [isOpen, setIsOpen] = React.useState(false);

    const handleConfirm = () => {
        if (productCost && shippingFee && sourcedCountry) {
            onQuoteConfirm({ productCost, shippingFee, sourcedCountry });
            setIsOpen(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Create Quote</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Quote for Order #{order.id.substring(0,8)}</DialogTitle>
                    <DialogDescription>Enter the cost and sourcing details for "{order.productName}".</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="productCost">Product Cost Per Unit (USD)</Label>
                            <Input id="productCost" type="number" value={productCost} onChange={(e) => setProductCost(parseFloat(e.target.value) || '')} placeholder="e.g., 25.00" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input id="quantity" type="number" value={order.quantity} disabled />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="shippingFee">Shipping & Tax (USD)</Label>
                        <Input id="shippingFee" type="number" value={shippingFee} onChange={(e) => setShippingFee(parseFloat(e.target.value) || '')} placeholder="e.g., 300" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sourcedCountry">Sourced From</Label>
                        <Select onValueChange={setSourcedCountry} defaultValue={sourcedCountry}>
                            <SelectTrigger id="sourcedCountry">
                                <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                            <SelectContent>
                                {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={!productCost || !shippingFee || !sourcedCountry}>Confirm & Send Quote</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, updateOrderPaymentDetails } = useOrders();
  const { toast } = useToast();

  const handleConfirmQuote = (orderId: string, details: { productCost: number; shippingFee: number; sourcedCountry: string }) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const { productCost: productCostPerUnit, shippingFee, sourcedCountry } = details;
    const totalProductCost = productCostPerUnit * order.quantity;
    
    const sourcingFeePercentage = totalProductCost < 500 ? 0.05 : 0.10;
    const sourcingFee = totalProductCost * sourcingFeePercentage;
    const totalAmount = totalProductCost + sourcingFee + shippingFee;
    
    updateOrderPaymentDetails(orderId, {
        productCost: totalProductCost,
        sourcingFee,
        shippingFee,
        totalAmount,
        sourcedCountry
    });

    updateOrderStatus(orderId, 'Quote Ready');

    toast({
        title: "Quote Confirmed",
        description: `The quote for order ${orderId.substring(0,8)} has been sent to the customer.`
    });
  };


  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Customer Orders</h1>
          <p className="text-muted-foreground">Track and manage all orders in the system.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline"><FileDown className="mr-2 h-4 w-4" /> Export All</Button>
        </div>
      </div>

       <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by order ID or product..." className="pl-8" />
            </div>
             <Select>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="home-goods">Home Goods</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">Filter by Status</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {orderStatuses.map(status => (
                  <DropdownMenuCheckboxItem key={status}>{status}</DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                            <Link href={`/admin/orders/${order.id}`} className="hover:underline">{order.id.substring(0, 8)}...</Link>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-md border overflow-hidden shrink-0">
                                    {order.referenceImage ? (
                                        <Image src={order.referenceImage} alt={order.productName} fill className="object-contain" />
                                    ) : (
                                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                                            <Package className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                               <div className="flex flex-col">
                                 <span className="font-medium">{order.productName}</span>
                                 <span className="text-sm text-muted-foreground">{order.category}</span>
                               </div>
                            </div>
                        </TableCell>
                         <TableCell>
                            {order.totalAmount ? `$${order.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}` : 'N/A'}
                         </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                           {order.status === 'Sourcing' ? (
                               <CreateQuoteDialog order={order} onQuoteConfirm={(details) => handleConfirmQuote(order.id, details)} />
                           ) : (
                             <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/orders/${order.id}`}>View Details</Link>
                             </Button>
                           )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-48 text-center">
                         <div className="flex flex-col items-center gap-4">
                            <Package className="h-12 w-12 text-muted-foreground" />
                            <h3 className="text-xl font-semibold">No orders yet</h3>
                            <p className="text-muted-foreground">When a customer creates an order, it will appear here.</p>
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
