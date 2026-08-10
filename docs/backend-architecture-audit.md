# Backend Architecture Audit — Royalmed Medical Clinic

**Audit Date:** 2026-08-10  
**Audit Type:** Read-only architecture inspection  
**Scope:** Database, Models, Business Logic, Security, Transactions, Workflow

---

# Executive Summary

Overall architecture rating:

```
Database: 7/10
Models & Relationships: 8/10
Controllers: 9/10
Form Requests: 8/10
Services: 8/10
Actions: 7/10
Concerns: 9/10
Transactions: 7/10
Inventory: 6/10
Billing: 7/10
Payments: 6/10
Authorization: 8/10
Overall: 7.3/10
```

**Summary:** The Royalmed backend demonstrates a solid foundation with clean architecture patterns, proper separation of concerns, and good use of Laravel best practices. The application follows the Service-Action pattern appropriately, uses Spatie permissions correctly, and has well-structured controllers. However, there are several critical areas that need attention before frontend development, particularly around inventory logic (FEFO vs FIFO), payment validation, state transition enforcement, and concurrency safeguards.

---

# Database Findings

| Severity | Area | Finding | Evidence | Recommendation |
|---|---|---|---|---|
| **High** | Queue Entries | Queue status uses string without enum constraint | `queue_entries.status` is `string('waiting')` with no FK to reference table | Add `queue_statuses` reference table or use PHP Enum with validation |
| **High** | Lab Orders | Lab order status uses string without enum constraint | `lab_orders.status` is `string('requested')` with no FK to reference table | Add `lab_order_statuses` reference table or use PHP Enum |
| **High** | Lab Order Items | Lab order item status uses string without enum constraint | `lab_order_items.status` is `string('pending')` with no FK to reference table | Add `lab_order_item_statuses` reference table or use PHP Enum |
| **Medium** | M-Pesa Transactions | Missing relationship to invoice/payment context | `mpesa_transactions` has no `invoice_id` or `payment_id` FK | Add `payment_id` FK for audit trail (reverse relationship exists) |
| **Medium** | Visit Status | Missing visit status seeder/data | `visit_statuses` table exists but no seeder to populate valid states | Add seeder with states: registered, triage, consultation, dispensing, billing, completed, cancelled |
| **Medium** | Invoice Status | Missing invoice status seeder/data | `invoice_statuses` table exists but no seeder to populate valid states | Add seeder with states: draft, issued, partial, paid, overdue, cancelled |
| **Low** | Prescription Items | Missing check constraint for dispensed ≤ quantity | No database constraint preventing `dispensed_quantity > quantity` | Add application-level validation in Actions |
| **Low** | Visit Number | Nullable but should be required | `visits.visit_number` is `nullable()->unique()` | Make required after seeder implements auto-generation |
| **Low** | Prescription Number | Nullable but should be required | `prescriptions.prescription_number` is `nullable()->unique()` | Make required after seeder implements auto-generation |
| **Low** | Indexes | Missing composite indexes for common queries | No index on `(patient_id, visit_date)` for visit history queries | Add composite index for frequently queried columns |

---

# Model & Relationship Findings

| Severity | Area | Finding | Evidence | Recommendation |
|---|---|---|---|---|
| **Medium** | Consultation | Missing inverse relationship to Visit | `Consultation` has `belongsTo(Visit)` but `Visit` relationship is correct | No change needed - relationship is correct |
| **Medium** | Diagnosis | Missing model relationship to Visit | `Diagnosis` only relates to `Consultation`, cannot be queried from Visit | Add `through('consultation')` relationship if needed for queries |
| **Medium** | Lab Results | Missing relationship to LabOrder | `LabResult` only relates to `LabOrderItem`, no direct path to `LabOrder` | Add `through('orderItem')` relationship if needed |
| **Low** | Clinical Notes | Missing relationship to Patient | Cannot query patient clinical notes directly | Add `through('visit')` relationship if needed |
| **Low** | Visit | Missing relationship to Receptionist | `receptionist_id` exists but no relationship defined | Add `belongsTo(User::class, 'receptionist_id')` |
| **Low** | Visit | Missing relationship to VisitStatus | `visit_status_id` exists but no relationship defined | Add `belongsTo(VisitStatus::class)` |
| **Low** | Consultation | Missing relationship to Provider | `provider_id` exists but no relationship defined | Add `belongsTo(User::class, 'provider_id')` |
| **Low** | Queue Entry | Missing composite unique constraint validation | Database has unique constraint but model doesn't enforce | Add validation in Form Request |

