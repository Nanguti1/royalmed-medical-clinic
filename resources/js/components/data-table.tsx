import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown, ArrowUpDown, Search, Filter } from 'lucide-react';

type Column<T> = {
    key: keyof T;
    label: string;
    className?: string;
    sortable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
};

type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
};

type FilterConfig = {
    key: string;
    value: string;
};

type DataTableProps<T> = {
    title: string;
    columns: Column<T>[];
    data: T[];
    emptyMessage?: string;
    searchable?: boolean;
    sortable?: boolean;
    pageSize?: number;
    onRowClick?: (row: T) => void;
};

export function DataTable<T extends Record<string, any>>({
    title,
    columns,
    data,
    emptyMessage = 'No data available',
    searchable = true,
    sortable = true,
    pageSize = 10,
    onRowClick,
}: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<FilterConfig[]>([]);

    // Filter data based on search query
    const filteredData = data.filter((row) => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        return columns.some((column) => {
            const value = row[column.key];
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(searchLower);
        });
    });

    // Sort data
    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortConfig) return 0;
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];
        
        if (aValue === bValue) return 0;
        
        const comparison = aValue < bValue ? -1 : 1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    // Paginate data
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handleSort = (key: string) => {
        if (!sortable) return;
        
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key) {
            direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
        }
        setSortConfig({ key, direction });
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const getSortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) {
            return sortable ? <ArrowUpDown className="h-4 w-4 opacity-50" /> : null;
        }
        return sortConfig.direction === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
        ) : (
            <ChevronDown className="h-4 w-4" />
        );
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{title}</CardTitle>
                    {searchable && (
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {paginatedData.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        {searchQuery ? 'No results found' : emptyMessage}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                        {columns.map((column) => (
                                            <th
                                                key={String(column.key)}
                                                className={`text-left p-3 font-medium text-muted-foreground ${column.className || ''} ${
                                                    column.sortable && sortable ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''
                                                }`}
                                                onClick={() => column.sortable && handleSort(String(column.key))}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {column.label}
                                                    {getSortIcon(String(column.key))}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((row, index) => (
                                        <tr
                                            key={index}
                                            className={`border-b border-border ${onRowClick ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`}
                                            onClick={() => onRowClick?.(row)}
                                        >
                                            {columns.map((column) => (
                                                <td
                                                    key={String(column.key)}
                                                    className={`p-3 ${column.className || ''}`}
                                                >
                                                    {column.render
                                                        ? column.render(row[column.key], row)
                                                        : row[column.key]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {(currentPage - 1) * pageSize + 1} to{' '}
                                    {Math.min(currentPage * pageSize, sortedData.length)} of{' '}
                                    {sortedData.length} results
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(
                                            (page) =>
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 1 && page <= currentPage + 1)
                                        )
                                        .map((page, index, filtered) => (
                                            <>
                                                {index > 0 && filtered[index - 1] !== page - 1 && (
                                                    <span className="px-2">...</span>
                                                )}
                                                <Button
                                                    key={page}
                                                    variant={currentPage === page ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => handlePageChange(page)}
                                                >
                                                    {page}
                                                </Button>
                                            </>
                                        ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}