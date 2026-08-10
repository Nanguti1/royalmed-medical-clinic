<?php

namespace App\Actions\Queue;

use App\Exceptions\InvalidQueueStateException;
use App\Models\QueueEntry;

class RemoveFromQueueAction
{
    public function execute(QueueEntry $entry): void
    {
        if (! $entry->canRemove()) {
            throw InvalidQueueStateException::cannotRemoveServed();
        }

        $entry->delete();
    }
}
