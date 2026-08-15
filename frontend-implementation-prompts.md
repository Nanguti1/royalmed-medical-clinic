# Frontend Implementation Prompts

This document contains organized prompts for implementing the missing frontend pages and backend HTTP layer to reach 98-100% system maturity.

---

## Phase 1: Backend Controllers and Routes

### Prompt 1.1: Create AppointmentController and Routes
**Module**: Appointments
**Backend Status**: ✅ AppointmentService, ✅ 5 models, ❌ No Controller, ❌ No Routes

**Tasks**:
1. Create `AppointmentController` using `php artisan make:controller AppointmentController`
2. Implement controller methods using `AppointmentService`:
   - `index()` - List appointments with filters (date, doctor, status)
   - `create()` - Show appointment creation form
   - `store()` - Create new appointment via AppointmentService
   - `show($appointment)` - Show appointment details
   - `edit($appointment)` - Show appointment edit form
   - `update($appointment)` - Update appointment via AppointmentService
   - `destroy($appointment)` - Delete appointment
   - `calendar()` - Calendar view (day/week/month)
   - `waitlist()` - Waitlist management
   - `scheduleDoctor()` - Doctor schedule management
   - `scheduleDental()` - Dental chair schedule management
3. Add routes to `routes/web.php`:
   ```php
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
   ```
4. Add authorization middleware to routes
5. Write feature tests for AppointmentController

---

### Prompt 1.2: Create DentalController and Routes
**Module**: Dental
**Backend Status**: ✅ DentalService, ✅ 7 models, ❌ No Controller, ❌ No Routes

**Tasks**:
1. Create `DentalController` using `php artisan make:controller DentalController`
2. Implement controller methods using `DentalService`:
   - `index()` - List dental appointments
   - `chart($patient)` - Interactive tooth chart/odontogram
   - `treatmentPlansIndex()` - Treatment plans list
   - `treatmentPlansCreate()` - Create treatment plan
   - `treatmentPlansShow($plan)` - Treatment plan details
   - `proceduresIndex()` - Dental procedures catalogue
   - `proceduresCreate()` - Create procedure
   - `proceduresEdit($procedure)` - Edit procedure
   - `attachments($patient)` - Dental images/gallery
   - `notes($patient)` - Dental notes
3. Add routes to `routes/web.php`:
   ```php
   Route::prefix('dental')->group(function () {
       Route::get('/', [DentalController::class, 'index'])->name('dental.index');
       Route::get('/patients/{patient}/chart', [DentalController::class, 'chart'])->name('dental.chart');
       Route::prefix('treatment-plans')->group(function () {
           Route::get('/', [DentalController::class, 'treatmentPlansIndex'])->name('dental.treatment-plans.index');
           Route::get('/create', [DentalController::class, 'treatmentPlansCreate'])->name('dental.treatment-plans.create');
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
   ```
4. Add authorization middleware to routes
5. Write feature tests for DentalController

---

### Prompt 1.3: Create InsuranceController and Routes
**Module**: Insurance
**Backend Status**: ✅ InsuranceService, ShaClaimService, ✅ 8 models, ❌ No Controller, ❌ No Routes

**Tasks**:
1. Create `InsuranceController` using `php artisan make:controller InsuranceController`
2. Implement controller methods using `InsuranceService` and `ShaClaimService`:
   - `insurersIndex()` - Insurers list
   - `insurersCreate()` - Create insurer
   - `insurersEdit($insurer)` - Edit insurer
   - `schemesIndex()` - Insurance schemes list
   - `schemesCreate()` - Create scheme
   - `schemesEdit($scheme)` - Edit scheme
   - `patientCoverage($patient)` - Patient coverage tab
   - `patientCoverageCreate($patient)` - Add patient coverage
   - `claimsIndex()` - Insurance claims list
   - `claimsCreate($invoice)` - Create claim from invoice
   - `claimsShow($claim)` - Claim details
   - `claimsEdit($claim)` - Edit claim
   - `claimsResubmit($claim)` - Resubmit rejected claim
   - `preauthorizationsIndex()` - Preauthorizations list
   - `preauthorizationsCreate()` - Create preauthorization
   - `preauthorizationsApprove($preauth)` - Approve/reject preauthorization
   - `claimsAgingReport()` - Claim aging report
