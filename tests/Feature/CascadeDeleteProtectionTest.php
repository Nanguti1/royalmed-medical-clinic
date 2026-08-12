<?php

namespace Tests\Feature;

use App\Models\Patient;
use App\Models\Visit;
use App\Services\PatientService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CascadeDeleteProtectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_patient_with_visits_cannot_be_deleted()
    {
        $patient = Patient::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);
        $visit = Visit::create([
            'patient_id' => $patient->id,
            'visit_date' => now(),
        ]);

        $service = new PatientService(
            app(\App\Actions\Patients\RegisterPatientAction::class),
            app(\App\Actions\Patients\UpdatePatientAction::class)
        );

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Cannot delete patient with associated visits. Use soft delete instead.');

        $service->delete($patient);
    }

    public function test_patient_without_visits_can_be_soft_deleted()
    {
        $patient = Patient::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);

        $result = $patient->delete();

        $this->assertTrue($result);
        $this->assertSoftDeleted('patients', ['id' => $patient->id]);
    }

    public function test_visit_deletion_blocked_by_database_constraint()
    {
        $patient = Patient::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);
        $visit = Visit::create([
            'patient_id' => $patient->id,
            'visit_date' => now(),
        ]);

        // Try to delete patient directly (should fail due to foreign key constraint)
        $this->expectException(\Illuminate\Database\QueryException::class);
        $this->expectExceptionMessageMatches('/FOREIGN KEY constraint/i');

        DB::table('patients')->where('id', $patient->id)->delete();
    }

    public function test_soft_delete_preserves_patient_history()
    {
        $patient = Patient::create([
            'first_name' => 'Jane',
            'last_name' => 'Smith',
        ]);
        $visit = Visit::create([
            'patient_id' => $patient->id,
            'visit_date' => now(),
        ]);

        $patient->delete(); // Soft delete
        $this->assertSoftDeleted('patients', ['id' => $patient->id]);
        $this->assertDatabaseHas('visits', ['id' => $visit->id]); // Visit should still exist
    }
}
