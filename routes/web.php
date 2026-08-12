<?php

use App\Http\Controllers\BillingController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\LaboratoryController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PaymentReconciliationController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PharmacyController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VisitController;
use Illuminate\Support\Facades\Route;

// Health check endpoint (public for monitoring)
Route::get('/health', HealthController::class)->name('health');

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard')
        ->middleware('can:patients.view');

    Route::prefix('patients')->group(function () {
        Route::get('/', [PatientController::class, 'index'])->name('patients.index')
            ->middleware('can:patients.view');
        Route::get('/create', [PatientController::class, 'create'])->name('patients.create')
            ->middleware('can:patients.create');
        Route::post('/', [PatientController::class, 'store'])->name('patients.store')
            ->middleware('can:patients.create');
        Route::get('/{patient}', [PatientController::class, 'show'])->name('patients.show')
            ->middleware('can:patients.view');
        Route::get('/{patient}/edit', [PatientController::class, 'edit'])->name('patients.edit')
            ->middleware('can:patients.update');
        Route::put('/{patient}', [PatientController::class, 'update'])->name('patients.update')
            ->middleware('can:patients.update');
        Route::delete('/{patient}', [PatientController::class, 'destroy'])->name('patients.destroy')
            ->middleware('can:patients.delete');
    });

    Route::prefix('visits')->group(function () {
        Route::get('/', [VisitController::class, 'index'])->name('visits.index')
            ->middleware('can:visits.view');
        Route::get('/create', [VisitController::class, 'create'])->name('visits.create')
            ->middleware('can:visits.create');
        Route::post('/', [VisitController::class, 'store'])->name('visits.store')
            ->middleware('can:visits.create');
        Route::get('/{visit}', [VisitController::class, 'show'])->name('visits.show')
            ->middleware('can:visits.view');
        Route::get('/{visit}/triage', [VisitController::class, 'triage'])->name('visits.triage')
            ->middleware('can:visits.update');
        Route::post('/{visit}/vitals', [VisitController::class, 'captureVitals'])->name('visits.captureVitals')
            ->middleware('can:visits.update');
        Route::get('/queue', [VisitController::class, 'queue'])->name('visits.queue')
            ->middleware('can:visits.view');
        Route::post('/{visit}/queue', [VisitController::class, 'addToQueue'])->name('visits.addToQueue')
            ->middleware('can:visits.update');
        Route::delete('/queue/{entry}', [VisitController::class, 'removeFromQueue'])->name('visits.removeFromQueue')
            ->middleware('can:visits.update');
        Route::post('/{visit}/start', [VisitController::class, 'start'])->name('visits.start')
            ->middleware('can:visits.update');
        Route::post('/{visit}/complete', [VisitController::class, 'complete'])->name('visits.complete')
            ->middleware('can:visits.update');
        Route::post('/{visit}/cancel', [VisitController::class, 'cancel'])->name('visits.cancel')
            ->middleware('can:visits.update');
    });

    Route::prefix('consultations')->group(function () {
        Route::get('/', [ConsultationController::class, 'index'])->name('consultations.index')
            ->middleware('can:consultations.view');
        Route::get('/create/{visit}', [ConsultationController::class, 'create'])->name('consultations.create')
            ->middleware('can:consultations.create');
        Route::post('/', [ConsultationController::class, 'store'])->name('consultations.store')
            ->middleware('can:consultations.create');
        Route::get('/{consultation}', [ConsultationController::class, 'show'])->name('consultations.show')
            ->middleware('can:consultations.view');
        Route::get('/{consultation}/edit', [ConsultationController::class, 'edit'])->name('consultations.edit')
            ->middleware('can:consultations.update');
        Route::put('/{consultation}', [ConsultationController::class, 'update'])->name('consultations.update')
            ->middleware('can:consultations.update');
        Route::post('/visits/{visit}/start', [ConsultationController::class, 'startConsultation'])->name('consultations.startConsultation')
            ->middleware('can:visits.update');
        Route::post('/visits/{visit}/complete', [ConsultationController::class, 'completeVisit'])->name('consultations.completeVisit')
            ->middleware('can:visits.update');
    });

    Route::prefix('prescriptions')->group(function () {
        Route::get('/create/{visit}', [PrescriptionController::class, 'create'])->name('prescriptions.create')
            ->middleware('can:consultations.create');
        Route::post('/', [PrescriptionController::class, 'store'])->name('prescriptions.store')
            ->middleware('can:consultations.create');
        Route::get('/{prescription}', [PrescriptionController::class, 'show'])->name('prescriptions.show')
            ->middleware('can:consultations.view');
    });

    Route::prefix('pharmacy')->group(function () {
        Route::get('/', [PharmacyController::class, 'index'])->name('pharmacy.index')
            ->middleware('can:pharmacy.view');
        Route::get('/dispense/{prescription}', [PharmacyController::class, 'dispense'])->name('pharmacy.dispense')
            ->middleware('can:pharmacy.view');
        Route::post('/dispense/{prescription}', [PharmacyController::class, 'storeDispense'])->name('pharmacy.storeDispense')
            ->middleware('can:pharmacy.dispense');
        Route::get('/inventory', [PharmacyController::class, 'inventory'])->name('pharmacy.inventory')
            ->middleware('can:inventory.view');
        Route::get('/receive', [PharmacyController::class, 'receive'])->name('pharmacy.receive')
            ->middleware('can:inventory.manage');
        Route::post('/receive', [PharmacyController::class, 'storeReceive'])->name('pharmacy.storeReceive')
            ->middleware('can:inventory.manage');
    });

    Route::prefix('laboratory')->group(function () {
        Route::get('/', [LaboratoryController::class, 'index'])->name('laboratory.index')
            ->middleware('can:laboratory.view');
        Route::get('/create/{visit}', [LaboratoryController::class, 'create'])->name('laboratory.create')
            ->middleware('can:laboratory.order');
        Route::post('/', [LaboratoryController::class, 'store'])->name('laboratory.store')
            ->middleware('can:laboratory.order');
        Route::get('/{labOrder}', [LaboratoryController::class, 'show'])->name('laboratory.show')
            ->middleware('can:laboratory.view');
        Route::post('/{labOrder}/start', [LaboratoryController::class, 'start'])->name('laboratory.start')
            ->middleware('can:laboratory.order');
        Route::post('/{labOrder}/complete', [LaboratoryController::class, 'complete'])->name('laboratory.complete')
            ->middleware('can:laboratory.order');
        Route::get('/{labOrder}/results', [LaboratoryController::class, 'recordResult'])->name('laboratory.recordResult')
            ->middleware('can:laboratory.result');
        Route::post('/{labOrder}/results', [LaboratoryController::class, 'storeResult'])->name('laboratory.storeResult')
            ->middleware('can:laboratory.result');
    });

    Route::prefix('billing')->group(function () {
        Route::get('/', [BillingController::class, 'index'])->name('billing.index')
            ->middleware('can:billing.view');
        Route::get('/create/{visit}', [BillingController::class, 'create'])->name('billing.create')
            ->middleware('can:billing.create');
        Route::post('/', [BillingController::class, 'store'])->name('billing.store')
            ->middleware('can:billing.create');
        Route::get('/{invoice}', [BillingController::class, 'show'])->name('billing.show')
            ->middleware('can:billing.view');
    });

    Route::prefix('payments')->group(function () {
        Route::get('/', [PaymentController::class, 'index'])->name('payments.index')
            ->middleware('can:billing.view');
        Route::get('/reconciliation', [PaymentReconciliationController::class, 'index'])->name('payments.reconciliation')
            ->middleware('can:billing.view');
        Route::get('/create/{invoice}', [PaymentController::class, 'create'])->name('payments.create')
            ->middleware('can:billing.create');
        Route::post('/', [PaymentController::class, 'store'])->name('payments.store')
            ->middleware('can:billing.create');
        Route::get('/receipt/{payment}', [PaymentController::class, 'receipt'])->name('payments.receipt')
            ->middleware('can:billing.view');
        Route::get('/{payment}', [PaymentController::class, 'show'])->name('payments.show')
            ->middleware('can:billing.view');
    });

    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('users.index')
            ->middleware('can:users.view');
        Route::get('/create', [UserController::class, 'create'])->name('users.create')
            ->middleware('can:users.create');
        Route::post('/', [UserController::class, 'store'])->name('users.store')
            ->middleware('can:users.create');
        Route::get('/{user}', [UserController::class, 'show'])->name('users.show')
            ->middleware('can:users.view');
        Route::get('/{user}/edit', [UserController::class, 'edit'])->name('users.edit')
            ->middleware('can:users.update');
        Route::put('/{user}', [UserController::class, 'update'])->name('users.update')
            ->middleware('can:users.update');
        Route::delete('/{user}', [UserController::class, 'destroy'])->name('users.destroy')
            ->middleware('can:users.delete');
        Route::post('/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status')
            ->middleware('can:users.update');
    });

    Route::prefix('roles')->group(function () {
        Route::get('/', [RoleController::class, 'index'])->name('roles.index')
            ->middleware('can:roles.view');
        Route::get('/create', [RoleController::class, 'create'])->name('roles.create')
            ->middleware('can:roles.create');
        Route::post('/', [RoleController::class, 'store'])->name('roles.store')
            ->middleware('can:roles.create');
        Route::get('/{role}', [RoleController::class, 'show'])->name('roles.show')
            ->middleware('can:roles.view');
        Route::get('/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit')
            ->middleware('can:roles.update');
        Route::put('/{role}', [RoleController::class, 'update'])->name('roles.update')
            ->middleware('can:roles.update');
        Route::delete('/{role}', [RoleController::class, 'destroy'])->name('roles.destroy')
            ->middleware('can:roles.delete');
    });

    Route::prefix('permissions')->group(function () {
        Route::get('/', [PermissionController::class, 'index'])->name('permissions.index')
            ->middleware('can:permissions.view');
    });
});

require __DIR__.'/settings.php';
