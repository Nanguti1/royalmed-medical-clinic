<?php

namespace App\Services;

use App\Models\InventoryBatch;
use App\Models\Invoice;
use App\Models\LabOrder;
use App\Models\Patient;
use App\Models\Prescription;

class BarcodeService
{
    public function generatePatientCardBarcode(Patient $patient): string
    {
        $data = $patient->hospital_number ?? 'PAT-'.$patient->id;

        return $this->generateCode128($data);
    }

    public function generatePatientCardQr(Patient $patient): string
    {
        $data = json_encode([
            'id' => $patient->id,
            'hospital_number' => $patient->hospital_number,
            'name' => trim($patient->first_name.' '.$patient->last_name),
            'dob' => $patient->date_of_birth->format('Y-m-d'),
        ]);

        return $this->generateQrCode($data);
    }

    public function generateLabSpecimenBarcode(LabOrder $labOrder): string
    {
        $sampleId = $labOrder->sample_id ?? uniqid();
        $data = 'LAB-'.$labOrder->id.'-'.$sampleId;

        return $this->generateCode128($data);
    }

    public function generateLabSpecimenQr(LabOrder $labOrder): string
    {
        $data = json_encode([
            'lab_order_id' => $labOrder->id,
            'sample_id' => $labOrder->sample_id,
            'patient_id' => $labOrder->visit->patient_id,
            'test_date' => $labOrder->created_at->format('Y-m-d'),
        ]);

        return $this->generateQrCode($data);
    }

    public function generatePrescriptionBarcode(Prescription $prescription): string
    {
        $prescriptionNumber = $prescription->prescription_number ?? uniqid();
        $data = 'RX-'.$prescription->id.'-'.$prescriptionNumber;

        return $this->generateCode128($data);
    }

    public function generatePrescriptionQr(Prescription $prescription): string
    {
        $data = json_encode([
            'prescription_id' => $prescription->id,
            'prescription_number' => $prescription->prescription_number,
            'patient_id' => $prescription->visit->patient_id,
            'prescribed_date' => $prescription->created_at->format('Y-m-d'),
        ]);

        return $this->generateQrCode($data);
    }

    public function generateReceiptBarcode(Invoice $invoice): string
    {
        $data = 'INV-'.$invoice->invoice_number;

        return $this->generateCode128($data);
    }

    public function generateReceiptQr(Invoice $invoice): string
    {
        $data = json_encode([
            'invoice_id' => $invoice->id,
            'invoice_number' => $invoice->invoice_number,
            'amount' => $invoice->total_amount,
            'date' => $invoice->invoice_date->format('Y-m-d'),
        ]);

        return $this->generateQrCode($data);
    }

    public function generateInventoryBatchBarcode(InventoryBatch $batch): string
    {
        $data = 'BATCH-'.$batch->batch_number;

        return $this->generateCode128($data);
    }

    public function generateInventoryBatchQr(InventoryBatch $batch): string
    {
        $data = json_encode([
            'batch_id' => $batch->id,
            'batch_number' => $batch->batch_number,
            'medicine_id' => $batch->medicine_id,
            'expiry_date' => $batch->expiry_date->format('Y-m-d'),
        ]);

        return $this->generateQrCode($data);
    }

    protected function generateCode128(string $data): string
    {
        $cleanData = preg_replace('/[^A-Za-z0-9\-]/', '', $data);

        return 'CODE128:'.$cleanData;
    }

    protected function generateQrCode(string $data): string
    {
        $encodedData = base64_encode($data);

        return 'QR:'.$encodedData;
    }

    public function decodeQrCode(string $qrCode): ?array
    {
        if (! str_starts_with($qrCode, 'QR:')) {
            return null;
        }

        $encodedData = substr($qrCode, 3);
        $decodedData = base64_decode($encodedData);

        if (! $decodedData) {
            return null;
        }

        return json_decode($decodedData, true);
    }

    public function validatePatientQr(string $qrCode, Patient $patient): bool
    {
        $data = $this->decodeQrCode($qrCode);

        if (! $data) {
            return false;
        }

        return isset($data['id']) && $data['id'] == $patient->id;
    }

    public function generateDeterministicCode(string $type, int $id): string
    {
        $seed = $type.'-'.$id;

        return strtoupper(substr(md5($seed), 0, 12));
    }
}
