
"use client"

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, FileDown, Info, Users, Package, CircleDollarSign } from 'lucide-react';
import { useOrders } from '@/hooks/use-orders';
import { format, startOfMonth, subMonths } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { unparse } from 'papaparse';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from "recharts"

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

function OrdersListDialog({ children }: { children: React.ReactNode }) {
    const { orders, deleteOrder } = useOrders();
    const { toast } = useToast();

    const handleDelete = (id: string) => {
        deleteOrder(id);
        toast({ title: "Order Deleted", description: "The order has been removed from the database." });
    }

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>All Orders</DialogTitle>
                    <DialogDescription>A complete list of every order placed on the platform.</DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id.substring(0,8)}...</TableCell>
                                    <TableCell>{order.customerName}</TableCell>
                                    <TableCell>{order.productName}</TableCell>
                                    <TableCell>{order.status}</TableCell>
                                    <TableCell className="text-right">
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">Delete</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This will permanently delete this order. This action cannot be undone.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(order.id)}>Yes, Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function CustomersListDialog({ children }: { children: React.ReactNode }) {
    const { uniqueCustomers, blockUser } = useOrders();
    const { toast } = useToast();

    const handleBlock = (userId: string, isBlocked: boolean) => {
        blockUser(userId, !isBlocked);
        toast({ title: `User ${!isBlocked ? 'Blocked' : 'Unblocked'}`, description: `The user's access has been updated.` });
    }

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Active Customers</DialogTitle>
                    <DialogDescription>A list of all unique customers who have placed orders.</DialogDescription>
                </DialogHeader>
                 <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Orders</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {uniqueCustomers.map(customer => (
                               <TableRow key={customer.userId}>
                                   <TableCell>
                                       <div className="flex items-center gap-2">
                                           <Avatar className="h-8 w-8">
                                                <AvatarImage src={customer.avatar} alt={customer.name} />
                                                <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span>{customer.name}</span>
                                       </div>
                                   </TableCell>
                                   <TableCell>{customer.email}</TableCell>
                                   <TableCell>{customer.orderCount}</TableCell>
                                   <TableCell className="text-right">
                                        <Button variant={customer.isBlocked ? 'secondary' : 'destructive'} size="sm" onClick={() => handleBlock(customer.userId, !!customer.isBlocked)}>
                                            {customer.isBlocked ? 'Unblock' : 'Block'}
                                        </Button>
                                   </TableCell>
                               </TableRow>
                           ))}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    )
}


