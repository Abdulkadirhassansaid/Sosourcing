
"use client"

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

export type Transaction = {
    id: string;
    userId: string;
    type: 'deposit' | 'payment' | 'withdrawal' | 'fee';
    amount: number;
    createdAt: string;
    description: string;
    orderId?: string;
}

const ADMIN_EMAIL = "mahir@gmail.com";

export function useTransactions({ forAdmin = false } = {}) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
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
            setTransactions([]);
            setLoading(false);
            return;
        }

        const transCollection = collection(db, 'transactions');
        let q;

        if (forAdmin) {
            if (user.email === ADMIN_EMAIL) {
                // Admin sees all transactions
                q = query(transCollection);
            } else {
                // Non-admin trying to access admin data, return empty
                setTransactions([]);
                setLoading(false);
                return;
            }
        } else {
            // Regular user sees only their transactions
            q = query(transCollection, where("userId", "==", user.uid));
        }

        const unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
            const transData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Transaction));
            
            // Sort client-side to avoid needing a composite index for createdAt
            transData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
            setTransactions(transData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching transactions: ", error);
            setLoading(false);
        });

        return () => unsubscribeFirestore();

    }, [user, forAdmin]);

    return { transactions, loading };
}
