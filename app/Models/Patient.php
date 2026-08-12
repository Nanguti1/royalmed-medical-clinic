<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'first_name', 'last_name', 'other_names', 'gender_id', 'date_of_birth', 'phone', 'email', 'address', 'county_id', 'sub_county_id', 'notes', 'created_by', 'updated_by',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function visits()
    {
        return $this->hasMany(Visit::class);
    }

    public function emergencyContacts()
    {
        return $this->hasMany(EmergencyContact::class);
    }

    public function identifiers()
    {
        return $this->hasMany(PatientIdentifier::class);
    }

    public function gender()
    {
        return $this->belongsTo(Gender::class);
    }

    public function county()
    {
        return $this->belongsTo(County::class);
    }

    public function sub_county()
    {
        return $this->belongsTo(SubCounty::class, 'sub_county_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
