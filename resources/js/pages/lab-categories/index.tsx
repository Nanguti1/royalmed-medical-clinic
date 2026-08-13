import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FlaskConical, Plus, Edit, Trash2 } from 'lucide-react';
import { PermissionGuard } from '@/components/permission-guard';

type PageProps = {
    categories: Array<{
        id: number;
        code: string;
        name: string;
        description: string | null;
        created_at: string;
        updated_at: string;
    }>;
};

export default function LabCategoriesIndex() {
    const { categories } = usePage<PageProps>().props;

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this lab category?')) {
            router.delete(`/lab-categories/${id}`);
        }
    };

    return (
        <>
            <Head title="Lab Categories" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Lab Categories</h1>
                        <p className="text-muted-foreground">
                            Manage laboratory test categories
                        </p>
                    </div>
                    <PermissionGuard permission="laboratory.manage" fallback={null}>
                        <Button asChild>
                            <a href="/lab-categories/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Category
                            </a>
                        </Button>
                    </PermissionGuard>
                </div>

                {/* Categories List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3">Code</th>
                                        <th className="text-left p-3">Name</th>
                                        <th className="text-left p-3">Description</th>
                                        <th className="text-left p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((category) => (
                                        <tr key={category.id} className="border-b">
                                            <td className="p-3 font-medium">{category.code}</td>
                                            <td className="p-3">{category.name}</td>
                                            <td className="p-3">{category.description || 'N/A'}</td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <PermissionGuard permission="laboratory.manage" fallback={null}>
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <a href={`/lab-categories/${category.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
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