<?php

namespace App\Support\Generators;

use App\Models\NumberSequence;
use Illuminate\Support\Facades\DB;

class NumberGenerator
{
    /**
     * Generate a unique, concurrency-safe number using a sequence table.
     *
     * This method uses row-level locking to ensure atomicity under concurrent requests.
     * Multiple requests for the same type and date will serialize, preventing duplicates.
     *
     * @param  string  $type  The type of number (prescription, invoice, receipt)
     * @param  string  $prefix  The prefix for the number (P, I, R)
     * @param  int  $padding  The zero-padding width for the sequence
     * @return string The generated number
     */
    protected static function generateSequenceNumber(string $type, string $prefix, int $padding): string
    {
        $date = now()->format('Ymd');
        $dateStr = now()->toDateString();

        return DB::transaction(function () use ($type, $date, $dateStr, $prefix, $padding) {
            // Lock the sequence row for this type and date
            $sequence = NumberSequence::where('type', $type)
                ->where('date', $dateStr)
                ->lockForUpdate()
                ->first();

            if (! $sequence) {
                // Create the sequence record (will be locked by the transaction)
                // Use insert to avoid unique constraint issues
                DB::table('number_sequences')->insert([
                    'type' => $type,
                    'date' => $dateStr,
                    'sequence' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Fetch the newly created record with lock
                $sequence = NumberSequence::where('type', $type)
                    ->where('date', $dateStr)
                    ->lockForUpdate()
                    ->first();
            }

            // Atomically increment and get the new sequence number
            $sequence->increment('sequence');
            $sequence->refresh();

            return "{$prefix}-{$date}-".str_pad($sequence->sequence, $padding, '0', STR_PAD_LEFT);
        });
    }

    public static function generateHospitalNumber(): string
    {
        return self::generateSequenceNumber('patient', 'H', 5);
    }

    public static function generateQueueNumber(string $department): string
    {
        return self::generateSequenceNumber('queue_'.$department, strtoupper(substr($department, 0, 1)).'Q', 3);
    }

    public static function generateVisitNumber(): string
    {
        return self::generateSequenceNumber('visit', 'V', 4);
    }

    public static function generateInvoiceNumber(): string
    {
        return self::generateSequenceNumber('invoice', 'I', 5);
    }

    public static function generatePrescriptionNumber(): string
    {
        return self::generateSequenceNumber('prescription', 'P', 4);
    }

    public static function generateReceiptNumber(): string
    {
        return self::generateSequenceNumber('receipt', 'R', 5);
    }

    public static function generateAccessionNumber(): string
    {
        return self::generateSequenceNumber('accession', 'ACC', 5);
    }

    public static function generateSpecimenLabel(string $sampleType = 'SPEC'): string
    {
        $prefix = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $sampleType), 0, 4)) ?: 'SPEC';

        return self::generateSequenceNumber('specimen_'.strtolower($prefix), $prefix, 4);
    }

    public static function generatePurchaseOrderNumber(): string
    {
        return self::generateSequenceNumber('purchase_order', 'PO', 5);
    }

    public static function generateGoodsReceivedNoteNumber(): string
    {
        return self::generateSequenceNumber('goods_received_note', 'GRN', 5);
    }
}