---

# Business Logic Findings

## Controllers

| Severity | Controller | Method | Problem | Recommendation |
|---|---|---|---|---|
| **Low** | QueueController | store | Inline validation instead of Form Request | Create dedicated Form Request for queue operations |
| **Low** | QueueController | index | Missing eager loading | Eager load `visit.patient` relationship |
| **Low** | PatientController | destroy | Missing authorization check | Add permission check or policy |

**Overall Assessment:** Controllers are lean and well-structured. They correctly delegate to Services and Actions. No fat controllers identified.

## Form Requests

| Severity | Form Request | Problem | Evidence | Recommendation |
|---|---|---|---|---|
| **Medium** | CreateInvoiceRequest | Accepts client-supplied calculated totals | `items.*.total_price` is required from client | Remove `total_price` from validation; calculate server-side |
| **Medium** | StorePaymentRequest | Missing invoice status validation | No check if invoice is already paid | Add custom validation rule to prevent overpayment |
| **Low** | CreateVisitRequest | Missing visit status validation | No validation for initial visit status | Add default status or validate against allowed states |
| **Low** | DispensePrescriptionRequest | Missing prescription finalized check | No validation that prescription is finalized before dispensing | Add custom validation rule |

**Overall Assessment:** Form Requests properly handle authorization and validation. Some business validation should move to Actions/Services.

## Services

| Severity | Service | Problem | Evidence | Recommendation |
|---|---|---|---|---|
| **High** | BillingService | Duplicate status refresh logic | Status calculation duplicated in `refreshStatus` and `PaymentService` | Extract to shared `InvoiceStatusService` or Action |
| **High** | PaymentService | Duplicate status refresh logic | Same status calculation as `BillingService` | Consolidate into single source of truth |
| **Medium** | InventoryService | FIFO instead of FEFO for pharmaceuticals | Orders by `expiry_date ASC` but doesn't check for expired stock | Add explicit expiry check before allocation |
| **Medium** | InventoryService | No row locking for concurrent deductions | Multiple users could deduct same stock simultaneously | Add `lockForUpdate()` on batch queries |
| **Medium** | PatientService | Search missing eager loading | Search returns patients without relationships | Eager load common relationships (county, gender) |
| **Low** | VisitService | Missing visit status updates | Actions update timestamps but not visit_status_id | Add status transitions in Actions |

**Overall Assessment:** Services are well-scoped and properly use transactions. Some duplication exists around invoice status management.

## Actions

| Severity | Action | Problem | Evidence | Recommendation |
|---|---|---|---|---|
| **High** | DispensePrescriptionAction | Circular dependency on InventoryService | Action injects Service which injects other Actions | Refactor to use StockMovementAction directly |
| **Medium** | CalculateInvoiceTotalsAction | Trusts client-supplied item totals | Uses `item->total_price` from database but client could have set it | Always recalculate from `quantity * unit_price` |
| **Medium** | CompleteVisitAction | No validation of visit completion prerequisites | Only checks if already completed, not if workflow complete | Add validation for required steps (billing, etc.) |
| **Medium** | StartVisitAction | Missing visit status transition | Only sets timestamp, doesn't update visit_status_id | Add status transition logic |
| **Low** | RecordPaymentAction | No validation of payment amount vs invoice due | Allows overpayment without checks | Add validation in Action or Service |
| **Low** | CreateVisitAction | Missing queue entry creation | Visit creation doesn't automatically add to queue | Consider adding queue entry in Action or Service |

**Overall Assessment:** Actions are focused and single-purpose. Some missing validation and circular dependency need attention.

## Concerns

| Severity | Concern | Problem | Evidence | Recommendation |
|---|---|---|---|---|
| **Low** | PasswordValidationRules | Fortify-specific, not reusable | Only used in Fortify context | Keep as-is - appropriate for its purpose |
| **Low** | ProfileValidationRules | Fortify-specific, not reusable | Only used in Fortify context | Keep as-is - appropriate for its purpose |

**Overall Assessment:** Concerns are appropriately scoped and not abused. No god traits identified.

## Exceptions

| Severity | Exception | Problem | Evidence | Recommendation |
|---|---|---|---|---|
| **Low** | InsufficientStockException | No custom message or error code | Generic exception without context | Add contextual error messages |
| **Low** | VisitAlreadyCompletedException | No custom message or error code | Generic exception without context | Add contextual error messages |
| **Low** | InvoiceAlreadyPaidException | Defined but never used | Exception exists but not thrown in code | Implement usage in PaymentService |

