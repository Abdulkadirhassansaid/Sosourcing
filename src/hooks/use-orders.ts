
"use client"

import { useState, useEffect, useMemo, useCallback } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, where, getDocs, DocumentData, writeBatch, serverTimestamp, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import type { Transaction } from './use-transactions';

export type ConversationMeta = {
    lastMessage?: string;
    lastMessageTimestamp?: Timestamp;
    unreadBy?: ('user' | 'admin')[];
    unreadCount?: {
        user: number;
        admin: number;
    }
}

export type Order = {
  id: string;
  userId: string;
  customerName?: string;
  customerAvatar?: string;
  customerEmail?: string;
  isBlocked?: boolean;
  productName: string;
  category: string;
  specifications: string;
  productLink?: string;
  referenceImage?: any;
  quantity: number;
  targetPrice?: number;
  city: string;
  phoneNumber: string;
  deliveryAddress: string;
  createdAt: string;
  status: 'Sourcing' | 'Quote Ready' | 'Payment Confirmed' | 'Payment Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  productCost?: number;
  sourcingFee?: number;
  shippingFee?: number;
  totalAmount?: number;
  sourcedCountry?: string;
  conversation?: ConversationMeta;
};

export type Customer = {
    userId: string;
    name: string;
    email: string;
    avatar?: string;
    isBlocked?: boolean;
    orderCount: number;
}

export type OrderPaymentDetails = Pick<Order, 'productCost' | 'sourcingFee' | 'shippingFee' | 'totalAmount' | 'sourcedCountry'>;

const ADMIN_EMAIL = "mahir@gmail.com";

