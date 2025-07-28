
"use client"

import { useState, useEffect, useCallback } from 'react';
import { db, auth, storage } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, Timestamp, doc, updateDoc, setDoc, getDoc, increment, writeBatch, getDocs, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export type Message = {
  id?: string;
  conversationId: string;
  senderId: string;
  senderName: string; 
  text?: string;
  timestamp: string;
  type: 'text' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
};

const ADMIN_EMAIL = 'mahir@gmail.com';

export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createMessageDocument = useCallback(async (data: Partial<Message>) => {
    const user = auth.currentUser;
    if (!user || !conversationId) return;

    const isUserAdmin = user.email === ADMIN_EMAIL;
    const batch = writeBatch(db);

    const newMessageRef = doc(collection(db, 'conversations', conversationId, 'messages'));
    batch.set(newMessageRef, {
      ...data,
      conversationId,
      senderId: user.uid,
      senderName: user.displayName || user.email || 'Anonymous',
      timestamp: serverTimestamp(),
    });

    const conversationDocRef = doc(db, 'conversations', conversationId);
    const counterToIncrement = isUserAdmin ? 'unreadCount.user' : 'unreadCount.admin';
    const lastMessageText = data.type === 'file' ? `Sent an attachment: ${data.fileName}` : data.text;
    
    batch.set(conversationDocRef, {
        lastMessage: lastMessageText,
        lastMessageTimestamp: serverTimestamp(),
        unreadCount: {
          ...((await getDoc(conversationDocRef)).data()?.unreadCount || { user: 0, admin: 0 }),
          [isUserAdmin ? 'user' : 'admin']: increment(1),
        }
    }, { merge: true });

    // Create a notification
    const orderDocSnap = await getDoc(doc(db, 'orders', conversationId));
    if (orderDocSnap.exists()) {
        const orderData = orderDocSnap.data();
        const adminUsersQuery = query(collection(db, "users"), where("email", "==", ADMIN_EMAIL));
        const adminSnapshot = await getDocs(adminUsersQuery);
        const adminId = !adminSnapshot.empty ? adminSnapshot.docs[0].id : null;
        
        const recipientId = isUserAdmin ? orderData.userId : adminId;

        if (recipientId) {
            const notificationRef = doc(collection(db, 'notifications'));
            batch.set(notificationRef, {
                userId: recipientId,
                orderId: conversationId,
                title: `New Message`,
                message: `You have a new message about order #${conversationId.substring(0, 6)}...`,
                href: isUserAdmin ? `/admin/messages/${conversationId}` : `/dashboard/messages/${conversationId}`,
                read: false,
                createdAt: serverTimestamp(),
            });
        }
    }

    await batch.commit();
  }, [conversationId]);


  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    const user = auth.currentUser;
    if (!user) return;

    const messagesCollection = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesCollection, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const messagesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: (data.timestamp as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        } as Message;
      });
      setMessages(messagesData);
      setLoading(false);

      const conversationDocRef = doc(db, 'conversations', conversationId);
      const convSnap = await getDoc(conversationDocRef);
      if (!convSnap.exists()) return;

      const readByField = user.email === ADMIN_EMAIL ? 'unreadCount.admin' : 'unreadCount.user';
      
      const unreadCount = convSnap.data().unreadCount;
      if (unreadCount && (user.email === ADMIN_EMAIL ? unreadCount.admin > 0 : unreadCount.user > 0)) {
           updateDoc(conversationDocRef, {
              [readByField]: 0
          }).catch(e => console.log("Failed to mark as read:", e));
      }
    }, (error) => {
      console.error("Error fetching messages: ", error);
      setLoading(false);
    });

    return () => unsubscribe();

  }, [conversationId]);

  const sendMessage = useCallback(async (messageData: { text?: string; file?: File }) => {
    const user = auth.currentUser;
    if (!user || !conversationId) {
      console.error("User not authenticated or no conversation ID provided.");
      return;
    }
    
    if (messageData.file) {
        const file = messageData.file;
        setUploading(true);
        const storageRef = ref(storage, `chat-attachments/${conversationId}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload failed:", error);
                setUploading(false);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                 await createMessageDocument({
                    type: 'file',
                    fileUrl: downloadURL,
                    fileName: file.name,
                    fileType: file.type,
                });
                setUploading(false);
                setUploadProgress(0);
            }
        );
    } else if (messageData.text) {
        await createMessageDocument({
            type: 'text',
            text: messageData.text,
        });
    }

  }, [conversationId, createMessageDocument]);
  
  return { messages, loading, sendMessage, uploading, uploadProgress };
}
