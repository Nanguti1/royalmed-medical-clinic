# RoyalMed Visit-Centric Workflow Implementation Plan

## Purpose

This plan converts RoyalMed toward a **Visit-Centric + Queue-Driven + Role-Based Workflow** without replacing existing modules or rewriting the application architecture.

The core product outcome is simple:

> A hospital worker opens their queue, sees patients requiring their action, performs the task, submits it, and RoyalMed automatically moves the visit to the next appropriate stage.

## Implementation Principles

1. Preserve existing patients, visits, consultations, laboratory orders, prescriptions, invoices, and payments.
2. Extend existing models and services instead of creating duplicate workflow engines.
3. Keep `Visit` as the central episode-of-care entity.
4. Make queue membership a consequence of visit state and department assignment.
5. Prefer small, testable workflow increments over broad redesigns.
6. Do not weaken backend authorization; UI visibility is not enough.
7. Every implementation step must include targeted PHPUnit tests.
8. Do not introduce new modules for imaging, admission, procedures, referrals, or emergency escalation until the existing core workflow is safe.

## Current Critical Findings To Address

### 1. Consultation Continuation Is Unsafe

The current consultation-start path can create a new consultation record for a visit rather than safely continuing an existing consultation. The implementation must prevent duplicate consultations unless the project explicitly adopts a multi-consultation-per-visit design later.

### 2. Laboratory Orders Do Not Preserve Consultation Ownership

Laboratory orders are visit-linked and doctor-linked, but they are not explicitly linked to the originating consultation. This makes it unsafe to guarantee that lab results return to the same consultation.

### 3. Laboratory Completion Does Not Return The Visit To The Doctor

Completing a lab order should automatically return the visit to the originating doctor's consultation queue with the action **Continue Consultation**.

### 4. Visit State Is Not The Workflow Source Of Truth

Visit workflow state is currently spread across timestamps, queue entries, lab order status, prescription status, invoice status, and payment status. A small workflow transition layer should coordinate these signals.

### 5. Queues Are Not Yet Role-Specific Enough

The existing queue foundation should be extended into department-specific and role-specific worklists: triage, consultation, laboratory, pharmacy, and billing.

## Target Workflow

```text
Patient Registration
  -> Visit Created
  -> Waiting For Triage
  -> Triage Queue
  -> Triage Completed
  -> Waiting For Consultation
  -> Doctor Queue
  -> Consultation In Progress
  -> Optional Lab Ordered
  -> Waiting For Lab
  -> Laboratory Queue
  -> Lab Completed
  -> Lab Results Ready
  -> Same Doctor Queue
  -> Continue Same Consultation
  -> Optional Prescription
  -> Pharmacy Queue
  -> Billing Queue
  -> Payment Recorded
  -> Visit Completed
```

## Recommended Visit States

Use the existing visit status mechanism where possible. If missing, seed these states through the existing status table rather than creating a duplicate status system.

| State | Meaning | Typical Next Action |
|---|---|---|
| `REGISTERED` | Visit exists but has not entered a clinical queue. | Send to Triage |
| `WAITING_FOR_TRIAGE` | Visit is ready for nurse triage. | Record Triage |
| `TRIAGE_IN_PROGRESS` | Nurse has opened/started triage. | Complete Triage |
| `WAITING_FOR_CONSULTATION` | Triage is complete and patient awaits doctor. | Start Consultation |
| `CONSULTATION_IN_PROGRESS` | Doctor is actively documenting care. | Continue / Order Lab / Prescribe / Complete |
| `WAITING_FOR_LAB` | Lab has been ordered and consultation is paused. | Process Lab Order |
| `LAB_IN_PROGRESS` | Lab technician has started processing. | Enter Results |
| `LAB_RESULTS_READY` | Lab results are complete and doctor must continue. | Continue Consultation |
| `WAITING_FOR_PHARMACY` | Prescription is finalized and awaits dispensing. | Dispense Medication |
| `WAITING_FOR_BILLING` | Billable services exist and payment is required. | Generate Invoice / Receive Payment |
| `PAID` | Required payment is complete. | Complete Visit |
| `VISIT_COMPLETED` | Visit episode is closed. | No active action |
| `CANCELLED` | Visit was cancelled. | No active action |

## Queue Model Requirements

Each active queue item should expose:

- Visit ID
- Patient name and hospital number
- Visit number
- Department
- Assigned user where applicable
- Current visit state
- Required action
- Priority
- Created time
- Waiting time
- Originating clinician where relevant
- Originating consultation where relevant

Only one active queue item should exist for the same visit and same department/action combination. Historical completed queue entries should remain auditable if the existing schema supports it.

## Phase 1 — Critical Consultation And Laboratory Workflow

### Goal

Guarantee that doctor-ordered lab tests pause the consultation, laboratory completion returns the visit to the same doctor, and the doctor continues the same consultation record.

### Backend Tasks

1. Fix broken references to `visit->consultation_id`; use the visit's `consultation` relationship instead.
2. Prevent duplicate consultation records for the same visit in the existing start-consultation action.
3. Add `consultation_id` to laboratory orders using a backward-compatible nullable migration.
4. Populate `consultation_id` when a lab order is created from an active consultation.
5. Add a workflow method for "lab ordered" that marks the visit as waiting for lab and moves the visit into laboratory work.
6. Add a workflow method for "lab completed" that marks the visit as lab results ready and creates a consultation queue item assigned to the originating doctor.
7. Add backend tests proving same-doctor, same-consultation continuation.

