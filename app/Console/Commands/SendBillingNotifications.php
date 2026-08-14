<?php

namespace App\Console\Commands;

use App\Models\Invoice;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendBillingNotifications extends Command
{
    protected $signature = 'billing:send-notifications';

    protected $description = 'Send billing notifications for pending and overdue invoices';

    public function handle(): int
    {
        $pendingInvoices = Invoice::whereHas('status', function ($query) {
            $query->where('code', 'pending');
        })
            ->whereHas('visit')
            ->with(['visit.patient'])
            ->get();

        $overdueInvoices = Invoice::whereHas('status', function ($query) {
            $query->where('code', 'pending');
        })
            ->whereHas('visit')
            ->where('issued_at', '<', now()->subDays(30))
            ->with(['visit.patient'])
            ->get();

        $count = 0;

        foreach ($pendingInvoices as $invoice) {
            try {
                $daysSinceIssued = $invoice->issued_at->diffInDays(now());
                Log::warning("Payment reminder: Invoice {$invoice->invoice_number} for patient {$invoice->visit->patient->hospital_number} issued {$daysSinceIssued} days ago (Amount: {$invoice->total_amount})");

                $count++;
            } catch (\Exception $e) {
                Log::error("Failed to send payment reminder: {$e->getMessage()}");
            }
        }

        foreach ($overdueInvoices as $invoice) {
            try {
                $daysOverdue = now()->diffInDays($invoice->issued_at);
                Log::error("Overdue payment: Invoice {$invoice->invoice_number} for patient {$invoice->visit->patient->hospital_number} is {$daysOverdue} days overdue (Amount: {$invoice->total_amount})");

                $count++;
            } catch (\Exception $e) {
                Log::error("Failed to send overdue notification: {$e->getMessage()}");
            }
        }

        $this->info("Processed {$count} billing notifications");

        return Command::SUCCESS;
    }
}
