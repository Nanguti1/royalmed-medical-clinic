<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Services\BarcodeService;
use Illuminate\Http\Request;

class PrintController extends Controller
{
    public function receipt(Payment $payment)
    {
        $invoice = $payment->invoice;
        $patient = $invoice->visit->patient;

        $data = [
            'receiptNumber' => $payment->receipt_number,
            'paidAt' => $payment->paid_at->format('d M Y H:i'),
            'patientName' => trim($patient->first_name.' '.$patient->last_name),
            'invoiceNumber' => $invoice->invoice_number,
            'items' => $invoice->items->map(function ($item) {
                return [
                    'description' => $item->description,
                    'total' => $item->total,
                ];
            })->toArray(),
            'subtotal' => $invoice->subtotal,
            'discountAmount' => $invoice->discount_amount,
            'amountPaid' => $payment->amount,
            'paymentMethod' => $payment->method->name,
            'mpesaRef' => $payment->mpesaTransaction?->transaction_id,
            'receivedBy' => $payment->receivedBy->name,
        ];

        return view('print.receipt', $data);
    }

    public function specimenLabel(Request $request)
    {
        $labOrderId = $request->input('lab_order_id');
        $sampleId = $request->input('sample_id');

        $barcodeService = app(BarcodeService::class);
        $barcode = 'LAB-'.$labOrderId.'-'.$sampleId;

        $data = [
            'labelType' => 'LAB SPECIMEN',
            'fields' => [
                'Lab Order ID' => $labOrderId,
                'Sample ID' => $sampleId,
                'Date' => now()->format('d M Y'),
            ],
            'barcode' => $barcode,
            'qrCode' => null,
        ];

        return view('print.label', $data);
    }

    public function inventoryLabel(Request $request)
    {
        $batchNumber = $request->input('batch_number');
        $itemName = $request->input('item_name');
        $expiryDate = $request->input('expiry_date');

        $data = [
            'labelType' => 'INVENTORY',
            'fields' => [
                'Item' => $itemName,
                'Batch' => $batchNumber,
                'Expiry' => $expiryDate,
            ],
            'barcode' => 'BATCH-'.$batchNumber,
            'qrCode' => null,
        ];

        return view('print.label', $data);
    }

    public function patientCardLabel(Request $request)
    {
        $hospitalNumber = $request->input('hospital_number');
        $patientName = $request->input('patient_name');

        $data = [
            'labelType' => 'PATIENT CARD',
            'fields' => [
                'Name' => $patientName,
                'Hospital No' => $hospitalNumber,
            ],
            'barcode' => $hospitalNumber,
            'qrCode' => null,
        ];

        return view('print.label', $data);
    }
}