export default function AdminAnalyticsPage() {
  const { orders, uniqueCustomers } = useOrders();

  const analyticsData = React.useMemo(() => {
    if (orders.length === 0) {
      return {
        totalRevenue: 0,
        totalFees: 0,
        totalOrders: 0,
        activeCustomers: 0,
        revenueByMonth: [],
        categoryPerformance: [],
        sourcingCountryDistribution: [],
      };
    }

    const completedOrders = orders.filter(o => o.status === 'Delivered');
    const totalRevenue = completedOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const totalFees = completedOrders.reduce((acc, o) => acc + (o.sourcingFee || 0), 0);
    
    const last12Months: { month: string; revenue: number; fees: number }[] = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
        const date = subMonths(today, i);
        last12Months.push({
            month: format(startOfMonth(date), 'MMM'),
            revenue: 0,
            fees: 0
        });
    }

    orders.forEach(order => {
        if (!order.totalAmount || order.status !== 'Delivered') return;
        const monthStr = format(startOfMonth(new Date(order.createdAt)), 'MMM');
        const monthData = last12Months.find(m => m.month === monthStr);
        if (monthData) {
            monthData.revenue += order.totalAmount;
            monthData.fees += order.sourcingFee || 0;
        }
    });

    const categoryPerformance = orders.reduce((acc, order) => {
        if (!order.totalAmount || order.status !== 'Delivered') return acc;
        const category = order.category;
        const existing = acc.find(item => item.category === category);
        if (existing) {
            existing.value += order.totalAmount;
        } else {
            acc.push({ category, value: order.totalAmount, fill: COLORS[acc.length % COLORS.length] });
        }
        return acc;
    }, [] as { category: string; value: number, fill: string }[]).sort((a,b) => b.value - a.value).slice(0, 5);

    const sourcingCountryDistribution = Object.entries(
        orders.reduce((acc, order) => {
            if (!order.sourcedCountry) return acc;
            acc[order.sourcedCountry] = (acc[order.sourcedCountry] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    ).map(([name, value], index) => ({ name, value, fill: COLORS[index % COLORS.length] }));


    return {
        totalRevenue,
        totalFees,
        totalOrders: orders.length,
        activeCustomers: uniqueCustomers.length,
        revenueByMonth: last12Months,
        categoryPerformance,
        sourcingCountryDistribution,
    };
  }, [orders, uniqueCustomers]);

  const revenueChartConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--primary))" },
    fees: { label: "Fees", color: "hsl(var(--accent))" },
  } satisfies ChartConfig

   const categoryChartConfig = {
    value: { label: "Value" },
    category: { label: "Category" },
  } satisfies ChartConfig

  const countryChartConfig = {
      value: { label: "Orders" },
      name: { label: "Country" },
  } satisfies ChartConfig

  const handleExport = () => {
    const kpiData = [
      { Statistic: 'Total Revenue', Value: analyticsData.totalRevenue },
      { Statistic: 'Total Platform Fees', Value: analyticsData.totalFees },
      { Statistic: 'Total Orders', Value: analyticsData.totalOrders },
      { Statistic: 'Active Customers', Value: analyticsData.activeCustomers },
    ];
    
    const kpiCsv = unparse(kpiData);
    const revenueCsv = unparse(analyticsData.revenueByMonth);
    const categoryCsv = unparse(analyticsData.categoryPerformance.map(c => ({category: c.category, value: c.value})));
    const countryCsv = unparse(analyticsData.sourcingCountryDistribution.map(c => ({name: c.name, value: c.value})));

    const fullCsv = [
      "Platform KPIs",
      kpiCsv,
      "", 
      "Revenue & Fees Over Time",
      revenueCsv,
      "",
      "Top Categories by Value",
      categoryCsv,
      "",
      "Sourcing Country Distribution",
      countryCsv,
    ].join("\n");

    const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) URL.revokeObjectURL(link.href);
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `SoSourcing_Analytics_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Analytics</h1>
          <p className="text-muted-foreground mt-1">High-level overview of the platform's performance.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Button className="w-full sm:w-auto" onClick={handleExport}><FileDown className="mr-2 h-4 w-4" /> Export Report</Button>
        </div>
      </header>

      {orders.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20">
            <CardHeader className="text-center">
                 <div className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4 mx-auto">
                    <Info className="w-8 h-8 text-muted-foreground" />
                </div>
                <CardTitle>No Analytics Data</CardTitle>
                <CardDescription>Platform analytics will appear here once customers start creating orders.</CardDescription>
            </CardHeader>
        </Card>
      ) : (
        <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-l-4 border-blue-500 rounded-l-sm">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${analyticsData.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                        <p className="text-xs text-muted-foreground">from delivered orders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-l-4 border-green-500 rounded-l-sm">
                        <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
                        <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${analyticsData.totalFees.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                        <p className="text-xs text-muted-foreground">earned from delivered orders</p>
                    </CardContent>
                </Card>
                 <OrdersListDialog>
                     <Card className="cursor-pointer hover:bg-secondary transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-l-4 border-orange-500 rounded-l-sm">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{analyticsData.totalOrders}</div>
                            <p className="text-xs text-muted-foreground">across all statuses</p>
                        </CardContent>
                    </Card>
                 </OrdersListDialog>
                 <CustomersListDialog>
                    <Card className="cursor-pointer hover:bg-secondary transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-l-4 border-purple-500 rounded-l-sm">
                            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analyticsData.activeCustomers}</div>
                            <p className="text-xs text-muted-foreground">who have placed orders</p>
                        </CardContent>
                    </Card>
                 </CustomersListDialog>
            </div>

            <Card>
                <CardHeader>
                <CardTitle>Revenue & Fees Over Time</CardTitle>
                <CardDescription>Comparison of total revenue vs. platform fees earned per month.</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                   <ChartContainer config={revenueChartConfig} className="h-full w-full">
                        <BarChart accessibilityLayer data={analyticsData.revenueByMonth}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                            <Bar dataKey="fees" fill="var(--color-fees)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Top Categories by Order Value</CardTitle>
                        <CardDescription>The 5 most valuable product categories.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                         <ChartContainer config={categoryChartConfig} className="h-full w-full">
                            <BarChart accessibilityLayer data={analyticsData.categoryPerformance} layout="vertical" margin={{ left: 10, right: 10 }}>
                                <CartesianGrid horizontal={false} />
                                <YAxis dataKey="category" type="category" tickLine={false} axisLine={false} tickMargin={10} width={120} />
                                <XAxis type="number" dataKey="value" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                                <ChartTooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                                <Bar dataKey="value" layout="vertical" radius={4}>
                                    {analyticsData.categoryPerformance.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Sourcing Country</CardTitle>
                        <CardDescription>Distribution of orders by sourcing country.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80 flex items-center justify-center">
                        <ChartContainer config={countryChartConfig} className="h-full w-full">
                             <PieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                <Pie data={analyticsData.sourcingCountryDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} label>
                                     {analyticsData.sourcingCountryDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </>
      )}
    </div>
  );
}

    