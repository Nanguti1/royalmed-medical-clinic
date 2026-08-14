<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'hospital_number', 'first_name', 'last_name', 'other_names', 'gender_id', 'date_of_birth', 'phone', 'email', 'photo_path', 'occupation', 'employer', 'marital_status', 'preferred_language', 'religion', 'blood_group', 'address', 'county_id', 'sub_county_id', 'notes', 'created_by', 'updated_by',
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

    public function contacts()
    {
        return $this->hasMany(PatientContact::class);
    }

    public function addresses()
    {
        return $this->hasMany(PatientAddress::class);
    }

    public function allergies()
    {
        return $this->hasMany(PatientAllergy::class);
    }

    public function chronicConditions()
    {
        return $this->hasMany(PatientChronicCondition::class);
    }

    public function alerts()
    {
        return $this->hasMany(PatientAlert::class);
    }

    public function relationships()
    {
        return $this->hasMany(PatientRelationship::class);
    }

    public function relatedRelationships()
    {
        return $this->hasMany(PatientRelationship::class, 'related_patient_id');
    }

    public function sourceMergeRecords()
    {
        return $this->hasMany(PatientMergeRecord::class, 'source_patient_id');
    }

    public function targetMergeRecords()
    {
        return $this->hasMany(PatientMergeRecord::class, 'target_patient_id');
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

    public function clinicalAttachments()
    {
        return $this->hasMany(ClinicalAttachment::class);
    }

    public function activeAlerts()
    {
        return $this->hasMany(PatientAlert::class)
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            });
    }

    public function activeAllergies()
    {
        return $this->hasMany(PatientAllergy::class)->where('is_active', true);
    }

    public function activeChronicConditions()
    {
        return $this->hasMany(PatientChronicCondition::class)->where('is_active', true);
    }

    public function getSafetySummaryAttribute(): array
    {
        return [
            'alerts' => $this->activeAlerts()->get(),
            'allergies' => $this->activeAllergies()->get(),
            'chronic_conditions' => $this->activeChronicConditions()->get(),
        ];
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
