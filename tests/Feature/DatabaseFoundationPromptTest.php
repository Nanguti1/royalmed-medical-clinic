<?php

namespace Tests\Feature;

use App\Actions\Queue\AddToQueueAction;
use App\Actions\Vitals\CaptureVitalsAction;
use App\Models\Patient;
use App\Models\Visit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DatabaseFoundationPromptTest extends TestCase
{
    use RefreshDatabase;

    public function test_patient_master_index_foundation_columns_exist(): void
    {
        $this->assertTrue(Schema::hasColumns('patients', [
            'hospital_number',
            'photo_path',
            'occupation',
            'employer',
            'marital_status',
            'preferred_language',
            'religion',
            'blood_group',
        ]));

        foreach (['patient_contacts', 'patient_addresses', 'patient_allergies', 'patient_chronic_conditions', 'patient_alerts', 'patient_relationships', 'patient_merge_records'] as $table) {
            $this->assertTrue(Schema::hasTable($table));
        }
    }

    public function test_patient_factory_populates_hospital_number(): void
    {
        $patient = Patient::factory()->create();

        $this->assertNotEmpty($patient->hospital_number);
    }

    public function test_triage_foundation_supports_extended_vitals_and_bmi(): void
    {
        $visit = Visit::factory()->create();

        $vitals = app(CaptureVitalsAction::class)->execute([
            'visit_id' => $visit->id,
            'weight_kg' => 70,
            'height_cm' => 175,
            'oxygen_saturation' => 98,
            'pain_score' => 2,
            'news_score' => 1,
            'chief_complaint' => 'Headache',
            'nurse_notes' => 'Stable at triage.',
        ]);

        $this->assertSame('22.86', (string) $vitals->bmi);
        $this->assertSame('Headache', $vitals->chief_complaint);
    }

    public function test_queue_foundation_allows_multiple_departments_for_one_visit(): void
    {
        $visit = Visit::factory()->create();
        $action = app(AddToQueueAction::class);

        $triage = $action->execute(['visit_id' => $visit->id, 'department' => 'triage']);
        $laboratory = $action->execute(['visit_id' => $visit->id, 'department' => 'laboratory']);

        $this->assertSame('triage', $triage->department);
        $this->assertSame('laboratory', $laboratory->department);
        $this->assertNotSame($triage->queue_number, $laboratory->queue_number);
    }
}
