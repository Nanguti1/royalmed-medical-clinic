<?php

namespace App\Console\Commands;

use App\Models\Medicine;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckLowStock extends Command
{
    protected $signature = 'inventory:check-low-stock';

    protected $description = 'Check for low stock items and send alerts';

    public function handle(): int
    {
        $medicines = Medicine::with(['batches' => function ($query) {
            $query->where('quantity', '>', 0);
        }])->get();

        $count = 0;

        foreach ($medicines as $medicine) {
            $totalQuantity = $medicine->batches->sum('quantity');

            if ($totalQuantity <= 0) {
                try {
                    Log::error("Out of stock: {$medicine->name} (Total: {$totalQuantity})");
                    $count++;
                } catch (\Exception $e) {
                    Log::error("Failed to send out of stock alert: {$e->getMessage()}");
                }
            } elseif ($totalQuantity <= $medicine->reorder_level) {
                try {
                    Log::warning("Low stock: {$medicine->name} (Current: {$totalQuantity}, Reorder Level: {$medicine->reorder_level})");
                    $count++;
                } catch (\Exception $e) {
                    Log::error("Failed to send low stock alert: {$e->getMessage()}");
                }
            }
        }

        $this->info("Processed {$count} stock alerts");

        return Command::SUCCESS;
    }
}
