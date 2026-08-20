# Consultation → Prescription → Billing Flow Sequential Implementation Prompts

Use these prompts one at a time in separate AI sessions. Each prompt is intentionally scoped to reduce confusion and ensure proper implementation. Do not skip the repository inspection step in any session.

## How To Use These Prompts

1. Start with Prompt 1.
2. When Prompt 1 is completed, committed, and tested, start a new session with Prompt 2.
3. Each prompt states what should already exist from the prior prompt.
4. If a prior prompt was only partially completed, tell the AI exactly what is missing before continuing.
5. Every prompt requires tests before committing.
6. Do not allow the AI to rewrite unrelated modules.

---

## Prompt 1 — Add Consultation Completion Action And Intermediate State

### Context From Issues

The current consultation workflow has no way to complete a consultation without completing the entire visit. Doctors need a way to finish their consultation and transition the visit to the prescription phase while keeping the visit active for billing and other workflow steps.

### Goal

Add a consultation completion action that transitions the visit to an intermediate state, allowing prescription creation while maintaining visit continuity.

### Implement

1. Inspect `ConsultationController`, `VisitService`, `VisitStatusSeeder`, and existing consultation-related routes.
2. Add a new visit status `WAITING_FOR_PRESCRIPTION` to `VisitStatusSeeder`.
3. Add a `completeConsultation()` method to `ConsultationController` that:
   - Updates the visit status to `WAITING_FOR_PRESCRIPTION`
   - Logs the consultation completion in the visit timeline
   - Removes the consultation from active consultation queue
   - Redirects to the prescription creation page or visit workspace
4. Add a corresponding route in `routes/web.php` for the consultation completion action.
5. Update `VisitService` to handle consultation completion state transitions.
6. Ensure cancelled or completed visits cannot have consultations completed.

### Tests Required

1. Completing a consultation transitions visit to `WAITING_FOR_PRESCRIPTION` status.
2. Consultation completion is logged in visit timeline.
3. Consultation is removed from active consultation queue.
4. Cancelled visits cannot complete consultations.
5. Completed visits cannot complete consultations.
6. Doctor is redirected appropriately after consultation completion.

### Do Not Do Yet

- Do not add prescription finalization UI yet.
- Do not modify visit workspace next actions yet.
- Do not add workflow progression indicators yet.

### Expected Result Before Prompt 2

After this prompt, doctors should be able to complete a consultation and have the visit automatically transition to a state indicating prescription is the next step, with proper timeline logging and queue management.

---

## Prompt 2 — Add Prescription Finalization UI/Endpoint

### What Prompt 1 Should Have Implemented

Prompt 1 should have added the consultation completion action with `WAITING_FOR_PRESCRIPTION` status, proper state transitions, timeline logging, and queue management.

### Goal

Add the ability for doctors to finalize prescriptions from the UI, enabling automatic pharmacy queue creation and workflow progression.

### Implement

1. Inspect `PrescriptionController`, `FinalizePrescriptionAction`, existing prescription routes, and consultation UI.
2. Add a `finalize()` method to `PrescriptionController` that:
   - Calls the existing `FinalizePrescriptionAction`
   - Handles the response and redirects appropriately
   - Provides success/error feedback to the user
3. Add a corresponding route in `routes/web.php` for prescription finalization.
4. Update the consultation show page (`resources/js/pages/consultations/show.tsx`) to:
   - Add a "Finalize Prescription" button for draft prescriptions
   - Show prescription status indicators (draft vs finalized)
   - Disable finalize button for already finalized prescriptions
   - Show clear feedback after finalization
5. Ensure proper authorization checks for prescription finalization.
6. Update `PrescriptionService` to handle the finalization workflow through the controller.

### Tests Required

1. Doctor can finalize a prescription from the consultation UI.
2. Finalizing a prescription transitions visit to `WAITING_FOR_PHARMACY` status.
3. Finalizing a prescription creates a pharmacy queue entry.
4. Already finalized prescriptions cannot be finalized again.
5. Unauthorized users cannot finalize prescriptions.
6. Prescription finalization is logged in visit timeline.
7. Doctor is redirected appropriately after prescription finalization.

### Do Not Do Yet

- Do not modify visit workspace next actions yet.
- Do not add workflow progression indicators beyond prescription status.
- Do not add automatic navigation improvements yet.

### Expected Result Before Prompt 3

After this prompt, doctors should be able to finalize prescriptions from the consultation UI, triggering automatic pharmacy queue creation and proper state transitions, with clear visual feedback and status indicators.

---

## Prompt 3 — Improve Visit Workspace For Consultation Workflow

### What Prompt 2 Should Have Implemented

Prompt 2 should have added prescription finalization UI/endpoint with proper state transitions, pharmacy queue creation, and status indicators in the consultation interface.

### Goal

Update the visit workspace to provide accurate next actions for the consultation → prescription workflow and improve the overall workflow guidance.

### Implement

1. Inspect `Visit.php` model, `VisitController`, and visit workspace UI.
2. Update `Visit::getNextAction()` to:
   - Add proper handling for `WAITING_FOR_PRESCRIPTION` state (show "Create Prescription")
   - Add proper handling for prescription-related states
   - Include "Finalize Prescription" action when prescription is in draft state
   - Ensure all consultation workflow states have accurate next actions
3. Add a `completeConsultation()` method to `VisitService` that:
   - Handles the consultation completion workflow
   - Manages state transitions
   - Logs timeline activities
   - Handles queue management
