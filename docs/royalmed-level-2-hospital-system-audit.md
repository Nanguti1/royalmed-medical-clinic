# Royalmed Clinic Level 2 Hospital System Audit

Audit date: 2026-08-13  
Scope: Laravel + Inertia monolith only; no REST/API/microservice/mobile recommendations.  
Evidence base: migrations, models, routes, controllers/services/actions, requests, React pages/components, tests, and package manifests in this repository.

## 1. Executive Summary

Royalmed is an early-to-mid maturity Laravel/Inertia hospital management system. It has solid foundations for patient registration, visits, triage vitals, consultations, prescriptions, pharmacy stock dispensing, laboratory ordering/results, billing/payments including M-Pesa transaction storage, dashboards, authentication, RBAC, two-factor/passkey readiness, and audit attribution. The implementation is practical and monolithic, with a clear route structure, Form Requests, services/actions, tests, Inertia pages, and Spatie permission-based access control.

It is not yet a complete Level 2 Hospital Information System/EMR. The largest gaps are appointment scheduling, dental services, insurance/SHA/NHIF workflows, clinical coding interoperability, document/consent management, formal reports, patient/staff portals, automation/reminders, and deeper compliance controls. Clinical data capture is basic: triage lacks oxygen saturation, BMI, pain score, NEWS score, and nursing notes; consultations lack explicit SOAP sections, coded diagnoses beyond plain strings, templates, attachments, and longitudinal medical history.

Overall system maturity score: **43%**.

## 2. Existing Modules

- **Patient registration:** patients, gender/county/sub-county references, emergency contacts, patient identifiers, soft deletes, creator/updater attribution.
- **Visits and queues:** visit lifecycle, visit numbers, statuses, triage/vitals, one queue entry per visit, queue position/status/called/served timestamps.
- **Consultations/EMR:** chief complaint, history, examination, plan, notes, diagnoses, prescriptions, clinical notes.
- **Prescriptions/pharmacy:** medicine catalogue, dosage references, prescription finalization/dispensing, batch inventory, stock movements, FEFO deduction, expiry/insufficient-stock exceptions.
- **Laboratory:** lab categories, tests, reference ranges, orders, order items, sample tracking, result entry, abnormal/critical flags, verification status.
- **Billing/payments:** invoices, invoice items, payment methods, payments, M-Pesa transaction records, receipt numbers, reconciliation, immutable invoice/receipt protections.
- **User/RBAC/security:** Fortify auth, verified auth routes, two-factor columns/UI, passkeys, Spatie roles/permissions, settings/security pages.
- **Dashboard:** daily operational/billing/lab/pharmacy queue summaries.

## 3. Fully Implemented Features

These features appear complete enough for current operational use:

1. **RBAC basics:** route-level permission middleware, seeded roles/permissions, Super Admin bypass, permission-aware navigation.
2. **Pharmacy FEFO dispensing:** non-expired stock pre-check, row locking, expiry ordering, movement recording, and exceptions.
3. **Laboratory reference ranges and verification primitives:** test categories/reference ranges, abnormal/critical flags, and verified/rejected status fields.
4. **Billing core:** invoice generation, line items, payment recording, receipt numbers, reconciliation controller/tests, and payment method support.
5. **Dashboard summaries:** daily visits, queues, prescriptions, pharmacy alerts, lab pending results, billing and payment totals.
6. **Two-factor/passkey readiness:** Fortify 2FA columns, passkey migration/package, security UI components.

## 4. Partially Implemented Features

