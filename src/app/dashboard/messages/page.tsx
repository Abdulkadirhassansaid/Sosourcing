
"use client"

import * as React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive, MessageSquare, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useOrders, Order } from '@/hooks/use-orders';
import { formatDistanceToNow } from 'date-fns';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';

function ConversationItem({ order }: { order: Order }) {
    
    const [user, setUser] = React.useState<User | null>(null);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const lastMessage = order.conversation?.lastMessage;
    const lastMessageTimestamp = order.conversation?.lastMessageTimestamp?.toDate();
    const unreadCount = order.conversation?.unreadCount?.user || 0;
    const isUnread = unreadCount > 0;

    return (
        <li>
            <Link href={`/dashboard/messages/${order.id}`} className="block hover:bg-secondary">
                <div className="flex items-start gap-4 p-4">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={`https://placehold.co/100x100.png`} alt="Admin" data-ai-hint="business person" />
                        <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold truncate">Admin</p>
                            {lastMessageTimestamp && <p className="text-xs text-muted-foreground">{formatDistanceToNow(lastMessageTimestamp, { addSuffix: true })}</p>}
                        </div>
                        <p className="text-sm font-medium truncate">Order: {order.productName}</p>
                        <p className={cn("text-sm text-muted-foreground truncate", isUnread && "font-bold text-primary")}>{lastMessage || 'No messages yet'}</p>
                    </div>
                     <div className="flex flex-col items-end gap-2">
                        {isUnread && <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">{unreadCount}</div>}
                        <Badge variant="outline">{order.status}</Badge>
                    </div>
                </div>
            </Link>
        </li>
    );
}

export default function MessagesPage() {
    const { orders } = useOrders();

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
                <p className="text-muted-foreground mt-1">
                    Conversations with sourcing agents about your orders.
                </p>
            </header>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by agent or order..." className="pl-8" />
                        </div>
                         <Button variant="outline" className="w-full md:w-auto"><Archive className="mr-2 h-4 w-4" /> Archive All</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <ul className="divide-y divide-border">
                        {orders.length > 0 ? (
                            orders.map(order => (
                                <ConversationItem 
                                    key={order.id}
                                    order={order}
                                />
                            ))
                        ) : (
                            <div className="p-12 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                                <MessageSquare className="w-12 h-12 mb-4" />
                                <h3 className="text-lg font-semibold text-foreground">No Conversations</h3>
                                <p className="text-sm">Place an order to start a conversation with our sourcing team.</p>
                            </div>
                        )}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
