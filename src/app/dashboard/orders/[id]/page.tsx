
"use client"

import * as React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CheckCircle, CreditCard, FileText, Package, Plane, Receipt, ShieldCheck, Warehouse, Star, Clock, Globe, Info, DollarSign, XCircle, ShoppingCart, Link as LinkIcon, File, Trash2, Wallet, ArrowLeft, Banknote } from 'lucide-react';
import { useOrders, Order } from '@/hooks/use-orders';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useParams, useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, doc, getDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { Transaction } from '@/hooks/use-transactions';
import { usePaymentMethods, PaymentMethod } from '@/hooks/use-payment-methods';
import { EvcPlusIcon, WaafiIcon, EDahabIcon } from '@/components/ui/payment-icons';


const PaymentMethodIcon = ({ type, className }: { type: PaymentMethod['type'], className?: string }) => {
    switch (type) {
        case 'EVC Plus': return <EvcPlusIcon className={className} />;
        case 'Waafi': return <WaafiIcon className={className} />;
        case 'E-Dahab': return <EDahabIcon className={className} />;
        case 'Bank Account': return <CreditCard className={className} />;
        default: return <Banknote className={className} />;
    }
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { orders, updateOrderStatus, deleteOrder } = useOrders();
  const order = orders.find(o => o.id === id);
  const { toast } = useToast();
  const { methods: paymentMethods, loading: paymentMethodsLoading } = usePaymentMethods();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string | null>(null);

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);
  
  const handleMakePayment = async () => {
      if (!order || !auth.currentUser || !selectedPaymentMethod) {
           toast({
              variant: "destructive",
              title: "Error",
              description: "Please select a payment method to proceed."
          });
          return;
      }

      try {
        const batch = writeBatch(db);
        const orderDocRef = doc(db, 'orders', order.id);
        const transactionRef = doc(collection(db, 'transactions'));
        
        // Update order status
        batch.update(orderDocRef, { status: 'Payment Confirmed' });
        
        // Create a new transaction record
        const newTransaction: Omit<Transaction, 'id'> = {
            userId: auth.currentUser.uid,
            type: 'payment',
            amount: -(order.totalAmount || 0),
            createdAt: new Date().toISOString(),
            description: `Payment for Order #${order.id.substring(0,6)}`,
            orderId: order.id,
        };
        batch.set(transactionRef, newTransaction);
        
        await batch.commit();

        toast({
            title: "Payment Successful!",
            description: "Your order is now being processed."
        });
        setIsPaymentDialogOpen(false);
      } catch (error) {
          console.error("Payment Error: ", error);
          toast({
              variant: "destructive",
              title: "Payment Failed",
              description: "An error occurred while processing your payment. Please try again."
          });
      }
  };
  
  const handleArrangeCashPayment = () => {
      if (order) {
          updateOrderStatus(order.id, 'Payment Pending');
          toast({
              title: "Cash Payment Requested",
              description: "Please proceed with the cash payment. An admin will confirm it shortly."
          });
      }
  }

  const handleCancelOrder = () => {
      if (order) {
          updateOrderStatus(order.id, 'Cancelled');
          toast({
              variant: "destructive",
              title: "Order Cancelled",
              description: "Your order has been successfully cancelled."
          });
      }
  }

  const handleDeleteOrder = () => {
      if (order) {
          deleteOrder(order.id);
          toast({
              title: "Order Deleted",
              description: "Your order has been successfully deleted.",
          });
          router.push('/dashboard/orders');
      }
  }
  
  if (!order) {
      return (
          <div className="flex items-center justify-center py-12">
              <Card>
                <CardHeader>
                    <CardTitle>Order Not Found</CardTitle>
                    <CardDescription>The requested order could not be found.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.push('/dashboard/orders')}>Back to Orders</Button>
                </CardContent>
            </Card>
          </div>
      )
  }
  
  const currentStatus = order.status;
  const isQuoteReadyOrLater = ['Quote Ready', 'Payment Pending', 'Payment Confirmed', 'Shipped', 'Delivered', 'Cancelled'].includes(currentStatus);

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
            <h1 className="text-3xl font-bold tracking-tight">Order #{id.substring(0, 8)}...</h1>
            <p className="text-muted-foreground mt-1">Product: {order.productName}</p>
        </div>
      </header>

      {currentStatus === 'Sourcing' ? (
           <Card>
              <CardHeader>
                <CardTitle>Sourcing in Progress</CardTitle>
                 <CardDescription>Our team is currently finding the best suppliers for your request. You'll be notified once a quote is ready for your review.</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
                <p className="mt-4 text-muted-foreground">Waiting for the admin to confirm a quote.</p>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="destructive" className="mt-4"><Trash2 className="mr-2 h-4 w-4" /> Delete Order</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your order request.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteOrder}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </CardContent>
          </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
               <Card>
                  <CardHeader>
                      <CardTitle>Order Timeline</CardTitle>
                      <CardDescription>Follow your order's journey from sourcing to your doorstep.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                     {timelineEvents.length > 0 ? (
                          <div className="relative pl-6">
                              <div className="absolute left-[34px] top-4 bottom-4 w-0.5 bg-border -translate-x-1/2"></div>
                              {timelineEvents.map((event, index) => (
                                  <div key={index} className="relative flex items-start gap-6 pb-8 last:pb-0">
                                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-full shrink-0", event.completed ? 'bg-primary' : 'bg-muted border-2', event.status === 'Cancelled' && 'bg-destructive', event.status === 'Payment Pending' && 'bg-amber-500')}>
                                      <event.icon className={cn("h-6 w-6", event.completed ? 'text-primary-foreground' : 'text-muted-foreground')} />
                                  </div>
                                  <div>
                                      <p className={cn("font-semibold", !event.completed && "text-muted-foreground")}>{event.status}</p>
                                      <p className="text-sm text-muted-foreground">{event.completed ? 'Completed' : 'Pending'}</p>
                                      {event.status === 'Quote Ready' && currentStatus === 'Quote Ready' && (
                                          <Alert variant="default" className="mt-4 bg-primary/10 border-primary/50 text-primary-foreground">
                                              <AlertTitle className="font-bold text-primary">Action Required</AlertTitle>
                                              <AlertDescription className="text-primary/90">Your quote is ready. Please review the quote details and make a payment to proceed.</AlertDescription>
                                          </Alert>
                                      )}
                                      {event.status === 'Payment Pending' && currentStatus === 'Payment Pending' && (
                                           <Alert variant="default" className="mt-4 bg-amber-50 border-amber-200">
                                                <AlertTitle className="text-amber-800">Payment Pending</AlertTitle>
                                                <AlertDescription className="text-amber-700">Please complete the cash payment. The admin will confirm receipt to proceed.</AlertDescription>
                                           </Alert>
                                      )}
                                  </div>
                                  </div>
                              ))}
                          </div>
                     ) : (
                      <div className="text-center py-8 text-muted-foreground">
                          <p>The order timeline will be displayed here once the order is in progress.</p>
                      </div>
                     )}
                  </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-1 space-y-6">
               {isQuoteReadyOrLater && (
                  <Card>
                      <CardHeader>
                          <CardTitle>Quote Details</CardTitle>
                          <CardDescription>All-inclusive quote for your order.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                           {/* Product Info */}
                           <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary">
                              <div className="relative w-16 h-16 rounded-md border overflow-hidden shrink-0">
                                  {order.referenceImage ? (
                                      <Image src={order.referenceImage} alt={order.productName} fill className="object-contain" />
                                  ) : (
                                      <div className="w-full h-full bg-muted flex items-center justify-center">
                                          <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                                      </div>
                                  )}
                              </div>
                              <div className="flex-1">
                                  <h3 className="font-semibold">{order.productName}</h3>
                                  <p className="text-sm text-muted-foreground">Quantity: {order.quantity}</p>
                              </div>
                          </div>

                          {/* Financial Details */}
                           <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-2 text-muted-foreground"><Globe className="h-4 w-4"/> Sourced From</span>
                                  <span className="font-semibold">{order.sourcedCountry}</span>
                              </div>
                              <div className="flex justify-between">
                                  <span className="text-muted-foreground">Product Cost:</span>
                                  <span>${(order.productCost || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                  <span className="text-muted-foreground">Sourcing Fee:</span>
                                  <span>${(order.sourcingFee || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                  <span className="text-muted-foreground">Shipping &amp; Tax:</span>
                                  <span>${(order.shippingFee || 0).toFixed(2)}</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between font-bold text-base">
                                  <span>Total Amount:</span>
                                  <span>${(order.totalAmount || 0).toFixed(2)}</span>
                              </div>
                          </div>
                           <Separator />

                           {/* Actions */}
                           {currentStatus === 'Quote Ready' && (
                               <div className="space-y-2">
                                  <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                                      <DialogTrigger asChild>
                                      <Button className="w-full">
                                          <CreditCard className="mr-2 h-4 w-4"/> Make Payment
                                      </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                      <DialogHeader>
                                          <DialogTitle>Complete Your Payment</DialogTitle>
                                          <DialogDescription>
                                              Select a payment method for order #{order.id.substring(0,8)}.
                                              Total due: <span className="font-bold text-primary">${(order.totalAmount || 0).toFixed(2)}</span>
                                          </DialogDescription>
                                      </DialogHeader>
                                       <div className="py-4">
                                            <RadioGroup value={selectedPaymentMethod || ''} onValueChange={setSelectedPaymentMethod}>
                                                <div className="space-y-2">
                                                    {paymentMethodsLoading ? <p>Loading methods...</p> : 
                                                    paymentMethods.length > 0 ? paymentMethods.map(method => (
                                                        <Label key={method.id} htmlFor={method.id!} className="flex items-center gap-4 rounded-md border p-3 has-[:checked]:border-primary">
                                                            <RadioGroupItem value={method.id!} id={method.id!} />
                                                            <PaymentMethodIcon type={method.type} className="h-6 w-auto" />
                                                            <div className="flex-1">
                                                                <p className="font-semibold">{method.nickname}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {method.type === 'Bank Account' ? `${method.details.bankName} • ****${method.details.accountNumber.slice(-4)}` : `****${method.details.phoneNumber.slice(-4)}`}
                                                                </p>
                                                            </div>
                                                        </Label>
                                                    )) : <p className="text-sm text-muted-foreground text-center">No payment methods found. Please add one in the billing page.</p>
                                                    }
                                                </div>
                                            </RadioGroup>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button className="w-full" disabled={!selectedPaymentMethod}>
                                                    Confirm Payment of ${(order.totalAmount || 0).toFixed(2)}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                   Are you sure you want to pay ${(order.totalAmount || 0).toFixed(2)} for this order?
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleMakePayment}>Yes, Pay Now</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                      </DialogContent>
                                  </Dialog>
                                   <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                           <Button className="w-full" variant="secondary"><Clock className="mr-2 h-4 w-4"/> Arrange Cash Payment</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Arrange Cash Payment?</AlertDialogTitle>
                                                <AlertDialogDescription>This will notify the admin that you intend to pay in cash. Please contact support to complete the payment. Your order will be on hold until payment is confirmed.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleArrangeCashPayment}>Yes, Proceed</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                  <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                           <Button className="w-full" variant="outline"><XCircle className="mr-2 h-4 w-4"/> Cancel Order</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                                                <AlertDialogDescription>This will cancel your order request. This action cannot be undone.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Keep Order</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleCancelOrder}>Yes, Cancel Order</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                               </div>
                           )}
                           
                           {currentStatus === 'PaymentPending' && (
                                <Alert className="bg-amber-50 border-amber-200">
                                   <Clock className="h-4 w-4 text-amber-600" />
                                   <AlertTitle className="text-amber-800 font-semibold">Awaiting Payment Confirmation</AlertTitle>
                                   <AlertDescription className="text-amber-700">
                                       Your order is on hold. Please finalize your cash payment with our team.
                                   </AlertDescription>
                               </Alert>
                           )}

                           {currentStatus === 'Payment Confirmed' && (
                               <Alert className="bg-green-50 border-green-200">
                                   <CheckCircle className="h-4 w-4 text-green-600" />
                                   <AlertTitle className="text-green-800 font-semibold">Payment Complete</AlertTitle>
                                   <AlertDescription className="text-green-700">
                                       We have received your payment of ${(order.totalAmount || 0).toFixed(2)}. Your order is now being processed.
                                   </AlertDescription>
                               </Alert>
                           )}

                           {currentStatus === 'Cancelled' && (
                               <Alert variant="destructive">
                                   <XCircle className="h-4 w-4" />
                                   <AlertTitle>Order Cancelled</AlertTitle>
                                   <AlertDescription>You have cancelled this order. No further actions can be taken.</AlertDescription>
                               </Alert>
                           )}
                      </CardContent>
                  </Card>
               )}
            </div>
        </div>
       )}
    </div>
  );
}

    