- **Patient registration:** supports names, gender, DOB, single phone/email/address, county/sub-county, notes, emergency contacts, and flexible identifiers. It does not explicitly model hospital number as a required primary identifier, national ID/passport/SHA/NHIF/insurance types, photo, next-of-kin distinction, multiple phones/addresses, occupation/employer, marital status, language, religion, blood group, allergies, chronic conditions, alerts, consents, signatures, family relationships, duplicate detection, or merge.
- **Triage:** supports temperature, BP, pulse, respiratory rate, height, and weight. It lacks oxygen saturation, BMI, pain score, NEWS score, chief complaint, and nurse notes.
- **Consultation/EMR:** supports basic clinical narrative and diagnoses, but not structured SOAP, coded ICD-10 diagnoses, differential diagnosis, templates, attachments, longitudinal medical/surgical/family/social history, or SNOMED readiness.
- **Queue management:** supports one queue entry per visit, positions, waiting/called/in-progress style statuses, and waiting time display. It lacks department-specific queues, queue numbers, priority logic, and SLA/waiting analytics.
- **Laboratory:** ordering, samples, result entry, reference ranges, verification, and critical flags exist. Result printing/history/alerts are incomplete; critical flags do not appear to trigger notifications.
- **Pharmacy/inventory:** medicine catalogue, batches, suppliers, purchases, stock movements, low/expiry dashboard alerts, and dispensing exist. Missing controlled-drug controls, interaction/allergy checks, returns, transfer workflows, purchase-order/GRN separation, barcode labels, and automated alerts.
- **Billing:** invoices, payments, cash/M-Pesa style payment methods, due amounts, receipts and reconciliation exist. Missing card/split/deposit/refund/credit-note/discount/payment-plan workflows.
- **Security:** authentication, authorization, two-factor readiness, and audit logs exist. Missing formal password complexity governance evidence, field-level sensitive-data encryption, session activity reporting, backup configuration, and comprehensive audit events.

## 5. Missing Features

No implementation evidence was found for these modules/workflows:

- Appointment management and calendars.
- Dental module: odontogram, tooth charting, procedures, dental images, dental billing/follow-up.
- Insurance/SHA/NHIF/private/corporate claims.
- Vaccination records/schedules/certificates/reminders.
- Formal report module pages for revenue, disease, doctor performance, inventory, lab, dental, SHA, or Ministry of Health reporting.
- SMS/WhatsApp/in-app notification workflows and reminder automations.
- Document management, scanned files, clinical attachments, consent forms, version history, digital signatures.
- Patient portal and staff portal.
- Healthcare interoperability readiness tables or adapters for HL7, FHIR, LOINC, SNOMED, and ICD-10 beyond free-text diagnosis fields.
- Barcode/QR/receipt-printer/label-printer workflows.

## 6. High Priority Improvements

### Recommendation 1: Strengthen patient master index

- **Category:** Patient Registration / Database
- **Priority:** Critical
- **Current State:** Patients have demographic basics, one phone/email/address, county/sub-county, emergency contacts, and flexible identifiers.
- **Why It Matters:** Level 2 hospitals need reliable patient matching, insurance/SHA identity capture, emergency details, and safe duplicate handling.
- **Recommended Improvement:** Add structured patient demographics: hospital number primary identifier, national ID, passport, SHA, NHIF, insurance number, photo path, next-of-kin type, occupation, employer, marital status, preferred language, religion, blood group, patient alerts, allergies, chronic conditions, and duplicate-detection service.
- **Suggested Files or Modules:** Patient migrations/model, PatientService, RegisterPatientAction, StorePatientRequest/UpdatePatientRequest, patient create/edit/show pages.
- **Potential Database Changes:** Add patient profile columns, `patient_contacts`, `patient_addresses`, `patient_alerts`, `patient_allergies`, `patient_conditions`, `patient_relationships`, `patient_merge_records`; enforce unique active hospital number and indexed identifier values.
- **Potential UI Changes:** Add tabbed patient profile sections, duplicate warning banner, photo upload, emergency/next-of-kin cards.
- **Dependencies:** Existing patient identifiers and emergency contacts.
- **Estimated Complexity:** Large

### Recommendation 2: Add appointment and scheduling module

- **Category:** Appointments / Operations
- **Priority:** High
- **Current State:** Visits support walk-in encounters, but there are no appointment routes, tables, controllers, or pages.
- **Why It Matters:** Level 2 outpatient and dental operations require doctor/chair scheduling, follow-ups, waitlists, and no-show management.
- **Recommended Improvement:** Implement appointments as a monolith module with clinician calendars, dental chair resources, status workflow, follow-up linkage, double-booking prevention, and reminder-ready fields.
- **Suggested Files or Modules:** New `appointments` migration/model/controller/service/Form Requests and Inertia pages under existing app/resources structure.
- **Potential Database Changes:** `appointments`, `appointment_resources`, `provider_schedules`, unique constraints on resource/time windows, nullable `visit_id` for converted appointments.
- **Potential UI Changes:** Calendar/list views, quick create from patient/visit/consultation, follow-up prompt at visit completion.
- **Dependencies:** Patients, users/providers, visits.
- **Estimated Complexity:** Large

