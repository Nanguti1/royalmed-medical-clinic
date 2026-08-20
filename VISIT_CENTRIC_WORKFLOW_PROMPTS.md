# RoyalMed Visit-Centric Workflow Sequential Implementation Prompts

Use these prompts one at a time in separate AI sessions. Each prompt is intentionally scoped to reduce confusion and hallucination. Do not skip the repository inspection step in any session.

## How To Use These Prompts

1. Start with Prompt 1.
2. When Prompt 1 is completed, committed, and merged, start a new session with Prompt 2.
3. Each prompt states what should already exist from the prior prompt.
4. If a prior prompt was only partially completed, tell the AI exactly what is missing before continuing.
5. Every prompt requires tests before committing.
6. Do not allow the AI to rewrite unrelated modules.

---

## Prompt 1 — Fix Consultation Identity And Broken Consultation Redirects

### Context From Planning

RoyalMed has a visit-centric model foundation, but consultation identity is unsafe. A visit has a `consultation()` relationship, while some controllers incorrectly reference `visit->consultation_id`. The consultation start action can create duplicate consultations for the same visit.

### Goal

Make consultation identity safe before touching laboratory queue behavior.

### Implement

1. Inspect `Visit`, `Consultation`, `ConsultationService`, `StartConsultationAction`, `ConsultationController`, `LaboratoryController`, and `PrescriptionController`.
2. Replace any incorrect `visit->consultation_id` usage with the existing `visit->consultation?->id` relationship or another existing safe pattern.
3. Update consultation start behavior so starting a consultation for a visit does not create duplicate consultation records.
4. If a consultation already exists for a visit, redirect to continue/edit/show that existing consultation instead of creating a second one.
5. Keep the change backward-compatible. Do not redesign multi-provider consultation architecture in this prompt.

### Tests Required

1. Starting consultation twice for the same visit creates only one consultation.
2. Lab-order creation redirects safely back to the existing consultation when a visit has one.
3. Prescription creation redirects safely back to the existing consultation when a visit has one.

### Do Not Do Yet

- Do not add lab-order `consultation_id` yet.
- Do not build doctor return queue yet.
- Do not redesign the sidebar.
- Do not create a new workflow engine.

### Expected Result Before Prompt 2

After this prompt, the application must safely identify the single consultation associated with a visit and must not rely on a nonexistent `visits.consultation_id` field.

---

## Prompt 2 — Link Laboratory Orders To The Originating Consultation

### What Prompt 1 Should Have Implemented

Prompt 1 should have fixed unsafe consultation identity by preventing duplicate consultations per visit and replacing broken `visit->consultation_id` redirects with the visit's consultation relationship.

### Goal

Make every doctor-ordered lab request traceable to the visit, originating consultation, and ordering doctor.

### Implement

1. Inspect lab migrations, `LabOrder`, `CreateLabOrderRequest`, `LaboratoryController`, `LabService`, and lab order factories/tests.
2. Add a backward-compatible nullable `consultation_id` column to `lab_orders`.
3. Add the `LabOrder::consultation()` relationship.
4. Add the `Consultation::labOrders()` relationship if useful and consistent with project conventions.
5. When a lab order is created from a visit that has an active consultation, populate `consultation_id` automatically unless explicitly supplied.
6. Preserve support for legacy lab orders that only have `visit_id`.

### Tests Required

1. Creating a lab order from a visit with a consultation stores `consultation_id`.
2. Creating a lab order still works for a visit without a consultation.
3. A consultation can have multiple lab orders.
4. A lab order still has multiple lab order items/tests.

### Do Not Do Yet

- Do not implement doctor return queue yet.
- Do not alter pharmacy or billing behavior.
- Do not create a large visit workspace.

### Expected Result Before Prompt 3

After this prompt, lab orders must know their originating consultation when one exists.

---

## Prompt 3 — Implement Lab Ordered And Lab Completed Workflow Transitions

### What Prompt 2 Should Have Implemented

Prompt 2 should have added `lab_orders.consultation_id` and relationships so laboratory requests preserve their originating consultation.

### Goal

When a doctor orders labs, the consultation should be paused/waiting for lab. When lab is complete, the same doctor's queue should receive a **Continue Consultation** item for the same consultation.

### Implement

1. Inspect `LabService`, `CompleteLabOrderAction`, `QueueService`, `VisitService`, `VisitStatus`, `QueueEntry`, and existing workflow tests.
2. Add or reuse visit statuses for `WAITING_FOR_LAB`, `LAB_IN_PROGRESS`, and `LAB_RESULTS_READY` using the existing status mechanism.
3. When a lab order is created from a consultation, transition the visit to `WAITING_FOR_LAB`.
4. When lab starts, transition the visit to `LAB_IN_PROGRESS` if appropriate.
5. When a lab order completes and all required items have results, transition the visit to `LAB_RESULTS_READY`.
6. Create or update a consultation queue item assigned to the lab order's originating doctor.
7. Store enough queue metadata to render next action as **Continue Consultation**.
8. Avoid creating duplicate active queue entries on repeated completion attempts.

