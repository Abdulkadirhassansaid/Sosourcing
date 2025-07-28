
"use client"

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Package, MessageSquare, Truck, ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useOrders, Order } from '@/hooks/use-orders';
import { format } from 'date-fns';

const getStatusVariant = (status: Order['status']) => {
  switch (status) {
    case 'Quote Ready':
      return 'default';
    case 'Sourcing':
      return 'outline';
    case 'Payment Confirmed':
    case 'Payment Pending':
      return 'destructive'
    default:
      return 'secondary';
  }
};


export default function DashboardPage() {
    const [userName, setUserName] = React.useState('');
    const router = useRouter();
    const { orders } = useOrders();
    const recentOrders = orders.slice(0, 5);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().fullName) {
                    setUserName(docSnap.data().fullName.split(' ')[0]);
                } else {
                    router.push('/onboarding');
                }
            } else {
                router.push('/login');
            }
        });
        return () => unsubscribe();
    }, [router]);

  return (
    <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Salaam, {userName}!</h1>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Button asChild className="w-full sm:w-auto"><Link href="/dashboard/orders/new"><PlusCircle className="mr-2 h-4 w-4" /> Create New Order</Link></Button>
            </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-l-4 border-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{orders.filter(o => ['Sourcing', 'Quote Ready', 'Payment Pending'].includes(o.status)).length}</div>
                    <p className="text-xs text-muted-foreground">Awaiting quotes or payment</p>
                </CardContent>
            </Card>
            <Card className="border-l-4 border-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">From your sourcing agent</p>
                </CardContent>
            </Card>
            <Card className="border-l-4 border-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Shipped Orders</CardTitle>
                    <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{orders.filter(o => o.status === 'Shipped').length}</div>
                    <p className="text-xs text-muted-foreground">Currently in transit</p>
                </CardContent>
            </Card>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Here's a quick look at your latest orders.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentOrders.length > 0 ? (
                                recentOrders.map(request => (
                                    <TableRow key={request.id}>
                                        <TableCell className="font-medium whitespace-nowrap">{request.id.substring(0, 8)}...</TableCell>
                                        <TableCell>{request.productName}</TableCell>
                                        <TableCell className="whitespace-nowrap">{format(new Date(request.createdAt), "PPP")}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(request.status)}>
                                            {request.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/dashboard/orders/${request.id}`}>
                                                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Package className="h-12 w-12 text-muted-foreground" />
                                            <h3 className="text-xl font-semibold">No Orders Yet</h3>
                                            <p className="text-muted-foreground">Ready to source a product? Create your first order to get started.</p>
                                            <Button asChild><Link href="/dashboard/orders/new"><PlusCircle className="mr-2 h-4 w-4" /> Create an Order</Link></Button>
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
  )
}