**Overall Assessment:** Custom exceptions are appropriate but underutilized. Should be used more consistently for business rule violations.

---

# Workflow Findings

Complete clinical workflow assessment:

```
Registration ✅ Complete
   ↓
Triage/Vitals ✅ Complete
   ↓
Queue ⚠️ Partial (missing status transitions)
   ↓
Consultation ✅ Complete
   ↓
Diagnosis ⚠️ Partial (no dedicated workflow support)
   ↓
Prescription ✅ Complete
   ↓
Laboratory ✅ Complete
   ↓
Pharmacy/Dispensing ⚠️ Partial (FEFO not enforced)
   ↓
Billing ✅ Complete
   ↓
Payment ⚠️ Partial (missing overpayment protection)
   ↓
Completion ✅ Complete
```

**Workflow Gaps:**
1. Queue status transitions not enforced
2. Diagnosis has no dedicated workflow state management
3. Inventory uses FIFO instead of pharmaceutical-standard FEFO
4. Payment allows overpayment without safeguards
5. Visit completion doesn't validate workflow prerequisites

---

# Critical Issues

These issues **must be fixed before frontend development**:

1. **Payment Overpayment Risk** - `PaymentService` allows recording payments that exceed invoice due amount without validation
2. **Inventory Concurrency** - `InventoryService::deduct()` lacks row locking, allowing concurrent stock deduction race conditions
3. **FEFO Not Enforced** - Inventory uses FIFO instead of First-Expiry-First-Out, risking expired medicine dispensing
4. **Missing State Transitions** - Queue, Lab Order, and Prescription statuses use raw strings without enforced transitions
5. **Client-Supplied Calculated Values** - `CreateInvoiceRequest` accepts `total_price` from client instead of calculating server-side
6. **Duplicate Status Logic** - Invoice status calculation duplicated between `BillingService` and `PaymentService`

---

# High Priority Issues

These issues **should preferably be fixed before frontend development**:

1. **Missing Database Indexes** - Composite indexes missing for common query patterns
2. **Missing Relationship Inverses** - Several models missing inverse relationships for efficient querying
3. **M-Pesa Audit Trail** - Missing direct relationship from M-Pesa transaction to invoice for auditing
4. **Visit Completion Validation** - `CompleteVisitAction` doesn't validate that all required workflow steps are complete
5. **Prescription Finalization Check** - Can dispense prescriptions that aren't finalized
6. **Visit Status Not Updated** - Visit status ID not updated during state transitions
7. **Missing Seeders** - Visit statuses and invoice statuses tables exist but no seeders populate them
8. **Exception Underutilization** - Custom exceptions defined but not consistently used

---

# Medium / Low Priority

Non-blocking improvements:

1. **Clinical Notes Query Path** - Add through-relationships for common query patterns
2. **Queue Form Request** - Replace inline validation with dedicated Form Request
3. **Patient Search Optimization** - Add eager loading to search results
4. **Prescription Number Required** - Make prescription_number non-nullable after implementing generation
5. **Visit Number Required** - Make visit_number non-nullable after implementing generation
6. **Controller Authorization** - Add missing authorization checks to destroy methods
7. **Exception Context** - Add contextual error messages to custom exceptions
8. **Number Generation Race Condition** - `NumberGenerator` could generate duplicates under high concurrency

---

# Recommended Architecture

The current architecture is largely sound. Recommended target architecture:

```
HTTP Request
 ↓
Form Request (validation + authorization)
 ↓
Controller (thin orchestration)
 ↓
Service (workflow orchestration + transactions)
 ↓
Action (single business operation)
 ↓
Model (persistence + relationships)
 ↓
MySQL (data storage + constraints)
```

**Recommended Changes:**
1. Extract shared `InvoiceStatusCalculator` to eliminate duplication
2. Add `StockAllocationService` to handle FEFO logic with row locking
3. Add `StateMachine` trait or dedicated State Transition Actions
4. Implement `Policy` classes for complex authorization logic
5. Add `Domain Events` for state transitions (partially implemented)

---

# Target Domain Map

Recommended relationships:

