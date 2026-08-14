<?php

namespace App\Services;

use App\Models\InsuranceClaim;
use App\Models\Invoice;
use App\Models\PatientCoverage;
use App\Models\Preauthorization;
use Illuminate\Support\Facades\DB;

class InsuranceService
{
    public function createClaimFromInvoice(Invoice $invoice, array $data): InsuranceClaim
    {
        return DB::transaction(function () use ($invoice, $data) {
            if (! $invoice->patientCoverage) {
                throw new \InvalidArgumentException('Invoice must have patient coverage to create insurance claim');
            }

            if ($invoice->insuranceClaim) {
                throw new \InvalidArgumentException('Invoice already has an insurance claim');
            }

            $claim = $invoice->createInsuranceClaim($data);

            // Create claim items from invoice items
            foreach ($invoice->items as $invoiceItem) {
                $claim->items()->create([
                    'invoice_item_id' => $invoiceItem->id,
                    'service_code' => $invoiceItem->description,
                    'service_name' => $invoiceItem->description,
                    'description' => $invoiceItem->description,
                    'quantity' => $invoiceItem->quantity,
                    'unit_price' => $invoiceItem->unit_price,
                    'claimed_amount' => $invoiceItem->total_price,
                    'approved_amount' => 0,
                    'rejected_amount' => 0,
                ]);
            }

            return $claim;
        });
    }

    public function submitClaim(InsuranceClaim $claim, ?int $userId = null): InsuranceClaim
    {
        if (! in_array($claim->status, ['draft', 'resubmitted'])) {
            throw new \RuntimeException('Claim can only be submitted from draft or resubmitted status');
        }

        $claim->submission_date = now();
        $claim->updateStatus('submitted', 'Claim submitted to insurer', $userId);

        return $claim;
    }

    public function approveClaim(InsuranceClaim $claim, float $approvedAmount, ?string $notes = null, ?int $userId = null): InsuranceClaim
    {
        if (! in_array($claim->status, ['submitted', 'pending'])) {
            throw new \RuntimeException('Claim can only be approved from submitted or pending status');
        }

        $claim->approved_amount = $approvedAmount;
        $claim->rejected_amount = $claim->claimed_amount - $approvedAmount;
        $claim->approval_date = now();
        $claim->authorization_number = $claim->authorization_number ?? 'AUTH'.now()->format('YmdHis');
        $claim->updateStatus('approved', $notes, $userId);

        return $claim;
    }

    public function rejectClaim(InsuranceClaim $claim, string $rejectionReason, ?int $userId = null): InsuranceClaim
    {
        if (! in_array($claim->status, ['submitted', 'pending'])) {
            throw new \RuntimeException('Claim can only be rejected from submitted or pending status');
        }

        $claim->rejected_amount = $claim->claimed_amount;
        $claim->approved_amount = 0;
        $claim->rejection_reason = $rejectionReason;
        $claim->updateStatus('rejected', $rejectionReason, $userId);

        return $claim;
    }

    public function resubmitClaim(InsuranceClaim $claim, array $correctedData, ?int $userId = null): InsuranceClaim
    {
        if (! $claim->canBeResubmitted()) {
            throw new \RuntimeException('Claim cannot be resubmitted');
        }

        $claim->update($correctedData);
        $claim->updateStatus('resubmitted', 'Claim resubmitted with corrections', $userId);

        return $claim;
    }

    public function recordClaimPayment(InsuranceClaim $claim, float $amount, ?int $userId = null): InsuranceClaim
    {
        if ($claim->status !== 'approved') {
            throw new \RuntimeException('Claim must be approved before recording payment');
        }

        $claim->paid_amount += $amount;
        $claim->payment_date = now();

        if ($claim->paid_amount >= $claim->approved_amount) {
            $claim->updateStatus('paid', 'Claim fully paid', $userId);
        } else {
            $claim->updateStatus('partially_paid', 'Partial payment recorded', $userId);
        }

        return $claim;
    }

    public function createPreauthorization(array $data): Preauthorization
    {
        return DB::transaction(function () use ($data) {
            $coverage = PatientCoverage::find($data['patient_coverage_id']);
            if (! $coverage) {
                throw new \InvalidArgumentException('Patient coverage not found');
            }

            if ($coverage->scheme && $coverage->scheme->requires_preauthorization) {
                $data['insurer_id'] = $coverage->insurer_id;
                $data['insurance_scheme_id'] = $coverage->insurance_scheme_id;
                $data['request_date'] = now();
            }

            return Preauthorization::create($data);
        });
    }

    public function approvePreauthorization(Preauthorization $preauth, float $authorizedAmount, ?string $notes = null, ?int $userId = null): Preauthorization
    {
        if ($preauth->status !== 'pending') {
            throw new \RuntimeException('Preauthorization can only be approved from pending status');
        }

        $preauth->authorized_amount = $authorizedAmount;
        $preauth->approval_date = now();
        $preauth->status = 'approved';
        $preauth->expiry_date = now()->addDays(30); // Default 30-day validity
        $preauth->notes = $notes;
        $preauth->updated_by = $userId;
        $preauth->save();

        return $preauth;
    }

    public function rejectPreauthorization(Preauthorization $preauth, string $rejectionReason, ?int $userId = null): Preauthorization
    {
        if ($preauth->status !== 'pending') {
            throw new \RuntimeException('Preauthorization can only be rejected from pending status');
        }

        $preauth->status = 'rejected';
        $preauth->rejection_reason = $rejectionReason;
        $preauth->updated_by = $userId;
        $preauth->save();

        return $preauth;
    }

    public function usePreauthorization(Preauthorization $preauth, float $amount): Preauthorization
    {
        if (! $preauth->canBeUsed()) {
            throw new \RuntimeException('Preauthorization cannot be used');
        }

        $preauth->useAmount($amount);

        return $preauth;
    }

    public function verifyPatientCoverage(int $patientId, ?string $insurerType = null): ?PatientCoverage
    {
        $query = PatientCoverage::where('patient_id', $patientId)->active();

        if ($insurerType) {
            $query->whereHas('insurer', function ($q) use ($insurerType) {
                $q->where('type', $insurerType);
            });
        }

        return $query->primary()->first() ?? $query->first();
    }

    public function getClaimAgingReport(): array
    {
        return [
            'pending_submissions' => InsuranceClaim::byStatus('submitted')->count(),
            'pending_review' => InsuranceClaim::byStatus('pending')->count(),
            'approved_unpaid' => InsuranceClaim::byStatus('approved')->whereNull('payment_date')->count(),
            'rejected' => InsuranceClaim::byStatus('rejected')->count(),
            'paid' => InsuranceClaim::byStatus('paid')->count(),
            'total_claimed' => InsuranceClaim::sum('claimed_amount'),
            'total_approved' => InsuranceClaim::sum('approved_amount'),
            'total_paid' => InsuranceClaim::sum('paid_amount'),
        ];
    }
}
