<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AuthorizationSeeder extends Seeder
{
    public function run(): void
    {
        // Permission list following module.permission convention
        $permissions = [
            // Super Admin wildcard - grants all permissions
            '*',
            // Patients
            'patients.view', 'patients.create', 'patients.update', 'patients.delete',
            // Visits
            'visits.view', 'visits.create', 'visits.update', 'visits.cancel',
            // Appointments
            'appointments.view', 'appointments.create', 'appointments.update', 'appointments.delete',
            // Dental
            'dental.view', 'dental.create', 'dental.update',
            // Consultations
            'consultations.view', 'consultations.create', 'consultations.update',
            // Pharmacy
            'pharmacy.view', 'pharmacy.dispense', 'pharmacy.purchase',
            // Inventory
            'inventory.view', 'inventory.create', 'inventory.adjust',
            // Laboratory
            'laboratory.view', 'laboratory.order', 'laboratory.result',
            // Billing
            'billing.view', 'billing.create', 'billing.refund',
            // Reports
            'reports.view', 'reports.export',
            // Users
            'users.view', 'users.create', 'users.update', 'users.delete',
            // Roles & Permissions
            'roles.view', 'roles.create', 'roles.update', 'roles.delete',
            'permissions.view', 'permissions.create', 'permissions.update', 'permissions.delete',
            // Settings
            'settings.manage',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        $roles = [
            'Super Admin' => ['*'], // wildcard grants all permissions
            'Administrator' => [
                'patients.view', 'patients.create', 'patients.update',
                'visits.view', 'visits.create', 'visits.update',
                'appointments.view', 'appointments.create', 'appointments.update',
                'dental.view', 'dental.create', 'dental.update',
                'users.view', 'users.create', 'users.update', 'roles.view', 'roles.create', 'roles.update', 'permissions.view',
                'reports.view',
            ],
            'Receptionist' => [
                'patients.view', 'patients.create', 'visits.view', 'visits.create',
                'appointments.view', 'appointments.create',
                'reports.view',
            ],
            'Doctor' => [
                'patients.view', 'consultations.view', 'consultations.create', 'consultations.update', 'laboratory.order', 'laboratory.view',
                'appointments.view',
                'dental.view', 'dental.create',
            ],
            'Pharmacist' => [
                'pharmacy.view', 'pharmacy.dispense', 'inventory.view', 'inventory.adjust',
            ],
            'Laboratory Technician' => [
                'laboratory.view', 'laboratory.result', 'laboratory.order',
            ],
        ];

        foreach ($roles as $roleName => $perms) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            if (! empty($perms)) {
                $role->syncPermissions($perms);
            }
        }
    }
}
