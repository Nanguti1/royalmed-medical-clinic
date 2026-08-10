<?php

namespace App\Support\Generators;

use Illuminate\Support\Facades\DB;

class NumberGenerator
{
    public static function generateVisitNumber(): string
    {
        $date = now()->format('Ymd');
        $count = DB::table('visits')->whereDate('visit_date', now()->toDateString())->count() + 1;

        return "V-{$date}-".str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    public static function generateInvoiceNumber(): string
    {
        $date = now()->format('Ymd');
        $count = DB::table('invoices')->whereDate('created_at', now()->toDateString())->count() + 1;

        return "I-{$date}-".str_pad($count, 5, '0', STR_PAD_LEFT);
    }

    public static function generatePrescriptionNumber(): string
    {
        $date = now()->format('Ymd');
        $count = DB::table('prescriptions')->whereDate('created_at', now()->toDateString())->count() + 1;

        return "P-{$date}-".str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    public static function generateReceiptNumber(): string
    {
        $date = now()->format('Ymd');
        $count = DB::table('payments')->whereDate('created_at', now()->toDateString())->count() + 1;

        return "R-{$date}-".str_pad($count, 5, '0', STR_PAD_LEFT);
    }
}
