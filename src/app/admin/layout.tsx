
"use client"

import * as React from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarFooter, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BarChart, Bell, Home, LogOut, MessageSquare, Settings, Users, Wallet, X, Check } from 'lucide-react';
import { useOrders } from '@/hooks/use-orders';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { ThemeToggle } from '@/components/theme-toggle';
import { useNotifications, Notification } from '@/hooks/use-notifications';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const ADMIN_EMAIL = "mahir@gmail.com";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = React.useState<any>(null);
  const router = useRouter();
  const { orders } = useOrders();
  const [unreadConversations, setUnreadConversations] = React.useState(0);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email === ADMIN_EMAIL) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);
  
  React.useEffect(() => {
    if (!user) return;

    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('unreadCount.admin', '>', 0)
    );

    const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
      setUnreadConversations(snapshot.size);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = () => {
    auth.signOut().then(() => {
      router.push('/login');
    });
  };
  
  if (!user) {
    return <div className="flex h-screen w-full items-center justify-center"><p>Loading...</p></div>
  }

  return (
    <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
              <div className="flex items-center gap-2">
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-6 w-6 text-primary"
                      >
                      <path d="M12 2L1 9l4 1v9h3v-6h4v6h3v-9l4-1-11-7z" />
                  </svg>
                  <span className="text-lg font-semibold">SomImports Admin</span>
              </div>
          </SidebarHeader>
          <SidebarMenu>
              <SidebarMenuButton href="/admin/dashboard" tooltip="Dashboard" ><Home />Dashboard</SidebarMenuButton>
                <SidebarMenuButton href="/admin/orders" tooltip="All Orders" >
                  <Users />All Orders {orders.length > 0 && <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground text-xs font-medium text-primary">{orders.length}</span>}
              </SidebarMenuButton>
              <SidebarMenuButton href="/admin/billing" tooltip="Billing">
                  <Wallet />Billing
              </SidebarMenuButton>
              <SidebarMenuButton href="/admin/messages" tooltip="All Messages" >
                  <MessageSquare />All Messages {unreadConversations > 0 && <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">{unreadConversations}</span>}
              </SidebarMenuButton>
              <SidebarMenuButton href="/admin/analytics" tooltip="Analytics"><BarChart />Analytics</SidebarMenuButton>
          </SidebarMenu>
          <SidebarFooter>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="min-h-screen flex-1">
            <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
                <div className="flex items-center gap-4 md:hidden">
                    <SidebarTrigger />
                </div>
                <div className="flex flex-1 items-center justify-end space-x-2">
                    <AdminDropdown userEmail={user.email} onLogout={handleLogout} />
                </div>
            </header>
            <main className="p-4 sm:p-6">
                {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  )
}


const AdminDropdown = React.memo(function AdminDropdown({ userEmail, onLogout }: { userEmail: string; onLogout: () => void; }) {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
    }

    return (
        <div className="flex items-center gap-4 py-2">
            <ThemeToggle />
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8 relative">
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">{unreadCount}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                    <div className="p-4 border-b">
                        <h4 className="font-medium text-sm">Notifications</h4>
                    </div>
                    <div className="p-2 max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <Link
                                    key={notif.id}
                                    href={notif.href}
                                    className={cn(
                                        "block rounded-md p-3 hover:bg-secondary",
                                        !notif.read && "bg-blue-50 dark:bg-blue-900/30"
                                    )}
                                    onClick={() => handleNotificationClick(notif)}
                                >
                                    <p className="font-semibold text-sm">{notif.title}</p>
                                    <p className="text-xs text-muted-foreground">{notif.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                    </p>
                                </Link>
                            ))
                        ) : (
                            <p className="p-4 text-center text-sm text-muted-foreground">No new notifications.</p>
                        )}
                    </div>
                     {notifications.length > 0 && (
                        <div className="p-2 border-t">
                            <Button variant="link" size="sm" onClick={markAllAsRead} className="w-full">
                                <Check className="mr-2 h-4 w-4" /> Mark all as read
                            </Button>
                        </div>
                    )}
                </PopoverContent>
            </Popover>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                     <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="https://placehold.co/100x100.png" alt="Admin" data-ai-hint="business person" />
                            <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">Admin</p>
                            <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem><Settings className="mr-2 h-4 w-4" /><span>Settings</span></DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout}><LogOut className="mr-2 h-4 w-4" /><span>Log out</span></DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
});
