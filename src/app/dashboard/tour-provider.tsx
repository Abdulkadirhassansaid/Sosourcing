
"use client";

import 'shepherd.js/dist/css/shepherd.css';
import { ShepherdTour, ShepherdTourContext } from 'react-shepherd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';

const tourSteps = [
    {
        id: 'welcome',
        attachTo: { element: '#tour-step-1', on: 'right' as const },
        text: 'Welcome to your Dashboard! This is your main hub for everything.',
        buttons: [ { text: 'Next', action() { return this.next()} } ]
    },
    {
        id: 'orders',
        attachTo: { element: '#tour-step-2', on: 'right' as const },
        text: 'Here you can view and manage all of your past and current orders.',
        buttons: [ { text: 'Back', action() { return this.back()} }, { text: 'Next', action() { return this.next()} } ]
    },
    {
        id: 'create-order',
        attachTo: { element: '#tour-step-3', on: 'bottom' as const },
        text: 'Ready to source a new product? Click here to create a new order request.',
        buttons: [ { text: 'Back', action() { return this.back()} }, { text: 'Next', action() { return this.next()} } ]
    },
    {
        id: 'recent-orders',
        attachTo: { element: '#tour-step-4', on: 'top' as const },
        text: 'Your most recent orders will appear here for quick access.',
        buttons: [ { text: 'Back', action() { return this.back()} }, { text: 'Finish', action() { return this.complete()} } ]
    },
];

const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true,
    },
  },
  useModalOverlay: true,
};

function TourInstance({ run }: { run: boolean }) {
    const tour = useContext(ShepherdTourContext);

    useEffect(() => {
        if (run && tour) {
            // Using a timeout to ensure all DOM elements are available for attachment
            setTimeout(() => {
                tour.start();
            }, 500);
        }
    }, [run, tour]);

    return null;
}


export function TourProvider({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [runTour, setRunTour] = useState(false);

    useEffect(() => {
        const tourParam = searchParams.get('tour');
        if (tourParam === 'true') {
            setRunTour(true);
            // Clean up URL without a full page reload
            router.replace('/dashboard', { scroll: false });
        }
    }, [searchParams, router]);

    return (
        <ShepherdTour steps={tourSteps} tourOptions={tourOptions}>
            <TourInstance run={runTour} />
            {children}
        </ShepherdTour>
    );
}