3. Add routes to `routes/web.php`:
   ```php
   Route::prefix('insurance')->group(function () {
       Route::prefix('insurers')->group(function () {
           Route::get('/', [InsuranceController::class, 'insurersIndex'])->name('insurance.insurers.index');
           Route::get('/create', [InsuranceController::class, 'insurersCreate'])->name('insurance.insurers.create');
           Route::get('/{insurer}/edit', [InsuranceController::class, 'insurersEdit'])->name('insurance.insurers.edit');
       });
       Route::prefix('schemes')->group(function () {
           Route::get('/', [InsuranceController::class, 'schemesIndex'])->name('insurance.schemes.index');
           Route::get('/create', [InsuranceController::class, 'schemesCreate'])->name('insurance.schemes.create');
           Route::get('/{scheme}/edit', [InsuranceController::class, 'schemesEdit'])->name('insurance.schemes.edit');
       });
       Route::get('/patients/{patient}/coverage', [InsuranceController::class, 'patientCoverage'])->name('insurance.patients.coverage');
       Route::post('/patients/{patient}/coverage', [InsuranceController::class, 'patientCoverageCreate'])->name('insurance.patients.coverage.create');
       Route::prefix('claims')->group(function () {
           Route::get('/', [InsuranceController::class, 'claimsIndex'])->name('insurance.claims.index');
           Route::get('/create/{invoice}', [InsuranceController::class, 'claimsCreate'])->name('insurance.claims.create');
           Route::get('/{claim}', [InsuranceController::class, 'claimsShow'])->name('insurance.claims.show');
           Route::get('/{claim}/edit', [InsuranceController::class, 'claimsEdit'])->name('insurance.claims.edit');
           Route::post('/{claim}/resubmit', [InsuranceController::class, 'claimsResubmit'])->name('insurance.claims.resubmit');
           Route::get('/aging-report', [InsuranceController::class, 'claimsAgingReport'])->name('insurance.claims.aging-report');
       });
       Route::prefix('preauthorizations')->group(function () {
           Route::get('/', [InsuranceController::class, 'preauthorizationsIndex'])->name('insurance.preauthorizations.index');
           Route::get('/create', [InsuranceController::class, 'preauthorizationsCreate'])->name('insurance.preauthorizations.create');
           Route::post('/{preauth}/approve', [InsuranceController::class, 'preauthorizationsApprove'])->name('insurance.preauthorizations.approve');
       });
   });
   ```
4. Add authorization middleware to routes
5. Write feature tests for InsuranceController

---

### Prompt 1.4: Create DocumentController and Routes
**Module**: Documents
**Backend Status**: ✅ DocumentService, ✅ 3 models, ❌ No Controller, ❌ No Routes

**Tasks**:
1. Create `DocumentController` using `php artisan make:controller DocumentController`
2. Implement controller methods using `DocumentService`:
   - `index()` - Documents library
   - `upload()` - Upload document
   - `show($document)` - Document preview
   - `versions($document)` - Document version history
   - `patientDocuments($patient)` - Patient documents tab
   - `consultationDocuments($consultation)` - Consultation attachments tab
   - `consentTemplatesIndex()` - Consent templates list
   - `consentTemplatesCreate()` - Create consent template
   - `consentTemplatesEdit($template)` - Edit consent template
   - `patientConsents($patient)` - Patient consents tab
   - `patientConsentsSign($patient)` - Sign consent modal
3. Add routes to `routes/web.php`:
   ```php
   Route::prefix('documents')->group(function () {
       Route::get('/', [DocumentController::class, 'index'])->name('documents.index');
       Route::get('/upload', [DocumentController::class, 'upload'])->name('documents.upload');
       Route::post('/upload', [DocumentController::class, 'store'])->name('documents.store');
       Route::get('/{document}', [DocumentController::class, 'show'])->name('documents.show');
       Route::get('/{document}/versions', [DocumentController::class, 'versions'])->name('documents.versions');
       Route::get('/patients/{patient}/documents', [DocumentController::class, 'patientDocuments'])->name('documents.patients.index');
       Route::get('/consultations/{consultation}/documents', [DocumentController::class, 'consultationDocuments'])->name('documents.consultations.index');
       Route::prefix('consent-templates')->group(function () {
           Route::get('/', [DocumentController::class, 'consentTemplatesIndex'])->name('documents.consent-templates.index');
           Route::get('/create', [DocumentController::class, 'consentTemplatesCreate'])->name('documents.consent-templates.create');
           Route::get('/{template}/edit', [DocumentController::class, 'consentTemplatesEdit'])->name('documents.consent-templates.edit');
       });
       Route::get('/patients/{patient}/consents', [DocumentController::class, 'patientConsents'])->name('documents.patients.consents');
       Route::post('/patients/{patient}/consents/sign', [DocumentController::class, 'patientConsentsSign'])->name('documents.patients.consents.sign');
   });
   ```