4. Update the visit show page to display accurate next actions for consultation workflow.
5. Ensure the visit workspace shows the correct user-facing status for all consultation-related states.
6. Add prescription-related information to the visit workspace sections.

### Tests Required

1. Visit workspace shows "Create Prescription" for `WAITING_FOR_PRESCRIPTION` state.
2. Visit workspace shows "Finalize Prescription" when prescription is in draft state.
3. Visit workspace shows accurate next actions for all consultation workflow states.
4. Visit workspace shows correct user-facing status for intermediate states.
5. VisitService completeConsultation() method handles state transitions correctly.
6. Timeline logging works for consultation completion workflow.

### Do Not Do Yet

- Do not add workflow progression indicators in the UI yet.
- Do not add automatic navigation improvements yet.
- Do not modify the consultation page layout significantly.

### Expected Result Before Prompt 4

After this prompt, the visit workspace should provide accurate next actions and status information for the entire consultation → prescription workflow, with proper backend support for consultation completion.

---

## Prompt 4 — Add UI Workflow Guidance And Navigation Improvements

### What Prompt 3 Should Have Implemented

Prompt 3 should have updated the visit workspace with accurate next actions for consultation workflow, added consultation completion workflow methods, and improved status handling.

### Goal

Add visual workflow guidance and automatic navigation to make the consultation → prescription → billing flow seamless and intuitive for doctors.

### Implement

1. Inspect consultation UI pages (`resources/js/pages/consultations/`), prescription UI, and visit workspace.
2. Add workflow progression indicators to the consultation show page:
   - Visual stepper showing current position in workflow
   - Clear indication of completed vs pending steps
   - Highlight next required action
3. Improve automatic navigation:
   - After consultation completion, automatically navigate to prescription creation
   - After prescription finalization, show clear next step options
   - Add "Continue to [Next Step]" buttons with intelligent routing
4. Add clear next step indicators:
   - Prominent buttons for next required actions
   - Context-sensitive action suggestions
   - Warning indicators for missing required steps
5. Update the consultation edit page to include workflow context:
   - Show current workflow state
   - Provide action buttons for workflow progression
   - Add validation to prevent incomplete workflow states
6. Ensure consistent workflow guidance across all relevant pages.

### Tests Required

1. Consultation page shows accurate workflow progression indicators.
2. Consultation completion automatically navigates to prescription creation.
3. Prescription finalization shows clear next step options.
4. Next step buttons are context-appropriate and function correctly.
5. Workflow indicators update correctly as state changes.
6. Doctors can navigate the complete workflow without manual URL manipulation.
7. Missing required steps are clearly indicated in the UI.

### Do Not Do Yet

- Do not modify the pharmacy or billing workflows unless they directly affect consultation workflow.
- Do not add new workflow steps beyond the consultation → prescription → billing flow.

### Expected Result Before Prompt 5

After this prompt, doctors should have clear visual guidance and automatic navigation throughout the consultation → prescription → billing workflow, with intuitive workflow progression indicators and context-sensitive next actions.

---

## Prompt 5 — End-To-End Testing And Refinement

### What Prompt 4 Should Have Implemented

Prompt 4 should have added workflow progression indicators, automatic navigation, clear next step indicators, and consistent workflow guidance across consultation pages.

### Goal

Test the complete consultation → prescription → billing flow end-to-end and refine any remaining issues to ensure a seamless clinical workflow.

### Implement

1. Inspect the complete workflow from consultation start through billing.
2. Create comprehensive end-to-end tests that cover:
   - Complete consultation workflow with prescription creation
   - Complete consultation workflow with lab orders
   - Complete consultation workflow with both prescriptions and lab orders
   - Edge cases and error conditions
   - Authorization and permission checks throughout
3. Test the workflow with different user roles (doctor, nurse, pharmacist, cashier).
4. Verify timeline logging is complete and accurate throughout the workflow.
5. Test queue creation and removal at each workflow step.
6. Verify visit state transitions are correct at each step.
7. Test error handling and rollback scenarios.
8. Refine any UI/UX issues discovered during testing.
9. Ensure performance is acceptable for the complete workflow.
10. Add any missing validation or safeguards identified during testing.

### Tests Required

1. End-to-end test: Consultation → Prescription → Pharmacy → Billing → Payment → Complete
2. End-to-end test: Consultation → Lab → Continue Consultation → Prescription → Pharmacy → Billing
3. End-to-end test with both lab and prescription workflows
4. Test with different user roles and permissions
5. Test error scenarios (cancelled visits, failed payments, etc.)
6. Test concurrent workflow operations
7. Verify timeline completeness for all workflow variations
8. Performance testing for complete workflow
9. UI/UX testing for workflow intuitiveness
10. Authorization testing for all workflow endpoints

### Final Acceptance Criteria

The consultation → prescription → billing workflow should satisfy:

```text
Doctor starts consultation
→ Doctor completes consultation (automatic state transition)
→ Automatic navigation to prescription creation
→ Doctor creates prescription
→ Doctor finalizes prescription (automatic pharmacy queue)
→ Pharmacist dispenses prescription (automatic billing queue)
→ Cashier processes payment
→ Visit completes
```

Key success indicators:
- Doctors can complete the workflow without manual navigation
- Visit states accurately reflect workflow progress
- Timeline logging is complete and accurate
- Queue automation works at each step
- UI provides clear guidance throughout
- Error handling is robust
- Performance is acceptable
- All roles have appropriate access and permissions

### Expected Final Result

After this prompt, the consultation → prescription → billing workflow should be seamless, intuitive, and reliable for clinical use, with comprehensive test coverage and robust error handling.
