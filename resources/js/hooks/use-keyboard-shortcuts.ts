import { useEffect } from 'react';

type KeyboardShortcut = {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
    callback: () => void;
    description: string;
};

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            for (const shortcut of shortcuts) {
                const {
                    key,
                    ctrl = false,
                    shift = false,
                    alt = false,
                    meta = false,
                    callback,
                } = shortcut;

                const keyMatches = event.key.toLowerCase() === key.toLowerCase();
                const ctrlMatches = ctrl === event.ctrlKey;
                const shiftMatches = shift === event.shiftKey;
                const altMatches = alt === event.altKey;
                const metaMatches = meta === event.metaKey;

                if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
                    event.preventDefault();
                    callback();
                    return;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
}

export const commonShortcuts: KeyboardShortcut[] = [
    {
        key: 'k',
        ctrl: true,
        callback: () => {
            // Focus search input if available
            const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
            if (searchInput) {
                searchInput.focus();
            }
        },
        description: 'Focus search',
    },
    {
        key: 'n',
        ctrl: true,
        callback: () => {
            // Navigate to new patient registration
            window.location.href = '/patients/create';
        },
        description: 'New patient',
    },
    {
        key: 's',
        ctrl: true,
        callback: () => {
            // Save current form
            const saveButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
            if (saveButton) {
                saveButton.click();
            }
        },
        description: 'Save form',
    },
    {
        key: 'Escape',
        callback: () => {
            // Close modals or cancel operations
            const closeButton = document.querySelector('[aria-label="Close"]') as HTMLButtonElement;
            if (closeButton) {
                closeButton.click();
            }
        },
        description: 'Close modal/cancel',
    },
];
