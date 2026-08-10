<?php

use App\Http\Controllers\BillingController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\LabController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\QueueController;
use App\Http\Controllers\VisitController;
use App\Http\Controllers\VitalController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('patients')->group(function () {
        Route::post('/', [PatientController::class, 'store'])->middleware('permission:patients.create');
        Route::put('{patient}', [PatientController::class, 'update'])->middleware('permission:patients.update');
        Route::get('search', [PatientController::class, 'search'])->middleware('permission:patients.view');
        Route::delete('{patient}', [PatientController::class, 'destroy'])->middleware('permission:patients.delete');
    });

    Route::prefix('visits')->group(function () {
        Route::post('/', [VisitController::class, 'store'])->middleware('permission:visits.create');
        Route::post('{visit}/complete', [VisitController::class, 'complete'])->middleware('permission:visits.update');
        Route::post('{visit}/start', [VisitController::class, 'start'])->middleware('permission:visits.update');
        Route::post('{visit}/cancel', [VisitController::class, 'cancel'])->middleware('permission:visits.update');
    });

    Route::apiResource('queue', QueueController::class)->only(['index', 'store', 'destroy']);

    Route::post('vitals', [VitalController::class, 'store'])->middleware('permission:visits.update');

    Route::post('consultations', [ConsultationController::class, 'store'])->middleware('permission:consultations.create');

    Route::post('prescriptions', [PrescriptionController::class, 'store'])->middleware('permission:consultations.create');
    Route::post('prescription-items', [PrescriptionController::class, 'addItem'])->middleware('permission:pharmacy.dispense');
    Route::post('prescriptions/{prescription}/finalize', [PrescriptionController::class, 'finalize'])->middleware('permission:consultations.update');
    Route::post('prescriptions/{prescription}/dispense', [PrescriptionController::class, 'dispense'])->middleware('permission:pharmacy.dispense');

    Route::post('invoices', [BillingController::class, 'store'])->middleware('permission:billing.create');
    Route::post('payments', [PaymentController::class, 'store'])->middleware('permission:billing.create');

    // Laboratory
    Route::post('lab/orders', [LabController::class, 'store'])->middleware('permission:laboratory.order');
    Route::post('lab/orders/add', [LabController::class, 'addTest'])->middleware('permission:laboratory.order');
    Route::post('lab/results', [LabController::class, 'recordResult'])->middleware('permission:laboratory.result');

    // Inventory
    Route::post('inventory/receive', [InventoryController::class, 'receive'])->middleware('permission:inventory.create');
});
