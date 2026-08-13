# Royalmed Clinic Level 2 HIS Implementation Prompts

Use these prompts sequentially. Each prompt builds on the previous one and must preserve the Laravel + Inertia monolith architecture. Do **not** introduce REST APIs, GraphQL, microservices, mobile apps, API gateways, or a separate frontend/backend split. Before starting each prompt, re-read `docs/royalmed-level-2-hospital-system-audit.md`, inspect the current implementation, and update the prompt scope if the codebase has changed.

## Prompt 01 — Database and Architecture Foundation Patches

You are a Senior Laravel 13 healthcare systems architect. Fix the core database design and architecture gaps identified in the Royalmed Level 2 HIS audit before adding business workflows.

### Current evidence to preserve

- `patients` currently has `first_name`, `last_name`, `other_names`, `gender_id`, `date_of_birth`, one `phone`, one `email`, one `address`, `county_id`, `sub_county_id`, `notes`, soft deletes, `created_by`, and `updated_by`.
- `patient_identifiers` currently has `patient_id`, `identifier_type`, `identifier_value`, `is_primary`, and a unique `identifier_type` + `identifier_value` constraint.
- `emergency_contacts` currently has `patient_id`, `name`, `relationship`, `phone`, and `address`.
- `visits` currently has `patient_id`, `visit_date`, `visit_status_id`, `receptionist_id`, `notes`, `visit_number`, lifecycle timestamps, and lifecycle actor IDs.
- `vital_signs` currently has `visit_id`, `temperature_c`, `blood_pressure`, `pulse`, `respiratory_rate`, `weight_kg`, and `height_cm`.
- `queue_entries` currently has one row per visit, `position`, `status`, `called_at`, and `served_at`.
- `consultations` currently has `visit_id`, `provider_id`, `chief_complaint`, `history`, `examination`, `plan`, and `notes`.
- `diagnoses` exists but is not ICD-10/SNOMED structured.
- `lab_tests`, `lab_orders`, `lab_order_items`, and `lab_results` already support categories, sample tracking, reference ranges, abnormal/critical flags, and verification status.
- `medicines`, `inventory_batches`, `stock_movements`, `suppliers`, `purchases`, and `purchase_items` already support drug catalogue, batches, suppliers, stock movement, purchase receiving, expiry dates, and FEFO-ready inventory.
- `invoices`, `invoice_items`, `payment_methods`, `payments`, and `mpesa_transactions` already support billing, payments, receipts, M-Pesa transaction storage, and reconciliation.
- Spatie permissions, Fortify auth, two-factor/passkey readiness, activity logs, services, actions, Form Requests, factories, seeders, and PHPUnit tests already exist.

### Required database changes

1. Patch the patient master index without breaking existing patient records:
   - Add `hospital_number` as a unique, indexed patient identifier or primary patient column, using existing number-generation conventions where possible.
   - Add patient profile fields: `photo_path`, `occupation`, `employer`, `marital_status`, `preferred_language`, `religion`, `blood_group`.
   - Add structured contact tables for multiple phones and addresses: `patient_contacts` and `patient_addresses`.
   - Add clinical safety tables: `patient_allergies`, `patient_chronic_conditions`, and `patient_alerts`.
   - Add relationship and merge tracking tables: `patient_relationships` and `patient_merge_records`.
   - Keep existing `phone`, `email`, and `address` for backward compatibility during migration; document them as legacy/primary-display fields if you introduce normalized tables.
2. Patch triage and queue architecture:
   - Add `oxygen_saturation`, `bmi`, `pain_score`, `news_score`, `chief_complaint`, and `nurse_notes` to vitals/triage storage.
   - Add queue department/type support for `triage`, `consultation`, `laboratory`, `pharmacy`, and future `dental` queues.
   - Replace or augment one-entry-per-visit queue design so a visit can move through multiple departmental queue entries over time.
   - Add queue fields for `queue_number`, `priority`, `started_at`, `completed_at`, and waiting-time analytics.
