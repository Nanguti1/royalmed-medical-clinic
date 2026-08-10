<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddToQueueRequest;
use App\Models\QueueEntry;
use App\Services\QueueService;
use Illuminate\Http\JsonResponse;

class QueueController extends Controller
{
    protected QueueService $service;

    public function __construct(QueueService $service)
    {
        $this->service = $service;
    }

    public function store(AddToQueueRequest $request): JsonResponse
    {
        $entry = $this->service->add($request->validated());

        return response()->json($entry, 201);
    }

    public function destroy(QueueEntry $entry): JsonResponse
    {
        $this->authorize('visits.update');
        $this->service->remove($entry);

        return response()->json(null, 204);
    }

    public function index(): JsonResponse
    {
        $this->authorize('visits.view');
        $list = $this->service->waiting();

        return response()->json($list);
    }
}
