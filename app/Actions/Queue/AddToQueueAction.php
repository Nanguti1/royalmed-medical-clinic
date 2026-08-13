<?php

namespace App\Actions\Queue;

use App\Models\QueueEntry;
use App\Support\Generators\NumberGenerator;

class AddToQueueAction
{
    public function execute(array $data): QueueEntry
    {
        $data['department'] ??= 'consultation';
        $data['status'] ??= 'waiting';
        $data['priority'] ??= 'normal';
        $data['queue_number'] ??= NumberGenerator::generateQueueNumber($data['department']);

        // position can be null; a separate process may compute it
        return QueueEntry::create($data);
    }
}
