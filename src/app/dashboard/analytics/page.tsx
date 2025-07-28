
"use client"

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Info, Package, CheckCircle, Clock } from 'lucide-react';
import { useOrders } from '@/hooks/use-orders';
import { format, startOfMonth, subMonths } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from "recharts"

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

export default function AnalyticsPage() {
  const { orders } = useOrders();

  const analyticsData = React.useMemo(() => {
    if (orders.length === 0) {
      return {
        totalSpending: 0,
        totalOrders: 0,
        activeOrders: 0,
        completedOrders: 0,
        spendingByMonth: [],
        spendingByCategory: [],
        orderStatusDistribution: [],
      };
    }

    const completedOrdersList = orders.filter(o => o.status === 'Delivered');
    const activeOrdersList = orders.filter(o => ['Sourcing', 'Quote Ready', 'Payment Confirmed', 'Payment Pending', 'Shipped'].includes(o.status));
    
    const totalSpending = completedOrdersList.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    const last12Months: { month: string; spending: number }[] = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
        const date = subMonths(today, i);
        last12Months.push({
            month: format(startOfMonth(date), 'MMM'),
            spending: 0
        });
    }

    orders.forEach(order => {
        if (!order.totalAmount || order.status !== 'Delivered') return;
        const monthStr = format(startOfMonth(new Date(order.createdAt)), 'MMM');
        const monthData = last12Months.find(m => m.month === monthStr);
        if (monthData) {
            monthData.spending += order.totalAmount;
        }
    });

    const spendingByCategory = orders.reduce((acc, order) => {
        if (!order.totalAmount || order.status !== 'Delivered') return acc;
        const category = order.category;
        const existing = acc.find(item => item.category === category);
        if (existing) {
            existing.value += order.totalAmount;
        } else {
            acc.push({ category, value: order.totalAmount, fill: COLORS[acc.length % COLORS.length] });
        }
        return acc;
    }, [] as { category: string; value: number; fill: string }[]);

    const orderStatusDistribution = Object.entries(orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>)).map(([name, value], index) => ({ name, value, fill: COLORS[index % COLORS.length] }));


    return {
      totalSpending,
      totalOrders: orders.length,
      activeOrders: activeOrdersList.length,
      completedOrders: completedOrdersList.length,
      spendingByMonth: last12Months,
      spendingByCategory,
      orderStatusDistribution,
    };
  }, [orders]);
  
  const spendingChartConfig = {
    spending: { label: "Spending", color: "hsl(var(--primary))" },
  } satisfies ChartConfig

  const categoryChartConfig = {
    value: { label: "Value" },
    category: { label: "Category" },
  } satisfies ChartConfig

  const statusChartConfig = {
      value: { label: "Orders" },
      name: { label: "Status" },
  } satisfies ChartConfig


  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Your Analytics</h1>
        <p className="text-muted-foreground mt-1">Insights into your personal sourcing activity.</p>
      </header>

      {orders.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20">
            <CardHeader className="text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4 mx-auto">
                    <Info className="w-8 h-8 text-muted-foreground" />
                </div>
                <CardTitle>No Analytics Data</CardTitle>
                <CardDescription>Your order analytics will appear here once you have some activity.</CardDescription>
            </CardHeader>
        </Card>
      ) : (
        <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${analyticsData.totalSpending.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                        <p className="text-xs text-muted-foreground">on all delivered orders</p>
                    </CardContent>
                </Card>
                 <Card className="border-l-4 border-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">placed in total</p>
                    </CardContent>
                </Card>
                 <Card className="border-l-4 border-yellow-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.activeOrders}</div>
                        <p className="text-xs text-muted-foreground">currently in progress</p>
                    </CardContent>
                </Card>
                 <Card className="border-l-4 border-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.completedOrders}</div>
                        <p className="text-xs text-muted-foreground">successfully delivered</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                <CardTitle>Spending Over Time</CardTitle>
                <CardDescription>Your total spending on delivered products per month.</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                    <ChartContainer config={spendingChartConfig} className="h-full w-full">
                        <BarChart accessibilityLayer data={analyticsData.spendingByMonth}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="spending" fill="var(--color-spending)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-5">
                <Card className="xl:col-span-3">
                    <CardHeader>
                        <CardTitle>Spending by Category</CardTitle>
                        <CardDescription>Breakdown of your spending across different product categories.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                         <ChartContainer config={categoryChartConfig} className="h-full w-full">
                            <BarChart accessibilityLayer data={analyticsData.spendingByCategory} layout="vertical" margin={{ left: 10, right: 10 }}>
                                <CartesianGrid horizontal={false} />
                                <YAxis dataKey="category" type="category" tickLine={false} axisLine={false} tickMargin={10} width={120} />
                                <XAxis type="number" dataKey="value" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                                <ChartTooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                                <Bar dataKey="value" layout="vertical" radius={4}>
                                    {analyticsData.spendingByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle>Order Status Overview</CardTitle>
                        <CardDescription>Current distribution of all your orders by status.</CardDescription>
                    </CardHeader>
                     <CardContent className="h-80 flex items-center justify-center">
                        <ChartContainer config={statusChartConfig} className="h-full w-full">
                             <PieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                <Pie data={analyticsData.orderStatusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                     {analyticsData.orderStatusDistribution.map((entry, index) => (
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
