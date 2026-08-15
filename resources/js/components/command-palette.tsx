import { useState, useEffect, useCallback } from 'react';
import { Search, FileText, Users, Stethoscope, Pill, Calendar, ChevronRight, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGlobalKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

type CommandItem = {
    id: string;
    title: string;
    description?: string;
    icon: React.ReactNode;
    category: string;
    action: () => void;
    shortcut?: string;
};

type CommandCategory = {
    name: string;
    items: CommandItem[];
};

type CommandPaletteProps = {
    isOpen: boolean;
    onClose: () => void;
};

const defaultCommands: CommandCategory[] = [
    {
        name: 'Navigation',
        items: [
            {
                id: 'dashboard',
                title: 'Dashboard',
                description: 'Go to main dashboard',
                icon: <FileText className="h-4 w-4" />,
                category: 'Navigation',
                action: () => window.location.href = '/dashboard',
                shortcut: 'D',
            },
            {
                id: 'patients',
                title: 'Patients',
                description: 'View patient list',
                icon: <Users className="h-4 w-4" />,
                category: 'Navigation',
                action: () => window.location.href = '/patients',
                shortcut: 'P',
            },
            {
                id: 'visits',
                title: 'Visits',
                description: 'View visit queue',
                icon: <Stethoscope className="h-4 w-4" />,
                category: 'Navigation',
                action: () => window.location.href = '/visits',
                shortcut: 'V',
            },
            {
                id: 'pharmacy',
                title: 'Pharmacy',
                description: 'Manage pharmacy',
                icon: <Pill className="h-4 w-4" />,
                category: 'Navigation',
                action: () => window.location.href = '/pharmacy',
                shortcut: 'M',
            },
            {
                id: 'appointments',
                title: 'Appointments',
                description: 'View appointments',
                icon: <Calendar className="h-4 w-4" />,
                category: 'Navigation',
                action: () => window.location.href = '/appointments',
                shortcut: 'A',
            },
        ],
    },
    {
        name: 'Actions',
        items: [
            {
                id: 'new-patient',
                title: 'New Patient',
                description: 'Register a new patient',
                icon: <Users className="h-4 w-4" />,
                category: 'Actions',
                action: () => window.location.href = '/patients/create',
            },
            {
                id: 'new-visit',
                title: 'New Visit',
                description: 'Start a new patient visit',
                icon: <Stethoscope className="h-4 w-4" />,
                category: 'Actions',
                action: () => window.location.href = '/visits/create',
            },
            {
                id: 'consultation-templates',
                title: 'Consultation Templates',
                description: 'Manage consultation templates',
                icon: <FileText className="h-4 w-4" />,
                category: 'Actions',
                action: () => window.location.href = '/consultations/templates',
            },
        ],
    },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [filteredCommands, setFilteredCommands] = useState<CommandCategory[]>(defaultCommands);

    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            setSelectedIndex(0);
            setFilteredCommands(defaultCommands);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => {
                    const flatItems = getFlatItems(filteredCommands);
                    return (prev + 1) % flatItems.length;
                });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => {
                    const flatItems = getFlatItems(filteredCommands);
                    return (prev - 1 + flatItems.length) % flatItems.length;
                });
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const flatItems = getFlatItems(filteredCommands);
                if (flatItems[selectedIndex]) {
                    flatItems[selectedIndex].action();
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, filteredCommands, onClose]);

    const getFlatItems = (categories: CommandCategory[]): CommandItem[] => {
        return categories.flatMap(category => category.items);
    };

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        setSelectedIndex(0);

        if (!query.trim()) {
            setFilteredCommands(defaultCommands);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const filtered = defaultCommands
            .map(category => ({
                ...category,
                items: category.items.filter(item =>
                    item.title.toLowerCase().includes(lowerQuery) ||
                    item.description?.toLowerCase().includes(lowerQuery) ||
                    item.category.toLowerCase().includes(lowerQuery)
                ),
            }))
            .filter(category => category.items.length > 0);

        setFilteredCommands(filtered);
    }, []);

    const flatItems = getFlatItems(filteredCommands);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-0">
                <div className="flex flex-col">
                    {/* Search Input */}
                    <div className="flex items-center border-b px-3">
                        <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Input
                            placeholder="Search commands..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12"
                            autoFocus
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="ml-2"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Command List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {flatItems.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                No commands found
                            </div>
                        ) : (
                            <div className="p-2">
                                {filteredCommands.map((category, categoryIndex) => (
                                    <div key={category.name} className="mb-4">
                                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                                            {category.name}
                                        </div>
                                        {category.items.map((item, itemIndex) => {
                                            const globalIndex = flatItems.indexOf(item);
                                            const isSelected = globalIndex === selectedIndex;
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => {
                                                        item.action();
                                                        onClose();
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                                                        isSelected
                                                            ? 'bg-accent'
                                                            : 'hover:bg-accent/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                                                        {item.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium">{item.title}</div>
                                                        {item.description && (
                                                            <div className="text-sm text-muted-foreground truncate">
                                                                {item.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {item.shortcut && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {item.shortcut}
                                                        </Badge>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t px-3 py-2 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-muted border">↑↓</kbd>
                                <span>Navigate</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-muted border">↵</kbd>
                                <span>Select</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-muted border">esc</kbd>
                                <span>Close</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-muted border">Ctrl</kbd>
                            <span>+</span>
                            <kbd className="px-1.5 py-0.5 rounded bg-muted border">K</kbd>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function useCommandPalette() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleCommandPalette = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    useGlobalKeyboardShortcuts(isOpen, toggleCommandPalette);

    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: toggleCommandPalette,
    };
}