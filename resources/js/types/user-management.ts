export interface ManagedUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  roles: Role[];
  permissions: Permission[];
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export interface UserFormData {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  password_confirmation?: string;
  is_active?: boolean;
  roles?: number[];
}

export interface RoleFormData {
  name: string;
  permissions?: number[];
}

export interface PermissionGroup {
  [module: string]: PermissionItem[];
}

export interface PermissionItem {
  id: number;
  name: string;
  action: string;
}

export interface UserFilters {
  search?: string;
  status?: 'active' | 'inactive';
  role?: string;
}
