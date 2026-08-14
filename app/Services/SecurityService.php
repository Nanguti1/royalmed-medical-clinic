<?php

namespace App\Services;

use App\Models\LoginSession;
use App\Models\RecordArchive;
use App\Models\RetentionSchedule;
use App\Models\SensitiveDataAccessLog;
use Illuminate\Support\Facades\DB;

class SecurityService
{
    public function logSensitiveDataAccess(int $userId, string $recordType, int $recordId, string $action, ?string $context = null, ?string $reason = null, ?string $ipAddress = null, ?string $userAgent = null): void
    {
        SensitiveDataAccessLog::create([
            'user_id' => $userId,
            'record_type' => $recordType,
            'record_id' => $recordId,
            'action' => $action,
            'context' => $context,
            'access_reason' => $reason,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
        ]);
    }

    public function createLoginSession(int $userId, string $sessionId, ?string $ipAddress = null, ?string $userAgent = null, ?array $deviceInfo = null): LoginSession
    {
        return LoginSession::create([
            'user_id' => $userId,
            'session_id' => $sessionId,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'device_type' => $deviceInfo['device_type'] ?? null,
            'browser' => $deviceInfo['browser'] ?? null,
            'platform' => $deviceInfo['platform'] ?? null,
            'location' => $deviceInfo['location'] ?? null,
            'status' => 'active',
        ]);
    }

    public function endLoginSession(string $sessionId, ?string $reason = null): void
    {
        $session = LoginSession::where('session_id', $sessionId)->first();

        if ($session && $session->isActive()) {
            $session->logout($reason);
        }
    }

    public function terminateSession(string $sessionId, string $reason): void
    {
        $session = LoginSession::where('session_id', $sessionId)->first();

        if ($session) {
            $session->terminate($reason);
        }
    }

    public function getUserSessions(int $userId, int $days = 30)
    {
        return LoginSession::forUser($userId)
            ->recent($days)
            ->orderBy('login_at', 'desc')
            ->get();
    }

    public function getActiveSessions(int $userId)
    {
        return LoginSession::forUser($userId)->active()->get();
    }

    public function terminateAllUserSessions(int $userId, string $reason): int
    {
        $sessions = LoginSession::forUser($userId)->active()->get();

        foreach ($sessions as $session) {
            $session->terminate($reason);
        }

        return $sessions->count();
    }

    public function getSensitiveDataAccessReport(int $userId, int $days = 30)
    {
        return SensitiveDataAccessLog::forUser($userId)
            ->recent($days)
            ->orderBy('accessed_at', 'desc')
            ->get()
            ->groupBy('record_type');
    }

    public function createRetentionSchedule(array $data): RetentionSchedule
    {
        return RetentionSchedule::create([
            'record_type' => $data['record_type'],
            'retention_period' => $data['retention_period'],
            'description' => $data['description'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'created_by' => $data['created_by'] ?? auth()->id(),
        ]);
    }

    public function archiveRecord(string $recordType, int $recordId, string $reason, ?int $userId = null): RecordArchive
    {
        return DB::transaction(function () use ($recordType, $recordId, $reason, $userId) {
            $schedule = RetentionSchedule::byRecordType($recordType)->active()->first();

            $archive = RecordArchive::create([
                'record_type' => $recordType,
                'record_id' => $recordId,
                'retention_schedule_id' => $schedule?->id,
                'archive_status' => 'archived',
                'archived_at' => now(),
                'archive_reason' => $reason,
                'archived_by' => $userId ?? auth()->id(),
            ]);

            if ($schedule && ! $schedule->isPermanent()) {
                $years = $schedule->retention_years;
                if ($years) {
                    $archive->restore_eligible_at = now()->addYears($years);
                    $archive->purge_eligible_at = now()->addYears($years + 1);
                    $archive->save();
                }
            }

            return $archive;
        });
    }

    public function restoreRecord(int $archiveId, ?int $userId = null): RecordArchive
    {
        $archive = RecordArchive::findOrFail($archiveId);
        $archive->restore($userId);

        return $archive->fresh();
    }

    public function purgeRecord(int $archiveId, ?int $userId = null): RecordArchive
    {
        $archive = RecordArchive::findOrFail($archiveId);
        $archive->purge($userId);

        return $archive->fresh();
    }

    public function getRestoreEligibleRecords()
    {
        return RecordArchive::restoreEligible()->get();
    }

    public function getPurgeEligibleRecords()
    {
        return RecordArchive::purgeEligible()->get();
    }
}
