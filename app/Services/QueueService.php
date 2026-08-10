<?php

namespace App\Services;

use App\Actions\Queue\AddToQueueAction;
use App\Actions\Queue\CallQueueEntryAction;
use App\Actions\Queue\RemoveFromQueueAction;
use App\Actions\Queue\ServeQueueEntryAction;
use App\Models\QueueEntry;
use Illuminate\Support\Facades\DB;

class QueueService
{
    protected AddToQueueAction $addAction;

    protected RemoveFromQueueAction $removeAction;

    protected CallQueueEntryAction $callAction;

    protected ServeQueueEntryAction $serveAction;

    public function __construct(AddToQueueAction $addAction, RemoveFromQueueAction $removeAction, CallQueueEntryAction $callAction, ServeQueueEntryAction $serveAction)
    {
        $this->addAction = $addAction;
        $this->removeAction = $removeAction;
        $this->callAction = $callAction;
        $this->serveAction = $serveAction;
    }

    public function add(array $data): QueueEntry
    {
        return DB::transaction(function () use ($data) {
            return $this->addAction->execute($data);
        });
    }

    public function remove(QueueEntry $entry): void
    {
        DB::transaction(function () use ($entry) {
            $this->removeAction->execute($entry);
        });
    }

    public function call(QueueEntry $entry): QueueEntry
    {
        return DB::transaction(function () use ($entry) {
            return $this->callAction->execute($entry);
        });
    }

    public function serve(QueueEntry $entry): QueueEntry
    {
        return DB::transaction(function () use ($entry) {
            return $this->serveAction->execute($entry);
        });
    }

    public function waiting()
    {
        return QueueEntry::where('status', 'waiting')->orderBy('position')->get();
    }
}