```
Patient
 ├── hasMany Visits
 ├── hasMany EmergencyContacts
 ├── hasMany PatientIdentifiers
 ├── belongsTo Gender
 ├── belongsTo County
 └── belongsTo SubCounty

Visit
 ├── belongsTo Patient
 ├── belongsTo VisitStatus
 ├── belongsTo User (receptionist)
 ├── hasOne VitalSign
 ├── hasOne Consultation
 ├── hasMany Prescriptions
 ├── hasMany LabOrders
 ├── hasOne Invoice
 ├── hasOne QueueEntry
 └── hasMany ClinicalNotes

VitalSign
 └── belongsTo Visit

Consultation
 ├── belongsTo Visit
 ├── belongsTo User (provider)
 ├── hasMany Diagnoses
 └── hasMany Prescriptions

Diagnosis
 └── belongsTo Consultation

Prescription
 ├── belongsTo Visit
 ├── belongsTo User (prescribed_by)
 ├── hasMany PrescriptionItems
 └── belongsTo Consultation (optional inverse)

PrescriptionItem
 ├── belongsTo Prescription
 ├── belongsTo Medicine
 ├── belongsTo DosageUnit
 ├── belongsTo Frequency
 ├── belongsTo Route
 └── belongsTo DurationUnit

Medicine
 ├── belongsTo MedicineCategory
 ├── belongsTo MedicineForm
 ├── belongsTo MedicineStrength
 ├── hasMany InventoryBatches
 ├── hasMany PrescriptionItems
 └── hasMany StockMovements

InventoryBatch
 ├── belongsTo Medicine
 ├── belongsTo Supplier
 ├── hasMany StockMovements
 └── belongsTo Purchase (inverse relationship missing)

StockMovement
 ├── belongsTo Medicine
 ├── belongsTo InventoryBatch
 ├── belongsTo User
 └── morphTo reference

LabOrder
 ├── belongsTo Visit
 ├── belongsTo User (ordered_by)
 ├── belongsTo LabOrderStatus (missing)
 └── hasMany LabOrderItems

LabOrderItem
 ├── belongsTo LabOrder
 ├── belongsTo LabTest
 ├── belongsTo LabOrderItemStatus (missing)
 └── hasOne LabResult

LabResult
 ├── belongsTo LabTest
 ├── belongsTo LabOrderItem
 └── belongsTo User (recorded_by)

Invoice
 ├── belongsTo Visit
 ├── belongsTo InvoiceStatus
 ├── hasMany InvoiceItems
 └── hasMany Payments

InvoiceItem
 └── belongsTo Invoice

Payment
 ├── belongsTo Invoice
 ├── belongsTo PaymentMethod
 ├── belongsTo MpesaTransaction
 └── belongsTo User (recorded_by - missing)

MpesaTransaction
 ├── hasOne Payment
 └── belongsTo Invoice (missing for audit trail)

User
 ├── hasMany Visits (as receptionist)
 ├── hasMany Consultations (as provider)
 ├── hasMany LabOrders (as ordered_by)
 ├── hasMany LabResults (as recorded_by)
 ├── hasMany Payments (as recorded_by - missing)
 ├── hasMany StockMovements
 └── morphMany ActivityLogs

QueueEntry
 ├── belongsTo Visit
 └── belongsTo QueueStatus (missing)

ActivityLog
 ├── belongsTo User
 └── morphTo auditable
```

---

# Frontend Readiness Assessment

**Answer:** `NOT READY`

**Why:**

The backend is **NOT READY** for Inertia + React frontend development due to the following critical issues:

1. **Payment Safety** - The payment system allows overpayments and lacks proper validation, which could lead to financial inconsistencies
2. **Inventory Race Conditions** - Concurrent stock deductions are not protected with row locks, risking negative stock in production
3. **State Management** - Critical workflows (queue, lab orders, prescriptions) use raw string statuses without enforced transitions
4. **Data Integrity** - Client-supplied calculated values are trusted instead of being recalculated server-side
5. **Missing Audit Trail** - M-Pesa transactions lack direct invoice relationship for complete auditability

These issues represent financial and data integrity risks that should be resolved before exposing the system to frontend users. The architecture is sound, but these business logic safeguards must be implemented.

---

# Prioritized Remediation Plan

## Phase A — Must Fix Before Frontend

### 1. Payment Overpayment Protection
**Issue:** `PaymentService` allows payments exceeding invoice due amount  
**Why it matters:** Financial data integrity, prevents duplicate/overpayment scenarios  
**Affected files:** `app/Services/PaymentService.php`, `app/Http/Requests/StorePaymentRequest.php`  
**Recommended solution:** 
- Add validation in `StorePaymentRequest` to check payment amount ≤ remaining balance
- Add check in `PaymentService` before recording payment
- Throw `InvoiceAlreadyPaidException` if already paid  
**Priority:** Critical

