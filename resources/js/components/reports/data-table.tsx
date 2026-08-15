import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DataTableProps {
    title: string;
    columns: {
        key: string;
        label: string;
        className?: string;
    }[];
    data: Record<string, any>[];
    emptyMessage?: string;
}

export function DataTable({ title, columns, data, emptyMessage = 'No data available' }: DataTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        {emptyMessage}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    {columns.map((column) => (
                                        <th key={column.key} className={`text-left p-2 ${column.className || ''}`}>
                                            {column.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, index) => (
                                    <tr key={index} className="border-b">
                                        {columns.map((column) => (
                                            <td key={column.key} className={`p-2 ${column.className || ''}`}>
                                                {row[column.key]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
