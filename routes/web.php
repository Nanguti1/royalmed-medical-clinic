<?php

use App\Http\Controllers\BillingController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\LabCategoryController;
use App\Http\Controllers\LaboratoryController;
use App\Http\Controllers\LabTestController;
use App\Http\Controllers\MedicineController;
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
        Route::post('/check-duplicates', [PatientController::class, 'checkDuplicates'])->name('patients.checkDuplicates')
            ->middleware('can:patients.view');
        Route::post('/', [PatientController::class, 'store'])->name('patients.store')
            ->middleware('can:patients.create');
        Route::get('/{patient}', [PatientController::class, 'show'])->name('patients.show')
            ->middleware('can:patients.view');
        Route::get('/{patient}/edit', [PatientController::class, 'edit'])->name('patients.edit')
            ->middleware('can:patients.update');
        Route::put('/{patient}', [PatientController::class, 'update'])->name('patients.update')
            ->middleware('can:patients.update');
        Route::post('/{patient}/merge', [PatientController::class, 'merge'])->name('patients.merge')
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
        Route::get('/queue', [VisitController::class, 'queue'])->name('visits.queue')
            ->middleware('can:visits.view');
        Route::get('/{visit}', [VisitController::class, 'show'])->name('visits.show')
            ->middleware('can:visits.view');
        Route::get('/{visit}/triage', [VisitController::class, 'triage'])->name('visits.triage')
            ->middleware('can:visits.update');
        Route::post('/{visit}/vitals', [VisitController::class, 'captureVitals'])->name('visits.captureVitals')
            ->middleware('can:visits.update');
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
        Route::post('/templates/{template}/apply', [ConsultationController::class, 'applyTemplate'])->name('consultations.applyTemplate')
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
        Route::get('/', [PrescriptionController::class, 'index'])->name('prescriptions.index')
            ->middleware('can:consultations.view');
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

    Route::prefix('medicines')->group(function () {
        Route::get('/', [MedicineController::class, 'index'])->name('medicines.index')
            ->middleware('can:inventory.manage');
        Route::get('/create', [MedicineController::class, 'create'])->name('medicines.create')
            ->middleware('can:inventory.manage');
        Route::post('/', [MedicineController::class, 'store'])->name('medicines.store')
            ->middleware('can:inventory.manage');
        Route::get('/{medicine}', [MedicineController::class, 'show'])->name('medicines.show')
            ->middleware('can:inventory.manage');
        Route::get('/{medicine}/edit', [MedicineController::class, 'edit'])->name('medicines.edit')
            ->middleware('can:inventory.manage');
        Route::put('/{medicine}', [MedicineController::class, 'update'])->name('medicines.update')
            ->middleware('can:inventory.manage');
        Route::delete('/{medicine}', [MedicineController::class, 'destroy'])->name('medicines.destroy')
            ->middleware('can:inventory.manage');
    });

    Route::prefix('lab-categories')->group(function () {
        Route::get('/', [LabCategoryController::class, 'index'])->name('lab-categories.index')
            ->middleware('can:laboratory.manage');
        Route::get('/create', [LabCategoryController::class, 'create'])->name('lab-categories.create')
            ->middleware('can:laboratory.manage');
        Route::post('/', [LabCategoryController::class, 'store'])->name('lab-categories.store')
            ->middleware('can:laboratory.manage');
        Route::get('/{labCategory}', [LabCategoryController::class, 'show'])->name('lab-categories.show')
            ->middleware('can:laboratory.manage');
        Route::get('/{labCategory}/edit', [LabCategoryController::class, 'edit'])->name('lab-categories.edit')
            ->middleware('can:laboratory.manage');
        Route::put('/{labCategory}', [LabCategoryController::class, 'update'])->name('lab-categories.update')
            ->middleware('can:laboratory.manage');
        Route::delete('/{labCategory}', [LabCategoryController::class, 'destroy'])->name('lab-categories.destroy')
            ->middleware('can:laboratory.manage');
    });

    Route::prefix('lab-tests')->group(function () {
        Route::get('/', [LabTestController::class, 'index'])->name('lab-tests.index')
            ->middleware('can:laboratory.manage');
        Route::get('/create', [LabTestController::class, 'create'])->name('lab-tests.create')
            ->middleware('can:laboratory.manage');
        Route::post('/', [LabTestController::class, 'store'])->name('lab-tests.store')
            ->middleware('can:laboratory.manage');
        Route::get('/{labTest}', [LabTestController::class, 'show'])->name('lab-tests.show')
            ->middleware('can:laboratory.manage');
        Route::get('/{labTest}/edit', [LabTestController::class, 'edit'])->name('lab-tests.edit')
            ->middleware('can:laboratory.manage');
        Route::put('/{labTest}', [LabTestController::class, 'update'])->name('lab-tests.update')
            ->middleware('can:laboratory.manage');
        Route::delete('/{labTest}', [LabTestController::class, 'destroy'])->name('lab-tests.destroy')
            ->middleware('can:laboratory.manage');
        Route::post('/{labTest}/reference-ranges', [LabTestController::class, 'storeReferenceRange'])->name('lab-tests.storeReferenceRange')
            ->middleware('can:laboratory.manage');
        Route::put('/{labTest}/reference-ranges/{referenceRange}', [LabTestController::class, 'updateReferenceRange'])->name('lab-tests.updateReferenceRange')
            ->middleware('can:laboratory.manage');
        Route::delete('/{labTest}/reference-ranges/{referenceRange}', [LabTestController::class, 'destroyReferenceRange'])->name('lab-tests.destroyReferenceRange')
            ->middleware('can:laboratory.manage');
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
        Route::post('/{labOrder}/collect-sample', [LaboratoryController::class, 'collectSample'])->name('laboratory.collectSample')
            ->middleware('can:laboratory.order');
        Route::post('/{labOrder}/items/{labOrderItem}/collect', [LaboratoryController::class, 'collectSampleItem'])->name('laboratory.collectSampleItem')
            ->middleware('can:laboratory.order');
        Route::post('/{labOrder}/items/{labOrderItem}/receive', [LaboratoryController::class, 'receiveSampleItem'])->name('laboratory.receiveSampleItem')
            ->middleware('can:laboratory.order');
        Route::post('/{labOrder}/items/{labOrderItem}/process', [LaboratoryController::class, 'processSampleItem'])->name('laboratory.processSampleItem')
            ->middleware('can:laboratory.order');
        Route::post('/{labOrder}/items/{labOrderItem}/complete', [LaboratoryController::class, 'completeSampleItem'])->name('laboratory.completeSampleItem')
            ->middleware('can:laboratory.order');
        Route::get('/{labOrder}/results', [LaboratoryController::class, 'recordResult'])->name('laboratory.recordResult')
            ->middleware('can:laboratory.result');
        Route::post('/{labOrder}/results', [LaboratoryController::class, 'storeResult'])->name('laboratory.storeResult')
            ->middleware('can:laboratory.result');
        Route::post('/{labOrder}/results/{labResult}/verify', [LaboratoryController::class, 'verifyResult'])->name('laboratory.verifyResult')
            ->middleware('can:laboratory.result');
        Route::post('/{labOrder}/results/{labResult}/reject', [LaboratoryController::class, 'rejectResult'])->name('laboratory.rejectResult')
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
