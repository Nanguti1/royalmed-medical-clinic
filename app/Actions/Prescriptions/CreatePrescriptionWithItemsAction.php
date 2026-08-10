<?php

namespace App\Actions\Prescriptions;

use App\Models\Prescription;

class CreatePrescriptionWithItemsAction
{
    public function execute(array $data): Prescription
    {
        $items = $data['items'] ?? [];
        unset($data['items']);

        $prescription = Prescription::create($data);

        foreach ($items as $itemData) {
            $prescription->items()->create(array_merge($itemData, [
                'prescription_id' => $prescription->id,
            ]));
        }

        return $prescription->load('items');
    }
}
