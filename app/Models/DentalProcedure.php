<?php

namespace App\Models;

use Database\Factories\DentalProcedureFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DentalProcedure extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = DentalProcedureFactory::class;

    protected $fillable = [
        'code',
        'name',
        'description',
        'category',
        'base_cost',
        'duration_minutes',
        'is_active',
    ];

    protected $casts = [
        'base_cost' => 'decimal:2',
        'duration_minutes' => 'integer',
        'is_active' => 'boolean',
    ];

    public function treatmentItems(): HasMany
    {
        return $this->hasMany(DentalTreatmentItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeScaling($query)
    {
        return $query->where('category', 'scaling');
    }

    public function scopeFillings($query)
    {
        return $query->where('category', 'filling');
    }

    public function scopeExtractions($query)
    {
        return $query->where('category', 'extraction');
    }

    public function scopeRootCanals($query)
    {
        return $query->where('category', 'root_canal');
    }

    public function scopeCrowns($query)
    {
        return $query->where('category', 'crown');
    }

    public function scopeBridges($query)
    {
        return $query->where('category', 'bridge');
    }

    public function scopeDentures($query)
    {
        return $query->where('category', 'denture');
    }

    public function scopeImplants($query)
    {
        return $query->where('category', 'implant');
    }

    public function scopeOrthodontics($query)
    {
        return $query->where('category', 'orthodontics');
    }
}
