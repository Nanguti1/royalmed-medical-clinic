<?php

namespace App\Services;

use App\Actions\Consultations\StartConsultationAction;
use App\Actions\Consultations\UpdateConsultationAction;
use App\Models\ClinicalAttachment;
use App\Models\Consultation;
use App\Models\ConsultationTemplate;
use App\Models\Patient;
use App\Models\Visit;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ConsultationService
{
    protected StartConsultationAction $startAction;

    protected UpdateConsultationAction $updateAction;

    public function __construct(StartConsultationAction $startAction, UpdateConsultationAction $updateAction)
    {
        $this->startAction = $startAction;
        $this->updateAction = $updateAction;
    }

    public function start(array $data): Consultation
    {
        return DB::transaction(function () use ($data) {
            $data['provider_id'] ??= Auth::id();

            // Check if visit is completed or cancelled
            $visit = Visit::find($data['visit_id']);
            if ($visit && ($visit->isCompleted() || $visit->isCancelled())) {
                throw new \RuntimeException('Cannot start consultation for a completed or cancelled visit.');
            }

            return $this->startAction->execute($data);
        });
    }

    public function update(Consultation $consultation, array $data): Consultation
    {
        return DB::transaction(function () use ($consultation, $data) {
            return $this->updateAction->execute($consultation, $data);
        });
    }

    public function applyTemplate(ConsultationTemplate $template, array $existingData): array
    {
        $fields = [
            'chief_complaint' => $template->chief_complaint,
            'subjective' => $template->subjective ?? $template->history,
            'history' => $template->history ?? $template->subjective,
            'objective' => $template->objective ?? $template->examination,
            'examination' => $template->examination ?? $template->objective,
            'assessment' => $template->assessment ?? $template->notes,
            'notes' => $template->notes ?? $template->assessment,
            'plan' => $template->plan,
        ];

        $merged = $existingData;

        foreach ($fields as $key => $templateValue) {
            if (empty($templateValue)) {
                continue;
            }

            if (! empty($merged[$key])) {
                $merged[$key] = trim($merged[$key])."\n\n".trim($templateValue);
            } else {
                $merged[$key] = trim($templateValue);
            }
        }

        return $merged;
    }

    public function getClinicalSummary(Patient $patient): array
    {
        $patient->load([
            'identifiers',
            'activeAlerts',
            'activeAllergies',
            'activeChronicConditions',
            'visits.vitalSign',
            'visits.consultation.diagnoses',
            'visits.prescriptions.items.medicine',
            'visits.labOrders.items.test',
            'visits.labOrders.items.result',
        ]);

        $previousDiagnoses = [];
        $prescriptionsHistory = [];
        $labHistory = [];
        $visitHistory = [];

        foreach ($patient->visits as $visit) {
            $visitHistory[] = [
                'id' => $visit->id,
                'visit_date' => $visit->visit_date,
                'visit_number' => $visit->visit_number,
                'notes' => $visit->notes,
                'vitals' => $visit->vitalSign,
            ];

            if ($visit->consultation) {
                foreach ($visit->consultation->diagnoses as $diagnosis) {
                    $previousDiagnoses[] = [
                        'visit_date' => $visit->visit_date,
                        'code' => $diagnosis->code,
                        'coding_system' => $diagnosis->coding_system,
                        'description' => $diagnosis->description,
                        'type' => $diagnosis->diagnosis_type,
                        'certainty' => $diagnosis->certainty,
                    ];
                }
            }

            foreach ($visit->prescriptions as $prescription) {
                $prescriptionsHistory[] = [
                    'visit_date' => $visit->visit_date,
                    'status' => $prescription->status,
                    'items' => $prescription->items,
                ];
            }

            foreach ($visit->labOrders as $labOrder) {
                $labHistory[] = [
                    'visit_date' => $visit->visit_date,
                    'status' => $labOrder->status,
                    'items' => $labOrder->items,
                ];
            }
        }

        return [
            'patient' => $patient,
            'active_alerts' => $patient->activeAlerts,
            'allergies' => $patient->activeAllergies,
            'chronic_conditions' => $patient->activeChronicConditions,
            'previous_diagnoses' => $previousDiagnoses,
            'prescriptions_history' => $prescriptionsHistory,
            'lab_history' => $labHistory,
            'visit_history' => $visitHistory,
        ];
    }

    public function attachFile(Consultation $consultation, array $attachmentData): ClinicalAttachment
    {
        $attachmentData['patient_id'] = $consultation->visit->patient_id;
        $attachmentData['visit_id'] = $consultation->visit_id;
        $attachmentData['consultation_id'] = $consultation->id;
        $attachmentData['uploaded_by'] ??= Auth::id();

        return ClinicalAttachment::create($attachmentData);
    }

    public function reassignProvider(Consultation $consultation, int $newProviderId): Consultation
    {
        return DB::transaction(function () use ($consultation, $newProviderId) {
            $oldProviderId = $consultation->provider_id;

            if ($oldProviderId === $newProviderId) {
                throw new \RuntimeException('Consultation is already assigned to this provider.');
            }

            // Update consultation provider
            $consultation->update(['provider_id' => $newProviderId]);

            // Log the reassignment
            $consultation->visit->logActivity('consultation.reassigned', [
                'consultation_id' => $consultation->id,
                'old_provider_id' => $oldProviderId,
                'new_provider_id' => $newProviderId,
            ]);

            return $consultation->refresh();
        });
    }
}
