<?php

namespace Tests\Feature;

use App\Models\Consultation;
use App\Models\ConsultationTemplate;
use App\Models\Patient;
use App\Models\PatientAlert;
use App\Models\PatientAllergy;
use App\Models\PatientChronicCondition;
use App\Models\User;
use App\Models\Visit;
use App\Services\ConsultationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ConsultationEmrWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['consultations.view', 'consultations.create', 'consultations.update', 'visits.view', 'visits.update'] as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $this->user = User::factory()->create();
        $this->user->givePermissionTo([
            'consultations.view',
            'consultations.create',
            'consultations.update',
            'visits.view',
            'visits.update',
        ]);
    }

    public function test_clinician_can_create_and_update_soap_consultation(): void
    {
        $visit = Visit::factory()->create();

        $response = $this->actingAs($this->user)->post(route('consultations.store'), [
            'visit_id' => $visit->id,
            'chief_complaint' => 'Persistent dry cough and fatigue',
            'subjective' => 'Patient states symptoms began 3 days ago following travel.',
            'objective' => 'Chest clear to auscultation. BP 120/80. Temp 37.2C.',
            'assessment' => 'Viral upper respiratory tract infection.',
            'plan' => 'Rest, fluids, symptomatic relief with paracetamol.',
            'follow_up_date' => '2026-08-21',
            'follow_up_notes' => 'Return if high fever or shortness of breath develops.',
            'follow_up_type' => 'outpatient_review',
        ]);

        $response->assertRedirect();

        $consultation = Consultation::where('visit_id', $visit->id)->first();
        $this->assertNotNull($consultation);
        $this->assertSame('Patient states symptoms began 3 days ago following travel.', $consultation->subjective);
        $this->assertSame('Chest clear to auscultation. BP 120/80. Temp 37.2C.', $consultation->objective);
        $this->assertSame('Viral upper respiratory tract infection.', $consultation->assessment);

        // Assert backward compatibility fields history/examination/notes are synchronized
        $this->assertSame($consultation->subjective, $consultation->history);
        $this->assertSame($consultation->objective, $consultation->examination);
        $this->assertSame($consultation->assessment, $consultation->notes);

        // Update consultation
        $updateResponse = $this->actingAs($this->user)->put(route('consultations.update', $consultation), [
            'assessment' => 'Acute viral bronchitis.',
            'plan' => 'Prescribe inhaler if wheezing persists.',
        ]);

        $updateResponse->assertRedirect(route('consultations.show', $consultation));
        $this->assertSame('Acute viral bronchitis.', $consultation->fresh()->assessment);
    }

    public function test_icd10_coded_primary_and_differential_diagnoses_persist(): void
    {
        $visit = Visit::factory()->create();

        $this->actingAs($this->user)->post(route('consultations.store'), [
            'visit_id' => $visit->id,
            'chief_complaint' => 'Fever and chest pain',
            'subjective' => 'Sudden onset chest discomfort.',
            'diagnoses' => [
                [
                    'code' => 'J06.9',
                    'coding_system' => 'ICD-10',
                    'description' => 'Acute upper respiratory infection, unspecified',
                    'diagnosis_type' => 'primary',
                    'certainty' => 'confirmed',
                    'rank' => 1,
                ],
                [
                    'code' => 'J18.9',
                    'coding_system' => 'ICD-10',
                    'description' => 'Pneumonia, unspecified organism',
                    'diagnosis_type' => 'differential',
                    'certainty' => 'suspected',
                    'rank' => 2,
                ],
            ],
        ]);

        $consultation = Consultation::where('visit_id', $visit->id)->first();
        $this->assertNotNull($consultation);

        $this->assertCount(2, $consultation->diagnoses);
        $this->assertCount(1, $consultation->primaryDiagnoses);
        $this->assertCount(1, $consultation->differentialDiagnoses);

        $primary = $consultation->primaryDiagnoses->first();
        $this->assertSame('J06.9', $primary->code);
        $this->assertSame('primary', $primary->diagnosis_type);

        $differential = $consultation->differentialDiagnoses->first();
        $this->assertSame('J18.9', $differential->code);
        $this->assertSame('differential', $differential->diagnosis_type);
    }

    public function test_consultation_template_content_can_be_applied_without_overwriting_clinician_edits(): void
    {
        $template = ConsultationTemplate::create([
            'name' => 'General Outpatient Routine Template',
            'specialty' => 'General Medicine',
            'chief_complaint' => 'Routine checkup.',
            'subjective' => 'System Review: No systemic complaints reported.',
            'objective' => 'Physical Exam: Head, ears, eyes, nose, throat normal.',
            'assessment' => 'Routine general health screen.',
            'plan' => 'Advise lifestyle measures and follow-up in 1 year.',
            'is_active' => true,
        ]);

        $service = app(ConsultationService::class);

        $existingData = [
            'chief_complaint' => 'Headache for 1 day.',
            'subjective' => 'Patient reports mild frontal headache starting this morning.',
        ];

        $merged = $service->applyTemplate($template, $existingData);

        // Clinician's original subjective note is preserved, template text appended
        $this->assertStringContainsString('Patient reports mild frontal headache starting this morning.', $merged['subjective']);
        $this->assertStringContainsString('System Review: No systemic complaints reported.', $merged['subjective']);
        $this->assertSame('Physical Exam: Head, ears, eyes, nose, throat normal.', $merged['objective']);
    }

    public function test_patient_safety_summary_is_loaded_for_consultation(): void
    {
        $patient = Patient::factory()->create();

        PatientAlert::create([
            'patient_id' => $patient->id,
            'type' => 'clinical',
            'title' => 'Severe Penicillin Allergy',
            'severity' => 'critical',
            'is_active' => true,
        ]);

        PatientAllergy::create([
            'patient_id' => $patient->id,
            'allergen' => 'Amoxicillin',
            'reaction' => 'Rash & Anaphylaxis',
            'severity' => 'severe',
            'is_active' => true,
        ]);

        PatientChronicCondition::create([
            'patient_id' => $patient->id,
            'condition_name' => 'Asthma',
            'code' => 'J45',
            'is_active' => true,
        ]);

        $visit = Visit::factory()->create(['patient_id' => $patient->id]);

        $service = app(ConsultationService::class);
        $summary = $service->getClinicalSummary($patient);

        $this->assertCount(1, $summary['active_alerts']);
        $this->assertCount(1, $summary['allergies']);
        $this->assertCount(1, $summary['chronic_conditions']);

        $response = $this->actingAs($this->user)->get(route('consultations.create', $visit));
        $response->assertOk();
    }
}