### Tests Required

1. Doctor orders lab -> visit becomes waiting for lab.
2. Lab starts -> visit/lab state reflects in-progress work.
3. Lab completes -> visit becomes lab results ready.
4. Lab completes -> queue item appears for the same doctor.
5. The queue item points to the existing consultation.
6. Double lab completion does not create duplicate queue items.
7. Partial results do not return the visit to the doctor prematurely.

### Do Not Do Yet

- Do not redesign all queues.
- Do not build the full visit workspace.
- Do not change pharmacy or billing queues yet.

### Expected Result Before Prompt 4

After this prompt, the critical lab rule must be true: lab tests pause consultation, lab completion returns to the same doctor, and no second consultation is needed.

---

## Prompt 4 — Add Continue Consultation UX For Lab Return Patients

### What Prompt 3 Should Have Implemented

Prompt 3 should have implemented visit state transitions for lab ordering/completion and created a same-doctor consultation queue item with next action **Continue Consultation**.

### Goal

Make the doctor-facing UI clearly distinguish new consultations from lab-return continuation cases.

### Implement

1. Inspect consultation queue/index page, visit queue page, consultation create/edit/show pages, and relevant route definitions.
2. In the doctor queue, show lab-return patients with clear text: **Lab Results Ready**.
3. Render the primary action as **Continue Consultation** for lab-return patients.
4. Render the primary action as **Start Consultation** for new patients.
5. Ensure **Continue Consultation** opens the existing consultation record, not the create form.
6. Show completed lab results in the consultation workspace.

### Tests Required

1. Doctor queue renders **Start Consultation** for new consultation queue items.
2. Doctor queue renders **Continue Consultation** for lab-results-ready queue items.
3. Continue action opens the existing consultation.
4. Lab results are visible on the consultation screen.

### Do Not Do Yet

- Do not rewrite all navigation.
- Do not build billing/pharmacy queue handoffs.
- Do not redesign the complete visit workspace.

### Expected Result Before Prompt 5

After this prompt, doctors should be able to continue the same consultation after lab completion without manually searching for the patient.

---

## Prompt 5 — Automate Reception To Triage To Consultation Queue Flow

### What Prompt 4 Should Have Implemented

Prompt 4 should have made the doctor queue distinguish **Start Consultation** from **Continue Consultation** and should open the existing consultation for lab-return patients.

### Goal

Make reception and nursing workflow queue-driven.

### Implement

1. Inspect visit creation, triage screen, vitals capture, queue service, and existing triage queue tests.
2. On visit creation, set state to `WAITING_FOR_TRIAGE` and create a triage queue item.
3. When nurse starts triage, set state to `TRIAGE_IN_PROGRESS`.
4. When vitals/triage are submitted, complete the triage queue item.
5. Automatically create a consultation queue item and set state to `WAITING_FOR_CONSULTATION`.
6. Ensure cancelled/completed visits cannot enter triage or consultation queues.

### Tests Required

1. Visit creation creates triage queue work.
2. Triage completion removes active triage queue work.
3. Triage completion creates consultation queue work.
4. Cancelled visits cannot be queued.
5. Double-submit triage does not create duplicate consultation queue items.

### Do Not Do Yet

- Do not change lab workflow from previous prompts except to keep tests passing.
- Do not alter pharmacy or billing yet.

### Expected Result Before Prompt 6

After this prompt, reception-to-nurse-to-doctor handoff should be automatic and queue-driven.

---

## Prompt 6 — Integrate Pharmacy Queue With Visit State

### What Prompt 5 Should Have Implemented

Prompt 5 should have automated visit creation to triage queue and triage completion to consultation queue.

### Goal

Make prescription finalization and dispensing part of the visit workflow.

### Implement

1. Inspect prescription finalization, pharmacy index, dispensing action, visit status handling, and pharmacy tests.
2. When a prescription is finalized, set visit state to `WAITING_FOR_PHARMACY` when dispensing is required.
3. Treat finalized, undispensed prescriptions as pharmacy queue items with visit context.
4. After dispensing completes, remove the item from active pharmacy work.
5. If billing is required, transition visit to `WAITING_FOR_BILLING`.
6. Preserve existing inventory deduction and allergy/interaction safeguards.

### Tests Required

1. Finalized prescription appears in pharmacy queue.
2. Dispensed prescription disappears from pharmacy queue.
3. Dispensing transitions visit to billing-ready state when billables exist.
4. Dispensing does not break existing inventory deduction tests.

### Do Not Do Yet

- Do not redesign billing internals.
- Do not change medicine inventory architecture.

### Expected Result Before Prompt 7

After this prompt, pharmacists should work from a visit-aware dispensing queue and successful dispensing should hand the visit toward billing.

---

## Prompt 7 — Add Billing Queue And Payment-To-Completion Flow

### What Prompt 6 Should Have Implemented

Prompt 6 should have connected prescription finalization/dispensing to visit state and billing readiness.