### Recommendation 3: Implement dental services module

- **Category:** Dental / EMR
- **Priority:** High
- **Current State:** No dental-specific routes, tables, models, or pages were found.
- **Why It Matters:** Royalmed provides dental services; generic consultation notes cannot safely capture tooth-specific procedures, odontograms, periodontal findings, images, or staged plans.
- **Recommended Improvement:** Add dental charting within the Laravel/Inertia monolith: tooth numbering, odontogram state, periodontal chart, procedure catalogue, treatment plans, before/after images, dental notes, billing hooks, and follow-up scheduling.
- **Suggested Files or Modules:** Dental migrations/models/controllers/actions, consultation integration, billing item generation, dental pages.
- **Potential Database Changes:** `dental_charts`, `dental_tooth_findings`, `dental_periodontal_measurements`, `dental_treatment_plans`, `dental_procedures`, `dental_attachments`.
- **Potential UI Changes:** Tooth chart component, procedure picker, treatment-plan timeline, image upload gallery.
- **Dependencies:** Patients, visits, consultations, billing, future document storage.
- **Estimated Complexity:** Large

### Recommendation 4: Expand clinical EMR structure and coding

- **Category:** Consultation / Compliance
- **Priority:** High
- **Current State:** Consultation captures chief complaint, history, examination, plan, notes and diagnoses, but coding/interoperability is absent.
- **Why It Matters:** Clinical quality, disease reporting, referral continuity, and Ministry/SHA reporting rely on coded diagnoses and structured clinical records.
- **Recommended Improvement:** Introduce explicit SOAP fields, differential diagnosis, ICD-10 catalogue/diagnosis codes, consultation templates, attachments, and structured history/problem/allergy views.
- **Suggested Files or Modules:** Consultation model/migration/controller/pages, diagnoses table/model, clinical notes, patient profile.
- **Potential Database Changes:** Add `icd10_code`, `diagnosis_type`, `certainty`, `rank` to diagnoses; add `consultation_templates`, `clinical_attachments`, `patient_problem_list`.
- **Potential UI Changes:** SOAP tabs, diagnosis code search, template insertion, longitudinal clinical summary panel.
- **Dependencies:** Existing consultations/diagnoses/patients.
- **Estimated Complexity:** Large

### Recommendation 5: Add insurance and SHA/NHIF claims workflow

- **Category:** Insurance / Finance
- **Priority:** High
- **Current State:** Billing supports invoices/payments; no insurance scheme, coverage, claim, preauthorization, rejection, or resubmission workflow exists.
- **Why It Matters:** Kenyan hospital billing commonly requires SHA/NHIF/private/corporate scheme capture and claim tracking.
- **Recommended Improvement:** Add insurer/scheme setup, patient coverage records, claim generation from invoices, claim statuses, rejections/resubmissions, preauthorization references, and claim aging reports.
- **Suggested Files or Modules:** Billing module, patient registration, new insurance controllers/pages/services.
- **Potential Database Changes:** `insurers`, `insurance_schemes`, `patient_coverages`, `insurance_claims`, `claim_items`, `claim_status_history`, `preauthorizations`.
- **Potential UI Changes:** Coverage tab on patient profile, invoice claim conversion, claim worklist, rejection/resubmission screens.
- **Dependencies:** Patients, invoices, payments.
- **Estimated Complexity:** Large

### Recommendation 6: Build compliance-grade audit and document/consent management

