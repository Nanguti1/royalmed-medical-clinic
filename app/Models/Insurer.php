<?php

namespace App\Models;

use Database\Factories\InsurerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Insurer extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = InsurerFactory::class;

    protected $fillable = [
        'code',
        'name',
        'type',
        'contact_person',
        'phone',
        'email',
        'address',
        'town',
        'postal_code',
        'is_active',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function schemes(): HasMany
    {
        return $this->hasMany(InsuranceScheme::class);
    }

    public function patientCoverages(): HasMany
    {
        return $this->hasMany(PatientCoverage::class);
    }

    public function employerSchemes(): HasMany
    {
        return $this->hasMany(EmployerScheme::class);
    }

    public function claims(): HasMany
    {
        return $this->hasMany(InsuranceClaim::class);
    }

    public function preauthorizations(): HasMany
    {
        return $this->hasMany(Preauthorization::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }
}
