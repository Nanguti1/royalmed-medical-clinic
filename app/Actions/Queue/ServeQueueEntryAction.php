<?php

namespace App\Actions\Queue;

use App\Exceptions\InvalidQueueStateException;
use App\Models\QueueEntry;

class ServeQueueEntryAction
{
    public function execute(QueueEntry $entry): QueueEntry
    {
        if (! $entry->canServe()) {
            if ($entry->isServed()) {
                throw InvalidQueueStateException::cannotServeServed();
            }

            if ($entry->isWaiting()) {
                throw InvalidQueueStateException::cannotServeUncalled();
            }

            throw InvalidQueueStateException::invalidStatus($entry->status, 'completed');
        }

        $entry->update([
            'status' => 'completed',
            'served_at' => now(),
        ]);

        return $entry;
    }
}
