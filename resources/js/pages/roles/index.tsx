import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PermissionGuard } from '@/components/permission-guard';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import type { Role } from '@/types/user-management';

export default function RoleIndex() {
  const { props } = usePage();
  const { roles } = props as { roles: Role[] };

  return (
    <>
      <Head title="Roles" />
      <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
            <p className="text-muted-foreground">Manage system roles and their permissions</p>
          </div>
          <PermissionGuard permission="roles.create" fallback={null}>
            <Button asChild>
              <a href="/roles/create">
                <Plus className="mr-2 h-4 w-4" />
                Add Role
              </a>
            </Button>
          </PermissionGuard>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {role.name}
                  </div>
                  {role.name === 'Super Admin' && (
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      System
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 5).map((permission) => (
                      <Badge key={permission.id} variant="outline" className="text-xs">
                        {permission.name}
                      </Badge>
                    ))}
                    {role.permissions.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{role.permissions.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <PermissionGuard permission="roles.view" fallback={null}>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/roles/${role.id}`}>
                        View
                      </a>
                    </Button>
                  </PermissionGuard>
                  {role.name !== 'Super Admin' && (
                    <>
                      <PermissionGuard permission="roles.update" fallback={null}>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`/roles/${role.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </a>
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard permission="roles.delete" fallback={null}>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          method="delete"
                          as="a"
                          href={`/roles/${role.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </PermissionGuard>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
