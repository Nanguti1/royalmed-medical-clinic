<?php

namespace Tests\Feature;

use App\Models\EmergencyContact;
use App\Models\Patient;
use App\Models\PatientAlert;
use App\Models\PatientAllergy;
use App\Models\PatientChronicCondition;
use App\Models\User;
use App\Models\Visit;
use App\Services\PatientService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class MasterPatientIndexWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['patients.view', 'patients.create', 'patients.update', 'patients.delete', 'visits.view'] as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $this->user = User::factory()->create();
        $this->user->givePermissionTo([
            'patients.view',
            'patients.create',
            'patients.update',
            'patients.delete',
            'visits.view',
        ]);
    }

    public function test_patient_can_be_registered_with_hospital_number_and_multiple_identifiers(): void
    {
        $response = $this->actingAs($this->user)->post(route('patients.store'), [
            'first_name' => 'Jane',
            'last_name' => 'Wanjiru',
            'date_of_birth' => '1995-04-12',
            'phone' => '0711223344',
            'national_id' => '29384756',
            'sha_number' => 'SHA-998877',
            'identifiers' => [
                [
                    'identifier_type' => 'nhif_number',
                    'identifier_value' => 'NHIF-112233',
                    'is_primary' => false,
                ],
                [
                    'identifier_type' => 'insurance_number',
                    'identifier_value' => 'INS-554433',
                    'is_primary' => false,
                ],
            ],
        ]);

        $response->assertRedirect();

        $patient = Patient::where('first_name', 'Jane')->where('last_name', 'Wanjiru')->first();
        $this->assertNotNull($patient);
        $this->assertNotEmpty($patient->hospital_number);
        $this->assertStringStartsWith('H-', $patient->hospital_number);

        $this->assertDatabaseHas('patient_identifiers', [
            'patient_id' => $patient->id,
            'identifier_type' => 'national_id',
            'identifier_value' => '29384756',
        ]);

        $this->assertDatabaseHas('patient_identifiers', [
            'patient_id' => $patient->id,
            'identifier_type' => 'sha_number',
            'identifier_value' => 'SHA-998877',
        ]);

        $this->assertDatabaseHas('patient_identifiers', [
            'patient_id' => $patient->id,
            'identifier_type' => 'nhif_number',
            'identifier_value' => 'NHIF-112233',
        ]);
    }

    public function test_duplicate_candidates_are_detected(): void
    {
        $existing = Patient::factory()->create([
            'first_name' => 'Peter',
            'last_name' => 'Kiprop',
            'date_of_birth' => '1988-09-20',
            'phone' => '0722334455',
        ]);

        $existing->identifiers()->create([
            'identifier_type' => 'national_id',
            'identifier_value' => '87654321',
            'is_primary' => true,
        ]);

        $service = app(PatientService::class);

        // Check matching name + DOB
        $candidates = $service->findDuplicates([
            'first_name' => 'Peter',
            'last_name' => 'Kiprop',
            'date_of_birth' => '1988-09-20',
        ]);
        $this->assertTrue($candidates->contains('id', $existing->id));

        // Check matching national_id
        $candidatesByIdentifier = $service->findDuplicates([
            'national_id' => '87654321',
        ]);
        $this->assertTrue($candidatesByIdentifier->contains('id', $existing->id));

        // HTTP Store warns about duplicates if confirm_duplicate is not set
        $response = $this->actingAs($this->user)->post(route('patients.store'), [
            'first_name' => 'Peter',
            'last_name' => 'Kiprop',
            'date_of_birth' => '1988-09-20',
            'phone' => '0722334455',
        ]);

        $response->assertSessionHas('warning');
        $response->assertSessionHas('duplicate_candidates');
    }

    public function test_patient_merge_preserves_audit_history_and_related_records(): void
    {
        $source = Patient::factory()->create(['first_name' => 'Source', 'last_name' => 'Patient']);
        $target = Patient::factory()->create(['first_name' => 'Target', 'last_name' => 'Patient']);

        $visit = Visit::factory()->create(['patient_id' => $source->id]);
        $emergencyContact = EmergencyContact::create([
            'patient_id' => $source->id,
            'name' => 'Mary Source',
            'relationship' => 'Sister',
            'phone' => '0799887766',
        ]);
        $allergy = PatientAllergy::create([
            'patient_id' => $source->id,
            'allergen' => 'Penicillin',
            'severity' => 'severe',
            'is_active' => true,
        ]);
        $condition = PatientChronicCondition::create([
            'patient_id' => $source->id,
            'condition_name' => 'Hypertension',
            'is_active' => true,
        ]);
        $alert = PatientAlert::create([
            'patient_id' => $source->id,
            'title' => 'Fall Risk',
            'severity' => 'high',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)->post(route('patients.merge', $source), [
            'target_patient_id' => $target->id,
            'reason' => 'Duplicate entry created during emergency intake.',
        ]);

        $response->assertRedirect(route('patients.show', $target));

        // Source is soft deleted
        $this->assertTrue($source->fresh()->trashed());

        // Target owns the transferred records
        $this->assertDatabaseHas('visits', ['id' => $visit->id, 'patient_id' => $target->id]);
        $this->assertDatabaseHas('emergency_contacts', ['id' => $emergencyContact->id, 'patient_id' => $target->id]);
        $this->assertDatabaseHas('patient_allergies', ['id' => $allergy->id, 'patient_id' => $target->id]);
        $this->assertDatabaseHas('patient_chronic_conditions', ['id' => $condition->id, 'patient_id' => $target->id]);
        $this->assertDatabaseHas('patient_alerts', ['id' => $alert->id, 'patient_id' => $target->id]);

        // Audit record created
        $this->assertDatabaseHas('patient_merge_records', [
            'source_patient_id' => $source->id,
            'target_patient_id' => $target->id,
            'merged_by' => $this->user->id,
            'reason' => 'Duplicate entry created during emergency intake.',
        ]);
    }

    public function test_allergies_alerts_chronic_conditions_are_persisted_and_visible_to_clinical_workflows(): void
    {
        $patient = Patient::factory()->create();

        PatientAllergy::create([
            'patient_id' => $patient->id,
            'allergen' => 'Aspirin',
            'reaction' => 'Anaphylaxis',
            'severity' => 'critical',
            'is_active' => true,
        ]);

        PatientChronicCondition::create([
            'patient_id' => $patient->id,
            'condition_name' => 'Type 2 Diabetes',
            'code' => 'E11',
            'is_active' => true,
        ]);

        PatientAlert::create([
            'patient_id' => $patient->id,
            'type' => 'clinical',
            'title' => 'Latex Allergy Warning',
            'severity' => 'high',
            'is_active' => true,
        ]);

        $visit = Visit::factory()->create(['patient_id' => $patient->id]);

        // Access patient show page
        $response = $this->actingAs($this->user)->get(route('patients.show', $patient));
        $response->assertOk();

        // Access visit show page
        $visitResponse = $this->actingAs($this->user)->get(route('visits.show', $visit));
        $visitResponse->assertOk();

        // Assert relations load properly
        $loadedPatient = $patient->fresh(['activeAlerts', 'activeAllergies', 'activeChronicConditions']);
        $this->assertCount(1, $loadedPatient->activeAlerts);
        $this->assertCount(1, $loadedPatient->activeAllergies);
        $this->assertCount(1, $loadedPatient->activeChronicConditions);
        $this->assertSame('Aspirin', $loadedPatient->activeAllergies->first()->allergen);
    }
}
