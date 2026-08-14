<?php

namespace Tests\Feature;

use App\Models\ConsentTemplate;
use App\Models\Patient;
use App\Models\PatientConsent;
use App\Services\ConsentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConsentWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected ConsentService $consentService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->consentService = app(ConsentService::class);
    }

    public function test_patient_consent_can_be_created(): void
    {
        $patient = Patient::factory()->create();
        $template = ConsentTemplate::factory()->create();

        $consent = $this->consentService->createPatientConsent([
            'patient_id' => $patient->id,
            'consent_template_id' => $template->id,
        ]);

        $this->assertDatabaseHas('patient_consents', [
            'patient_id' => $patient->id,
            'consent_template_id' => $template->id,
            'status' => 'draft',
        ]);

        $this->assertNotNull($consent->consent_number);
    }

    public function test_consent_can_be_signed(): void
    {
        $consent = PatientConsent::factory()->create(['status' => 'draft']);

        $signedConsent = $this->consentService->signConsent($consent, [
            [
                'signer_type' => 'patient',
                'signer_name' => 'John Doe',
                'signature_method' => 'digital',
            ],
        ]);

        $this->assertEquals('signed', $signedConsent->status);
        $this->assertNotNull($signedConsent->signed_at);
    }

    public function test_consent_can_be_revoked(): void
    {
        $consent = PatientConsent::factory()->create(['status' => 'signed']);

        $revokedConsent = $this->consentService->revokeConsent($consent, 'Patient withdrew consent');

        $this->assertEquals('revoked', $revokedConsent->status);
        $this->assertEquals('Patient withdrew consent', $revokedConsent->revocation_reason);
    }

    public function test_consent_expires_after_validity_period(): void
    {
        $template = ConsentTemplate::factory()->create(['validity_days' => 30]);
        $consent = PatientConsent::factory()->create([
            'consent_template_id' => $template->id,
            'status' => 'signed',
            'signed_at' => now()->subDays(31),
            'expires_at' => now()->subDay(),
        ]);

        $this->assertTrue($consent->isExpired());
    }

    public function test_consignatures_are_stored(): void
    {
        $consent = PatientConsent::factory()->create();

        $signature = $consent->addSignature([
            'signer_type' => 'patient',
            'signer_name' => 'John Doe',
            'signature_method' => 'digital',
        ]);

        $this->assertDatabaseHas('consent_signatures', [
            'patient_consent_id' => $consent->id,
            'signer_type' => 'patient',
        ]);
    }

    public function test_witness_signature_is_required_when_configured(): void
    {
        $template = ConsentTemplate::factory()->create(['requires_witness' => true]);
        $consent = PatientConsent::factory()->create([
            'consent_template_id' => $template->id,
        ]);

        $consent->addSignature([
            'signer_type' => 'patient',
            'signer_name' => 'John Doe',
            'signature_method' => 'digital',
        ]);

        $this->assertFalse($consent->hasAllRequiredSignatures());
    }

    public function test_active_consents_can_be_retrieved(): void
    {
        $patient = Patient::factory()->create();
        PatientConsent::factory()->create([
            'patient_id' => $patient->id,
            'status' => 'signed',
            'expires_at' => now()->addDays(30),
        ]);
        PatientConsent::factory()->create([
            'patient_id' => $patient->id,
            'status' => 'revoked',
        ]);

        $activeConsents = $this->consentService->getActiveConsentsForPatient($patient->id);

        $this->assertCount(1, $activeConsents);
    }

    public function test_consent_templates_can_be_filtered_by_category(): void
    {
        ConsentTemplate::factory()->create(['category' => 'treatment']);
        ConsentTemplate::factory()->create(['category' => 'surgery']);
        ConsentTemplate::factory()->create(['category' => 'treatment']);

        $templates = $this->consentService->getConsentTemplatesByCategory('treatment');

        $this->assertCount(2, $templates);
    }

    public function test_consent_number_is_auto_generated(): void
    {
        $consent = PatientConsent::factory()->create(['consent_number' => null]);

        $this->assertNotNull($consent->consent_number);
        $this->assertStringStartsWith('CON', $consent->consent_number);
    }

    public function test_draft_consent_can_be_signed(): void
    {
        $consent = PatientConsent::factory()->create(['status' => 'draft']);

        $consent->sign();

        $this->assertEquals('signed', $consent->status);
    }

    public function test_signed_consent_cannot_be_signed_again(): void
    {
        $consent = PatientConsent::factory()->create(['status' => 'signed']);

        $this->expectException(\RuntimeException::class);

        $consent->sign();
    }

    public function test_expired_consents_can_be_marked(): void
    {
        $consent = PatientConsent::factory()->create([
            'status' => 'signed',
            'expires_at' => now()->subDay(),
        ]);

        $consent->markAsExpired();

        $this->assertEquals('expired', $consent->status);
    }
}
