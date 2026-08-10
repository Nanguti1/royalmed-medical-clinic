import { Head, usePage } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PermissionGuard } from '@/components/permission-guard';
import { Search, Plus, Edit, Trash2, Power, User as UserIcon } from 'lucide-react';
import type { ManagedUser, UserFilters } from '@/types/user-management';

export default function UserIndex() {
  const { props } = usePage();
  const { users, filters } = props as { users: any; filters: UserFilters };

  const { get, data, setData, processing } = useForm({
    search: filters.search || '',
    status: filters.status || '',
    role: filters.role || '',
  });

  const handleSearch = () => {
    get('/users', { preserveState: true });
  };

  const handleReset = () => {
    setData({ search: '', status: '', role: '' });
    get('/users', { preserveState: true });
  };

  const toggleStatus = (userId: number) => {
    window.location.href = `/users/${userId}/toggle-status`;
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Inactive</Badge>
    );
  };

  return (
    <>
      <Head title="Users" />
      <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">Manage system users and their access</p>
          </div>
          <PermissionGuard permission="users.create" fallback={null}>
            <Button asChild>
              <a href="/users/create">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </a>
            </Button>
          </PermissionGuard>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={data.search}
                  onChange={(e) => setData('search', e.target.value)}
                  className="pl-10"
                />
              </div>
              <Input
                placeholder="Status"
                value={data.status}
                onChange={(e) => setData('status', e.target.value)}
              />
              <Input
                placeholder="Role"
                value={data.role}
                onChange={(e) => setData('role', e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleSearch} disabled={processing}>
                  Search
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">User</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Phone</th>
                    <th className="text-left p-4">Roles</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Created</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.data.map((user: ManagedUser) => (
                    <tr key={user.id} className="border-b">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <UserIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">{user.phone || '—'}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge key={role.id} variant="outline">
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">{getStatusBadge(user.is_active)}</td>
                      <td className="p-4">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <PermissionGuard permission="users.update" fallback={null}>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={`/users/${user.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </a>
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard permission="users.update" fallback={null}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleStatus(user.id)}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard permission="users.delete" fallback={null}>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              method="delete"
                              as="a"
                              href={`/users/${user.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
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

        {users.links && (
          <div className="flex justify-center gap-2">
            {users.links.map((link: any, index: number) => (
              <Button
                key={index}
                variant={link.active ? 'default' : 'outline'}
                size="sm"
                disabled={!link.url}
                asChild={!!link.url}
              >
                {link.url ? (
                  <a
                    href={link.url}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: link.label }} />
                )}
              </Button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
