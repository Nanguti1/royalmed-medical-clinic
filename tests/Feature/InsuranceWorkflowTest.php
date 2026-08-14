<?php

namespace Tests\Feature;

use App\Actions\Insurance\CreateInsuranceClaimAction;
use App\Models\InsuranceClaim;
use App\Models\Insurer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Patient;
use App\Models\PatientCoverage;
use App\Models\Preauthorization;
use App\Services\InsuranceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InsuranceWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected InsuranceService $insuranceService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->insuranceService = app(InsuranceService::class);
    }

    public function test_patient_coverage_can_be_created(): void
    {
        $patient = Patient::factory()->create();
        $insurer = Insurer::factory()->create();

        $coverage = PatientCoverage::create([
            'patient_id' => $patient->id,
            'insurer_id' => $insurer->id,
            'policy_number' => 'POL123456',
            'member_number' => 'MEM789',
            'relationship' => 'self',
            'effective_from' => now()->subMonth(),
            'effective_to' => now()->addYear(),
            'is_primary' => true,
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('patient_coverages', [
            'policy_number' => 'POL123456',
            'patient_id' => $patient->id,
        ]);

        $this->assertTrue($coverage->isCurrentlyValid());
    }

    public function test_insurance_claim_can_be_created_from_invoice(): void
    {
        $patient = Patient::factory()->create();
        $insurer = Insurer::factory()->create();
        $coverage = PatientCoverage::factory()->create([
            'patient_id' => $patient->id,
            'insurer_id' => $insurer->id,
        ]);

        $invoice = Invoice::factory()->create([
            'patient_coverage_id' => $coverage->id,
        ]);

        InvoiceItem::factory()->count(3)->create([
            'invoice_id' => $invoice->id,
            'total_price' => 5000,
        ]);

        $invoice->total_amount = 15000;
        $invoice->save();

        $action = new CreateInsuranceClaimAction;
        $claim = $action->execute($invoice, ['created_by' => 1]);

        $this->assertDatabaseHas('insurance_claims', [
            'invoice_id' => $invoice->id,
            'patient_id' => $patient->id,
            'insurer_id' => $insurer->id,
            'status' => 'draft',
        ]);

        $this->assertCount(3, $claim->items);
        $this->assertEquals(15000, $claim->claimed_amount);
    }

    public function test_claim_can_be_submitted(): void
    {
        $claim = InsuranceClaim::factory()->create(['status' => 'draft']);

        $this->insuranceService->submitClaim($claim, 1);

        $this->assertEquals('submitted', $claim->fresh()->status);
        $this->assertNotNull($claim->submission_date);
    }

    public function test_claim_can_be_approved(): void
    {
        $claim = InsuranceClaim::factory()->create([
            'status' => 'submitted',
            'claimed_amount' => 10000,
        ]);

        $this->insuranceService->approveClaim($claim, 8000, 'Approved after review', 1);

        $claim->refresh();

        $this->assertEquals('approved', $claim->status);
        $this->assertEquals(8000, $claim->approved_amount);
        $this->assertEquals(2000, $claim->rejected_amount);
        $this->assertNotNull($claim->approval_date);
    }

    public function test_claim_can_be_rejected(): void
    {
        $claim = InsuranceClaim::factory()->create([
            'status' => 'submitted',
            'claimed_amount' => 10000,
        ]);

        $this->insuranceService->rejectClaim($claim, 'Services not covered', 1);

        $claim->refresh();

        $this->assertEquals('rejected', $claim->status);
        $this->assertEquals(10000, $claim->rejected_amount);
        $this->assertEquals(0, $claim->approved_amount);
        $this->assertEquals('Services not covered', $claim->rejection_reason);
    }

    public function test_claim_can_be_resubmitted(): void
    {
        $claim = InsuranceClaim::factory()->create([
            'status' => 'rejected',
            'claimed_amount' => 10000,
        ]);

        $this->insuranceService->resubmitClaim($claim, [
            'claimed_amount' => 8000,
        ], 1);

        $this->assertEquals('resubmitted', $claim->fresh()->status);
        $this->assertEquals(8000, $claim->fresh()->claimed_amount);
    }

    public function test_claim_payment_can_be_recorded(): void
    {
        $claim = InsuranceClaim::factory()->create([
            'status' => 'approved',
            'approved_amount' => 10000,
            'paid_amount' => 0,
        ]);

        $this->insuranceService->recordClaimPayment($claim, 5000, 1);

        $claim->refresh();

        $this->assertEquals('partially_paid', $claim->status);
        $this->assertEquals(5000, $claim->paid_amount);
    }

    public function test_claim_can_be_fully_paid(): void
    {
        $claim = InsuranceClaim::factory()->create([
            'status' => 'approved',
            'approved_amount' => 10000,
            'paid_amount' => 8000,
        ]);

        $this->insuranceService->recordClaimPayment($claim, 2000, 1);

        $claim->refresh();

        $this->assertEquals('paid', $claim->status);
        $this->assertEquals(10000, $claim->paid_amount);
        $this->assertTrue($claim->isFullyPaid());
    }

    public function test_preauthorization_can_be_created(): void
    {
        $patient = Patient::factory()->create();
        $insurer = Insurer::factory()->create();
        $coverage = PatientCoverage::factory()->create([
            'patient_id' => $patient->id,
            'insurer_id' => $insurer->id,
        ]);

        $preauth = $this->insuranceService->createPreauthorization([
            'patient_id' => $patient->id,
            'insurer_id' => $insurer->id,
            'patient_coverage_id' => $coverage->id,
            'requested_services' => 'MRI Scan',
            'diagnosis' => 'Headache',
            'justification' => 'Persistent symptoms',
        ]);

        $this->assertDatabaseHas('preauthorizations', [
            'patient_id' => $patient->id,
            'status' => 'pending',
        ]);

        $this->assertNotNull($preauth->authorization_number);
    }

    public function test_preauthorization_can_be_approved(): void
    {
        $preauth = Preauthorization::factory()->create([
            'status' => 'pending',
            'authorized_amount' => 0,
        ]);

        $this->insuranceService->approvePreauthorization($preauth, 50000, 'Approved', 1);

        $preauth->refresh();

        $this->assertEquals('approved', $preauth->status);
        $this->assertEquals(50000, $preauth->authorized_amount);
        $this->assertNotNull($preauth->approval_date);
        $this->assertNotNull($preauth->expiry_date);
    }

    public function test_preauthorization_can_be_rejected(): void
    {
        $preauth = Preauthorization::factory()->create(['status' => 'pending']);

        $this->insuranceService->rejectPreauthorization($preauth, 'Not medically necessary', 1);

        $preauth->refresh();

        $this->assertEquals('rejected', $preauth->status);
        $this->assertEquals('Not medically necessary', $preauth->rejection_reason);
    }

    public function test_preauthorization_can_be_used(): void
    {
        $preauth = Preauthorization::factory()->create([
            'status' => 'approved',
            'authorized_amount' => 50000,
            'used_amount' => 0,
            'expiry_date' => now()->addMonth(),
        ]);

        $this->insuranceService->usePreauthorization($preauth, 20000);

        $preauth->refresh();

        $this->assertEquals(20000, $preauth->used_amount);
        $this->assertEquals(30000, $preauth->remaining_amount);
    }

    public function test_preauthorization_status_changes_when_fully_used(): void
    {
        $preauth = Preauthorization::factory()->create([
            'status' => 'approved',
            'authorized_amount' => 50000,
            'used_amount' => 0,
            'expiry_date' => now()->addMonth(),
        ]);

        $this->insuranceService->usePreauthorization($preauth, 50000);

        $preauth->refresh();

        $this->assertEquals('used', $preauth->status);
        $this->assertNotNull($preauth->usage_date);
    }

    public function test_patient_coverage_verification(): void
    {
        $patient = Patient::factory()->create();
        $insurer = Insurer::factory()->create(['type' => 'nhif']);
        $coverage = PatientCoverage::factory()->create([
            'patient_id' => $patient->id,
            'insurer_id' => $insurer->id,
            'is_primary' => true,
        ]);

        $verifiedCoverage = $this->insuranceService->verifyPatientCoverage($patient->id, 'nhif');

        $this->assertNotNull($verifiedCoverage);
        $this->assertEquals($coverage->id, $verifiedCoverage->id);
    }

    public function test_claim_aging_report(): void
    {
        InsuranceClaim::factory()->count(5)->create(['status' => 'submitted']);
        InsuranceClaim::factory()->count(3)->create(['status' => 'pending']);
        InsuranceClaim::factory()->count(2)->create(['status' => 'approved', 'paid_amount' => 0]);
        InsuranceClaim::factory()->count(1)->create(['status' => 'rejected']);
        InsuranceClaim::factory()->count(4)->create(['status' => 'paid']);

        $report = $this->insuranceService->getClaimAgingReport();

        $this->assertEquals(5, $report['pending_submissions']);
        $this->assertEquals(3, $report['pending_review']);
        $this->assertEquals(2, $report['approved_unpaid']);
        $this->assertEquals(1, $report['rejected']);
        $this->assertEquals(4, $report['paid']);
    }

    public function test_claim_status_history_is_recorded(): void
    {
        $claim = InsuranceClaim::factory()->create(['status' => 'draft']);

        $claim->updateStatus('submitted', 'Submitted to insurer', 1);

        $this->assertDatabaseHas('claim_status_history', [
            'insurance_claim_id' => $claim->id,
            'from_status' => 'draft',
            'to_status' => 'submitted',
        ]);
    }

    public function test_patient_can_have_multiple_coverages(): void
    {
        $patient = Patient::factory()->create();
        $insurer1 = Insurer::factory()->create();
        $insurer2 = Insurer::factory()->create();

        $coverage1 = PatientCoverage::factory()->create([
            'patient_id' => $patient->id,
            'insurer_id' => $insurer1->id,
            'policy_number' => 'POL123',
            'is_primary' => true,
        ]);

        $coverage2 = PatientCoverage::factory()->create([
            'patient_id' => $patient->id,
            'insurer_id' => $insurer2->id,
            'policy_number' => 'POL456',
            'is_primary' => false,
        ]);

        $this->assertEquals(2, $patient->coverages()->count());
        $this->assertTrue($coverage1->is_primary);
        $this->assertFalse($coverage2->is_primary);
    }
}
