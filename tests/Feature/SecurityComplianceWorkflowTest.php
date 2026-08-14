<?php

namespace Tests\Feature;

use App\Models\LoginSession;
use App\Models\RecordArchive;
use App\Models\RetentionSchedule;
use App\Models\User;
use App\Services\SecurityService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityComplianceWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected SecurityService $securityService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->securityService = app(SecurityService::class);
    }

    public function test_sensitive_data_access_is_logged(): void
    {
        $this->securityService->logSensitiveDataAccess(
            1,
            'patient',
            100,
            'viewed',
            'profile',
            'Clinical review',
            '127.0.0.1',
            'Mozilla/5.0'
        );

        $this->assertDatabaseHas('sensitive_data_access_logs', [
            'user_id' => 1,
            'record_type' => 'patient',
            'record_id' => 100,
            'action' => 'viewed',
        ]);
    }

    public function test_login_session_can_be_created(): void
    {
        $user = User::factory()->create();

        $session = $this->securityService->createLoginSession(
            $user->id,
            'session-123',
            '127.0.0.1',
            'Mozilla/5.0',
            ['device_type' => 'desktop', 'browser' => 'Chrome']
        );

        $this->assertDatabaseHas('login_sessions', [
            'user_id' => $user->id,
            'session_id' => 'session-123',
            'status' => 'active',
        ]);
    }

    public function test_login_session_can_be_ended(): void
    {
        $session = LoginSession::factory()->create(['status' => 'active']);

        $this->securityService->endLoginSession($session->session_id, 'User logout');

        $this->assertEquals('logged_out', $session->fresh()->status);
    }

    public function test_session_can_be_terminated(): void
    {
        $session = LoginSession::factory()->create(['status' => 'active']);

        $this->securityService->terminateSession($session->session_id, 'Security breach');

        $this->assertEquals('terminated', $session->fresh()->status);
    }

    public function test_all_user_sessions_can_be_terminated(): void
    {
        $user = User::factory()->create();
        LoginSession::factory()->count(3)->create(['user_id' => $user->id, 'status' => 'active']);

        $count = $this->securityService->terminateAllUserSessions($user->id, 'Password reset');

        $this->assertEquals(3, $count);
        $this->assertEquals(0, LoginSession::forUser($user->id)->active()->count());
    }

    public function test_retention_schedule_can_be_created(): void
    {
        $schedule = $this->securityService->createRetentionSchedule([
            'record_type' => 'lab_results',
            'retention_period' => '10_years',
            'description' => 'Lab results for 10 years',
        ]);

        $this->assertDatabaseHas('retention_schedules', [
            'record_type' => 'lab_results',
            'retention_period' => '10_years',
        ]);
    }

    public function test_record_can_be_archived(): void
    {
        $schedule = RetentionSchedule::factory()->create([
            'record_type' => 'patient_records',
            'retention_period' => '7_years',
        ]);

        $archive = $this->securityService->archiveRecord('patient_records', 100, 'Patient request');

        $this->assertEquals('archived', $archive->archive_status);
        $this->assertNotNull($archive->archive_number);
    }

    public function test_archived_record_can_be_restored(): void
    {
        $archive = RecordArchive::factory()->create([
            'archive_status' => 'archived',
            'restore_eligible_at' => now()->subDay(),
        ]);

        $restored = $this->securityService->restoreRecord($archive->id);

        $this->assertEquals('restored', $restored->archive_status);
    }

    public function test_archived_record_can_be_purged(): void
    {
        $archive = RecordArchive::factory()->create([
            'archive_status' => 'archived',
            'purge_eligible_at' => now()->subDay(),
        ]);

        $purged = $this->securityService->purgeRecord($archive->id);

        $this->assertEquals('purged', $purged->archive_status);
    }

    public function test_restore_eligible_records_can_be_found(): void
    {
        RecordArchive::factory()->create([
            'archive_status' => 'archived',
            'restore_eligible_at' => now()->subDay(),
        ]);
        RecordArchive::factory()->create([
            'archive_status' => 'archived',
            'restore_eligible_at' => now()->addDay(),
        ]);

        $eligible = $this->securityService->getRestoreEligibleRecords();

        $this->assertCount(1, $eligible);
    }

    public function test_purge_eligible_records_can_be_found(): void
    {
        RecordArchive::factory()->create([
            'archive_status' => 'archived',
            'purge_eligible_at' => now()->subDay(),
        ]);
        RecordArchive::factory()->create([
            'archive_status' => 'archived',
            'purge_eligible_at' => now()->addDay(),
        ]);

        $eligible = $this->securityService->getPurgeEligibleRecords();

        $this->assertCount(1, $eligible);
    }

    public function test_user_sessions_can_be_retrieved(): void
    {
        $user = User::factory()->create();
        LoginSession::factory()->count(5)->create(['user_id' => $user->id]);
        LoginSession::factory()->count(2)->create(['user_id' => $user->id, 'login_at' => now()->subDays(40)]);

        $sessions = $this->securityService->getUserSessions($user->id, 30);

        $this->assertCount(5, $sessions);
    }

    public function test_active_sessions_can_be_retrieved(): void
    {
        $user = User::factory()->create();
        LoginSession::factory()->count(3)->create(['user_id' => $user->id, 'status' => 'active']);
        LoginSession::factory()->count(2)->create(['user_id' => $user->id, 'status' => 'logged_out']);

        $active = $this->securityService->getActiveSessions($user->id);

        $this->assertCount(3, $active);
    }

    public function test_archive_number_is_auto_generated(): void
    {
        $archive = RecordArchive::factory()->create(['archive_number' => null]);

        $this->assertNotNull($archive->archive_number);
        $this->assertStringStartsWith('ARC', $archive->archive_number);
    }

    public function test_permanent_retention_is_handled(): void
    {
        $schedule = RetentionSchedule::factory()->create(['retention_period' => 'permanent']);

        $this->assertTrue($schedule->isPermanent());
    }

    public function test_session_duration_is_calculated(): void
    {
        $session = LoginSession::factory()->create([
            'login_at' => now()->subHour(),
            'logout_at' => now()->subMinutes(30),
        ]);

        $this->assertEquals(1800, $session->duration);
    }

    public function test_archive_cannot_be_restored_before_eligible(): void
    {
        $archive = RecordArchive::factory()->create([
            'archive_status' => 'archived',
            'restore_eligible_at' => now()->addDay(),
        ]);

        $this->expectException(\RuntimeException::class);

        $archive->restore();
    }

    public function test_archive_cannot_be_purged_before_eligible(): void
    {
        $archive = RecordArchive::factory()->create([
            'archive_status' => 'archived',
            'purge_eligible_at' => now()->addDay(),
        ]);

        $this->expectException(\RuntimeException::class);

        $archive->purge();
    }
}
