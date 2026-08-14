<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ControlledDrugRegister extends Model
{
    use HasFactory;

    protected $table = 'controlled_drug_register';

    protected $fillable = [
        'medicine_id',
        'inventory_batch_id',
        'patient_id',
        'prescription_id',
        'quantity',
        'transaction_type',
        'balance_after',
        'prescriber_name',
        'dispensed_by',
        'witness_by',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'balance_after' => 'decimal:2',
    ];

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(InventoryBatch::class, 'inventory_batch_id');
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class);
    }

    public function dispensedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dispensed_by');
    }

    public function witnessBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'witness_by');
    }
}
