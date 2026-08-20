<?php

namespace App\Actions\Laboratory;

use App\Models\LabOrder;
use App\Models\Visit;
use App\Models\VisitStatus;
use App\Support\Generators\NumberGenerator;
use Illuminate\Support\Facades\Auth;

class CreateLabOrderAction
{
    public function execute(array $data): LabOrder
    {
        if (! isset($data['status'])) {
            $data['status'] = 'ordered';
        }

        if (! isset($data['ordered_by']) && Auth::check()) {
            $data['ordered_by'] = Auth::id();
        }

        if (empty($data['accession_number'])) {
            $data['accession_number'] = NumberGenerator::generateAccessionNumber();
        }

        // Automatically populate consultation_id from visit if not provided
        if (! isset($data['consultation_id']) && isset($data['visit_id'])) {
            $visit = Visit::find($data['visit_id']);
            if ($visit && $visit->consultation) {
                $data['consultation_id'] = $visit->consultation->id;

                // Transition visit to WAITING_FOR_LAB when lab is ordered from consultation
                $waitingForLabStatus = VisitStatus::where('code', 'WAITING_FOR_LAB')->first();
                if ($waitingForLabStatus) {
                    $visit->update(['visit_status_id' => $waitingForLabStatus->id]);
                }
            }
        }

        return LabOrder::create($data);
    }
}
