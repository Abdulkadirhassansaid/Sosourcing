
"use client"

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CheckCircle, Plane, Receipt, ShieldCheck, Warehouse, FileText, ShoppingCart, User, Link as LinkIcon, Phone, MapPin, Globe, ArrowLeft, XCircle, Clock } from 'lucide-react';
import { useOrders, Order, OrderPaymentDetails } from '@/hooks/use-orders';
import { format } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addDoc, collection, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Transaction } from '@/hooks/use-transactions';

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
                <Button>Create Quote</Button>
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

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { orders, updateOrderStatus, updateOrderPaymentDetails } = useOrders();
  const order = orders.find(o => o.id === id);
  const { toast } = useToast();

  const handleUpdateStatus = (newStatus: Order['status']) => {
      if (order) {
          updateOrderStatus(order.id, newStatus);
          toast({
              title: "Order Status Updated",
              description: `Order is now ${newStatus}.`
          })
      }
  };

  const handleConfirmCashPayment = async () => {
    if (!order) return;
    try {
        // Create a transaction record for the cash payment
        const newTransaction: Omit<Transaction, 'id'> = {
            userId: order.userId,
            type: 'payment',
            amount: -(order.totalAmount || 0),
            createdAt: new Date().toISOString(),
            description: `Cash Payment for Order #${order.id.substring(0,6)}`,
            orderId: order.id,
        };
        await addDoc(collection(db, 'transactions'), newTransaction);
        
        // Update order status
        handleUpdateStatus('Payment Confirmed');
        
        toast({
            title: "Payment Confirmed",
            description: `Cash payment for order ${order.id.substring(0,8)} has been confirmed.`,
        });

    } catch (error) {
        console.error("Error confirming cash payment: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to confirm cash payment.",
        });
    }
  };

  const handleConfirmQuote = (details: { productCost: number; shippingFee: number; sourcedCountry: string }) => {
    if (!order) return;

    const { productCost: productCostPerUnit, shippingFee, sourcedCountry } = details;
    const totalProductCost = productCostPerUnit * order.quantity;
    
    const sourcingFeePercentage = totalProductCost < 500 ? 0.05 : 0.10;
    const sourcingFee = totalProductCost * sourcingFeePercentage;
    const totalAmount = totalProductCost + sourcingFee + shippingFee;
    
    updateOrderPaymentDetails(order.id, {
        productCost: totalProductCost,
        sourcingFee,
        shippingFee,
        totalAmount,
        sourcedCountry
    });
    
    handleUpdateStatus('Quote Ready');
  };

  if (!order) {
      return (
          <div className="flex items-center justify-center py-12">
              <Card>
                <CardHeader>
                    <CardTitle>Order Not Found</CardTitle>
                    <CardDescription>The requested order could not be found.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.push('/admin/orders')}>Back to Orders</Button>
                </CardContent>
            </Card>
          </div>
      )
  }

  const currentStatus = order.status;

  const timelineEvents = [
    { status: 'Order Placed', completed: true, icon: FileText },
    { status: 'Sourcing', completed: ['Sourcing', 'Quote Ready', 'Payment Pending', 'Payment Confirmed', 'Shipped', 'Delivered', 'Cancelled'].includes(currentStatus), icon: Warehouse },
    { status: 'Quote Ready', completed: ['Quote Ready', 'Payment Pending', 'Payment Confirmed', 'Shipped', 'Delivered'].includes(currentStatus), icon: Receipt },
    { status: 'Payment Pending', completed: ['Payment Pending', 'Payment Confirmed', 'Shipped', 'Delivered'].includes(currentStatus), icon: Clock },
    { status: 'Payment Confirmed', completed: ['Payment Confirmed', 'Shipped', 'Delivered'].includes(currentStatus), icon: ShieldCheck },
    { status: 'Shipped', completed: ['Shipped', 'Delivered'].includes(currentStatus), icon: Plane },
    { status: 'Delivered', completed: currentStatus === 'Delivered', icon: CheckCircle },
  ];
  
  if (currentStatus === 'Cancelled') {
      const cancelledIndex = timelineEvents.findIndex(event => !event.completed);
      if(cancelledIndex !== -1) {
        timelineEvents.splice(cancelledIndex, 0, { status: 'Cancelled', completed: true, icon: XCircle });
      } else {
        timelineEvents.push({ status: 'Cancelled', completed: true, icon: XCircle });
      }
  }

  return (
    <div className="flex flex-col gap-6">
       <header className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Go Back</span>
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Order #{id.substring(0,8)}...</h1>
            <p className="text-muted-foreground mt-1">Product: {order.productName}</p>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Order Timeline</CardTitle>
                    <CardDescription>Current status: <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge></CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative pl-6">
                          <div className="absolute left-[34px] top-4 bottom-4 w-0.5 bg-border -translate-x-1/2"></div>
                          {timelineEvents.map((event, index) => (
                              <div key={index} className="relative flex items-start gap-6 pb-8 last:pb-0">
                              <div className={cn("flex h-12 w-12 items-center justify-center rounded-full shrink-0", event.completed ? 'bg-primary' : 'bg-muted border-2', event.status === 'Cancelled' && 'bg-destructive', event.status === 'Payment Pending' && 'bg-amber-500')}>
                                  <event.icon className={cn("h-6 w-6", event.completed ? 'text-primary-foreground' : 'text-muted-foreground')} />
                              </div>
                              <div>
                                  <p className={cn("font-semibold", !event.completed && "text-muted-foreground")}>{event.status}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {event.completed ? 'Completed' : 'Pending'}
                                  </p>
                              </div>
                              </div>
                          ))}
                      </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                            <div className="relative w-32 h-32 rounded-lg border overflow-hidden">
                            {order.referenceImage ? (
                                <Image src={order.referenceImage} alt={order.productName} fill className="object-contain" />
                            ) : (
                                <div className="w-full h-full bg-secondary flex items-center justify-center">
                                    <ShoppingCart className="w-12 h-12 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-2">
                            <h3 className="text-lg font-semibold">{order.productName}</h3>
                            <p className="text-sm text-muted-foreground">Category: {order.category}</p>
                            <p className="text-sm text-muted-foreground">Quantity: {order.quantity}</p>
                            {order.productLink && (
                                    <a href={order.productLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                    <LinkIcon className="w-4 h-4"/>  Reference Link
                                    </a>
                            )}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Specifications:</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.specifications}</p>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {order.status === 'Sourcing' && (
                        <div className="flex flex-col gap-2">
                            <Alert>
                                <AlertTitle>Action Required</AlertTitle>
                                <AlertDescription>Create a quote for the customer to review.</AlertDescription>
                            </Alert>
                             <CreateQuoteDialog order={order} onQuoteConfirm={handleConfirmQuote} />
                        </div>
                    )}
                    {order.status === 'Quote Ready' && (
                        <Alert>
                            <AlertTitle>Waiting for Customer</AlertTitle>
                            <AlertDescription>The customer has received the quote and needs to make a payment.</AlertDescription>
                        </Alert>
                    )}
                    {order.status === 'Payment Pending' && (
                         <div className="flex flex-col gap-2">
                            <Alert className="bg-amber-50 border-amber-200">
                                <Clock className="h-4 w-4 text-amber-600"/>
                                <AlertTitle className="text-amber-800">Pending Cash Payment</AlertTitle>
                                <AlertDescription className="text-amber-700">The customer has opted to pay with cash. Confirm once you have received the payment.</AlertDescription>
                            </Alert>
                             <Button onClick={handleConfirmCashPayment}>Confirm Cash Payment</Button>
                         </div>
                    )}
                     {order.status === 'Payment Confirmed' && (
                         <div className="flex flex-col gap-2">
                            <Alert className="bg-green-50 border-green-200">
                                <AlertTitle className="text-green-800">Payment Confirmed</AlertTitle>
                                <AlertDescription className="text-green-700">Customer has paid. You may now proceed with fulfillment.</AlertDescription>
                            </Alert>
                             <Button onClick={() => handleUpdateStatus('Shipped')}>Mark as Shipped</Button>
                         </div>
                    )}
                    {order.status === 'Shipped' && (
                        <div className="flex flex-col gap-2">
                            <Alert>
                                <AlertTitle>Order In Transit</AlertTitle>
                                <AlertDescription>The order is on its way to the customer.</AlertDescription>
                            </Alert>
                            <Button onClick={() => handleUpdateStatus('Delivered')}>Mark as Delivered</Button>
                        </div>
                    )}
                     {order.status === 'Delivered' && (
                        <Alert className="bg-blue-50 border-blue-200">
                            <AlertTitle className="text-blue-800">Order Complete</AlertTitle>
                            <AlertDescription className="text-blue-700">This order has been successfully delivered.</AlertDescription>
                        </Alert>
                    )}
                     {order.status === 'Cancelled' && (
                         <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>Order Cancelled</AlertTitle>
                            <AlertDescription>This order has been cancelled by the customer. No further actions can be taken.</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Financials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                     <div className="flex items-center justify-between p-3 rounded-md bg-secondary text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground"><Globe className="h-4 w-4"/> Sourced From</span>
                        <span className="font-semibold">{order.sourcedCountry || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Product Cost:</span>
                        <span>${(order.productCost || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sourcing Fee:</span>
                        <span>${(order.sourcingFee || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping & Tax:</span>
                        <span>${(order.shippingFee || 0).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-base">
                        <span>Total Amount:</span>
                        <span>${(order.totalAmount || 0).toFixed(2)}</span>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{order.deliveryAddress}, {order.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{order.phoneNumber}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