- **Category:** Security / Compliance / Documents
- **Priority:** High
- **Current State:** Activity log table/service exists, but documents, consents, signatures, scanned files, versioning, and retention policies are missing.
- **Why It Matters:** Kenya Data Protection Act readiness and HIPAA-style principles require traceability, consent evidence, controlled access, and retention governance.
- **Recommended Improvement:** Add patient document library, consent templates/responses, digital signature capture, file metadata, immutable audit events for clinical/financial actions, and retention/delete controls.
- **Suggested Files or Modules:** New document/consent module; extend AuditService; patient/consultation pages.
- **Potential Database Changes:** `patient_documents`, `document_versions`, `consent_templates`, `patient_consents`, `digital_signatures`, expanded `activity_logs` metadata and indexes.
- **Potential UI Changes:** Documents tab, consent signing modal, audit timeline, file preview/download controls.
- **Dependencies:** Filesystem/storage configuration, users, patients, visits.
- **Estimated Complexity:** Large

## 7. Medium Priority Improvements

### Recommendation 7: Improve triage acuity and queue prioritization

- **Category:** Triage / Queue
- **Priority:** Medium
- **Current State:** Basic vitals and one queue entry per visit are supported.
- **Why It Matters:** Safer outpatient flow requires acuity scoring and priority routing.
- **Recommended Improvement:** Add oxygen saturation, pain score, BMI auto-calculation, NEWS score, chief complaint, nurse notes, pregnancy/pediatric flags, department queue type, priority level, queue number, and timestamps for arrival/called/started/completed.
- **Suggested Files or Modules:** VitalSign, QueueEntry, CaptureVitalsRequest, Visit triage/queue pages, QueueService.
- **Potential Database Changes:** Add triage fields and queue department/priority/number indexes.
- **Potential UI Changes:** Triage score card, colored priority badges, separate triage/consultation/lab/pharmacy/dental queue filters.
- **Dependencies:** Visits, vitals, queue.
- **Estimated Complexity:** Medium

### Recommendation 8: Formalize reporting and analytics inside Inertia

- **Category:** Reporting / Analytics
- **Priority:** Medium
- **Current State:** Dashboard gives operational counts/totals, but report routes/pages are absent despite report permissions.
- **Why It Matters:** Management needs daily/monthly revenue, disease, lab, pharmacy, inventory, doctor productivity, and SHA/MOH reports.
- **Recommended Improvement:** Add reports section with date filters, exportable tables, and chart summaries using server-side query objects/services.
- **Suggested Files or Modules:** New ReportController/ReportService/Inertia pages; reuse Billing, Lab, Pharmacy, Consultation models.
- **Potential Database Changes:** Add indexes for date/status/provider/diagnosis fields as reports mature.
- **Potential UI Changes:** Reports navigation group, reusable filter bar, export/download buttons.
- **Dependencies:** Existing data modules and permissions.
- **Estimated Complexity:** Medium

### Recommendation 9: Add automations and notifications

- **Category:** Automation / Notifications
- **Priority:** Medium
- **Current State:** Laravel notification infrastructure exists through users/auth, but no operational reminder jobs or schedules are present.
- **Why It Matters:** Missed appointments, medication reminders, low stock, expiries, lab criticals, and unpaid balances need proactive follow-up.
- **Recommended Improvement:** Add queued notifications and scheduled commands for appointment reminders, missed appointments, vaccination due dates, low stock, expiry, critical lab results, and billing notifications.
- **Suggested Files or Modules:** Notifications, Jobs, console schedule, DashboardService alert counts.
- **Potential Database Changes:** `notification_preferences`, `automation_runs`, optional SMS log table.
- **Potential UI Changes:** Notification center, preference screens, alert worklists.
- **Dependencies:** Queue workers, mail/SMS settings, future appointments/vaccinations.
- **Estimated Complexity:** Medium

### Recommendation 10: Enhance pharmacy/inventory controls

- **Category:** Pharmacy / Inventory
- **Priority:** Medium
- **Current State:** FEFO stock deduction is strong, but controls are incomplete.
- **Why It Matters:** Medication safety and stock accountability require validation, returns, adjustments, and controlled-drug audit trails.
- **Recommended Improvement:** Add drug interaction/allergy checks, controlled-drug flag and register, returns, adjustment approval, stock transfers, PO-to-GRN receiving, barcode labels, and reorder worklists.
- **Suggested Files or Modules:** Medicine, InventoryBatch, StockMovement, PharmacyController/pages, InventoryService.
- **Potential Database Changes:** `drug_interactions`, controlled fields on medicines, `stock_adjustments`, `stock_transfers`, `purchase_orders`, `goods_received_notes`.
- **Potential UI Changes:** Dispensing safety warnings, controlled drug register, adjustment approval forms, reorder dashboard.
- **Dependencies:** Patient allergy module, current inventory batches/movements.
- **Estimated Complexity:** Medium