4. Add authorization middleware to routes
5. Write feature tests for DocumentController

---

### Prompt 1.5: Create VaccinationController and Routes
**Module**: Vaccination
**Backend Status**: ✅ VaccinationService, ✅ 3 models, ❌ No Controller, ❌ No Routes

**Tasks**:
1. Create `VaccinationController` using `php artisan make:controller VaccinationController`
2. Implement controller methods using `VaccinationService`:
   - `index()` - Vaccination records list
   - `create()` - Record vaccination
   - `show($record)` - Vaccination details
   - `schedule()` - Vaccination schedule
   - `certificatesIndex()` - Certificates list
   - `certificatesGenerate($record)` - Generate certificate
   - `certificatesPrint($certificate)` - Print certificate
   - `patientVaccinations($patient)` - Patient vaccination history tab
   - `reminders()` - Vaccination reminders management
3. Add routes to `routes/web.php`:
   ```php
   Route::prefix('vaccinations')->group(function () {
       Route::get('/', [VaccinationController::class, 'index'])->name('vaccinations.index');
       Route::get('/create', [VaccinationController::class, 'create'])->name('vaccinations.create');
       Route::post('/', [VaccinationController::class, 'store'])->name('vaccinations.store');
       Route::get('/{record}', [VaccinationController::class, 'show'])->name('vaccinations.show');
       Route::get('/schedule', [VaccinationController::class, 'schedule'])->name('vaccinations.schedule');
       Route::prefix('certificates')->group(function () {
           Route::get('/', [VaccinationController::class, 'certificatesIndex'])->name('vaccinations.certificates.index');
           Route::get('/{record}/generate', [VaccinationController::class, 'certificatesGenerate'])->name('vaccinations.certificates.generate');
           Route::get('/certificates/{certificate}/print', [VaccinationController::class, 'certificatesPrint'])->name('vaccinations.certificates.print');
       });
       Route::get('/patients/{patient}/vaccinations', [VaccinationController::class, 'patientVaccinations'])->name('vaccinations.patients.index');
       Route::get('/reminders', [VaccinationController::class, 'reminders'])->name('vaccinations.reminders');
   });
   ```
4. Add authorization middleware to routes
5. Write feature tests for VaccinationController

---

### Prompt 1.6: Create ReportController and Routes
**Module**: Reports
**Backend Status**: ✅ ReportingService, ❌ No Controller, ❌ No Routes

**Tasks**:
1. Create `ReportController` using `php artisan make:controller ReportController`
2. Implement controller methods using `ReportingService`:
   - `index()` - Reports dashboard
   - `revenue()` - Revenue report (daily/monthly)
   - `disease()` - Disease surveillance report
   - `lab()` - Laboratory report
   - `pharmacy()` - Pharmacy report
   - `inventory()` - Inventory report
   - `doctorPerformance()` - Doctor productivity report
   - `claims()` - Insurance claims report
   - `shaMoh()` - SHA/MOH reporting
   - `billing()` - Billing report
3. Add routes to `routes/web.php`:
   ```php
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
   ```
4. Add authorization middleware to routes
5. Write feature tests for ReportController

---

### Prompt 1.7: Create PortalController and Routes
**Module**: Patient & Staff Portals
**Backend Status**: ❌ No PortalService, ❌ Unknown models, ❌ No Controller, ❌ No Routes

