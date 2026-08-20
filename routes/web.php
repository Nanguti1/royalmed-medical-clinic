<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DentalController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\InsuranceController;
use App\Http\Controllers\LabCategoryController;
use App\Http\Controllers\LaboratoryController;
use App\Http\Controllers\LabTestController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PaymentReconciliationController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PharmacyController;
use App\Http\Controllers\PortalController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\PrintController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VaccinationController;
use App\Http\Controllers\VisitController;
use Illuminate\Support\Facades\Route;

// Health check endpoint (public for monitoring)
Route::get('/health', HealthController::class)->name('health');

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard')
        ->middleware('can:patients.view');

    // Redirect old insurers route to new location
    Route::redirect('/insurers', '/insurance/insurers', 301);
    Route::redirect('/insurance/claims', '/billing/claims', 301);
    Route::redirect('/insurance/preauthorizations', '/billing/preauthorizations', 301);

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

    Route::prefix('appointments')->group(function () {
        Route::get('/', [AppointmentController::class, 'index'])->name('appointments.index');
        Route::get('/create', [AppointmentController::class, 'create'])->name('appointments.create');
        Route::post('/', [AppointmentController::class, 'store'])->name('appointments.store');
        Route::get('/{appointment}', [AppointmentController::class, 'show'])->name('appointments.show');
        Route::get('/{appointment}/edit', [AppointmentController::class, 'edit'])->name('appointments.edit');
        Route::put('/{appointment}', [AppointmentController::class, 'update'])->name('appointments.update');
        Route::delete('/{appointment}', [AppointmentController::class, 'destroy'])->name('appointments.destroy');
        Route::get('/calendar', [AppointmentController::class, 'calendar'])->name('appointments.calendar');
        Route::get('/waitlist', [AppointmentController::class, 'waitlist'])->name('appointments.waitlist');
        Route::prefix('schedules')->group(function () {
            Route::get('/doctor', [AppointmentController::class, 'scheduleDoctor'])->name('appointments.schedules.doctor');
            Route::get('/dental', [AppointmentController::class, 'scheduleDental'])->name('appointments.schedules.dental');
        });
    });

    Route::prefix('dental')->group(function () {
        Route::get('/', [DentalController::class, 'index'])->name('dental.index');
        Route::get('/patients/{patient}/chart', [DentalController::class, 'chart'])->name('dental.chart');
        Route::prefix('charts')->group(function () {
            Route::get('/create', [DentalController::class, 'chartsCreate'])->name('dental.charts.create');
            Route::post('/', [DentalController::class, 'chartsStore'])->name('dental.charts.store');
        });
        Route::prefix('treatment-plans')->group(function () {
            Route::get('/', [DentalController::class, 'treatmentPlansIndex'])->name('dental.treatment-plans.index');
            Route::get('/create', [DentalController::class, 'treatmentPlansCreate'])->name('dental.treatment-plans.create');
            Route::post('/', [DentalController::class, 'treatmentPlansStore'])->name('dental.treatment-plans.store');
            Route::get('/{plan}', [DentalController::class, 'treatmentPlansShow'])->name('dental.treatment-plans.show');
        });
        Route::prefix('procedures')->group(function () {
            Route::get('/', [DentalController::class, 'proceduresIndex'])->name('dental.procedures.index');
            Route::get('/create', [DentalController::class, 'proceduresCreate'])->name('dental.procedures.create');
            Route::get('/{procedure}/edit', [DentalController::class, 'proceduresEdit'])->name('dental.procedures.edit');
        });
        Route::get('/patients/{patient}/attachments', [DentalController::class, 'attachments'])->name('dental.attachments');
        Route::get('/patients/{patient}/notes', [DentalController::class, 'notes'])->name('dental.notes');
    });

    Route::prefix('insurance')->group(function () {
        Route::prefix('insurers')->group(function () {
            Route::get('/', [InsuranceController::class, 'insurersIndex'])->name('insurance.insurers.index');
            Route::get('/create', [InsuranceController::class, 'insurersCreate'])->name('insurance.insurers.create');
            Route::post('/', [InsuranceController::class, 'insurersStore'])->name('insurance.insurers.store');
            Route::get('/{insurer}/edit', [InsuranceController::class, 'insurersEdit'])->name('insurance.insurers.edit');
            Route::put('/{insurer}', [InsuranceController::class, 'insurersUpdate'])->name('insurance.insurers.update');
            Route::delete('/{insurer}', [InsuranceController::class, 'insurersDestroy'])->name('insurance.insurers.destroy');
        });
        Route::prefix('schemes')->group(function () {
            Route::get('/', [InsuranceController::class, 'schemesIndex'])->name('insurance.schemes.index');
            Route::get('/create', [InsuranceController::class, 'schemesCreate'])->name('insurance.schemes.create');
            Route::post('/', [InsuranceController::class, 'schemesStore'])->name('insurance.schemes.store');
            Route::get('/{scheme}/edit', [InsuranceController::class, 'schemesEdit'])->name('insurance.schemes.edit');
            Route::put('/{scheme}', [InsuranceController::class, 'schemesUpdate'])->name('insurance.schemes.update');
            Route::delete('/{scheme}', [InsuranceController::class, 'schemesDestroy'])->name('insurance.schemes.destroy');
        });
        Route::get('/patients/{patient}/coverage', [InsuranceController::class, 'patientCoverage'])->name('insurance.patients.coverage');
        Route::post('/patients/{patient}/coverage', [InsuranceController::class, 'patientCoverageCreate'])->name('insurance.patients.coverage.create');
    });

    Route::prefix('documents')->group(function () {
        Route::get('/', [DocumentController::class, 'index'])->name('documents.index');
        Route::get('/upload', [DocumentController::class, 'upload'])->name('documents.upload');
        Route::post('/upload', [DocumentController::class, 'store'])->name('documents.store');
        Route::prefix('consent-templates')->group(function () {
            Route::get('/', [DocumentController::class, 'consentTemplatesIndex'])->name('documents.consent-templates.index');
            Route::get('/create', [DocumentController::class, 'consentTemplatesCreate'])->name('documents.consent-templates.create');
            Route::get('/{template}/edit', [DocumentController::class, 'consentTemplatesEdit'])->name('documents.consent-templates.edit');
        });
        Route::get('/patients/{patient}/documents', [DocumentController::class, 'patientDocuments'])->name('documents.patients.index');
        Route::get('/consultations/{consultation}/documents', [DocumentController::class, 'consultationDocuments'])->name('documents.consultations.index');
        Route::get('/patients/{patient}/consents', [DocumentController::class, 'patientConsents'])->name('documents.patients.consents');
        Route::post('/patients/{patient}/consents/sign', [DocumentController::class, 'patientConsentsSign'])->name('documents.patients.consents.sign');
        Route::get('/{document}', [DocumentController::class, 'show'])->name('documents.show');
        Route::get('/{document}/versions', [DocumentController::class, 'versions'])->name('documents.versions');
    });

    Route::prefix('vaccinations')->group(function () {
        Route::get('/', [VaccinationController::class, 'index'])->name('vaccinations.index');
        Route::get('/create', [VaccinationController::class, 'create'])->name('vaccinations.create');
        Route::post('/', [VaccinationController::class, 'store'])->name('vaccinations.store');
        Route::get('/schedule', [VaccinationController::class, 'schedule'])->name('vaccinations.schedule');
        Route::prefix('certificates')->group(function () {
            Route::get('/', [VaccinationController::class, 'certificatesIndex'])->name('vaccinations.certificates.index');
            Route::post('/{record}/generate', [VaccinationController::class, 'certificatesGenerate'])->name('vaccinations.certificates.generate');
            Route::get('/{certificate}/print', [VaccinationController::class, 'certificatesPrint'])->name('vaccinations.certificates.print');
        });
        Route::get('/patients/{patient}/vaccinations', [VaccinationController::class, 'patientVaccinations'])->name('vaccinations.patients.index');
        Route::get('/reminders', [VaccinationController::class, 'reminders'])->name('vaccinations.reminders');
        Route::get('/{record}', [VaccinationController::class, 'show'])->name('vaccinations.show');
    });

    Route::prefix('reports')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/revenue', [ReportController::class, 'revenue'])->name('reports.revenue');
        Route::get('/disease', [ReportController::class, 'disease'])->name('reports.disease');
        Route::get('/lab', [ReportController::class, 'lab'])->name('reports.lab');
        Route::get('/pharmacy', [ReportController::class, 'pharmacy'])->name('reports.pharmacy');
        Route::get('/inventory', [ReportController::class, 'inventory'])->name('reports.inventory');
        Route::get('/doctor-performance', [ReportController::class, 'doctorPerformance'])->name('reports.doctor-performance');
        Route::get('/claims', [ReportController::class, 'claims'])->name('reports.claims');
        Route::get('/sha-moh', [ReportController::class, 'shaMoh'])->name('reports.sha-moh');
        Route::get('/billing', [ReportController::class, 'billing'])->name('reports.billing');
    });

    Route::prefix('portal')->group(function () {
        Route::prefix('patient')->group(function () {
            Route::get('/dashboard', [PortalController::class, 'patientDashboard'])->name('portal.patient.dashboard');
            Route::get('/appointments', [PortalController::class, 'patientAppointments'])->name('portal.patient.appointments');
            Route::get('/book-appointment', [PortalController::class, 'patientBookAppointment'])->name('portal.patient.book-appointment');
            Route::get('/lab-results', [PortalController::class, 'patientLabResults'])->name('portal.patient.lab-results');
            Route::get('/billing', [PortalController::class, 'patientBilling'])->name('portal.patient.billing');
            Route::get('/payments', [PortalController::class, 'patientPayments'])->name('portal.patient.payments');
            Route::get('/documents', [PortalController::class, 'patientDocuments'])->name('portal.patient.documents');
            Route::get('/messages', [PortalController::class, 'patientMessages'])->name('portal.patient.messages');
            Route::get('/profile', [PortalController::class, 'patientProfile'])->name('portal.patient.profile');
        });
        Route::prefix('staff')->group(function () {
            Route::get('/dashboard', [PortalController::class, 'staffDashboard'])->name('portal.staff.dashboard');
            Route::get('/schedule', [PortalController::class, 'staffSchedule'])->name('portal.staff.schedule');
            Route::get('/tasks', [PortalController::class, 'staffTasks'])->name('portal.staff.tasks');
            Route::get('/announcements', [PortalController::class, 'staffAnnouncements'])->name('portal.staff.announcements');
            Route::get('/messages', [PortalController::class, 'staffMessages'])->name('portal.staff.messages');
            Route::get('/leave-requests', [PortalController::class, 'staffLeaveRequests'])->name('portal.staff.leave-requests');
            Route::get('/attendance', [PortalController::class, 'staffAttendance'])->name('portal.staff.attendance');
        });
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
        Route::post('/{consultation}/reassign', [ConsultationController::class, 'reassignProvider'])->name('consultations.reassignProvider')
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
        Route::get('/patient/{patient}/history', [LaboratoryController::class, 'patientHistory'])->name('laboratory.patientHistory')
            ->middleware('can:laboratory.view');
        Route::get('/test/{labTest}/history', [LaboratoryController::class, 'testHistory'])->name('laboratory.testHistory')
            ->middleware('can:laboratory.view');
        Route::get('/results/{labResult}/print', [LaboratoryController::class, 'printResult'])->name('laboratory.printResult')
            ->middleware('can:laboratory.view');
        Route::get('/{labOrder}/print', [LaboratoryController::class, 'printOrder'])->name('laboratory.printOrder')
            ->middleware('can:laboratory.view');
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

        Route::prefix('claims')->group(function () {
            Route::get('/', [InsuranceController::class, 'claimsIndex'])->name('billing.claims.index')
                ->middleware('can:insurance.view');
            Route::get('/create/{invoice}', [InsuranceController::class, 'claimsCreate'])->name('billing.claims.create')
                ->middleware('can:insurance.create');
            Route::get('/{claim}', [InsuranceController::class, 'claimsShow'])->name('billing.claims.show')
                ->middleware('can:insurance.view');
            Route::get('/{claim}/edit', [InsuranceController::class, 'claimsEdit'])->name('billing.claims.edit')
                ->middleware('can:insurance.update');
            Route::post('/{claim}/resubmit', [InsuranceController::class, 'claimsResubmit'])->name('billing.claims.resubmit')
                ->middleware('can:insurance.update');
            Route::get('/aging-report', [InsuranceController::class, 'claimsAgingReport'])->name('billing.claims.aging-report')
                ->middleware('can:insurance.view');
        });

        Route::prefix('preauthorizations')->group(function () {
            Route::get('/', [InsuranceController::class, 'preauthorizationsIndex'])->name('billing.preauthorizations.index')
                ->middleware('can:insurance.view');
            Route::get('/create', [InsuranceController::class, 'preauthorizationsCreate'])->name('billing.preauthorizations.create')
                ->middleware('can:insurance.create');
            Route::post('/{preauth}/approve', [InsuranceController::class, 'preauthorizationsApprove'])->name('billing.preauthorizations.approve')
                ->middleware('can:insurance.update');
        });
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

    Route::prefix('print')->group(function () {
        Route::get('/receipt/{payment}', [PrintController::class, 'receipt'])->name('print.receipt');
        Route::get('/label/specimen', [PrintController::class, 'specimenLabel'])->name('print.label.specimen');
        Route::get('/label/inventory', [PrintController::class, 'inventoryLabel'])->name('print.label.inventory');
        Route::get('/label/patient', [PrintController::class, 'patientCardLabel'])->name('print.label.patient');
    });
});

require __DIR__.'/settings.php';
