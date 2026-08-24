import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { ReactNode } from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Initialize theme outside of React component context
initializeTheme();

function AppInitializer({ children }: { children: ReactNode }) {
    useFlashToast();
    return <>{children}</>;
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: false,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                <AppInitializer>
                    {app}
                </AppInitializer>
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        delay: 250,
        color: '#22C55E',
        includeCSS: true,
        showSpinner: false,
    },
});
