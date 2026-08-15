<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\DentalAttachment;
use App\Models\DentalChart;
use App\Models\DentalNote;
use App\Models\DentalProcedure;
use App\Models\DentalTooth;
use App\Models\DentalTreatmentItem;
use App\Models\DentalTreatmentPlan;
use Illuminate\Support\Facades\DB;

class DentalService
{
    public function createDentalChart(array $data): DentalChart
    {
        return DentalChart::create([
            'patient_id' => $data['patient_id'],
            'dentist_id' => $data['dentist_id'] ?? null,
            'visit_id' => $data['visit_id'] ?? null,
            'chart_date' => $data['chart_date'] ?? now(),
            'chief_complaint' => $data['chief_complaint'] ?? null,
            'medical_history' => $data['medical_history'] ?? null,
            'dental_history' => $data['dental_history'] ?? null,
            'oral_hygiene' => $data['oral_hygiene'] ?? null,
            'periodontal_status' => $data['periodontal_status'] ?? null,
            'findings' => $data['findings'] ?? null,
            'notes' => $data['notes'] ?? null,
            'created_by' => $data['created_by'] ?? auth()->id(),
        ]);
    }

    public function createTreatmentPlan(array $data): DentalTreatmentPlan
    {
        return DB::transaction(function () use ($data) {
            $plan = DentalTreatmentPlan::create([
                'patient_id' => $data['patient_id'],
                'dentist_id' => $data['dentist_id'] ?? null,
                'dental_chart_id' => $data['dental_chart_id'] ?? null,
                'plan_date' => $data['plan_date'] ?? now(),
                'status' => 'draft',
                'estimated_cost' => 0,
                'notes' => $data['notes'] ?? null,
                'created_by' => $data['created_by'] ?? auth()->id(),
            ]);

            if (isset($data['treatment_items'])) {
                foreach ($data['treatment_items'] as $item) {
                    $this->addTreatmentItem($plan, $item);
                }
                $plan->updateEstimatedCost();
            }

            return $plan;
        });
    }

    public function addTreatmentItem(DentalTreatmentPlan $plan, array $data): DentalTreatmentItem
    {
        $procedure = DentalProcedure::findOrFail($data['dental_procedure_id']);

        $item = $plan->treatmentItems()->create([
            'dental_procedure_id' => $data['dental_procedure_id'],
            'tooth_number' => $data['tooth_number'] ?? null,
            'tooth_surface' => $data['tooth_surface'] ?? null,
            'description' => $data['description'] ?? $procedure->name,
            'cost' => $data['cost'] ?? $procedure->base_cost,
            'status' => 'pending',
            'scheduled_date' => $data['scheduled_date'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        $plan->updateEstimatedCost();

        return $item;
    }

    public function activateTreatmentPlan(DentalTreatmentPlan $plan): void
    {
        DB::transaction(function () use ($plan) {
            $plan->activate();
        });
    }

    public function completeTreatmentItem(DentalTreatmentItem $item): void
    {
        DB::transaction(function () use ($item) {
            $item->complete();
            $item->treatmentPlan->updateEstimatedCost();
        });
    }

    public function completeTreatmentPlan(DentalTreatmentPlan $plan): void
    {
        DB::transaction(function () use ($plan) {
            $plan->complete();
        });
    }

    public function createDentalNote(array $data): DentalNote
    {
        return DentalNote::create([
            'patient_id' => $data['patient_id'],
            'dentist_id' => $data['dentist_id'] ?? null,
            'visit_id' => $data['visit_id'] ?? null,
            'treatment_plan_id' => $data['treatment_plan_id'] ?? null,
            'note_date' => $data['note_date'] ?? now(),
            'clinical_notes' => $data['clinical_notes'],
            'treatment_performed' => $data['treatment_performed'] ?? null,
            'prescriptions' => $data['prescriptions'] ?? null,
            'follow_up_instructions' => $data['follow_up_instructions'] ?? null,
            'created_by' => $data['created_by'] ?? auth()->id(),
        ]);
    }

    public function addToothCondition(DentalTooth $tooth, string $condition): void
    {
        $tooth->addCondition($condition);
    }

    public function extractTooth(DentalTooth $tooth): void
    {
        $tooth->extract();
    }

    public function createDentalAttachment(array $data): DentalAttachment
    {
        return DentalAttachment::create([
            'patient_id' => $data['patient_id'],
            'dental_chart_id' => $data['dental_chart_id'] ?? null,
            'dental_note_id' => $data['dental_note_id'] ?? null,
            'attachment_type' => $data['attachment_type'] ?? 'xray',
            'file_path' => $data['file_path'],
            'file_name' => $data['file_name'],
            'file_type' => $data['file_type'],
            'file_size' => $data['file_size'],
            'mime_type' => $data['mime_type'],
            'description' => $data['description'] ?? null,
        ]);
    }

    public function getPatientDentalHistory(int $patientId)
    {
        return DentalChart::byPatient($patientId)
            ->with(['teeth', 'dentist'])
            ->orderBy('chart_date', 'desc')
            ->get();
    }

    public function getActiveTreatmentPlans(int $patientId)
    {
        return DentalTreatmentPlan::byPatient($patientId)
            ->active()
            ->with(['treatmentItems.dentalProcedure', 'dentist'])
            ->orderBy('plan_date', 'desc')
            ->get();
    }

    public function getProceduresByCategory(string $category)
    {
        return DentalProcedure::active()->byCategory($category)->get();
    }

    public function getAllActiveProcedures()
    {
        return DentalProcedure::active()->orderBy('category')->orderBy('name')->get();
    }

    public function getDentalAppointments(?string $date = null, ?string $query = null)
    {
        return Appointment::with(['patient', 'doctor'])
            ->where('appointment_type', 'dental')
            ->when($date, fn ($q) => $q->whereDate('appointment_date', $date))
            ->when($query, fn ($q) => $q->whereHas('patient', fn ($p) => $p->where('first_name', 'like', "%{$query}%")
                ->orWhere('last_name', 'like', "%{$query}%")
                ->orWhere('hospital_number', 'like', "%{$query}%")))
            ->orderBy('appointment_date')
            ->orderBy('start_time')
            ->paginate(20);
    }

    public function getPatientDentalChart(int $patientId)
    {
        return DentalChart::byPatient($patientId)
            ->with(['teeth', 'dentist'])
            ->orderBy('chart_date', 'desc')
            ->first();
    }

    public function getPatientDentalAttachments(int $patientId)
    {
        return DentalAttachment::where('patient_id', $patientId)
            ->with(['dentalChart', 'dentalNote'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getPatientDentalNotes(int $patientId)
    {
        return DentalNote::where('patient_id', $patientId)
            ->with(['dentist', 'treatmentPlan'])
            ->orderBy('note_date', 'desc')
            ->get();
    }
}