**Tasks**:
1. Create `PortalService` for patient and staff portal logic
2. Create `PortalController` using `php artisan make:controller PortalController`
3. Implement controller methods for patient portal:
   - `patientDashboard()` - Patient portal dashboard
   - `patientAppointments()` - Patient appointments
   - `patientBookAppointment()` - Online booking
   - `patientLabResults()` - Lab results view
   - `patientBilling()` - Patient billing view
   - `patientPayments()` - Online payment
   - `patientDocuments()` - Patient documents
   - `patientMessages()` - Secure messaging
   - `patientProfile()` - Patient profile management
4. Implement controller methods for staff portal:
   - `staffDashboard()` - Staff portal dashboard
   - `staffSchedule()` - Staff schedule view
   - `staffTasks()` - Task management
   - `staffAnnouncements()` - Staff announcements
   - `staffMessages()` - Secure messaging
   - `staffLeaveRequests()` - Leave management
   - `staffAttendance()` - Attendance tracking
5. Add routes to `routes/web.php`:
   ```php
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
   ```
6. Add authorization middleware to routes
7. Write feature tests for PortalController

---

## Phase 2: Frontend Pages for New Modules

### Prompt 2.1: Create Appointment Frontend Pages
**Module**: Appointments
**Backend Status**: ✅ Controller, ✅ Routes (after Phase 1)

**Tasks**:
1. Create `resources/js/pages/appointments/index.tsx` - List/calendar view of appointments with filters
2. Create `resources/js/pages/appointments/create.tsx` - Create new appointment form
3. Create `resources/js/pages/appointments/show.tsx` - Appointment details view
4. Create `resources/js/pages/appointments/edit.tsx` - Edit appointment form
5. Create `resources/js/pages/appointments/calendar.tsx` - Calendar view (day/week/month toggle)
6. Create `resources/js/pages/appointments/waitlist.tsx` - Waitlist management
7. Create `resources/js/pages/appointments/schedules/doctor.tsx` - Doctor schedule management
8. Create `resources/js/pages/appointments/schedules/dental.tsx` - Dental chair schedule management
9. Add TypeScript types for appointments in `resources/js/types/appointment.ts`
10. Update navigation to include appointments menu
11. Run `npm run build` and verify

---

### Prompt 2.2: Create Dental Frontend Pages
**Module**: Dental
**Backend Status**: ✅ Controller, ✅ Routes (after Phase 1)

**Tasks**:
1. Create `resources/js/pages/dental/index.tsx` - Dental appointments list
2. Create `resources/js/pages/dental/chart.tsx` - Interactive tooth chart/odontogram component
3. Create `resources/js/pages/dental/treatment-plans/index.tsx` - Treatment plans list
4. Create `resources/js/pages/dental/treatment-plans/create.tsx` - Create treatment plan form
5. Create `resources/js/pages/dental/treatment-plans/show.tsx` - Treatment plan details
6. Create `resources/js/pages/dental/procedures/index.tsx` - Dental procedures catalogue
7. Create `resources/js/pages/dental/procedures/create.tsx` - Create procedure form
8. Create `resources/js/pages/dental/procedures/edit.tsx` - Edit procedure form
9. Create `resources/js/pages/dental/attachments.tsx` - Dental images/gallery
10. Create `resources/js/pages/dental/notes.tsx` - Dental notes
11. Add TypeScript types for dental in `resources/js/types/dental.ts`
12. Update navigation to include dental menu
13. Run `npm run build` and verify

---

### Prompt 2.3: Create Insurance Frontend Pages
**Module**: Insurance
**Backend Status**: ✅ Controller, ✅ Routes (after Phase 1)

**Tasks**:
1. Create `resources/js/pages/insurers/index.tsx` - Insurers list
2. Create `resources/js/pages/insurers/create.tsx` - Create insurer form
3. Create `resources/js/pages/insurers/edit.tsx` - Edit insurer form
4. Create `resources/js/pages/insurance-schemes/index.tsx` - Insurance schemes list
5. Create `resources/js/pages/insurance-schemes/create.tsx` - Create scheme form
6. Create `resources/js/pages/insurance-schemes/edit.tsx` - Edit scheme form
7. Create `resources/js/pages/patients/{id}/coverage.tsx` - Patient coverage tab (integrate into patient show page)
8. Create `resources/js/pages/patients/{id}/coverage/create.tsx` - Add patient coverage modal
9. Create `resources/js/pages/billing/claims/index.tsx` - Insurance claims list
10. Create `resources/js/pages/billing/claims/create.tsx` - Create claim from invoice
11. Create `resources/js/pages/billing/claims/show.tsx` - Claim details
12. Create `resources/js/pages/billing/claims/edit.tsx` - Edit claim
13. Create `resources/js/pages/billing/claims/resubmit.tsx` - Resubmit rejected claim
14. Create `resources/js/pages/billing/preauthorizations/index.tsx` - Preauthorizations list
15. Create `resources/js/pages/billing/preauthorizations/create.tsx` - Create preauthorization
16. Create `resources/js/pages/billing/preauthorizations/approve.tsx` - Approve/reject preauthorization
17. Create `resources/js/pages/billing/claims/aging-report.tsx` - Claim aging report
18. Add TypeScript types for insurance in `resources/js/types/insurance.ts`
19. Update navigation to include insurance menu
20. Run `npm run build` and verify

