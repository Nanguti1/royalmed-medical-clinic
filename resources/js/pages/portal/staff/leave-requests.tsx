import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AlertError from '@/components/alert-error';
import {
    Calendar,
    Plus,
    Filter,
    X,
    Search,
    Check,
    XCircle,
    Clock,
} from 'lucide-react';
import type { LeaveRequest, LeaveRequestFormData } from '@/types/portal';
import { useState } from 'react';

type PageProps = {
    leaveRequests: LeaveRequest[];
    filters: {
        status?: string;
        leave_type?: string;
        date_from?: string;
        date_to?: string;
    };
    leaveTypes: string[];
};

export default function StaffLeaveRequests() {
    const { leaveRequests, filters, leaveTypes } = usePage<PageProps>().props;
    const [showCreateForm, setShowCreateForm] = useState(false);

    const { data, setData, post, processing, errors } = useForm<LeaveRequestFormData>({
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/portal/staff/leave-requests', {
            onSuccess: () => {
                setShowCreateForm(false);
                setData('leave_type', '');
                setData('start_date', '');
                setData('end_date', '');
                setData('reason', '');
            },
        });
    };

    const handleCancel = (requestId: number) => {
        if (confirm('Are you sure you want to cancel this leave request?')) {
            window.location.href = `/portal/staff/leave-requests/${requestId}/cancel`;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Approved</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejected</Badge>;
            case 'cancelled':
                return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const clearFilters = () => {
        window.location.href = '/portal/staff/leave-requests';
    };

    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    const calculateDays = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    return (
        <>
            <Head title="Leave Requests" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Leave Requests</h1>
                        <p className="text-muted-foreground">
                            Manage your leave requests
                        </p>
                    </div>
                    <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                        <Plus className="mr-2 h-4 w-4" />
                        {showCreateForm ? 'Cancel' : 'New Request'}
                    </Button>
                </div>

                {/* Create Leave Request Form */}
                {showCreateForm && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Create Leave Request
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <AlertError errors={errors} />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="leave_type">Leave Type *</Label>
                                        <select
                                            id="leave_type"
                                            value={data.leave_type}
                                            onChange={(e) => setData('leave_type', e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            required
                                        >
                                            <option value="">Select leave type</option>
                                            {leaveTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.leave_type} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="start_date">Start Date *</Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                            min={getTodayDate()}
                                            required
                                        />
                                        <InputError message={errors.start_date} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="end_date">End Date *</Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                            min={data.start_date || getTodayDate()}
                                            required
                                        />
                                        <InputError message={errors.end_date} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Number of Days</Label>
                                        <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm">
                                            {data.start_date && data.end_date
                                                ? calculateDays(data.start_date, data.end_date)
                                                : '-'}
                                        </div>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="reason">Reason</Label>
                                        <textarea
                                            id="reason"
                                            value={data.reason}
                                            onChange={(e) => setData('reason', e.target.value)}
                                            rows={3}
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Provide reason for leave request..."
                                        />
                                        <InputError message={errors.reason} />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Submitting...' : 'Submit Request'}
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
                                        placeholder="Search requests..."
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
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="leave_type">Leave Type</Label>
                                <select
                                    id="leave_type"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    defaultValue={filters.leave_type || ''}
                                    onChange={(e) => {
                                        const url = new URL(window.location.href);
                                        if (e.target.value) {
                                            url.searchParams.set('leave_type', e.target.value);
                                        } else {
                                            url.searchParams.delete('leave_type');
                                        }
                                        window.location.href = url.toString();
                                    }}
                                >
                                    <option value="">All Types</option>
                                    {leaveTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date_from">Date Range</Label>
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
                        {(filters.status || filters.leave_type || filters.date_from || filters.date_to) && (
                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Leave Requests List */}
                {leaveRequests.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No leave requests found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {leaveRequests.map((request) => (
                            <Card key={request.id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                                request.status === 'approved' ? 'bg-green-100 dark:bg-green-900/20' :
                                                request.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/20' :
                                                request.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                                                'bg-gray-100 dark:bg-gray-900/20'
                                            }`}>
                                                {request.status === 'approved' ? (
                                                    <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                                                ) : request.status === 'rejected' ? (
                                                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                                ) : (
                                                    <Clock className="h-6 w-6" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="font-medium">{request.leave_type}</p>
                                                    {getStatusBadge(request.status)}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{formatDate(request.start_date)} - {formatDate(request.end_date)}</span>
                                                    </div>
                                                    <span>• {calculateDays(request.start_date, request.end_date)} days</span>
                                                </div>
                                                {request.reason && (
                                                    <p className="text-sm text-muted-foreground">{request.reason}</p>
                                                )}
                                                {request.rejection_reason && (
                                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                        Rejection reason: {request.rejection_reason}
                                                    </p>
                                                )}
                                                {request.approved_at && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Approved on: {formatDate(request.approved_at)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {request.status === 'pending' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCancel(request.id)}
                                            >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Cancel
                                            </Button>
                                        )}
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