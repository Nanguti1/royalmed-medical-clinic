<?php

namespace App\Services;

use App\Models\InsuranceClaim;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ShaClaimService
{
    public function exportClaim(InsuranceClaim $claim): array
    {
        $patient = $claim->patient;
        $invoice = $claim->invoice;
        $insurer = $claim->insurer;

        $exportData = [
            'header' => [
                'message_type' => 'CLAIM_SUBMISSION',
                'version' => '1.0',
                'sender_id' => env('SHA_SENDER_ID', 'ROYALMED'),
                'receiver_id' => $insurer?->code ?? 'SHA',
                'timestamp' => now()->toISOString(),
                'claim_number' => $claim->claim_number,
            ],
            'patient' => [
                'patient_id' => $patient->hospital_number ?? $patient->id,
                'first_name' => $patient->first_name,
                'last_name' => $patient->last_name,
                'date_of_birth' => $patient->date_of_birth->format('Y-m-d'),
                'gender' => $patient->gender_id,
                'phone' => $patient->phone,
                'identification_type' => 'national_id',
                'identification_number' => $this->getPatientIdentifier($patient, 'national_id'),
            ],
            'coverage' => [
                'coverage_id' => $claim->patientCoverage?->id,
                'scheme_code' => $claim->scheme?->code,
                'employer_scheme_code' => $claim->employerScheme?->code,
                'authorization_number' => $claim->authorization_number,
                'effective_date' => $claim->patientCoverage?->start_date?->format('Y-m-d'),
                'expiry_date' => $claim->patientCoverage?->end_date?->format('Y-m-d'),
            ],
            'claim' => [
                'claim_number' => $claim->claim_number,
                'service_date_from' => $claim->service_date_from->format('Y-m-d'),
                'service_date_to' => $claim->service_date_to->format('Y-m-d'),
                'submission_date' => $claim->submission_date?->format('Y-m-d') ?? now()->format('Y-m-d'),
                'claimed_amount' => (float) $claim->claimed_amount,
                'facility_code' => env('SHA_FACILITY_CODE', 'ROYALMED'),
                'claim_type' => 'outpatient',
            ],
            'items' => $claim->items->map(function ($item) {
                return [
                    'item_code' => $item->item_code,
                    'item_description' => $item->item_description,
                    'quantity' => $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'total_amount' => (float) $item->total_amount,
                    'service_date' => $item->service_date?->format('Y-m-d'),
                ];
            })->toArray(),
            'invoice' => [
                'invoice_number' => $invoice?->invoice_number,
                'invoice_date' => $invoice?->invoice_date?->format('Y-m-d'),
                'total_amount' => (float) $invoice?->total_amount ?? 0,
            ],
        ];

        Log::info('SHA claim exported', [
            'claim_number' => $claim->claim_number,
            'patient_id' => $patient->id,
        ]);

        return $exportData;
    }

    public function exportClaimsBatch(array $claimIds): array
    {
        $claims = InsuranceClaim::whereIn('id', $claimIds)
            ->with(['patient', 'invoice', 'insurer', 'scheme', 'patientCoverage', 'employerScheme', 'items'])
            ->get();

        $batchData = [
            'header' => [
                'message_type' => 'BATCH_CLAIM_SUBMISSION',
                'version' => '1.0',
                'sender_id' => env('SHA_SENDER_ID', 'ROYALMED'),
                'receiver_id' => 'SHA',
                'timestamp' => now()->toISOString(),
                'batch_number' => 'BATCH-'.uniqid(),
                'total_claims' => $claims->count(),
                'total_amount' => $claims->sum('claimed_amount'),
            ],
            'claims' => $claims->map(function ($claim) {
                return $this->exportClaim($claim);
            })->toArray(),
        ];

        Log::info('SHA batch claims exported', [
            'batch_number' => $batchData['header']['batch_number'],
            'claim_count' => $claims->count(),
        ]);

        return $batchData;
    }

    public function importClaimResponse(array $responseData): InsuranceClaim
    {
        $claimNumber = $responseData['claim_number'] ?? null;
        $claim = InsuranceClaim::where('claim_number', $claimNumber)->firstOrFail();

        $oldStatus = $claim->status;
        $claim->update([
            'status' => $responseData['status'] ?? $claim->status,
            'approved_amount' => $responseData['approved_amount'] ?? $claim->approved_amount,
            'rejected_amount' => $responseData['rejected_amount'] ?? $claim->rejected_amount,
            'paid_amount' => $responseData['paid_amount'] ?? $claim->paid_amount,
            'authorization_number' => $responseData['authorization_number'] ?? $claim->authorization_number,
            'rejection_reason' => $responseData['rejection_reason'] ?? $claim->rejection_reason,
            'approval_date' => isset($responseData['approval_date']) ? Carbon::parse($responseData['approval_date']) : $claim->approval_date,
            'payment_date' => isset($responseData['payment_date']) ? Carbon::parse($responseData['payment_date']) : $claim->payment_date,
        ]);

        if ($responseData['status'] != $oldStatus) {
            $claim->updateStatus($responseData['status'], $responseData['notes'] ?? null);
        }

        if (isset($responseData['items'])) {
            foreach ($responseData['items'] as $itemData) {
                $claimItem = $claim->items()->where('item_code', $itemData['item_code'] ?? null)->first();
                if ($claimItem) {
                    $claimItem->update([
                        'approved_quantity' => $itemData['approved_quantity'] ?? $claimItem->quantity,
                        'approved_unit_price' => $itemData['approved_unit_price'] ?? $claimItem->unit_price,
                        'approved_amount' => $itemData['approved_amount'] ?? $claimItem->total_amount,
                        'rejection_reason' => $itemData['rejection_reason'] ?? null,
                    ]);
                }
            }
        }

        Log::info('SHA claim response imported', [
            'claim_number' => $claimNumber,
            'status' => $responseData['status'],
        ]);

        return $claim->fresh();
    }

    public function generateShaXml(InsuranceClaim $claim): string
    {
        $data = $this->exportClaim($claim);

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<ClaimSubmission>';
        $xml .= $this->arrayToXml($data);
        $xml .= '</ClaimSubmission>';

        return $xml;
    }

    public function generateShaJson(InsuranceClaim $claim): string
    {
        $data = $this->exportClaim($claim);

        return json_encode($data, JSON_PRETTY_PRINT);
    }

    public function generateBatchJson(array $claimIds): string
    {
        $data = $this->exportClaimsBatch($claimIds);

        return json_encode($data, JSON_PRETTY_PRINT);
    }

    protected function getPatientIdentifier(Patient $patient, string $type): ?string
    {
        if (! method_exists($patient, 'identifiers')) {
            return null;
        }

        try {
            $identifier = $patient->identifiers()->where('identifier_type', $type)->first();

            return $identifier?->identifier_value;
        } catch (\Exception $e) {
            return null;
        }
    }

    protected function arrayToXml(array $data, string $nodeName = 'Node'): string
    {
        $xml = '';

        foreach ($data as $key => $value) {
            if (is_numeric($key)) {
                $key = 'Item';
            }

            $key = preg_replace('/[^a-zA-Z0-9_]/', '_', $key);

            if (is_array($value)) {
                $xml .= "<{$key}>".$this->arrayToXml($value)."</{$key}>";
            } else {
                $xml .= "<{$key}>".htmlspecialchars($value)."</{$key}>";
            }
        }

        return $xml;
    }

    public function validateClaimForSubmission(InsuranceClaim $claim): array
    {
        $errors = [];

        if (! $claim->patientCoverage) {
            $errors[] = 'Patient coverage is required';
        }

        if (! $claim->authorization_number) {
            $errors[] = 'Authorization number is required';
        }

        if ($claim->items->isEmpty()) {
            $errors[] = 'Claim must have at least one item';
        }

        if (! $claim->service_date_from || ! $claim->service_date_to) {
            $errors[] = 'Service date range is required';
        }

        if (! $claim->patient) {
            $errors[] = 'Patient information is required';
        }

        $patientIdentifier = $this->getPatientIdentifier($claim->patient, 'national_id');
        if (! $patientIdentifier) {
            $errors[] = 'Patient must have a national ID identifier';
        }

        return [
            'is_valid' => empty($errors),
            'errors' => $errors,
        ];
    }
}