## 8. Low Priority Improvements

### Recommendation 11: Improve UX consistency and productivity

- **Category:** UX / React/Inertia
- **Priority:** Low
- **Current State:** Navigation, empty/loading components, permission guards, and dark mode exist; global search, keyboard shortcuts, bulk actions, and advanced filters are not evident.
- **Why It Matters:** Fast data entry and retrieval reduce patient waiting time and clerical errors.
- **Recommended Improvement:** Add global patient/visit search, consistent pagination/filter/sort components, keyboard shortcuts, bulk table actions, better empty/error states, and mobile workflow polish.
- **Suggested Files or Modules:** App layout/sidebar/header, pages under patients/visits/lab/pharmacy/billing, reusable table/filter components.
- **Potential Database Changes:** Add searchable indexes once query patterns are finalized.
- **Potential UI Changes:** Command palette, quick actions, reusable data table, patient context header.
- **Dependencies:** Existing Inertia layout/components.
- **Estimated Complexity:** Medium

### Recommendation 12: Add patient and staff portals after core HIS maturity improves

- **Category:** Portals
- **Priority:** Low
- **Current State:** No patient or staff portal workflows exist.
- **Why It Matters:** Portal value depends on reliable appointments, documents, lab results, billing, and secure messaging.
- **Recommended Improvement:** Defer until core clinical, document, and appointment modules are stronger; then add role-scoped Inertia portal pages in the same monolith.
- **Suggested Files or Modules:** Auth/RBAC, patients, appointments, lab, billing, documents.
- **Potential Database Changes:** `patient_users`, `secure_messages`, `staff_announcements`, `tasks`, `leave_requests`, `attendance_records`.
- **Potential UI Changes:** Patient dashboard, staff notices/tasks, secure messaging.
- **Dependencies:** Documents, appointments, notifications.
- **Estimated Complexity:** Large

## 9. Security Findings

- Strengths: auth/verified middleware wraps application routes; Spatie permissions protect routes; Super Admin bypass exists; users have active flag; two-factor columns and passkey package/pages exist; financial immutability is enforced in invoice model.
- Gaps: no evidence of field-level encryption for sensitive patient identifiers/clinical data, no comprehensive session/login history report, no backup readiness artifacts, no explicit department/location restrictions, and audit coverage is not clearly universal.
- Risk: patient and financial data are sensitive; missing encryption/retention/audit workflows raise compliance risk.

## 10. Database Findings

- Strengths: broad foreign keys, indexes on important billing/patient/visit fields, soft deletes on patients/medicines/suppliers/batches/purchases, unique identifiers and generated numbers.
- Gaps: many clinical tables use nullable fields where workflow may require stronger constraints; queue has only one entry per visit, preventing multi-department queue history; diagnoses lack code constraints; lab statuses use strings/enums without shared status tables; no soft deletes on visits/consultations/lab orders/invoices/payments; financial cascade deletes from visits/invoices could be risky for retention.
- Normalization gaps: single patient phone/address; no separate patient problems/allergies/contacts/addresses; insurance/dental/document/reporting tables absent.

## 11. Laravel Architecture Findings

- Strengths: code is organized into Controllers, Form Requests, Services, Actions, Models, Events, Exceptions, factories, seeders, and PHPUnit feature tests. Route middleware is explicit. Transactions are used in inventory and dispensing flows.
- Gaps: policies are not mapped; authorization is mostly permission-string middleware/Form Requests. Scheduled tasks, queued jobs, notifications, listeners, caching strategy, and report query objects are minimal/absent. Several models lack explicit return types on relationships, reflecting current style but below stricter PHP best practice. Some dashboards run multiple aggregate queries and may need caching/indexing as data grows.
- Recommendation: keep the monolith, but add bounded module services/actions, policies where record-level rules appear, scheduled jobs for automations, and query services for reports.

## 12. React & Inertia Findings