3. Patch clinical coding architecture:
   - Add ICD-10-ready columns to diagnoses: `code`, `coding_system`, `description`, `diagnosis_type`, `certainty`, and `rank`.
   - Add tables for consultation templates and clinical attachments metadata.
4. Patch retention and audit architecture:
   - Review cascade deletes on clinical and financial records; protect medical/financial retention by replacing destructive cascades with restrict/null behavior where appropriate.
   - Add missing soft deletes or immutable audit records for clinical, lab, billing, payment, and document-adjacent records.
5. Add indexes and constraints for patient search, identifiers, visit lookup, queue worklists, lab status filters, inventory alerts, billing reports, and audit lookups.

### Required architecture changes

- Use Laravel migrations, models, factories, seeders, and Form Requests following existing conventions.
- Use explicit relationships in models for each new table.
- Update existing services/actions only where needed to keep current workflows working.
- Add or update PHPUnit feature tests for every schema-backed workflow change.
- Run the smallest affected test set and `vendor/bin/pint --dirty --format agent` if PHP files are modified.

### Acceptance criteria

- Existing tests still pass or failures are explained with environment limitations.
- New migrations are reversible.
- Patient registration, visit creation, triage capture, queue listing, consultation, lab, pharmacy, and billing workflows remain functional.
- The schema supports the missing fields and relationships listed above without requiring an API or separate frontend.

## Prompt 02 — Patient Registration and Master Patient Index Business Logic

Build on Prompt 01. Implement business logic for a safer Royalmed master patient index.

### Current state to preserve

- Existing patient registration uses `StorePatientRequest`, `UpdatePatientRequest`, `RegisterPatientAction`, `UpdatePatientAction`, `PatientService`, `PatientController`, and Inertia pages under `resources/js/pages/patients`.
- Existing patient identifiers and emergency contacts must continue to work.

### Required business logic

- Generate and persist hospital numbers consistently.
- Support National ID, Passport, SHA Number, NHIF Number, private insurance number, and legacy/custom identifiers through `patient_identifiers`.
- Validate uniqueness of identifiers across active patients.
- Add duplicate detection using name + DOB + phone + identifier matching; warn before creation rather than silently blocking valid edge cases.
- Add patient merge workflow with audit trail and source/target patient records.
- Add CRUD for multiple contacts, multiple addresses, next of kin, emergency contacts, relationships, allergies, chronic conditions, and alerts.
- Ensure patient safety alerts appear in every clinical workflow that loads a patient.

### Required tests

- Patient can be registered with hospital number and multiple identifiers.
- Duplicate candidates are detected.
- Patient merge preserves audit history and related records.
- Allergies/alerts/chronic conditions are persisted and visible to clinical workflows.

## Prompt 03 — Triage, Queue, and Visit Flow Business Logic

Build on Prompts 01 and 02. Implement Level 2 hospital triage and departmental queue flow.

### Current state to preserve

- Visits already support pending/in-progress/completed/cancelled lifecycle.
- Vitals already support temperature, blood pressure, pulse, respiratory rate, weight, and height.
- Queue entries already support waiting/called/in-progress style statuses.

### Required business logic

- Capture full triage: temperature, pulse, respiratory rate, oxygen saturation, blood pressure, height, weight, BMI, pain score, NEWS score, chief complaint, and nurse notes.
- Auto-calculate BMI from height/weight and NEWS score from supported vitals where possible.
- Route visits through triage, consultation, laboratory, pharmacy, and future dental queues.
- Generate human-friendly queue numbers per department/day.
- Support queue prioritization for emergency, elderly, child, pregnant, critical NEWS score, or manual priority.
- Track waiting time, called time, service start, service completion, and skipped/cancelled states.
- Prevent invalid transitions and duplicate active queue entries in the same department.

### Required tests

