import { Head, usePage, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';
import type { PermissionGroup, RoleFormData, Role } from '@/types/user-management';

export default function EditRole() {
  const { props } = usePage();
  const { role, permissions } = props as { role: Role; permissions: PermissionGroup };

  const { data, setData, put, processing, errors } = useForm<RoleFormData>({
    name: role.name,
    permissions: role.permissions.map((p) => p.id),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/roles/${role.id}`);
  };

  const handlePermissionToggle = (permissionId: number) => {
    const currentPermissions = data.permissions || [];
    if (currentPermissions.includes(permissionId)) {
      setData('permissions', currentPermissions.filter((id) => id !== permissionId));
    } else {
      setData('permissions', [...currentPermissions, permissionId]);
    }
  };

  const handleModuleToggle = (modulePermissions: number[]) => {
    const currentPermissions = data.permissions || [];
    const allSelected = modulePermissions.every((id) => currentPermissions.includes(id));

    if (allSelected) {
      setData('permissions', currentPermissions.filter((id) => !modulePermissions.includes(id)));
    } else {
      setData('permissions', [...new Set([...currentPermissions, ...modulePermissions])]);
    }
  };

  if (role.name === 'Super Admin') {
    return (
      <>
        <Head title="Edit Role" />
        <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <a href="/roles">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </a>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Role</h1>
              <p className="text-muted-foreground">Update role information and permissions</p>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                The Super Admin role cannot be modified. It has all permissions by default.
              </p>
              <Button asChild className="mt-4">
                <a href="/roles">Back to Roles</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Head title="Edit Role" />
      <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <a href="/roles">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </a>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Role</h1>
            <p className="text-muted-foreground">Update role information and permissions</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Role Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-4">
                <Label>Permissions</Label>
                {Object.entries(permissions).map(([module, modulePermissions]) => (
                  <div key={module} className="space-y-2 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold capitalize">{module}</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleModuleToggle(modulePermissions.map((p) => p.id))}
                      >
                        Toggle All
                      </Button>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      {modulePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`permission-${permission.id}`}
                            checked={(data.permissions || []).includes(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                          />
                          <Label htmlFor={`permission-${permission.id}`} className="capitalize">
                            {permission.action}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" asChild>
                  <a href="/roles">Cancel</a>
                </Button>
                <Button type="submit" disabled={processing}>
                  Update Role
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