---

### Prompt 2.4: Create Document Frontend Pages
**Module**: Documents
**Backend Status**: ✅ Controller, ✅ Routes (after Phase 1)

**Tasks**:
1. Create `resources/js/pages/documents/index.tsx` - Documents library
2. Create `resources/js/pages/documents/upload.tsx` - Upload document form
3. Create `resources/js/pages/documents/show.tsx` - Document preview
4. Create `resources/js/pages/documents/versions.tsx` - Document version history
5. Create `resources/js/pages/patients/{id}/documents.tsx` - Patient documents tab (integrate into patient show page)
6. Create `resources/js/pages/consultations/{id}/documents.tsx` - Consultation attachments tab (integrate into consultation show page)
7. Create `resources/js/pages/documents/consent-templates/index.tsx` - Consent templates list
8. Create `resources/js/pages/documents/consent-templates/create.tsx` - Create consent template
9. Create `resources/js/pages/documents/consent-templates/edit.tsx` - Edit consent template
10. Create `resources/js/pages/patients/{id}/consents.tsx` - Patient consents tab (integrate into patient show page)
11. Create `resources/js/pages/patients/{id}/consents/sign.tsx` - Sign consent modal
12. Add TypeScript types for documents in `resources/js/types/document.ts`
13. Update navigation to include documents menu
14. Run `npm run build` and verify

---

### Prompt 2.5: Create Vaccination Frontend Pages
**Module**: Vaccination
**Backend Status**: ✅ Controller, ✅ Routes (after Phase 1)

**Tasks**:
1. Create `resources/js/pages/vaccinations/index.tsx` - Vaccination records list
2. Create `resources/js/pages/vaccinations/create.tsx` - Record vaccination form
3. Create `resources/js/pages/vaccinations/show.tsx` - Vaccination details
4. Create `resources/js/pages/vaccinations/schedule.tsx` - Vaccination schedule
5. Create `resources/js/pages/vaccinations/certificates/index.tsx` - Certificates list
6. Create `resources/js/pages/vaccinations/certificates/generate.tsx` - Generate certificate
7. Create `resources/js/pages/vaccinations/certificates/print.tsx` - Print certificate
8. Create `resources/js/pages/patients/{id}/vaccinations.tsx` - Patient vaccination history tab (integrate into patient show page)
9. Create `resources/js/pages/vaccinations/reminders.tsx` - Vaccination reminders management
10. Add TypeScript types for vaccinations in `resources/js/types/vaccination.ts`
11. Update navigation to include vaccinations menu
12. Run `npm run build` and verify

---

### Prompt 2.6: Create Report Frontend Pages
**Module**: Reports
**Backend Status**: ✅ Controller, ✅ Routes (after Phase 1)

**Tasks**:
1. Create `resources/js/pages/reports/index.tsx` - Reports dashboard
2. Create `resources/js/pages/reports/revenue.tsx` - Revenue report (daily/monthly) with charts
3. Create `resources/js/pages/reports/disease.tsx` - Disease surveillance report
4. Create `resources/js/pages/reports/lab.tsx` - Laboratory report
5. Create `resources/js/pages/reports/pharmacy.tsx` - Pharmacy report
6. Create `resources/js/pages/reports/inventory.tsx` - Inventory report
7. Create `resources/js/pages/reports/doctor-performance.tsx` - Doctor productivity report
8. Create `resources/js/pages/reports/claims.tsx` - Insurance claims report
9. Create `resources/js/pages/reports/sha-moh.tsx` - SHA/MOH reporting
10. Create `resources/js/pages/reports/billing.tsx` - Billing report
11. Create reusable report components (date range picker, export buttons, data tables)
12. Add TypeScript types for reports in `resources/js/types/report.ts`
13. Update navigation to include reports menu
14. Run `npm run build` and verify

