<?php

namespace App\Actions\Queue;

use App\Models\QueueEntry;

class AddToQueueAction
{
    public function execute(array $data): QueueEntry
    {
        // Set default status to waiting if not provided
        if (! isset($data['status'])) {
            $data['status'] = 'waiting';
        }

        // position can be null; a separate process may compute it
        return QueueEntry::create($data);
    }
}