- Triage capture stores all fields and calculates BMI/NEWS.
- Queue entries can be created per department for the same visit.
- Duplicate active entries in the same department are rejected.
- Priority ordering is respected.

## Prompt 04 — Consultation and EMR Business Logic

Build on Prompts 01-03. Strengthen consultation/EMR logic without replacing the monolith.

### Current state to preserve

- Consultations currently support chief complaint, history, examination, plan, notes, diagnoses, prescriptions, lab orders, and clinical notes.

### Required business logic

- Add structured SOAP notes: subjective, objective, assessment, plan.
- Preserve existing history/examination/plan/notes by migrating or mapping to SOAP fields without data loss.
- Add differential diagnoses, diagnosis rank, certainty, and ICD-10 codes.
- Add consultation templates that clinicians can insert and edit.
- Add longitudinal clinical summary: active problems, chronic conditions, allergies, previous diagnoses, lab history, prescriptions, and visit history.
- Add clinical attachment metadata ready for document storage.
- Add follow-up recommendation fields that can later create appointments.

### Required tests

- Clinician can create/update SOAP consultation.
- ICD-10-coded primary and differential diagnoses persist.
- Consultation template content can be applied without overwriting clinician edits unexpectedly.
- Patient safety summary is loaded for a consultation.

## Prompt 05 — Laboratory Business Logic Completion

Build on Prompts 01-04. Complete laboratory workflow gaps.

### Current state to preserve

- Lab categories/tests/reference ranges/orders/order items/results/sample statuses/verification fields already exist.

### Required business logic

- Add specimen labels and accession numbers.
- Enforce sample lifecycle transitions: ordered → collected → received → processing → completed → verified/rejected.
- Trigger critical result alerts inside the application when a critical abnormal result is recorded or verified.
- Add result history by patient and by test.
- Add printable result view/PDF generation if existing dependencies support it; otherwise create print-friendly Inertia pages.
- Ensure result verification requires appropriate permission and tracks verifier/time.

### Required tests

- Sample lifecycle transitions are enforced.
- Critical result creates an alert/audit record.
- Verification permission is enforced.
- Patient lab history displays chronological results.

## Prompt 06 — Pharmacy and Inventory Business Logic Completion

Build on Prompts 01-05. Complete medication safety and inventory control gaps.

### Current state to preserve

- Medicines, prescription items, batches, stock movements, suppliers, purchases, FEFO deduction, expiry checks, and insufficient-stock exceptions already exist.

### Required business logic

- Add allergy checking during prescription and dispensing using `patient_allergies`.
- Add drug interaction checks using a local `drug_interactions` table.
- Add controlled-drug flag, controlled-drug register, and stricter audit requirements.
- Add returns, stock adjustments with reason/approval, stock transfers, purchase orders, and goods received notes.
- Add automated low-stock, reorder, expired, and expiring-soon alerts.
- Ensure FEFO remains the default dispensing algorithm.

### Required tests

- Dispensing warns/blocks on documented allergy according to severity.
- Drug interaction warnings are generated.
- Controlled-drug dispensing writes register entries.
- Returns and adjustments update stock movements and audit logs.
- Low-stock and expiry alerts are generated.

## Prompt 07 — Billing, Finance, Insurance, SHA, and NHIF Business Logic

Build on Prompts 01-06. Complete finance and insurance workflows for a Kenyan Level 2 hospital.

### Current state to preserve

- Invoices, invoice items, payment methods, payments, M-Pesa transactions, receipt numbers, due amounts, and reconciliation already exist.

### Required business logic

- Add card payments, split payments, deposits, refunds, credit notes, discounts, outstanding-balance workflows, and payment plans.
- Add insurer, scheme, employer/corporate cover, patient coverage, preauthorization, claim, claim item, rejection, resubmission, and claim status history models.
- Support SHA, NHIF legacy references where needed, private insurance, corporate insurance, and employer schemes.
- Link invoices and invoice items to claims while preserving cash/private payment paths.
- Add claim aging and rejection reason tracking.
- Maintain financial immutability and audit trails.

