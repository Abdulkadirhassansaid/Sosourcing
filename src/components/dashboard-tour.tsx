
"use client"

import * as React from 'react';
import Joyride, { Step } from 'react-joyride';

type DashboardTourProps = {
    run: boolean;
    setRun: (run: boolean) => void;
};

export const DashboardTour: React.FC<DashboardTourProps> = ({ run, setRun }) => {
    const [steps] = React.useState<Step[]>([
        {
            target: '#tour-step-1',
            content: 'Welcome to your Dashboard! This is your main hub for everything.',
            placement: 'right',
        },
        {
            target: '#tour-step-2',
            content: 'Here you can view and manage all of your past and current orders.',
            placement: 'right',
        },
        {
            target: '#tour-step-3',
            content: 'Ready to source a new product? Click here to create a new order request.',
            placement: 'bottom',
        },
        {
            target: '#tour-step-4',
            content: 'Your most recent orders will appear here for quick access.',
            placement: 'top',
        },
    ]);

    return (
        <Joyride
            run={run}
            steps={steps}
            continuous
            showProgress
            showSkipButton
            callback={({ status }) => {
                const finishedStatuses: string[] = ['finished', 'skipped'];
                if (finishedStatuses.includes(status)) {
                    setRun(false);
                }
            }}
            styles={{
                options: {
                    primaryColor: 'hsl(var(--primary))',
                    textColor: 'hsl(var(--foreground))',
                    arrowColor: 'hsl(var(--card))',
                    backgroundColor: 'hsl(var(--card))',
                    zIndex: 1000,
                },
                spotlight: {
                    borderRadius: '0.5rem',
                }
            }}
        />
    );
};