---

## Phase 3: Enhanced Pages for Existing Modules

### Prompt 3.1: Create Pharmacy Enhancement Pages
**Module**: Pharmacy Enhancements
**Backend Status**: Partially in PharmacyController

**Tasks**:
1. Create `resources/js/pages/pharmacy/controlled-drug-register.tsx` - Controlled drug register with audit trail
2. Create `resources/js/pages/pharmacy/adjustments/index.tsx` - Stock adjustments list
3. Create `resources/js/pages/pharmacy/adjustments/create.tsx` - Create adjustment with approval
4. Create `resources/js/pages/pharmacy/transfers/index.tsx` - Stock transfers list
5. Create `resources/js/pages/pharmacy/transfers/create.tsx` - Create transfer
6. Create `resources/js/pages/pharmacy/purchase-orders/index.tsx` - Purchase orders list
7. Create `resources/js/pages/pharmacy/purchase-orders/create.tsx` - Create PO
8. Create `resources/js/pages/pharmacy/grn/index.tsx` - Goods received notes list
9. Create `resources/js/pages/pharmacy/grn/create.tsx` - Create GRN
10. Create `resources/js/pages/pharmacy/reorder.tsx` - Reorder worklist
11. Add drug interaction checker to prescription creation page
12. Add TypeScript types for pharmacy enhancements
13. Run `npm run build` and verify

---

### Prompt 3.2: Create Billing Enhancement Pages
**Module**: Billing Enhancements
**Backend Status**: Partially in BillingController

**Tasks**:
1. Create `resources/js/pages/billing/refunds/index.tsx` - Refunds list
2. Create `resources/js/pages/billing/refunds/create.tsx` - Create refund
3. Create `resources/js/pages/billing/credit-notes/index.tsx` - Credit notes list
4. Create `resources/js/pages/billing/credit-notes/create.tsx` - Create credit note
5. Create `resources/js/pages/billing/deposits/index.tsx` - Deposits list
6. Create `resources/js/pages/billing/deposits/create.tsx` - Create deposit
7. Create `resources/js/pages/billing/payment-plans/index.tsx` - Payment plans list
8. Create `resources/js/pages/billing/payment-plans/create.tsx` - Create payment plan
9. Create `resources/js/pages/billing/discounts/index.tsx` - Discounts management
10. Create `resources/js/pages/payments/split.tsx` - Split payment (multiple methods)
11. Create `resources/js/pages/payments/card.tsx` - Card payment integration
12. Add TypeScript types for billing enhancements
13. Run `npm run build` and verify

---

### Prompt 3.3: Create Laboratory Enhancement Pages
**Module**: Laboratory Enhancements
**Backend Status**: Partially in LaboratoryController

**Tasks**:
1. Create `resources/js/pages/laboratory/critical-alerts.tsx` - Critical results alert worklist
2. Create `resources/js/pages/laboratory/verification.tsx` - Result verification queue
3. Create `resources/js/pages/laboratory/specimen-tracking.tsx` - Sample lifecycle tracking
4. Create `resources/js/pages/laboratory/worklist.tsx` - Laboratory worklist dashboard
5. Add TypeScript types for laboratory enhancements
6. Run `npm run build` and verify

---

### Prompt 3.4: Create Patient Enhancement Pages
**Module**: Patient Enhancements
**Backend Status**: Existing pages exist

**Tasks**:
1. Create `resources/js/pages/patients/merge.tsx` - Patient merge interface
2. Create `resources/js/pages/patients/duplicate-warning.tsx` - Duplicate detection warning modal
3. Create `resources/js/pages/patients/photo-upload.tsx` - Patient photo upload
4. Create `resources/js/pages/patients/clinical-timeline.tsx` - Longitudinal clinical history timeline
5. Integrate duplicate warning into patient creation flow
6. Integrate clinical timeline into patient show page
7. Add TypeScript types for patient enhancements
8. Run `npm run build` and verify

