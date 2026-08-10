<?php

namespace App\Actions\Queue;

use App\Exceptions\InvalidQueueStateException;
use App\Models\QueueEntry;

class CallQueueEntryAction
{
    public function execute(QueueEntry $entry): QueueEntry
    {
        if (! $entry->canCall()) {
            if ($entry->isServed()) {
                throw InvalidQueueStateException::cannotCallServed();
            }

            if ($entry->isCalled()) {
                throw InvalidQueueStateException::cannotCallCalled();
            }

            throw InvalidQueueStateException::invalidStatus($entry->status, 'called');
        }

        $entry->update([
            'status' => 'called',
            'called_at' => now(),
        ]);

        return $entry;
    }
}
