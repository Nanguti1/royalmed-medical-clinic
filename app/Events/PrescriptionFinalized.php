<?php

namespace App\Events;

use App\Models\Prescription;
use Illuminate\Queue\SerializesModels;

class PrescriptionFinalized
{
    use SerializesModels;

    public Prescription $prescription;

    public function __construct(Prescription $prescription)
    {
        $this->prescription = $prescription;
    }
}