### Required tests

- Split payments and deposits update invoice due amount correctly.
- Refund/credit note workflows are audited and cannot mutate original receipt totals.
- Patient coverage can be verified/attached to invoice.
- Claims can be submitted, rejected, corrected, and resubmitted.

## Prompt 08 — Documents, Consent, Security, and Compliance Business Logic

Build on Prompts 01-07. Add compliance-grade patient documents and consent workflows.

### Current state to preserve

- Fortify auth, Spatie permissions, two-factor/passkey readiness, users, activity logs, and filesystem configuration already exist.

### Required business logic

- Add document upload metadata for clinical documents, scanned documents, lab attachments, dental images, and consent forms.
- Add consent templates, patient consent records, expiry/revocation, and digital signature metadata.
- Add file version history and access audit logs.
- Add sensitive-data access events for patient profile, clinical notes, documents, billing, and reports.
- Add session/login history reporting if not already present.
- Add retention-safe delete/archive flows for medical records.
- Do not add external document services unless already configured; use Laravel storage.

### Required tests

- Document upload metadata is stored and linked to patient/visit/consultation.
- Consent can be signed, revoked, and audited.
- Unauthorized users cannot access protected documents.
- Sensitive record access writes audit entries.

## Prompt 09 — Appointment, Dental, Vaccination, Automation, and Reporting Business Logic

Build on Prompts 01-08. Add the remaining high-value hospital operations modules.

### Required appointment logic

- Add doctor schedules, dental chair schedules, appointments, walk-ins, follow-ups, waitlists, statuses, no-shows, cancellation reasons, double-booking prevention, and reminder readiness.

### Required dental logic

- Add dental chart, tooth numbering, odontogram, periodontal charting, treatment plans, procedures, dental notes, before/after images, attachments, dental billing, and dental follow-up.
- Include common services: scaling, fillings, extractions, root canal, crowns, bridges, dentures, implants, and orthodontics.

### Required vaccination logic

- Add vaccination records, schedules, due reminders, certificates, and history.

### Required reporting and analytics logic

- Add daily/monthly revenue, patient statistics, disease statistics, consultation statistics, doctor performance, inventory, drug consumption, financial, laboratory, dental, SHA, and Ministry of Health reports.
- Add analytics for revenue trends, patient growth, disease trends, doctor productivity, waiting time, consultation duration, inventory turnover, and claim success rate.

### Required automation logic

- Add scheduled jobs/notifications for appointment reminders, missed appointments, medication reminders, vaccination reminders, prescription expiry, low stock, expiring stock, insurance expiry, recurring appointments, billing notifications, and critical lab results.

### Required tests

- Appointment double booking is prevented.
- Dental chart records tooth-level procedures.
- Vaccination due reminders are generated.
- Reports return correct filtered totals.
- Scheduled automation jobs create expected notifications/alerts.

## Prompt 10 — Backend Integration Readiness Within the Monolith

Build on Prompts 01-09. Add integration readiness without changing the monolithic architecture.

### Required integration areas

- M-Pesa operational workflow completion using existing `mpesa_transactions` and payment services.
- SHA claim export/import readiness inside the billing/insurance module.
- SMS gateway abstraction using Laravel notifications/config, without hard-coding a vendor unless configured.
- Email notification templates for appointments, billing, lab alerts, and account/security events.
- WhatsApp readiness via notification channel abstraction only if configured.
- Barcode/QR generation for patient cards, lab specimens, prescriptions, receipts, and inventory batches if dependencies exist or can be implemented without new unapproved packages.
- Receipt printer and label printer print-friendly pages.

### Required tests

- Payment reconciliation still works.
- SMS/email notification jobs can be faked and asserted.
- Barcode/QR payloads are deterministic.
- Print views render required data.

## Prompt 11 — Frontend/Inertia Feature Implementation

