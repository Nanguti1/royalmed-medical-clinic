<?php

use App\Http\Controllers\BillingWebController;
use App\Http\Controllers\ConsultationWebController;
use App\Http\Controllers\DashboardWebController;
use App\Http\Controllers\LaboratoryWebController;
use App\Http\Controllers\PatientWebController;
use App\Http\Controllers\PaymentReconciliationWebController;
use App\Http\Controllers\PaymentWebController;
use App\Http\Controllers\PermissionWebController;
use App\Http\Controllers\PharmacyWebController;
use App\Http\Controllers\PrescriptionWebController;
use App\Http\Controllers\RoleWebController;
use App\Http\Controllers\UserWebController;
use App\Http\Controllers\VisitWebController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardWebController::class, 'index'])->name('dashboard')
        ->middleware('can:patients.view');

    Route::prefix('patients')->group(function () {
        Route::get('/', [PatientWebController::class, 'index'])->name('patients.index');
        Route::get('/create', [PatientWebController::class, 'create'])->name('patients.create');
        Route::post('/', [PatientWebController::class, 'store'])->name('patients.store');
        Route::get('/{patient}', [PatientWebController::class, 'show'])->name('patients.show');
        Route::get('/{patient}/edit', [PatientWebController::class, 'edit'])->name('patients.edit');
        Route::put('/{patient}', [PatientWebController::class, 'update'])->name('patients.update');
        Route::delete('/{patient}', [PatientWebController::class, 'destroy'])->name('patients.destroy');
    });

    Route::prefix('visits')->group(function () {
        Route::get('/', [VisitWebController::class, 'index'])->name('visits.index');
        Route::get('/create', [VisitWebController::class, 'create'])->name('visits.create');
        Route::post('/', [VisitWebController::class, 'store'])->name('visits.store');
        Route::get('/{visit}', [VisitWebController::class, 'show'])->name('visits.show');
        Route::get('/{visit}/triage', [VisitWebController::class, 'triage'])->name('visits.triage');
        Route::post('/{visit}/vitals', [VisitWebController::class, 'captureVitals'])->name('visits.captureVitals');
        Route::get('/queue', [VisitWebController::class, 'queue'])->name('visits.queue');
        Route::post('/{visit}/queue', [VisitWebController::class, 'addToQueue'])->name('visits.addToQueue');
        Route::delete('/queue/{entry}', [VisitWebController::class, 'removeFromQueue'])->name('visits.removeFromQueue');
        Route::post('/{visit}/start', [VisitWebController::class, 'start'])->name('visits.start');
        Route::post('/{visit}/complete', [VisitWebController::class, 'complete'])->name('visits.complete');
        Route::post('/{visit}/cancel', [VisitWebController::class, 'cancel'])->name('visits.cancel');
    });

    Route::prefix('consultations')->group(function () {
        Route::get('/', [ConsultationWebController::class, 'index'])->name('consultations.index');
        Route::get('/create/{visit}', [ConsultationWebController::class, 'create'])->name('consultations.create');
        Route::post('/', [ConsultationWebController::class, 'store'])->name('consultations.store');
        Route::get('/{consultation}', [ConsultationWebController::class, 'show'])->name('consultations.show');
        Route::get('/{consultation}/edit', [ConsultationWebController::class, 'edit'])->name('consultations.edit');
        Route::put('/{consultation}', [ConsultationWebController::class, 'update'])->name('consultations.update');
        Route::post('/visits/{visit}/start', [ConsultationWebController::class, 'startConsultation'])->name('consultations.startConsultation');
        Route::post('/visits/{visit}/complete', [ConsultationWebController::class, 'completeVisit'])->name('consultations.completeVisit');
    });

    Route::prefix('prescriptions')->group(function () {
        Route::get('/create/{visit}', [PrescriptionWebController::class, 'create'])->name('prescriptions.create');
        Route::post('/', [PrescriptionWebController::class, 'store'])->name('prescriptions.store');
        Route::get('/{prescription}', [PrescriptionWebController::class, 'show'])->name('prescriptions.show');
    });

    Route::prefix('pharmacy')->group(function () {
        Route::get('/', [PharmacyWebController::class, 'index'])->name('pharmacy.index');
        Route::get('/dispense/{prescription}', [PharmacyWebController::class, 'dispense'])->name('pharmacy.dispense');
        Route::post('/dispense/{prescription}', [PharmacyWebController::class, 'storeDispense'])->name('pharmacy.storeDispense');
        Route::get('/inventory', [PharmacyWebController::class, 'inventory'])->name('pharmacy.inventory');
        Route::get('/receive', [PharmacyWebController::class, 'receive'])->name('pharmacy.receive');
        Route::post('/receive', [PharmacyWebController::class, 'storeReceive'])->name('pharmacy.storeReceive');
    });

    Route::prefix('laboratory')->group(function () {
        Route::get('/', [LaboratoryWebController::class, 'index'])->name('laboratory.index');
        Route::get('/create/{visit}', [LaboratoryWebController::class, 'create'])->name('laboratory.create');
        Route::post('/', [LaboratoryWebController::class, 'store'])->name('laboratory.store');
        Route::get('/{labOrder}', [LaboratoryWebController::class, 'show'])->name('laboratory.show');
        Route::post('/{labOrder}/start', [LaboratoryWebController::class, 'start'])->name('laboratory.start');
        Route::post('/{labOrder}/complete', [LaboratoryWebController::class, 'complete'])->name('laboratory.complete');
        Route::get('/{labOrder}/results', [LaboratoryWebController::class, 'recordResult'])->name('laboratory.recordResult');
        Route::post('/{labOrder}/results', [LaboratoryWebController::class, 'storeResult'])->name('laboratory.storeResult');
    });

    Route::prefix('billing')->group(function () {
        Route::get('/', [BillingWebController::class, 'index'])->name('billing.index');
        Route::get('/create/{visit}', [BillingWebController::class, 'create'])->name('billing.create');
        Route::post('/', [BillingWebController::class, 'store'])->name('billing.store');
        Route::get('/{invoice}', [BillingWebController::class, 'show'])->name('billing.show');
    });

    Route::prefix('payments')->group(function () {
        Route::get('/', [PaymentWebController::class, 'index'])->name('payments.index');
        Route::get('/reconciliation', [PaymentReconciliationWebController::class, 'index'])->name('payments.reconciliation');
        Route::get('/create/{invoice}', [PaymentWebController::class, 'create'])->name('payments.create');
        Route::post('/', [PaymentWebController::class, 'store'])->name('payments.store');
        Route::get('/receipt/{payment}', [PaymentWebController::class, 'receipt'])->name('payments.receipt');
        Route::get('/{payment}', [PaymentWebController::class, 'show'])->name('payments.show');
    });

    Route::prefix('users')->group(function () {
        Route::get('/', [UserWebController::class, 'index'])->name('users.index')
            ->middleware('can:users.view');
        Route::get('/create', [UserWebController::class, 'create'])->name('users.create')
            ->middleware('can:users.create');
        Route::post('/', [UserWebController::class, 'store'])->name('users.store')
            ->middleware('can:users.create');
        Route::get('/{user}', [UserWebController::class, 'show'])->name('users.show')
            ->middleware('can:users.view');
        Route::get('/{user}/edit', [UserWebController::class, 'edit'])->name('users.edit')
            ->middleware('can:users.update');
        Route::put('/{user}', [UserWebController::class, 'update'])->name('users.update')
            ->middleware('can:users.update');
        Route::delete('/{user}', [UserWebController::class, 'destroy'])->name('users.destroy')
            ->middleware('can:users.delete');
        Route::post('/{user}/toggle-status', [UserWebController::class, 'toggleStatus'])->name('users.toggle-status')
            ->middleware('can:users.update');
    });

    Route::prefix('roles')->group(function () {
        Route::get('/', [RoleWebController::class, 'index'])->name('roles.index')
            ->middleware('can:roles.view');
        Route::get('/create', [RoleWebController::class, 'create'])->name('roles.create')
            ->middleware('can:roles.create');
        Route::post('/', [RoleWebController::class, 'store'])->name('roles.store')
            ->middleware('can:roles.create');
        Route::get('/{role}', [RoleWebController::class, 'show'])->name('roles.show')
            ->middleware('can:roles.view');
        Route::get('/{role}/edit', [RoleWebController::class, 'edit'])->name('roles.edit')
            ->middleware('can:roles.update');
        Route::put('/{role}', [RoleWebController::class, 'update'])->name('roles.update')
            ->middleware('can:roles.update');
        Route::delete('/{role}', [RoleWebController::class, 'destroy'])->name('roles.destroy')
            ->middleware('can:roles.delete');
    });

    Route::prefix('permissions')->group(function () {
        Route::get('/', [PermissionWebController::class, 'index'])->name('permissions.index')
            ->middleware('can:permissions.view');
    });
});

require __DIR__.'/settings.php';
