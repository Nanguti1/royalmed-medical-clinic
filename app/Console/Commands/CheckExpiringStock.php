<?php

namespace App\Console\Commands;

use App\Models\InventoryBatch;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckExpiringStock extends Command
{
    protected $signature = 'inventory:check-expiring';

    protected $description = 'Check for expiring stock items and send alerts';

    public function handle(): int
    {
        $expiringSoonBatches = InventoryBatch::where('expiry_date', '<=', now()->addDays(90))
            ->where('expiry_date', '>', now())
            ->where('quantity', '>', 0)
            ->with('medicine')
            ->get();

        $expiredBatches = InventoryBatch::where('expiry_date', '<=', now())
            ->where('quantity', '>', 0)
            ->with('medicine')
            ->get();

        $count = 0;

        foreach ($expiringSoonBatches as $batch) {
            try {
                $daysUntilExpiry = $batch->expiry_date->diffInDays(now());
                Log::warning("Expiring soon: {$batch->medicine->name} batch {$batch->batch_number} expires in {$daysUntilExpiry} days (Qty: {$batch->quantity})");

                $count++;
            } catch (\Exception $e) {
                Log::error("Failed to send expiring soon alert: {$e->getMessage()}");
            }
        }

        foreach ($expiredBatches as $batch) {
            try {
                Log::error("Expired: {$batch->medicine->name} batch {$batch->batch_number} expired on {$batch->expiry_date} (Qty: {$batch->quantity})");

                $count++;
            } catch (\Exception $e) {
                Log::error("Failed to send expired alert: {$e->getMessage()}");
            }
        }

        $this->info("Processed {$count} stock expiry alerts");

        return Command::SUCCESS;
    }
}
