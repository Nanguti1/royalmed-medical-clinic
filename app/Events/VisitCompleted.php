<?php

namespace App\Events;

use App\Models\Visit;
use Illuminate\Queue\SerializesModels;

class VisitCompleted
{
    use SerializesModels;

    public Visit $visit;

    public function __construct(Visit $visit)
    {
        $this->visit = $visit;
    }
}
