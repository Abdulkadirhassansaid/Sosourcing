
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

export type PayoutMethod = {
  id?: string;
  adminId: string;
  nickname: string;
  type: 'Bank Account' | 'EVC Plus' | 'Waafi' | 'E-Dahab';
  details: BankAccountDetails | MobileMoneyDetails;
  createdAt: string;
};

const ADMIN_EMAIL = "mahir@gmail.com";

export function usePayoutMethods() {
  const [methods, setMethods] = useState<PayoutMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) {
        setMethods([]);
        setLoading(false);
        return;
    }

    const methodsCollection = collection(db, 'payoutMethods');
    const q = query(methodsCollection, where("adminId", "==", user.uid));

    const unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
      const methodsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PayoutMethod));
      setMethods(methodsData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching payout methods: ", error);
        setLoading(false);
    });

    return () => unsubscribeFirestore();

  }, [user]);

  const addMethod = async (method: Omit<PayoutMethod, 'id' | 'createdAt' | 'adminId'>) => {
    if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) throw new Error("User not authenticated as admin");
    
    const newMethod: Omit<PayoutMethod, 'id'> = {
      ...method,
      adminId: auth.currentUser.uid,
      createdAt: new Date().toISOString(),
    };
    await addDoc(collection(db, 'payoutMethods'), newMethod);
  };

  const updateMethod = async (id: string, data: Partial<Omit<PayoutMethod, 'id' | 'createdAt' | 'adminId' | 'type'>>) => {
    const methodDoc = doc(db, 'payoutMethods', id);
    await updateDoc(methodDoc, data);
  };

  const deleteMethod = async (id: string) => {
    const methodDoc = doc(db, 'payoutMethods', id);
    await deleteDoc(methodDoc);
  };

  return { methods, loading, addMethod, updateMethod, deleteMethod };
}
