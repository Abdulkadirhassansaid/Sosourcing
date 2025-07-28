
"use client"

import { useState, useEffect, useCallback } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, query, where, orderBy, doc, updateDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  href: string;
  read: boolean;
  createdAt: string;
  orderId: string;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const notificationsCollection = collection(db, 'notifications');
    const q = query(notificationsCollection, where("userId", "==", user.uid));

    const unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
      const notificationsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          } as Notification
      });
      // Sort client-side to avoid needing a composite index
      notificationsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setNotifications(notificationsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications: ", error);
      setLoading(false);
    });

    return () => unsubscribeFirestore();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback(async (id: string) => {
    const notificationDoc = doc(db, 'notifications', id);
    await updateDoc(notificationDoc, { read: true });
  }, []);

  const markAllAsRead = useCallback(async () => {
    const batch = writeBatch(db);
    notifications.forEach(notification => {
      if (!notification.read) {
        const notificationDoc = doc(db, 'notifications', notification.id);
        batch.update(notificationDoc, { read: true });
      }
    });
    await batch.commit();
  }, [notifications]);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}
