<?php

namespace App\Services;

use App\Actions\Visits\CancelVisitAction;
use App\Actions\Visits\CompleteVisitAction;
use App\Actions\Visits\CreateVisitAction;
use App\Actions\Visits\StartVisitAction;
use App\Models\Visit;
use Illuminate\Support\Facades\DB;

class VisitService
{
    protected CreateVisitAction $createAction;

    protected CompleteVisitAction $completeAction;

    protected StartVisitAction $startAction;

    protected CancelVisitAction $cancelAction;

    public function __construct(CreateVisitAction $createAction, CompleteVisitAction $completeAction, StartVisitAction $startAction, CancelVisitAction $cancelAction)
    {
        $this->createAction = $createAction;
        $this->completeAction = $completeAction;
        $this->startAction = $startAction;
        $this->cancelAction = $cancelAction;
    }

    public function create(array $data): Visit
    {
        return DB::transaction(function () use ($data) {
            return $this->createAction->execute($data);
        });
    }

    public function complete(Visit $visit): Visit
    {
        return DB::transaction(function () use ($visit) {
            return $this->completeAction->execute($visit);
        });
    }

    public function start(Visit $visit): Visit
    {
        return DB::transaction(function () use ($visit) {
            return $this->startAction->execute($visit);
        });
    }

    public function cancel(Visit $visit): Visit
    {
        return DB::transaction(function () use ($visit) {
            return $this->cancelAction->execute($visit);
        });
    }
}