### 2. Inventory Concurrency Protection
**Issue:** `InventoryService::deduct()` lacks row locking for concurrent stock deduction  
**Why it matters:** Prevents race conditions where multiple users deduct same stock  
**Affected files:** `app/Services/InventoryService.php`  
**Recommended solution:**
- Add `lockForUpdate()` to batch queries in `deduct()` method
- Consider using database-level `FOR UPDATE` locks
- Add retry logic for deadlock scenarios  
**Priority:** Critical

### 3. Implement FEFO for Pharmaceutical Inventory
**Issue:** Current FIFO implementation doesn't prioritize expiry dates for pharmaceuticals  
**Why it matters:** Regulatory compliance, prevents expired medicine dispensing  
**Affected files:** `app/Services/InventoryService.php`  
**Recommended solution:**
- Change ordering to prioritize nearest expiry date
- Add explicit check to skip expired batches even if they have quantity
- Add warning when stock is approaching expiry  
**Priority:** Critical

### 4. Enforce State Transitions
**Issue:** Queue, Lab Order, and Prescription statuses use raw strings without enforced transitions  
**Why it matters:** Prevents invalid state changes, ensures workflow integrity  
**Affected files:** 
- `database/migrations/` (add status reference tables)
- `app/Services/QueueService.php`, `app/Services/LabService.php`, `app/Services/PrescriptionService.php`
- Create `app/Services/StateTransitionService.php`  
**Recommended solution:**
- Create reference tables for valid statuses
- Implement state machine pattern with allowed transitions
- Add validation before each state change  
**Priority:** Critical

### 5. Server-Side Calculation of Invoice Totals
**Issue:** `CreateInvoiceRequest` accepts client-supplied `total_price` values  
**Why it matters:** Prevents manipulation of financial calculations  
**Affected files:** `app/Http/Requests/CreateInvoiceRequest.php`, `app/Actions/Billing/CalculateInvoiceTotalsAction.php`  
**Recommended solution:**
- Remove `total_price` from Form Request validation
- Always calculate `total_price = quantity * unit_price` server-side
- Add validation to ensure client-supplied values match calculated values (or ignore them)  
**Priority:** Critical

### 6. Consolidate Invoice Status Logic
**Issue:** Duplicate status calculation in `BillingService` and `PaymentService`  
**Why it matters:** Single source of truth for invoice status, prevents inconsistencies  
**Affected files:** `app/Services/BillingService.php`, `app/Services/PaymentService.php`  
**Recommended solution:**
- Extract to `app/Services/InvoiceStatusService.php`
- Create `app/Actions/Billing\RefreshInvoiceStatusAction.php`
- Consume from both services  
**Priority:** Critical

## Phase B — Should Fix Before Frontend

### 7. Add Database Indexes
**Issue:** Missing composite indexes for common query patterns  
**Why it matters:** Performance optimization for production workload  
**Affected files:** `database/migrations/`  
**Recommended solution:**
- Add index on `(patient_id, visit_date)` for visits table
- Add index on `(medicine_id, expiry_date)` for inventory_batches
- Add index on `(invoice_id, paid_at)` for payments  
**Priority:** High

### 8. Implement Missing Seeders
**Issue:** Visit statuses and invoice statuses tables exist but no seeders  
**Why it matters:** Provides valid reference data for state transitions  
**Affected files:** `database/seeders/`  
**Recommended solution:**
- Create `VisitStatusSeeder` with states: registered, triage, consultation, dispensing, billing, completed, cancelled
- Create `InvoiceStatusSeeder` with states: draft, issued, partial, paid, overdue, cancelled
- Add to `DatabaseSeeder`  
**Priority:** High

### 9. Add M-Pesa Invoice Relationship
**Issue:** M-Pesa transactions lack direct invoice relationship for audit trail  
**Why it matters:** Complete auditability of payment flow  
**Affected files:** `database/migrations/2026_08_06_000600_create_billing_tables.php`  
**Recommended solution:**
- Add `invoice_id` FK to `mpesa_transactions` table
- Update `MpesaTransaction` model relationship  
**Priority:** High

### 10. Validate Visit Completion Prerequisites
**Issue:** `CompleteVisitAction` doesn't validate workflow completion  
**Why it matters:** Prevents premature visit completion  
**Affected files:** `app/Actions/Visits/CompleteVisitAction.php`  
**Recommended solution:**
- Add validation: billing complete, prescriptions dispensed (if any), lab results recorded (if ordered)
- Throw exception if prerequisites not met  
**Priority:** High