Build on Prompts 01-10. Implement React 19 + Inertia v3 frontend workflows for all completed backend modules.

### Current frontend to preserve

- Existing pages are under `resources/js/pages`.
- Existing layouts, sidebar navigation, empty/loading components, permission guards, dark mode, and shared UI components should be reused.
- Use existing Wayfinder/route conventions where available.

### Required frontend work

- Update patient create/edit/show pages for master patient index, identifiers, contacts, addresses, alerts, allergies, chronic conditions, relationships, duplicate warnings, and merge workflow.
- Update visit/triage/queue pages for full vitals, BMI/NEWS, queue department filters, queue numbers, priority, waiting time, and state transitions.
- Update consultation pages for SOAP, ICD-10 diagnosis search, templates, attachments, follow-up recommendation, and longitudinal clinical summary.
- Add lab result history, sample lifecycle controls, critical alerts, verification screens, and print-friendly result pages.
- Add pharmacy safety warnings, controlled-drug register, adjustment/return/transfer/PO/GRN screens, and inventory alert worklists.
- Add billing/insurance pages for split payments, deposits, refunds, credit notes, discounts, payment plans, coverage, claims, preauthorization, rejections, resubmissions, and claim aging.
- Add document/consent pages and protected preview/download UX.
- Add appointment calendar/list, dental charting, vaccination, reports, notifications, patient portal, and staff portal pages only after their backend modules exist.

### Required tests/checks

- Run TypeScript checks and affected frontend tests if present.
- Validate Inertia validation errors, loading states, empty states, and permission hiding.
- Avoid Axios unless the project explicitly installs it; use Inertia forms and the installed stack.

## Prompt 12 — UI, Accessibility, and Operational UX Polish

Build on Prompts 01-11. Polish the application for fast outpatient, dental, pharmacy, laboratory, billing, and administrative use.

### Required UI/UX work

- Add a global patient/visit search or command palette.
- Add consistent table filtering, sorting, pagination, date filters, and export actions.
- Add keyboard shortcuts for registration, queue actions, consultation save, prescription add item, lab result entry, and payment collection.
- Add patient safety banners for allergies, chronic conditions, alerts, insurance status, and outstanding balances.
- Add quick actions on patient, visit, consultation, lab, pharmacy, and billing pages.
- Add mobile-responsive layouts for registration, queue, triage, consultation, payment, and lab result lookup.
- Add accessible labels, focus states, aria attributes, color contrast checks, and keyboard navigation for charts/modals/dropdowns.
- Add improved loading states, skeletons for deferred data, empty states, and error recovery messaging.
- Add print-optimized layouts for receipts, prescriptions, lab results, vaccination certificates, claim summaries, and labels.

### Required checks

- Run `npm run types:check`.
- Run `npm run lint:check` or explain environment limitations.
- Run `npm run build` for perceptible frontend changes if dependencies are installed.
- Take screenshots for major UI changes when the app can run in the environment.

## Prompt 13 — Final Audit Reconciliation and Release Readiness

Build on Prompts 01-12. Reconcile the implementation against the original audit.

### Required work

- Re-open `docs/royalmed-level-2-hospital-system-audit.md` and verify each missing/partial item against the codebase.
- Update the audit only if explicitly requested; otherwise produce a release-readiness summary in the PR body.
- Run the smallest meaningful backend and frontend checks first, then the full suite if feasible.
- Verify migrations from a clean database and from the previous schema state.
- Verify seeded roles and permissions cover new modules.
- Verify no recommendation introduced REST APIs, GraphQL, microservices, mobile apps, API versioning, API gateways, or separate backend/frontend architecture.

### Acceptance criteria

- Every module has database schema, relationships, backend business logic, authorization, validation, tests, Inertia pages, and operational UX appropriate to its priority.
- Critical patient safety, financial integrity, and compliance workflows have automated tests.
- Remaining gaps are documented as known limitations, not hidden assumptions.