---

### Prompt 3.5: Create Consultation Enhancement Pages
**Module**: Consultation Enhancements
**Backend Status**: Existing pages exist

**Tasks**:
1. Create `resources/js/pages/consultations/templates/index.tsx` - Consultation templates library
2. Create `resources/js/pages/consultations/templates/create.tsx` - Create template
3. Create `resources/js/pages/consultations/templates/apply.tsx` - Apply template to consultation
4. Create `resources/js/pages/consultations/attachments.tsx` - Clinical attachments
5. Enhance `resources/js/pages/consultations/create.tsx` with structured SOAP form
6. Add TypeScript types for consultation enhancements
7. Run `npm run build` and verify

---

## Phase 4: Global UX Components

### Prompt 4.1: Create Global UX Components
**Module**: Global UX Components
**Backend Status**: N/A

**Tasks**:
1. Create `resources/js/components/command-palette.tsx` - Global command palette (Ctrl+K popup)
2. Create `resources/js/components/data-table.tsx` - Reusable data table with filters, sort, pagination
3. Create `resources/js/components/date-range-picker.tsx` - Reusable date range filter
4. Create `resources/js/components/bulk-actions.tsx` - Bulk action toolbar
5. Create `resources/js/components/clinical-timeline.tsx` - Longitudinal medical history timeline
6. Create `resources/js/components/tooth-chart.tsx` - Interactive dental odontogram
7. Create `resources/js/components/notification-center.tsx` - Notification inbox
8. Create `resources/js/components/quick-actions.tsx` - Quick action buttons on pages
9. Integrate command palette with useKeyboardShortcuts hook
10. Run `npm run build` and verify

---

## Phase 5: Portal Frontend Pages

### Prompt 5.1: Create Patient Portal Pages
**Module**: Patient Portal
**Backend Status**: ✅ Controller, ✅ Routes (after Phase 1)

**Tasks**:
1. Create `resources/js/pages/portal/patient/dashboard.tsx` - Patient portal dashboard
2. Create `resources/js/pages/portal/patient/appointments.tsx` - Patient appointments
3. Create `resources/js/pages/portal/patient/book-appointment.tsx` - Online booking
4. Create `resources/js/pages/portal/patient/lab-results.tsx` - Lab results view
5. Create `resources/js/pages/portal/patient/billing.tsx` - Patient billing view
6. Create `resources/js/pages/portal/patient/payments.tsx` - Online payment
7. Create `resources/js/pages/portal/patient/documents.tsx` - Patient documents
8. Create `resources/js/pages/portal/patient/messages.tsx` - Secure messaging
9. Create `resources/js/pages/portal/patient/profile.tsx` - Patient profile management
10. Add TypeScript types for patient portal
11. Run `npm run build` and verify

---

### Prompt 5.2: Create Staff Portal Pages
**Module**: Staff Portal
**Backend Status**: ✅ Controller, ✅ Routes (after Phase 1)

**Tasks**:
1. Create `resources/js/pages/portal/staff/dashboard.tsx` - Staff portal dashboard
2. Create `resources/js/pages/portal/staff/schedule.tsx` - Staff schedule view
3. Create `resources/js/pages/portal/staff/tasks.tsx` - Task management
4. Create `resources/js/pages/portal/staff/announcements.tsx` - Staff announcements
5. Create `resources/js/pages/portal/staff/messages.tsx` - Secure messaging
6. Create `resources/js/pages/portal/staff/leave-requests.tsx` - Leave management
7. Create `resources/js/pages/portal/staff/attendance.tsx` - Attendance tracking
8. Add TypeScript types for staff portal
9. Run `npm run build` and verify

---

## Summary

**Total Prompts**: 15
- Phase 1 (Backend Controllers & Routes): 7 prompts
- Phase 2 (Frontend Pages for New Modules): 6 prompts
- Phase 3 (Enhanced Pages for Existing Modules): 5 prompts
- Phase 4 (Global UX Components): 1 prompt
- Phase 5 (Portal Frontend Pages): 2 prompts

**Implementation Order**: Execute prompts in numerical order (1.1 → 1.7 → 2.1 → 2.6 → 3.1 → 3.5 → 4.1 → 5.1 → 5.2)