const fetchUsers = async (userIds: string[]): Promise<Map<string, DocumentData>> => {
  const usersMap = new Map<string, DocumentData>();
  if (userIds.length === 0) return usersMap;

  const MAX_IN_QUERY_SIZE = 30;
  const userBatches: string[][] = [];
  for (let i = 0; i < userIds.length; i += MAX_IN_QUERY_SIZE) {
      userBatches.push(userIds.slice(i, i + MAX_IN_QUERY_SIZE));
  }
  
  const userPromises = userBatches.map(batch => 
      getDocs(query(collection(db, 'users'), where('__name__', 'in', batch)))
  );

  const userSnapshots = await Promise.all(userPromises);
  for (const userSnapshot of userSnapshots) {
      userSnapshot.forEach(doc => {
          usersMap.set(doc.id, doc.data());
      });
  }
  return usersMap;
};

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<User | null>(null);

   useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  const updateOrdersState = useCallback((newOrders: Order[], currentUser: User) => {
      const currentUserRole = currentUser.email === ADMIN_EMAIL ? 'admin' : 'user';
      newOrders.sort((a, b) => {
          const aUnreadCount = (currentUserRole === 'admin' ? a.conversation?.unreadCount?.admin : a.conversation?.unreadCount?.user) || 0;
          const bUnreadCount = (currentUserRole === 'admin' ? b.conversation?.unreadCount?.admin : b.conversation?.unreadCount?.user) || 0;
          
          if (aUnreadCount > 0 && bUnreadCount === 0) return -1;
          if (aUnreadCount === 0 && bUnreadCount > 0) return 1;

          const aTimestamp = a.conversation?.lastMessageTimestamp?.toMillis() || new Date(a.createdAt).getTime();
          const bTimestamp = b.conversation?.lastMessageTimestamp?.toMillis() || new Date(b.createdAt).getTime();

          return bTimestamp - aTimestamp;
      });
      setOrders(newOrders);
  }, []);

  useEffect(() => {
    if (!user) {
        setOrders([]);
        return;
    }

    const ordersCollection = collection(db, 'orders');
    const q = user.email === ADMIN_EMAIL ? query(ordersCollection) : query(ordersCollection, where("userId", "==", user.uid));
    
    const unsubscribeOrders = onSnapshot(q, async (ordersSnapshot) => {
        const ordersData = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        
        // Batch fetch user data for performance
        const userIds = [...new Set(ordersData.map(o => o.userId).filter(Boolean))];
        const usersMap = await fetchUsers(userIds);

        // Fetch all relevant conversation data in one go
        const orderIds = ordersData.map(o => o.id);
        const conversationsMap = new Map<string, ConversationMeta>();
        if (orderIds.length > 0) {
            const MAX_IN_QUERY_SIZE = 30;
            const orderIdBatches: string[][] = [];
            for (let i = 0; i < orderIds.length; i += MAX_IN_QUERY_SIZE) {
                orderIdBatches.push(orderIds.slice(i, i + MAX_IN_QUERY_SIZE));
            }
            const convPromises = orderIdBatches.map(batch => 
                getDocs(query(collection(db, 'conversations'), where('__name__', 'in', batch)))
            );
            const convSnapshots = await Promise.all(convPromises);

            for (const convSnapshot of convSnapshots) {
                convSnapshot.forEach(doc => {
                    conversationsMap.set(doc.id, doc.data() as ConversationMeta);
                });
            }
        }

        const enrichedOrders = ordersData.map(order => {
            const userData = usersMap.get(order.userId);
            const conversationData = conversationsMap.get(order.id);
            return {
                ...order,
                customerName: userData?.fullName,
                customerEmail: userData?.email,
                isBlocked: userData?.isBlocked,
                customerAvatar: userData?.profile?.avatar,
                conversation: conversationData,
            };
        });

        updateOrdersState(enrichedOrders, user);
    });

    return () => unsubscribeOrders();

  }, [user, updateOrdersState]);

  const uniqueCustomers = useMemo(() => {
    const customerMap = new Map<string, Customer>();
    orders.forEach(order => {
        if (!order.userId || !order.customerName) return;

        if (customerMap.has(order.userId)) {
            const existing = customerMap.get(order.userId)!;
            existing.orderCount++;
        } else {
            customerMap.set(order.userId, {
                userId: order.userId,
                name: order.customerName,
                email: order.customerEmail || 'N/A',
                avatar: order.customerAvatar,
                isBlocked: order.isBlocked,
                orderCount: 1,
            });
        }
    });
    return Array.from(customerMap.values());
  }, [orders]);

  const addOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'status' | 'userId' | 'customerName' | 'customerAvatar' | 'customerEmail' | 'isBlocked'>) => {
    if (!auth.currentUser) throw new Error("User not authenticated");

    const adminUsersQuery = query(collection(db, "users"), where("email", "==", ADMIN_EMAIL));
    const adminSnapshot = await getDocs(adminUsersQuery);
    const adminId = !adminSnapshot.empty ? adminSnapshot.docs[0].id : null;

    const newOrder: Omit<Order, 'id'> & { adminId?: string | null } = {
      ...order,
      userId: auth.currentUser.uid,
      createdAt: new Date().toISOString(),
      status: 'Sourcing',
      adminId: adminId,
    };
    const orderDocRef = await addDoc(collection(db, 'orders'), newOrder);
    
    const batch = writeBatch(db);

    // Conversation
    const conversationDocRef = doc(db, 'conversations', orderDocRef.id);
    batch.set(conversationDocRef, {
      userId: auth.currentUser.uid,
      orderId: orderDocRef.id,
      lastMessage: `Order created for ${order.productName}.`,
      lastMessageTimestamp: serverTimestamp(),
      unreadCount: { admin: 1, user: 0 }
    });
    
    const messagesCollectionRef = collection(conversationDocRef, 'messages');
    batch.set(doc(messagesCollectionRef), {
        conversationId: orderDocRef.id,
        senderId: 'system',
        senderName: 'System',
        text: `Order created for ${order.productName}.`,
        type: 'text',
        timestamp: serverTimestamp(),
    });

    // Notification for admin
    if (adminId) {
        const notificationRef = doc(collection(db, 'notifications'));
        batch.set(notificationRef, {
            userId: adminId,
            orderId: orderDocRef.id,
            title: "New Order Submitted",
            message: `${order.productName} (x${order.quantity})`,
            href: `/admin/orders/${orderDocRef.id}`,
            read: false,
            createdAt: serverTimestamp(),
        });
    }

    await batch.commit();

    return { ...newOrder, id: orderDocRef.id };
  };

  const getOrder = (id: string) => {
    return orders.find(order => order.id === id);
  };
  
  const updateOrderStatus = async (id: string, status: Order['status']) => {
    const orderDocRef = doc(db, 'orders', id);
    const batch = writeBatch(db);
    
    batch.update(orderDocRef, { status });

    // Create notification
    const orderSnap = await getDoc(orderDocRef);
    if(orderSnap.exists()) {
        const orderData = orderSnap.data();
        const notificationRef = doc(collection(db, 'notifications'));
        batch.set(notificationRef, {
            userId: orderData.userId,
            orderId: id,
            title: `Order Status Updated: ${status}`,
            message: `Your order for "${orderData.productName}" is now ${status}.`,
            href: `/dashboard/orders/${id}`,
            read: false,
            createdAt: serverTimestamp(),
        });
    }

    await batch.commit();
  };
  
  const updateOrderPaymentDetails = async (id: string, paymentDetails: Partial<OrderPaymentDetails>) => {
    const orderDocRef = doc(db, 'orders', id);
    await updateDoc(orderDocRef, paymentDetails as any);
  };

  const deleteOrder = async (id: string) => {
    const orderDocRef = doc(db, 'orders', id);
    await deleteDoc(orderDocRef);
  };

  const blockUser = async (userId: string, isBlocked: boolean) => {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { isBlocked });
  };

  return { orders, uniqueCustomers, addOrder, getOrder, updateOrderStatus, updateOrderPaymentDetails, deleteOrder, blockUser };
}
