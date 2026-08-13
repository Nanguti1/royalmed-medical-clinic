import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Plus, Edit, Trash2 } from 'lucide-react';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    tests: Array<{
        id: number;
        code: string | null;
        name: string;
        description: string | null;
        standard_units: string | null;
        price: number | null;
        lab_category_id: number | null;
        sample_type: string | null;
        is_critical: boolean;
        turnaround_time_hours: number | null;
        category?: {
            id: number;
            name: string;
        } | null;
        created_at: string;
        updated_at: string;
    }>;
};

export default function LabTestsIndex() {
    const { tests } = usePage<PageProps>().props;

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this lab test?')) {
            router.delete(`/lab-tests/${id}`);
        }
    };

    return (
        <>
            <Head title="Lab Tests" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Lab Tests</h1>
                        <p className="text-muted-foreground">
                            Manage laboratory test catalog
                        </p>
                    </div>
                    <PermissionGuard permission="laboratory.manage" fallback={null}>
                        <Button asChild>
                            <a href="/lab-tests/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Test
                            </a>
                        </Button>
                    </PermissionGuard>
                </div>

                {/* Tests List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3">Code</th>
                                        <th className="text-left p-3">Name</th>
                                        <th className="text-left p-3">Category</th>
                                        <th className="text-left p-3">Sample Type</th>
                                        <th className="text-left p-3">Price</th>
                                        <th className="text-left p-3">Critical</th>
                                        <th className="text-left p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tests.map((test) => (
                                        <tr key={test.id} className="border-b">
                                            <td className="p-3 font-medium">{test.code || 'N/A'}</td>
                                            <td className="p-3">{test.name}</td>
                                            <td className="p-3">{test.category?.name || 'N/A'}</td>
                                            <td className="p-3">{test.sample_type || 'N/A'}</td>
                                            <td className="p-3">{test.price ? `KES ${test.price}` : 'N/A'}</td>
                                            <td className="p-3">
                                                {test.is_critical ? (
                                                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                        Critical
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                                        Normal
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <PermissionGuard permission="laboratory.manage" fallback={null}>
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <a href={`/lab-tests/${test.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(test.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </PermissionGuard>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}