<?php

namespace Tests\Feature;

use App\Models\DentalChart;
use App\Models\DentalProcedure;
use App\Models\DentalTooth;
use App\Models\DentalTreatmentItem;
use App\Models\DentalTreatmentPlan;
use App\Models\Patient;
use App\Services\DentalService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DentalWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected DentalService $dentalService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->dentalService = app(DentalService::class);
    }

    public function test_dental_chart_can_be_created(): void
    {
        $patient = Patient::factory()->create();

        $chart = $this->dentalService->createDentalChart([
            'patient_id' => $patient->id,
            'chief_complaint' => 'Tooth pain',
            'medical_history' => 'No significant history',
        ]);

        $this->assertDatabaseHas('dental_charts', [
            'patient_id' => $patient->id,
            'chief_complaint' => 'Tooth pain',
        ]);
    }

    public function test_tooth_condition_can_be_added(): void
    {
        $tooth = DentalTooth::factory()->create(['conditions' => ['caries']]);

        $tooth->addCondition('sensitivity');

        $this->assertTrue($tooth->hasCondition('sensitivity'));
    }

    public function test_tooth_can_be_extracted(): void
    {
        $tooth = DentalTooth::factory()->create(['is_extracted' => false]);

        $tooth->extract();

        $this->assertTrue($tooth->is_extracted);
        $this->assertNotNull($tooth->extraction_date);
    }

    public function test_treatment_plan_can_be_created(): void
    {
        $patient = Patient::factory()->create();
        $procedure = DentalProcedure::factory()->create();

        $plan = $this->dentalService->createTreatmentPlan([
            'patient_id' => $patient->id,
            'treatment_items' => [
                [
                    'dental_procedure_id' => $procedure->id,
                    'tooth_number' => '14',
                    'cost' => 5000,
                ],
            ],
        ]);

        $this->assertDatabaseHas('dental_treatment_plans', [
            'patient_id' => $patient->id,
            'status' => 'draft',
        ]);

        $this->assertEquals(5000, $plan->estimated_cost);
    }

    public function test_treatment_item_can_be_completed(): void
    {
        $item = DentalTreatmentItem::factory()->create(['status' => 'pending']);

        $this->dentalService->completeTreatmentItem($item);

        $this->assertEquals('completed', $item->fresh()->status);
        $this->assertNotNull($item->completed_date);
    }

    public function test_treatment_plan_can_be_activated(): void
    {
        $plan = DentalTreatmentPlan::factory()->create(['status' => 'draft']);

        $plan->activate();

        $this->assertEquals('active', $plan->status);
    }

    public function test_treatment_plan_can_be_completed(): void
    {
        $plan = DentalTreatmentPlan::factory()->create([
            'status' => 'active',
            'estimated_cost' => 10000,
        ]);

        DentalTreatmentItem::factory()->create([
            'treatment_plan_id' => $plan->id,
            'status' => 'completed',
            'cost' => 10000,
        ]);

        $plan->complete();

        $this->assertEquals('completed', $plan->status);
        $this->assertEquals(10000, $plan->actual_cost);
    }

    public function test_dental_note_can_be_created(): void
    {
        $patient = Patient::factory()->create();

        $note = $this->dentalService->createDentalNote([
            'patient_id' => $patient->id,
            'clinical_notes' => 'Patient presented with tooth sensitivity',
            'treatment_performed' => 'Fluoride application',
        ]);

        $this->assertDatabaseHas('dental_notes', [
            'patient_id' => $patient->id,
            'clinical_notes' => 'Patient presented with tooth sensitivity',
        ]);
    }

    public function test_procedures_can_be_filtered_by_category(): void
    {
        DentalProcedure::factory()->create(['category' => 'scaling']);
        DentalProcedure::factory()->create(['category' => 'filling']);
        DentalProcedure::factory()->create(['category' => 'scaling']);

        $procedures = $this->dentalService->getProceduresByCategory('scaling');

        $this->assertCount(2, $procedures);
    }

    public function test_patient_dental_history_can_be_retrieved(): void
    {
        $patient = Patient::factory()->create();
        DentalChart::factory()->count(3)->create(['patient_id' => $patient->id]);

        $history = $this->dentalService->getPatientDentalHistory($patient->id);

        $this->assertCount(3, $history);
    }

    public function test_active_treatment_plans_can_be_retrieved(): void
    {
        $patient = Patient::factory()->create();
        DentalTreatmentPlan::factory()->create([
            'patient_id' => $patient->id,
            'status' => 'active',
        ]);
        DentalTreatmentPlan::factory()->create([
            'patient_id' => $patient->id,
            'status' => 'draft',
        ]);

        $plans = $this->dentalService->getActiveTreatmentPlans($patient->id);

        $this->assertCount(1, $plans);
    }

    public function test_dental_attachment_can_be_created(): void
    {
        $patient = Patient::factory()->create();

        $attachment = $this->dentalService->createDentalAttachment([
            'patient_id' => $patient->id,
            'attachment_type' => 'xray',
            'file_path' => 'dental/xray.jpg',
            'file_name' => 'xray.jpg',
            'file_type' => 'jpg',
            'file_size' => 500000,
            'mime_type' => 'image/jpeg',
        ]);

        $this->assertDatabaseHas('dental_attachments', [
            'patient_id' => $patient->id,
            'attachment_type' => 'xray',
        ]);
    }

    public function test_procedure_has_category_scopes(): void
    {
        DentalProcedure::factory()->create(['category' => 'scaling']);
        DentalProcedure::factory()->create(['category' => 'filling']);
        DentalProcedure::factory()->create(['category' => 'extraction']);

        $scaling = DentalProcedure::scaling()->get();
        $fillings = DentalProcedure::fillings()->get();
        $extractions = DentalProcedure::extractions()->get();

        $this->assertCount(1, $scaling);
        $this->assertCount(1, $fillings);
        $this->assertCount(1, $extractions);
    }

    public function test_tooth_scope_with_condition(): void
    {
        DentalTooth::factory()->create(['conditions' => ['caries', 'missing']]);
        DentalTooth::factory()->create(['conditions' => ['filled']]);

        $caries = DentalTooth::withCondition('caries')->get();

        $this->assertCount(1, $caries);
    }
}
