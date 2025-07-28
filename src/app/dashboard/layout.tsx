
"use client"

import * as React from 'react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset } from '@/components/ui/sidebar';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BarChart, Bell, Home, LogOut, MessageSquare, Package, Search, Settings, Truck, User, LifeBuoy, X, Wallet2, Check } from 'lucide-react';
import { doc, getDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { useOrders } from '@/hooks/use-orders';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { Sheet, SheetClose, SheetContent } from '@/components/ui/sheet';
import { useNotifications, Notification } from '@/hooks/use-notifications';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDistanceToNow } from 'date-fns';
import { TourProvider } from './tour-provider';


const ADMIN_EMAIL = "mahir@gmail.com";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = React.useState<any>(null);
  const [userName, setUserName] = React.useState('');
  const [userEmail, setUserEmail] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState('');
  const router = useRouter();
  const { orders } = useOrders();
  const [unreadConversations, setUnreadConversations] = React.useState(0);
  
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        if (currentUser.email === ADMIN_EMAIL) {
            router.push('/admin/dashboard');
            return;
        }
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
             if (data.profile) {
                setUser(currentUser);
                setUserEmail(currentUser.email || '');
                setUserName(data.fullName);
                setAvatarUrl(data.profile?.avatar || '');
             } else {
                router.push('/onboarding');
             }
        } else {
            router.push('/onboarding');
        }
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
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
        const unreadCount = snapshot.docs.filter(doc => doc.data().unreadCount?.user > 0).length;
        setUnreadConversations(unreadCount);
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
    <React.Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><p>Loading Dashboard...</p></div>}>
      <TourProvider>
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
                        <span className="text-lg font-semibold">SomImports</span>
                    </div>
                </SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuButton href="/dashboard" tooltip="Dashboard" id="tour-step-1"><Home />Dashboard</SidebarMenuButton>
                    <SidebarMenuButton href="/dashboard/orders" tooltip="Orders" id="tour-step-2">
                        <Truck />Orders {orders.length > 0 && <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground text-xs font-medium text-primary">{orders.length}</span>}
                    </SidebarMenuButton>
                    <SidebarMenuButton href="/dashboard/billing" tooltip="Billing" >
                        <Wallet2 />Billing
                    </SidebarMenuButton>
                    <SidebarMenuButton href="/dashboard/messages" tooltip="Messages" >
                        <MessageSquare />Messages {unreadConversations > 0 && <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">{unreadConversations}</span>}
                    </SidebarMenuButton>
                    <SidebarMenuButton href="/dashboard/analytics" tooltip="Analytics"><BarChart />Analytics</SidebarMenuButton>
                </SidebarMenu>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuButton href="/dashboard/settings" tooltip="Settings"><Settings />Settings</SidebarMenuButton>
                        <SidebarMenuButton href="/dashboard/help" tooltip="Help"><LifeBuoy />Help Center</SidebarMenuButton>
                        <SidebarMenuButton onClick={handleLogout} tooltip="Logout" className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"><LogOut />Logout</SidebarMenuButton>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset className="flex-1 min-h-screen">
                <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
                    <div className="flex items-center gap-4 md:hidden">
                        <SidebarTrigger />
                    </div>
                    <div className="flex flex-1 items-center justify-end space-x-2">
                        <UserDropdown userName={userName} userEmail={userEmail} avatarUrl={avatarUrl} onLogout={handleLogout} />
                    </div>
                </header>
                <main className="p-4 sm:p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    </TourProvider>
    </React.Suspense>
  )
}


const UserDropdown = React.memo(function UserDropdown({ userName, userEmail, avatarUrl, onLogout }: { userName: string; userEmail: string; avatarUrl: string; onLogout: () => void; }) {
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
                            <AvatarImage src={avatarUrl} alt={userName} data-ai-hint="business person" />
                            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{userName}</p>
                            <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings"><User className="mr-2 h-4 w-4" /><span>Profile</span></Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                             <Link href="/dashboard/settings"><Settings className="mr-2 h-4 w-4" /><span>Settings</span></Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout}><LogOut className="mr-2 h-4 w-4" /><span>Log out</span></DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
});
