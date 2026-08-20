<?php

namespace App\Actions\Consultations;

use App\Models\Consultation;

class StartConsultationAction
{
    public function execute(array $data): Consultation
    {
        $diagnoses = $data['diagnoses'] ?? [];
        $consultationData = array_diff_key($data, ['diagnoses' => []]);

        $existingConsultation = Consultation::where('visit_id', $consultationData['visit_id'])->first();

        if ($existingConsultation) {
            return $existingConsultation;
        }

        $consultation = Consultation::create($consultationData);

        foreach ($diagnoses as $rank => $diag) {
            if (! empty($diag['code']) || ! empty($diag['description'])) {
                $consultation->diagnoses()->create([
                    'code' => $diag['code'] ?? null,
                    'coding_system' => $diag['coding_system'] ?? 'ICD-10',
                    'description' => $diag['description'] ?? '',
                    'diagnosis_type' => $diag['diagnosis_type'] ?? 'primary',
                    'certainty' => $diag['certainty'] ?? 'confirmed',
                    'rank' => $diag['rank'] ?? ($rank + 1),
                    'is_primary' => ($diag['diagnosis_type'] ?? 'primary') === 'primary',
                ]);
            }
        }

        return $consultation;
    }
}
