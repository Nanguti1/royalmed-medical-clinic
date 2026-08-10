import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PermissionGuard } from '@/components/permission-guard';
import { ArrowLeft, Edit, Trash2, Shield, Users } from 'lucide-react';
import type { Role } from '@/types/user-management';

export default function ShowRole() {
  const { props } = usePage();
  const { role } = props as { role: Role };

  return (
    <>
      <Head title={`Role: ${role.name}`} />
      <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <a href="/roles">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </a>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Role Details</h1>
            <p className="text-muted-foreground">View role permissions and information</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-lg font-semibold">{role.name}</p>
                <p className="text-sm text-muted-foreground">Guard: {role.guard_name}</p>
              </div>

              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Created: {new Date(role.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Updated: {new Date(role.updated_at).toLocaleDateString()}
                </p>
              </div>

              {role.name !== 'Super Admin' && (
                <div className="flex gap-2 pt-4">
                  <PermissionGuard permission="roles.update" fallback={null}>
                    <Button asChild className="flex-1">
                      <a href={`/roles/${role.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Role
                      </a>
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard permission="roles.delete" fallback={null}>
                    <Button
                      variant="destructive"
                      asChild
                      className="flex-1"
                      method="delete"
                      as="a"
                      href={`/roles/${role.id}`}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </PermissionGuard>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Permissions</span>
                  <span className="font-semibold">{role.permissions.length}</span>
                </div>
                {role.name === 'Super Admin' && (
                  <p className="text-sm text-muted-foreground">
                    Super Admin has all permissions by default.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {role.permissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No permissions assigned</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(
                    role.permissions.reduce((acc: Record<string, any[]>, perm) => {
                      const [module] = perm.name.split('.');
                      if (!acc[module]) acc[module] = [];
                      acc[module].push(perm);
                      return acc;
                    }, {}),
                  ).map(([module, modulePermissions]) => (
                    <div key={module} className="space-y-2">
                      <h3 className="font-semibold capitalize">{module}</h3>
                      <div className="flex flex-wrap gap-2">
                        {modulePermissions.map((permission) => (
                          <Badge key={permission.id} variant="secondary">
                            {permission.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
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