### Goal

Make cashier workflow queue-driven and connect payment to visit completion readiness.

### Implement

1. Inspect billing controller, payment controller, invoice/payment models, billing service, payment service, and visit completion validator.
2. Add a billing queue or billing worklist derived from visits with billable items or unpaid invoices.
3. Show patient, visit number, amount due, invoice status, and next action.
4. Ensure payment recording updates invoice/payment status through existing services.
5. When payment is complete, set visit state to `PAID` or complete the visit if the existing validator allows it.
6. Do not bill undispensed medicines as dispensed if the existing data can distinguish dispensed quantity.

### Tests Required

1. Visit with billables appears in billing queue.
2. Visit with fully paid invoice leaves payment-required queue.
3. Payment updates visit state correctly.
4. Billing does not double-count lab or prescription items.
5. Existing invoice/payment tests still pass.

### Do Not Do Yet

- Do not overhaul insurance claims.
- Do not redesign pricing rules without explicit approval.

### Expected Result Before Prompt 8

After this prompt, cashiers should work from a billing queue and paid visits should be ready for completion.

---

## Prompt 8 — Build Visit Workspace Next Action Summary

### What Prompt 7 Should Have Implemented

Prompt 7 should have added billing queue behavior and payment-to-completion readiness.

### Goal

Make the visit page the central workspace for the full episode of care.

### Implement

1. Inspect visit show controller/page and existing components for patient safety, timeline, cards, badges, and queues.
2. Add a backend-computed next-action payload for each visit.
3. Show current visit state and primary next action at the top of the visit workspace.
4. Add sections for triage, consultation, laboratory, prescriptions, pharmacy status, billing, and payments.
5. Show only role-permitted actions.
6. Use user-facing workflow labels rather than internal status codes.

### Tests Required

1. Visit workspace exposes the correct next action for triage, consultation, lab results ready, pharmacy, billing, paid, completed, and cancelled states.
2. Unauthorized users cannot perform hidden backend actions directly.
3. Lab-return visit shows **Continue Consultation**.

### Do Not Do Yet

- Do not rebuild all page designs.
- Do not introduce a separate frontend state management framework.

### Expected Result Before Prompt 9

After this prompt, staff should be able to open a visit and immediately understand current status, context, and next action.

---

## Prompt 9 — Add Visit Timeline And Audit Visibility

### What Prompt 8 Should Have Implemented

Prompt 8 should have added a visit workspace next-action summary and role-permitted workflow actions.

### Goal

Expose a chronological visit timeline so staff can understand what happened without navigating across modules.

### Implement

1. Inspect existing activity/audit models and services.
2. Reuse existing audit/activity records if available.
3. Add meaningful timeline entries for visit creation, triage completion, consultation start, lab order, lab completion, consultation continuation, prescription finalization, dispensing, invoice generation, payment, and visit completion.
4. Render the timeline in the visit workspace.
5. Avoid adding a complex new audit framework if existing logging is sufficient.

### Tests Required

1. Important workflow transitions create timeline/audit entries.
2. Visit workspace renders timeline entries in chronological order.
3. Timeline entries include actor, action, visit, and timestamp where available.

### Do Not Do Yet

- Do not add external observability tools.
- Do not log sensitive clinical content unnecessarily.

### Expected Result Before Prompt 10

After this prompt, the visit workspace should answer: who did what, to which visit, and when.

---

## Prompt 10 — Harden Authorization, Edge Cases, And Concurrency

### What Prompt 9 Should Have Implemented

Prompt 9 should have added timeline/audit visibility for key workflow transitions.

### Goal

Make the workflow resilient for real hospital use.

### Implement

1. Inspect all workflow routes, controllers, requests, services, and tests.
2. Enforce backend authorization for role and assignment-sensitive actions.
3. Prevent cancelled and completed visits from re-entering active queues.
4. Add duplicate-submit protections for consultation start, lab order creation, lab completion, prescription finalization, dispensing, invoice generation, and payment recording.
5. Add authorized reassignment for doctor-unavailable lab-return cases if not already present.
6. Add concurrency-safe queue creation and state transitions where the current code is vulnerable.

### Tests Required

1. Unauthorized users cannot perform workflow actions by direct POST/PUT requests.
2. Cancelled visits cannot re-enter active queues.
3. Completed visits cannot re-enter active queues.
4. Double-submit does not duplicate consultations, lab orders, queue items, prescriptions, invoices, or payments.
5. Authorized doctor reassignment preserves consultation history.
6. Same-doctor continuation still passes.

### Final Acceptance Criteria

RoyalMed should satisfy the core workflow:

```text
Registration -> Triage Queue -> Consultation Queue -> Lab Queue
-> Same Doctor Continue Consultation -> Pharmacy Queue -> Billing Queue
-> Payment -> Visit Completed
```

The most important proof remains:

```text
Doctor orders lab
-> consultation is paused
-> lab completes
-> same doctor's queue receives the visit
-> doctor continues the same consultation
-> no duplicate consultation exists
```
