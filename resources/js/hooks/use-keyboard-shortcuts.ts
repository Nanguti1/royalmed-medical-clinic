import { useEffect, useCallback } from 'react';

type KeyboardShortcut = {
    key: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    callback: () => void;
    description?: string;
};

type UseKeyboardShortcutsOptions = {
    enabled?: boolean;
    preventDefault?: boolean;
};

export function useKeyboardShortcuts(
    shortcuts: KeyboardShortcut[],
    options: UseKeyboardShortcutsOptions = {}
) {
    const { enabled = true, preventDefault = true } = options;

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!enabled) return;

            const matchingShortcut = shortcuts.find((shortcut) => {
                return (
                    e.key.toLowerCase() === shortcut.key.toLowerCase() &&
                    !!shortcut.ctrlKey === e.ctrlKey &&
                    !!shortcut.shiftKey === e.shiftKey &&
                    !!shortcut.altKey === e.altKey &&
                    !!shortcut.metaKey === e.metaKey
                );
            });

            if (matchingShortcut) {
                if (preventDefault) {
                    e.preventDefault();
                }
                matchingShortcut.callback();
            }
        },
        [shortcuts, enabled, preventDefault]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return {
        shortcuts,
        addShortcut: (shortcut: KeyboardShortcut) => {
            // This would need to be implemented with state if we want dynamic shortcuts
            console.warn('Dynamic shortcuts not implemented. Use state management for dynamic shortcuts.');
        },
        removeShortcut: (key: string) => {
            // This would need to be implemented with state if we want dynamic shortcuts
            console.warn('Dynamic shortcuts not implemented. Use state management for dynamic shortcuts.');
        },
    };
}

// Common keyboard shortcuts
export const commonShortcuts = {
    commandPalette: {
        key: 'k',
        ctrlKey: true,
        callback: () => {
            // This will be implemented by the component using the hook
        },
        description: 'Open command palette',
    },
    search: {
        key: '/',
        callback: () => {
            // This will be implemented by the component using the hook
        },
        description: 'Focus search',
    },
    escape: {
        key: 'Escape',
        callback: () => {
            // This will be implemented by the component using the hook
        },
        description: 'Close modal/dropdown',
    },
    save: {
        key: 's',
        ctrlKey: true,
        callback: () => {
            // This will be implemented by the component using the hook
        },
        description: 'Save',
    },
    new: {
        key: 'n',
        ctrlKey: true,
        callback: () => {
            // This will be implemented by the component using the hook
        },
        description: 'Create new',
    },
};

export function useGlobalKeyboardShortcuts(isCommandPaletteOpen: boolean, toggleCommandPalette: () => void) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+K to open command palette
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                toggleCommandPalette();
            }
            // Escape to close command palette
            if (e.key === 'Escape' && isCommandPaletteOpen) {
                toggleCommandPalette();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isCommandPaletteOpen, toggleCommandPalette]);
}