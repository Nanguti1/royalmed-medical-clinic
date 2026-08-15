import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Check, Trash2, Archive, Mail, MoreHorizontal, ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type BulkAction = {
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: (selectedIds: any[]) => void;
    danger?: boolean;
    requiresConfirmation?: boolean;
    confirmationMessage?: string;
};

type BulkActionsProps<T> = {
    data: T[];
    selectedIds: Set<any>;
    onSelectionChange: (ids: Set<any>) => void;
    actions: BulkAction[];
    getId: (item: T) => any;
    label?: string;
};

export function BulkActions<T extends Record<string, any>>({
    data,
    selectedIds,
    onSelectionChange,
    actions,
    getId,
    label = 'bulk-actions',
}: BulkActionsProps<T>) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(data.map(getId));
            onSelectionChange(allIds);
        } else {
            onSelectionChange(new Set());
        }
    };

    const handleSelectItem = (id: any, checked: boolean) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        onSelectionChange(newSelected);
    };

    const handleActionClick = (action: BulkAction) => {
        if (action.requiresConfirmation && action.confirmationMessage) {
            if (confirm(action.confirmationMessage)) {
                action.onClick(Array.from(selectedIds));
            }
        } else {
            action.onClick(Array.from(selectedIds));
        }
        setIsOpen(false);
    };

    const allSelected = data.length > 0 && selectedIds.size === data.length;
    const someSelected = selectedIds.size > 0 && selectedIds.size < data.length;

    return (
        <div className="space-y-4">
            {/* Bulk Action Bar */}
            {selectedIds.size > 0 && (
                <div className="flex items-center justify-between p-4 bg-accent rounded-lg border">
                    <div className="flex items-center gap-4">
                        <Badge variant="secondary">
                            {selectedIds.size} selected
                        </Badge>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectionChange(new Set())}
                        >
                            Clear selection
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        {actions.map((action) => (
                            <Button
                                key={action.id}
                                variant={action.danger ? 'destructive' : 'default'}
                                size="sm"
                                onClick={() => handleActionClick(action)}
                            >
                                {action.icon}
                                <span className="ml-2">{action.label}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Select All Checkbox */}
            {data.length > 0 && (
                <div className="flex items-center gap-2 px-2">
                    <Checkbox
                        id={`${label}-select-all`}
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                    />
                    <label
                        htmlFor={`${label}-select-all`}
                        className="text-sm font-medium cursor-pointer"
                    >
                        Select All
                    </label>
                </div>
            )}
        </div>
    );
}

type BulkActionItemProps = {
    id: any;
    isSelected: boolean;
    onSelect: (id: any, checked: boolean) => void;
    children: React.ReactNode;
};

export function BulkActionItem({ id, isSelected, onSelect, children }: BulkActionItemProps) {
    return (
        <div className="flex items-start gap-3 p-2 hover:bg-accent/50 rounded-lg transition-colors">
            <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(id, !!checked)}
                className="mt-1"
            />
            <div className="flex-1">{children}</div>
        </div>
    );
}

type BulkActionDropdownProps = {
    actions: BulkAction[];
    selectedCount: number;
    onActionClick: (action: BulkAction) => void;
};

export function BulkActionDropdown({
    actions,
    selectedCount,
    onActionClick,
}: BulkActionDropdownProps) {
    return (
        <DropdownMenu open={selectedCount > 0}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={selectedCount === 0}>
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="ml-2">Actions</span>
                    {selectedCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {selectedCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {actions.map((action) => (
                    <DropdownMenuItem
                        key={action.id}
                        onClick={() => onActionClick(action)}
                        className={action.danger ? 'text-destructive' : ''}
                    >
                        {action.icon}
                        <span className="ml-2">{action.label}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}