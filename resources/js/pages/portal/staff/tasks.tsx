import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AlertError from '@/components/alert-error';
import {
    CheckCircle,
    Plus,
    Filter,
    X,
    Search,
    Clock,
    AlertTriangle,
} from 'lucide-react';
import type { StaffTask, TaskFormData } from '@/types/portal';
import { useState } from 'react';

type PageProps = {
    tasks: StaffTask[];
    filters: {
        status?: string;
        priority?: string;
        date_from?: string;
        date_to?: string;
    };
};

export default function StaffTasks() {
    const { tasks, filters } = usePage<PageProps>().props;
    const [showCreateForm, setShowCreateForm] = useState(false);

    const { data, setData, post, processing, errors } = useForm<TaskFormData>({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/portal/staff/tasks', {
            onSuccess: () => {
                setShowCreateForm(false);
                setData('title', '');
                setData('description', '');
                setData('priority', 'medium');
                setData('due_date', '');
            },
        });
    };

    const handleStatusChange = (taskId: number, newStatus: string) => {
        window.location.href = `/portal/staff/tasks/${taskId}?status=${newStatus}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return <Badge variant="destructive">Urgent</Badge>;
            case 'high':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">High</Badge>;
            case 'medium':
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Medium</Badge>;
            case 'low':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Low</Badge>;
            default:
                return <Badge variant="outline">{priority}</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>;
            case 'in_progress':
                return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">In Progress</Badge>;
            case 'pending':
                return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Pending</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const clearFilters = () => {
        window.location.href = '/portal/staff/tasks';
    };

    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    return (
        <>
            <Head title="Tasks" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                        <p className="text-muted-foreground">
                            Manage your assigned tasks
                        </p>
                    </div>
                    <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                        <Plus className="mr-2 h-4 w-4" />
                        {showCreateForm ? 'Cancel' : 'New Task'}
                    </Button>
                </div>

                {/* Create Task Form */}
                {showCreateForm && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Create New Task
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <AlertError errors={errors} />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="title">Task Title *</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Enter task title..."
                                            required
                                        />
                                        <InputError message={errors.title} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Priority *</Label>
                                        <select
                                            id="priority"
                                            value={data.priority}
                                            onChange={(e) => setData('priority', e.target.value as any)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            required
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                        <InputError message={errors.priority} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="due_date">Due Date</Label>
                                        <Input
                                            id="due_date"
                                            type="date"
                                            value={data.due_date}
                                            onChange={(e) => setData('due_date', e.target.value)}
                                            min={getTodayDate()}
                                        />
                                        <InputError message={errors.due_date} />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="description">Description</Label>
                                        <textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={3}
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Add task description..."
                                        />
                                        <InputError message={errors.description} />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creating...' : 'Create Task'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Search tasks..."
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    defaultValue={filters.status || ''}
                                    onChange={(e) => {
                                        const url = new URL(window.location.href);
                                        if (e.target.value) {
                                            url.searchParams.set('status', e.target.value);
                                        } else {
                                            url.searchParams.delete('status');
                                        }
                                        window.location.href = url.toString();
                                    }}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <select
                                    id="priority"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    defaultValue={filters.priority || ''}
                                    onChange={(e) => {
                                        const url = new URL(window.location.href);
                                        if (e.target.value) {
                                            url.searchParams.set('priority', e.target.value);
                                        } else {
                                            url.searchParams.delete('priority');
                                        }
                                        window.location.href = url.toString();
                                    }}
                                >
                                    <option value="">All Priorities</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date_from">Due Date</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    defaultValue={filters.date_from || ''}
                                    onChange={(e) => {
                                        const url = new URL(window.location.href);
                                        if (e.target.value) {
                                            url.searchParams.set('date_from', e.target.value);
                                        } else {
                                            url.searchParams.delete('date_from');
                                        }
                                        window.location.href = url.toString();
                                    }}
                                />
                            </div>
                        </div>
                        {(filters.status || filters.priority || filters.date_from || filters.date_to) && (
                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Tasks List */}
                {tasks.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No tasks found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {tasks.map((task) => (
                            <Card key={task.id} className={task.priority === 'urgent' ? 'border-red-500' : ''}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                                task.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900/20' :
                                                task.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/20' :
                                                task.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                                                'bg-green-100 dark:bg-green-900/20'
                                            }`}>
                                                {task.priority === 'urgent' ? (
                                                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                                ) : (
                                                    <CheckCircle className="h-6 w-6" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="font-medium">{task.title}</p>
                                                    <div className="flex gap-2">
                                                        {getPriorityBadge(task.priority)}
                                                        {getStatusBadge(task.status)}
                                                    </div>
                                                </div>
                                                {task.description && (
                                                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    {task.due_date && (
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            <span>Due: {formatDate(task.due_date)}</span>
                                                        </div>
                                                    )}
                                                    {task.completed_at && (
                                                        <span>Completed: {formatDate(task.completed_at)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {task.status !== 'completed' && task.status !== 'cancelled' && (
                                                <select
                                                    value={task.status}
                                                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}