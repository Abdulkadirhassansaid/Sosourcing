
"use client"

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, FileDown, PlusCircle, Search, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { useOrders, Order } from '@/hooks/use-orders';
import { format } from 'date-fns';

const getStatusVariant = (status: Order['status']) => {
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

export default function OrdersPage() {
  const { orders } = useOrders();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Your Orders</h1>
        <p className="text-muted-foreground mt-1">Track and manage all your past and current orders.</p>
      </header>

      <Card>
        <CardHeader>
             <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by order ID or product..." className="pl-8 w-full" />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
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
                    <Button asChild className="w-full md:w-auto"><Link href="/dashboard/orders/new"><PlusCircle className="mr-2 h-4 w-4" /> Create Order</Link></Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            {orders.length > 0 ? (
                 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map((order) => (
                        <Card key={order.id} className="overflow-hidden flex flex-col">
                             <CardHeader className="p-0">
                                <div className="relative aspect-video w-full">
                                {order.referenceImage ? (
                                    <Image src={order.referenceImage} alt={order.productName} fill className="object-contain" />
                                ) : (
                                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                                        <Package className="w-12 h-12 text-muted-foreground" />
                                    </div>
                                )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-2 flex-grow">
                                <div className="flex items-center justify-between">
                                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                    <p className="text-sm text-muted-foreground">{format(new Date(order.createdAt), "PPP")}</p>
                                </div>
                                <h3 className="text-lg font-semibold truncate">{order.productName}</h3>
                                <p className="text-sm text-muted-foreground">Order ID: {order.id.substring(0, 8)}...</p>
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                 <Button asChild variant="outline" size="sm" className="w-full">
                                    <Link href={`/dashboard/orders/${order.id}`}>
                                        View Details <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                 </div>
            ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                    <div className="flex flex-col items-center gap-4">
                        <Package className="h-12 w-12 text-muted-foreground" />
                        <h3 className="text-xl font-semibold">No orders yet</h3>
                        <p className="text-muted-foreground">When you create an order, it will appear here.</p>
                        <Button asChild><Link href="/dashboard/orders/new"><PlusCircle className="mr-2 h-4 w-4" /> Create Your First Order</Link></Button>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
