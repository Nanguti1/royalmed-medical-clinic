<?php

namespace App\Actions\Inventory;

use App\Models\InventoryBatch;

class ReceiveStockAction
{
    public function execute(array $data): InventoryBatch
    {
        return InventoryBatch::create($data);
    }
}
