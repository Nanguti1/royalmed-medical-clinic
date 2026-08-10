import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Key } from 'lucide-react';
import type { PermissionGroup } from '@/types/user-management';

export default function PermissionIndex() {
  const { props } = usePage();
  const { permissions } = props as { permissions: PermissionGroup };

  return (
    <>
      <Head title="Permissions" />
      <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
          <p className="text-muted-foreground">View all system permissions by module</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(permissions).map(([module, modulePermissions]) => (
            <Card key={module}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  <Shield className="h-5 w-5" />
                  {module}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {modulePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between">
                      <Badge variant="outline" className="justify-start flex-1">
                        {permission.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground capitalize ml-2">
                        {permission.action}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Permission Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Permissions are system-defined capabilities that can be assigned to roles.
              Super Admin users have all permissions by default. To manage permissions,
              assign them to roles through the role management interface.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
