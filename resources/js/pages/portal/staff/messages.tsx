import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AlertError from '@/components/alert-error';
import {
    MessageSquare,
    Send,
    Plus,
    Filter,
    X,
    Search,
    Check,
    User,
    Clock,
} from 'lucide-react';
import type { StaffMessage } from '@/types/portal';

type PageProps = {
    messages: StaffMessage[];
    filters: {
        status?: string;
        date_from?: string;
        date_to?: string;
    };
    staffList: Array<{
        id: number;
        first_name: string;
        last_name: string;
    }>;
};

export default function StaffMessages() {
    const { messages, filters, staffList } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        recipient_id: 0,
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/portal/staff/messages');
    };

    const handleMarkAsRead = (messageId: number) => {
        window.location.href = `/portal/staff/messages/${messageId}/read`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const clearFilters = () => {
        window.location.href = '/portal/staff/messages';
    };

    const unreadCount = messages.filter(m => !m.is_read).length;

    return (
        <>
            <Head title="Messages" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
                        <p className="text-muted-foreground">
                            Secure messaging with colleagues
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href="/portal/staff/messages?view=all">
                                View All
                            </a>
                        </Button>
                        <Button asChild>
                            <a href="/portal/staff/messages/new">
                                <Plus className="mr-2 h-4 w-4" />
                                New Message
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* New Message Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Send className="h-5 w-5" />
                                Send Message
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <AlertError errors={errors} />

                                <div className="space-y-2">
                                    <Label htmlFor="recipient_id">Recipient *</Label>
                                    <select
                                        id="recipient_id"
                                        value={data.recipient_id}
                                        onChange={(e) => setData('recipient_id', parseInt(e.target.value))}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        required
                                    >
                                        <option value={0}>Select recipient</option>
                                        {staffList.map((staff) => (
                                            <option key={staff.id} value={staff.id}>
                                                {staff.first_name} {staff.last_name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.recipient_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject *</Label>
                                    <Input
                                        id="subject"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        placeholder="Brief description of your message..."
                                        required
                                    />
                                    <InputError message={errors.subject} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Message *</Label>
                                    <textarea
                                        id="message"
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        rows={6}
                                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Type your message here..."
                                        required
                                    />
                                    <InputError message={errors.message} />
                                </div>

                                <Button type="submit" disabled={processing} className="w-full">
                                    <Send className="mr-2 h-4 w-4" />
                                    {processing ? 'Sending...' : 'Send Message'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Messages List */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Messages ({messages.length})
                                    {unreadCount > 0 && (
                                        <Badge variant="destructive" className="ml-2">
                                            {unreadCount} unread
                                        </Badge>
                                    )}
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Filters */}
                            <div className="mb-4 space-y-2">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search messages..."
                                            className="pl-9"
                                        />
                                    </div>
                                    <select
                                        className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                                        <option value="">All Messages</option>
                                        <option value="unread">Unread</option>
                                        <option value="read">Read</option>
                                    </select>
                                </div>
                                {(filters.status || filters.date_from || filters.date_to) && (
                                    <Button variant="outline" size="sm" onClick={clearFilters}>
                                        <X className="mr-2 h-4 w-4" />
                                        Clear Filters
                                    </Button>
                                )}
                            </div>

                            {messages.length === 0 ? (
                                <div className="text-center py-8">
                                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No messages yet</p>
                                    <p className="text-sm text-muted-foreground">
                                        Start a conversation with your colleagues
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((message) => (
                                        <Card key={message.id} className={!message.is_read ? 'border-primary' : ''}>
                                            <CardContent className="pt-6">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-4 flex-1">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                            <User className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <p className="font-medium">{message.subject}</p>
                                                                {!message.is_read && (
                                                                    <Badge variant="primary" className="text-xs">New</Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                                {message.message}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    <span>{formatDate(message.sent_at)} at {formatTime(message.sent_at)}</span>
                                                                </div>
                                                                {message.sender && (
                                                                    <span>• From: {message.sender.first_name} {message.sender.last_name}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {!message.is_read && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleMarkAsRead(message.id)}
                                                            >
                                                                <Check className="h-4 w-4 mr-1" />
                                                                Mark Read
                                                            </Button>
                                                        )}
                                                        <Button variant="outline" size="sm" asChild>
                                                            <a href={`/portal/staff/messages/${message.id}`}>
                                                                View
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}