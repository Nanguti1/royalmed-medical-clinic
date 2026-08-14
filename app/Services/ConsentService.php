<?php

namespace App\Services;

use App\Models\ConsentTemplate;
use App\Models\Patient;
use App\Models\PatientConsent;
use Illuminate\Support\Facades\DB;

class ConsentService
{
    public function createPatientConsent(array $data): PatientConsent
    {
        return DB::transaction(function () use ($data) {
            return PatientConsent::create([
                'patient_id' => $data['patient_id'],
                'consent_template_id' => $data['consent_template_id'],
                'visit_id' => $data['visit_id'] ?? null,
                'consultation_id' => $data['consultation_id'] ?? null,
                'status' => 'draft',
                'created_by' => $data['created_by'] ?? auth()->id(),
                'notes' => $data['notes'] ?? null,
            ]);
        });
    }

    public function signConsent(PatientConsent $consent, array $signatures, ?int $userId = null): PatientConsent
    {
        return DB::transaction(function () use ($consent, $signatures, $userId) {
            foreach ($signatures as $signatureData) {
                $consent->addSignature($signatureData);
            }

            $consent->sign($userId);

            return $consent->fresh();
        });
    }

    public function revokeConsent(PatientConsent $consent, string $reason, ?int $userId = null): PatientConsent
    {
        DB::transaction(function () use ($consent, $reason, $userId) {
            $consent->revoke($reason, $userId);
        });

        return $consent->fresh();
    }

    public function getActiveConsentsForPatient(int $patientId)
    {
        return PatientConsent::where('patient_id', $patientId)
            ->active()
            ->with(['consentTemplate', 'signatures'])
            ->orderBy('signed_at', 'desc')
            ->get();
    }

    public function getConsentTemplatesByCategory(string $category)
    {
        return ConsentTemplate::byCategory($category)->active()->get();
    }

    public function checkConsentRequired(int $patientId, string $category): array
    {
        $templates = ConsentTemplate::byCategory($category)->active()->get();
        $patient = Patient::find($patientId);

        $required = [];

        foreach ($templates as $template) {
            $existingConsent = PatientConsent::where('patient_id', $patientId)
                ->where('consent_template_id', $template->id)
                ->active()
                ->first();

            if (! $existingConsent) {
                $patientAge = $patient->date_of_birth ? $patient->date_of_birth->age : 18;
                $required[] = [
                    'template' => $template,
                    'requires_adult' => $template->requiresAdultConsent($patientAge),
                ];
            }
        }

        return $required;
    }

    public function createConsentTemplate(array $data): ConsentTemplate
    {
        return ConsentTemplate::create([
            'code' => $data['code'],
            'name' => $data['name'],
            'category' => $data['category'],
            'content' => $data['content'],
            'description' => $data['description'] ?? null,
            'requires_signature' => $data['requires_signature'] ?? true,
            'requires_witness' => $data['requires_witness'] ?? false,
            'is_active' => $data['is_active'] ?? true,
            'validity_days' => $data['validity_days'] ?? null,
            'minimum_age' => $data['minimum_age'] ?? 18,
            'version' => $data['version'] ?? '1.0',
            'effective_from' => $data['effective_from'] ?? now(),
            'effective_to' => $data['effective_to'] ?? null,
            'created_by' => $data['created_by'] ?? auth()->id(),
        ]);
    }

    public function getExpiredConsents()
    {
        return PatientConsent::signed()
            ->where('expires_at', '<', now())
            ->where('status', '!=', 'expired')
            ->get();
    }

    public function markExpiredConsents(): int
    {
        $expired = $this->getExpiredConsents();

        foreach ($expired as $consent) {
            $consent->markAsExpired();
        }

        return $expired->count();
    }
}
