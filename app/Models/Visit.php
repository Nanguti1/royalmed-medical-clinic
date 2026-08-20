<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Visit extends Model
{
    use HasFactory;

    protected $fillable = ['patient_id', 'visit_date', 'visit_status_id', 'notes', 'receptionist_id', 'visit_number', 'started_at', 'completed_at', 'cancelled_at', 'started_by', 'completed_by', 'cancelled_by'];

    protected $casts = [
        'visit_date' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function status()
    {
        return $this->belongsTo(VisitStatus::class, 'visit_status_id');
    }

    public function vitalSign()
    {
        return $this->hasOne(VitalSign::class);
    }

    public function consultation()
    {
        return $this->hasOne(Consultation::class);
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }

    public function labOrders()
    {
        return $this->hasMany(LabOrder::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }

    public function queueEntry()
    {
        return $this->hasOne(QueueEntry::class);
    }

    public function receptionist()
    {
        return $this->belongsTo(User::class, 'receptionist_id');
    }

    public function startedBy()
    {
        return $this->belongsTo(User::class, 'started_by');
    }

    public function completedBy()
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    public function cancelledBy()
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function activityLogs()
    {
        return $this->morphMany(ActivityLog::class, 'auditable')->orderBy('created_at', 'asc');
    }

    public function getTimeline(): array
    {
        return $this->activityLogs->map(function ($log) {
            return [
                'id' => $log->id,
                'action' => $log->action,
                'description' => $this->getTimelineDescription($log->action, $log->meta),
                'actor' => $log->user ? $log->user->name : 'System',
                'timestamp' => $log->created_at->toISOString(),
                'meta' => $log->meta,
            ];
        })->toArray();
    }

    protected function getTimelineDescription(string $action, ?array $meta): string
    {
        return match ($action) {
            'visit.created' => 'Visit created',
            'visit.triage_started' => 'Triage started',
            'visit.triage_completed' => 'Triage completed',
            'visit.consultation_started' => 'Consultation started',
            'visit.consultation_completed' => 'Consultation completed',
            'visit.lab_ordered' => 'Lab tests ordered',
            'visit.lab_completed' => 'Lab results completed',
            'visit.prescription_finalized' => 'Prescription finalized',
            'visit.prescription_dispensed' => 'Medicines dispensed',
            'visit.invoice_generated' => 'Invoice generated',
            'visit.payment_recorded' => 'Payment recorded',
            'visit.paid' => 'Visit marked as paid',
            'visit.completed' => 'Visit completed',
            'visit.cancelled' => 'Visit cancelled',
            'consultation.reassigned' => 'Consultation reassigned to different provider',
            default => ucfirst(str_replace('.', ' ', $action)),
        };
    }

    public function logActivity(string $action, ?array $meta = null, ?int $userId = null): void
    {
        ActivityLog::create([
            'user_id' => $userId ?? Auth::id(),
            'action' => $action,
            'auditable_type' => self::class,
            'auditable_id' => $this->id,
            'meta' => $meta,
        ]);
    }

    public function isStarted(): bool
    {
        return ! is_null($this->started_at);
    }

    public function isCompleted(): bool
    {
        return ! is_null($this->completed_at);
    }

    public function isCancelled(): bool
    {
        return ! is_null($this->cancelled_at);
    }

    public function canStart(): bool
    {
        return ! $this->isStarted() && ! $this->isCompleted() && ! $this->isCancelled();
    }

    public function canComplete(): bool
    {
        return $this->isStarted() && ! $this->isCompleted() && ! $this->isCancelled();
    }

    public function canCancel(): bool
    {
        return ! $this->isCompleted() && ! $this->isCancelled();
    }

    public function getNextAction(): array
    {
        if (! $this->status) {
            return [
                'label' => 'Start Visit',
                'action' => 'start',
                'permission' => 'visits.update',
            ];
        }

        return match ($this->status->code) {
            'REGISTERED' => [
                'label' => 'Start Triage',
                'action' => 'triage',
                'permission' => 'visits.update',
            ],
            'WAITING_FOR_TRIAGE' => [
                'label' => 'Start Triage',
                'action' => 'triage',
                'permission' => 'visits.update',
            ],
            'TRIAGE_IN_PROGRESS' => [
                'label' => 'Complete Triage',
                'action' => 'complete_triage',
                'permission' => 'visits.update',
            ],
            'WAITING_FOR_CONSULTATION' => [
                'label' => 'Start Consultation',
                'action' => 'start_consultation',
                'permission' => 'consultations.create',
            ],
            'CONSULTATION_IN_PROGRESS' => [
                'label' => 'Complete Consultation',
                'action' => 'complete_consultation',
                'permission' => 'consultations.update',
            ],
            'WAITING_FOR_PRESCRIPTION' => [
                'label' => 'Create Prescription',
                'action' => 'create_prescription',
                'permission' => 'consultations.create',
            ],
            'WAITING_FOR_LAB' => [
                'label' => 'Process Lab Order',
                'action' => 'process_lab',
                'permission' => 'lab_orders.update',
            ],
            'LAB_IN_PROGRESS' => [
                'label' => 'Complete Lab Processing',
                'action' => 'complete_lab',
                'permission' => 'lab_orders.update',
            ],
            'LAB_RESULTS_READY' => [
                'label' => 'Continue Consultation',
                'action' => 'continue_consultation',
                'permission' => 'consultations.update',
            ],
            'WAITING_FOR_PHARMACY' => [
                'label' => 'Process Prescription',
                'action' => 'process_pharmacy',
                'permission' => 'pharmacy.update',
            ],
            'WAITING_FOR_BILLING' => [
                'label' => 'Process Payment',
                'action' => 'process_payment',
                'permission' => 'billing.update',
            ],
            'PAID' => [
                'label' => 'Complete Visit',
                'action' => 'complete_visit',
                'permission' => 'visits.update',
            ],
            'VISIT_COMPLETED' => [
                'label' => 'Visit Completed',
                'action' => null,
                'permission' => null,
            ],
            'CANCELLED' => [
                'label' => 'Visit Cancelled',
                'action' => null,
                'permission' => null,
            ],
            default => [
                'label' => 'Unknown Status',
                'action' => null,
                'permission' => null,
            ],
        };
    }

    public function getUserFacingStatus(): string
    {
        if (! $this->status) {
            return 'Unknown';
        }

        return match ($this->status->code) {
            'REGISTERED' => 'Registered',
            'WAITING_FOR_TRIAGE' => 'Waiting for Triage',
            'TRIAGE_IN_PROGRESS' => 'Triage in Progress',
            'WAITING_FOR_CONSULTATION' => 'Waiting for Consultation',
            'CONSULTATION_IN_PROGRESS' => 'Consultation in Progress',
            'WAITING_FOR_PRESCRIPTION' => 'Waiting for Prescription',
            'WAITING_FOR_LAB' => 'Waiting for Lab Results',
            'LAB_IN_PROGRESS' => 'Lab Processing',
            'LAB_RESULTS_READY' => 'Lab Results Ready',
            'WAITING_FOR_PHARMACY' => 'Waiting for Pharmacy',
            'WAITING_FOR_BILLING' => 'Waiting for Payment',
            'PAID' => 'Paid',
            'VISIT_COMPLETED' => 'Completed',
            'CANCELLED' => 'Cancelled',
            default => $this->status->name,
        };
    }
}