- Strengths: Inertia v3/React 19 stack, page folders by module, shared layouts/components, permission-aware navigation, loading/empty components, dark mode hook, Wayfinder dependency.
- Gaps: no global search/command palette, limited reusable data table evidence, no error boundary evidence, no lazy-loading strategy evidence, some navigation uses literal URLs rather than generated route helpers, and no dental/appointment/report portal page structures.
- Recommendation: standardize route helper usage, shared form/table primitives, patient context panels, and optimistic UX only where workflows are safe.

## 13. UX Findings

- Navigation covers current modules clearly: Dashboard, Patients, Visits, Queue, Clinician Desk, Prescriptions, Pharmacy, Laboratory, Billing, and User Management.
- Missing: global search, high-speed patient lookup UX, keyboard shortcuts, advanced filters, sorting/pagination consistency, bulk actions, queue prioritization view, clinical timeline, document tabs, formal report filter layout, and patient safety banners for allergies/alerts.

## 14. Compliance Findings

- Kenya Data Protection Act/HIPAA-principle readiness is partial: authentication/RBAC/audit basics exist, but consent, retention, minimization, access history, encryption, and document governance are missing.
- ICD-10 readiness is missing; diagnoses are not coded. LOINC/SNOMED/FHIR/HL7 readiness is missing; no code-system tables or mapping layers were found.
- Medical record retention needs explicit policy and technical controls, especially because some clinical/financial child records cascade on delete.

## 15. Scalability Considerations

The monolith is appropriate for a Level 2 hospital. Scale within Laravel using database indexes, query services, caching for dashboards, queued jobs for notifications/reports, background exports, and careful eager loading. Avoid splitting the architecture. The highest operational scaling risks are report query load, dashboard aggregate load, patient search speed, and inventory concurrency under busy pharmacy workflows.

## 16. Technical Debt

- Missing high-value modules: appointments, dental, insurance, documents, reports, notifications.
- Incomplete patient master index and EMR structure.
- String-based statuses across lab/queue/medicine workflows need consistent state management.
- Cascade delete behavior conflicts with medical/financial retention expectations.
- Sparse scheduled jobs/listeners/notifications despite event classes.
- No explicit interoperability/coding dictionaries.

## 17. Recommended Development Roadmap

1. **Phase 1: Safety and identity foundation (4-6 weeks):** patient master index, allergies/alerts/chronic conditions, duplicate detection, triage expansion, audit/retention hardening.
2. **Phase 2: Operational scheduling and queues (4-6 weeks):** appointments, provider schedules, dental chair resources, department queues, reminders-ready status lifecycle.
3. **Phase 3: Clinical depth (6-10 weeks):** SOAP EMR, ICD-10, templates, clinical attachments, dental charting/procedures/images.
4. **Phase 4: Finance and claims (5-8 weeks):** insurance/SHA/NHIF schemes, claims, preauthorization, refunds/credit notes/deposits/split payments.
5. **Phase 5: Reporting, automation, compliance (5-8 weeks):** management reports, MOH/SHA outputs, scheduled notifications, consent/document management, audit exports.
6. **Phase 6: Portals and advanced analytics (6-10 weeks):** patient/staff portals, secure messaging, trend dashboards, productivity and claim success analytics.

## 18. Estimated Development Effort

- Patient master index and triage expansion: **Large**, 4-6 weeks.
- Appointment/calendar scheduling: **Large**, 4-6 weeks.
- Dental module: **Large**, 6-10 weeks depending charting complexity.
- Insurance/SHA claims: **Large**, 5-8 weeks.
- Document/consent/audit hardening: **Large**, 4-8 weeks.
- Reports/analytics: **Medium-Large**, 4-8 weeks.
- Notifications/automation: **Medium**, 3-5 weeks after source workflows exist.
- UX productivity improvements: **Medium**, ongoing across phases.

## 19. Overall System Maturity Score

**43 / 100**

Rationale: the system has credible foundations in registration, visits, pharmacy, laboratory, billing, RBAC, security settings, and dashboards. It loses substantial maturity points because appointments, dental, insurance/SHA, documents/consents, reporting, automation, interoperability coding, compliance retention, and portals are absent or incomplete.
