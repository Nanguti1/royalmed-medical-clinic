<?php

namespace App\Services;

use App\Models\ActivityLog;

class AuditService
{
    public function log(?int $userId, string $action, $auditable = null, array $changes = [], array $meta = [])
    {
        $entry = ActivityLog::create([
            'user_id' => $userId,
            'action' => $action,
            'auditable_type' => $auditable ? get_class($auditable) : null,
            'auditable_id' => $auditable ? $auditable->id : null,
            'changes' => $changes ?: null,
            'ip_address' => request()->ip(),
            'meta' => $meta ?: null,
        ]);

        return $entry;
    }
}
