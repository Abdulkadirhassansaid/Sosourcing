
"use client"

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, doc, deleteDoc, query, where, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

type BankAccountDetails = {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
}

type MobileMoneyDetails = {
    phoneNumber: string;
}

export type PaymentMethod = {
  id?: string;
  userId: string;
  nickname: string;
  type: 'Bank Account' | 'EVC Plus' | 'Waafi' | 'E-Dahab';
  details: BankAccountDetails | MobileMoneyDetails;
  createdAt: string;
};

export function usePaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
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
        setMethods([]);
        setLoading(false);
        return;
    }

    const methodsCollection = collection(db, 'paymentMethods');
    const q = query(methodsCollection, where("userId", "==", user.uid));

    const unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
      const methodsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PaymentMethod));
      setMethods(methodsData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching payment methods: ", error);
        setLoading(false);
    });

    return () => unsubscribeFirestore();

  }, [user]);

  const addMethod = async (method: Omit<PaymentMethod, 'id' | 'createdAt' | 'userId'>) => {
    if (!auth.currentUser) throw new Error("User not authenticated");
    
    const newMethod: Omit<PaymentMethod, 'id'> = {
      ...method,
      userId: auth.currentUser.uid,
      createdAt: new Date().toISOString(),
    };
    await addDoc(collection(db, 'paymentMethods'), newMethod);
  };

  const updateMethod = async (id: string, data: Partial<Omit<PaymentMethod, 'id' | 'createdAt' | 'userId' | 'type'>>) => {
    const methodDoc = doc(db, 'paymentMethods', id);
    await updateDoc(methodDoc, data);
  };

  const deleteMethod = async (id: string) => {
    const methodDoc = doc(db, 'paymentMethods', id);
    await deleteDoc(methodDoc);
  };

  return { methods, loading, addMethod, updateMethod, deleteMethod };
}

    