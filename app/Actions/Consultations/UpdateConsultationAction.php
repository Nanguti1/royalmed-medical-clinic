<?php

namespace App\Actions\Consultations;

use App\Models\Consultation;

class UpdateConsultationAction
{
    public function execute(Consultation $consultation, array $data): Consultation
    {
        $diagnoses = $data['diagnoses'] ?? null;
        $consultationData = array_diff_key($data, ['diagnoses' => []]);

        if (! empty($consultationData)) {
            $consultation->update($consultationData);
        }

        if (is_array($diagnoses)) {
            foreach ($diagnoses as $rank => $diag) {
                if (! empty($diag['code']) || ! empty($diag['description'])) {
                    if (isset($diag['id'])) {
                        $consultation->diagnoses()->where('id', $diag['id'])->update([
                            'code' => $diag['code'] ?? null,
                            'coding_system' => $diag['coding_system'] ?? 'ICD-10',
                            'description' => $diag['description'] ?? '',
                            'diagnosis_type' => $diag['diagnosis_type'] ?? 'primary',
                            'certainty' => $diag['certainty'] ?? 'confirmed',
                            'rank' => $diag['rank'] ?? ($rank + 1),
                            'is_primary' => ($diag['diagnosis_type'] ?? 'primary') === 'primary',
                        ]);
                    } else {
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
            }
        }

        return $consultation;
    }
}