### 11. Add Prescription Finalization Check
**Issue:** Can dispense prescriptions that aren't finalized  
**Why it matters:** Ensures prescription is approved before dispensing  
**Affected files:** `app/Http/Requests/DispensePrescriptionRequest.php`  
**Recommended solution:**
- Add custom validation rule to check `finalized_at` is not null
- Add check in `DispensePrescriptionAction`  
**Priority:** High

### 12. Update Visit Status on Transitions
**Issue:** Visit status ID not updated during state transitions  
**Why it matters:** Accurate visit tracking throughout workflow  
**Affected files:** `app/Actions/Visits/StartVisitAction.php`, `app/Actions/Visits/CompleteVisitAction.php`  
**Recommended solution:**
- Add status transition logic in each visit state Action
- Map timestamps to appropriate status codes  
**Priority:** High

## Phase C — Can Be Implemented After Frontend

### 13. Add Missing Model Relationships
**Issue:** Several models missing inverse relationships  
**Why it matters:** Developer experience, query efficiency  
**Affected files:** Multiple model files  
**Recommended solution:**
- Add missing inverse relationships identified in audit
- Add through-relationships for common query patterns  
**Priority:** Medium

### 14. Create Dedicated Queue Form Request
**Issue:** `QueueController::store` uses inline validation  
**Why it matters:** Consistency, maintainability  
**Affected files:** `app/Http/Controllers/QueueController.php`  
**Recommended solution:**
- Create `StoreQueueEntryRequest.php`
- Move validation rules to Form Request  
**Priority:** Medium

### 15. Implement Custom Exception Usage
**Issue:** Custom exceptions defined but not consistently used  
**Why it matters:** Better error handling, API consistency  
**Affected files:** Multiple Service and Action files  
**Recommended solution:**
- Use `InvoiceAlreadyPaidException` in payment validation
- Add contextual messages to all custom exceptions  
**Priority:** Medium

### 16. Add Eager Loading to Search
**Issue:** Patient search doesn't eager load relationships  
**Why it matters:** Performance optimization  
**Affected files:** `app/Services/PatientService.php`  
**Recommended solution:**
- Add `with(['county', 'gender'])` to search query  
**Priority:** Low

### 17. Make Generated Numbers Required
**Issue:** `visit_number` and `prescription_number` are nullable  
**Why it matters:** Data consistency  
**Affected files:** Database migrations  
**Recommended solution:**
- Make fields non-nullable after confirming generation works
- Add validation to ensure numbers are generated  
**Priority:** Low

## Phase D — Future Enhancements

### 18. Implement Number Generation Race Condition Protection
**Issue:** `NumberGenerator` could generate duplicates under high concurrency  
**Why it matters:** Data integrity under high load  
**Affected files:** `app/Support/Generators/NumberGenerator.php`  
**Recommended solution:**
- Use database sequences or atomic counters
- Add unique constraint with retry logic  
**Priority:** Future

### 19. Add Diagnosis Workflow Support
**Issue:** Diagnosis has no dedicated workflow state management  
**Why it matters:** Clinical workflow completeness  
**Affected files:** New models/services  
**Recommended solution:**
- Consider adding diagnosis status tracking
- Implement ICD-10 code validation  
**Priority:** Future

### 20. Implement Policies for Complex Authorization
**Issue:** Complex authorization logic in controllers  
**Why it matters:** Clean separation of concerns  
**Affected files:** `app/Policies/`  
**Recommended solution:**
- Create Policy classes for complex authorization scenarios
- Move authorization logic from controllers to policies  
**Priority:** Future

### 21. Add Domain Events for State Transitions
**Issue:** Events exist but not consistently used for all state transitions  
**Why it matters:** Extensibility, audit trail, integration points  
**Affected files:** `app/Events/`  
**Recommended solution:**
- Add events for all major state transitions
- Consider event sourcing for audit trail  
**Priority:** Future

### 22. Implement Soft Deletes for Additional Tables
**Issue:** Some tables lack soft deletes where it might be useful  
**Why it matters:** Data recovery, audit trail  
**Affected files:** Database migrations  
**Recommended solution:**
- Evaluate which tables would benefit from soft deletes
- Add to migrations where appropriate  
**Priority:** Future

---

**End of Audit Report**

This audit was conducted as a read-only inspection. No code was modified during this process. All recommendations should be reviewed and prioritized based on business requirements and timeline constraints.