### Frontend Tasks

1. Show **Continue Consultation** instead of **Start Consultation** when a queue item represents `LAB_RESULTS_READY`.
2. Keep existing clinical details visible when returning from lab.
3. Surface lab results in the consultation show/edit workspace.

### Tests

Minimum tests for Phase 1:

- Creating a consultation twice for the same visit does not create two consultations.
- Lab order stores `visit_id`, `consultation_id`, and `ordered_by`.
- Lab completion returns the visit to the originating doctor's queue.
- Continuing after lab updates the same consultation.
- Partial lab results do not return the visit to the doctor prematurely.

## Phase 2 — Triage And Consultation Queues

### Goal

Make reception-to-triage-to-consultation handoff automatic and queue-driven.

### Backend Tasks

1. On visit creation, set visit state to `WAITING_FOR_TRIAGE`.
2. Automatically create a triage queue item.
3. When nurse starts triage, set state to `TRIAGE_IN_PROGRESS`.
4. When vitals/triage are submitted, set state to `WAITING_FOR_CONSULTATION`.
5. Complete the triage queue item and create a consultation queue item.
6. Filter doctor worklists by consultation department and assignment rules.

### Frontend Tasks

1. Add or refine a nurse triage queue view.
2. Add clear triage actions: **Record Triage** and **Complete Triage**.
3. Add a doctor consultation queue that distinguishes new patients from lab-return patients.

### Tests

- Visit creation automatically creates a triage queue item.
- Triage completion creates a consultation queue item.
- Patient disappears from active triage queue after handoff.
- Doctor queue only shows relevant consultation items.

## Phase 3 — Pharmacy And Billing Queue Integration

### Goal

Make prescriptions and billing part of the visit queue lifecycle without rewriting pharmacy or billing modules.

### Backend Tasks

1. When a prescription is finalized, set visit state to `WAITING_FOR_PHARMACY` if dispensing is required.
2. Treat finalized, undispensed prescriptions as pharmacy queue items with visit context.
3. When dispensing completes, move the visit to billing if billables exist.
4. Add a billing queue derived from visits with unpaid invoices or billable services awaiting invoice creation.
5. After full payment, mark the visit `PAID` and allow visit completion.

### Frontend Tasks

1. Rename or frame pharmacy index as a pharmacy queue.
2. Show patient, visit number, prescription summary, and next action.
3. Add a cashier/billing queue view showing invoice/payment-required next actions.

### Tests

- Finalized prescription appears in pharmacy queue.
- Dispensed prescription leaves pharmacy queue.
- Dispensing creates or exposes billing queue work.
- Paid invoice enables visit completion.

## Phase 4 — Visit Workspace And Timeline

### Goal

Make the visit show page the central workspace for one episode of care.

### Backend Tasks

1. Load visit timeline events from existing activity/audit records where available.
2. Add a simple computed next-action payload for each visit.
3. Ensure the workspace returns only data permitted for the current user role.

### Frontend Tasks

1. Show patient summary, current state, next action, and active queue item at the top of the visit workspace.
2. Add sections for triage, consultation, labs, prescriptions, billing, and payments.
3. Add a chronological visit timeline.
4. Avoid exposing internal database status names to frontline users.

### Tests

- Visit workspace returns correct next action by state.
- Lab-return visit shows **Continue Consultation**.
- Cancelled and completed visits do not show active workflow actions.

## Phase 5 — Authorization, Edge Cases, And Hardening

### Goal

Protect workflow integrity under real hospital conditions.

### Backend Tasks

1. Add assignment-aware authorization for consultation continuation after lab.
2. Add cancellation safeguards so cancelled visits cannot re-enter active queues.
3. Add duplicate-submission protections for consultation, lab order, prescription, invoice, and payment actions.
4. Add concurrency tests around lab completion and queue creation.
5. Add authorized reassignment flow for unavailable doctors.

### Frontend Tasks

1. Disable submit buttons during in-flight requests.
2. Show clear error messages for invalid state transitions.
3. Show reassignment actions only to authorized users.

### Tests

- Cancelled visit cannot be queued.
- Double-submit does not duplicate clinical or billing records.
- Unauthorized users cannot submit lab results, dispense medication, receive payments, or continue another doctor's assigned consultation.
- Authorized reassignment preserves consultation history.

## Suggested Implementation Order

1. Fix broken `consultation_id` assumptions in redirects.
2. Prevent duplicate consultations for one visit.
3. Add lab-order `consultation_id`.
4. Implement lab completed -> same doctor queue return.
5. Add frontend **Continue Consultation** action.
6. Automate visit creation -> triage queue.
7. Automate triage -> consultation queue.
8. Add pharmacy queue state handoff.
9. Add billing queue state handoff.
10. Build visit workspace next-action summary.
11. Add timeline.
12. Harden authorization and edge cases.

## Definition Of Done

RoyalMed meets the target workflow when:

- Reception can create a visit and send it to triage without manual queue hunting.
- Nurses work from triage queue.
- Doctors work from consultation queue.
- Laboratory technicians work from laboratory queue.
- Pharmacists work from pharmacy queue.
- Cashiers work from billing queue.
- Lab orders pause, not complete, consultations.
- Lab completion returns the visit to the originating doctor.
- The doctor continues the same consultation.
- Multiple lab orders and prescriptions are safe within one visit.
- Billing can identify visit billables.
- Visit state and queue next action are consistent.
- Backend permissions enforce role access.
- Tests prove critical handoffs and invalid transitions.
