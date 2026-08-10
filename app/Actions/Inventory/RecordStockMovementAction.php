<?php

namespace App\Actions\Inventory;

use App\Models\StockMovement;

class RecordStockMovementAction
{
    public function execute(array $data): StockMovement
    {
        return StockMovement::create($data);
    }
}
