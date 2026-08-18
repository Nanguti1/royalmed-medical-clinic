<?php

namespace App\Models;

use Database\Factories\PatientFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = PatientFactory::class;

    protected $fillable = [
        'hospital_number', 'first_name', 'last_name', 'other_names', 'gender_id', 'date_of_birth', 'phone', 'email', 'photo_path', 'occupation', 'employer', 'marital_status', 'preferred_language', 'religion', 'blood_group', 'address', 'county_id', 'sub_county_id', 'notes', 'created_by', 'updated_by',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function visits(): HasMany
    {
        return $this->hasMany(Visit::class);
    }

    public function emergencyContacts(): HasMany
    {
        return $this->hasMany(EmergencyContact::class);
    }

    public function identifiers(): HasMany
    {
        return $this->hasMany(PatientIdentifier::class);
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(PatientContact::class);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(PatientAddress::class);
    }

    public function allergies(): HasMany
    {
        return $this->hasMany(PatientAllergy::class);
    }

    public function chronicConditions(): HasMany
    {
        return $this->hasMany(PatientChronicCondition::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(PatientAlert::class);
    }

    public function relationships(): HasMany
    {
        return $this->hasMany(PatientRelationship::class);
    }

    public function relatedRelationships(): HasMany
    {
        return $this->hasMany(PatientRelationship::class, 'related_patient_id');
    }

    public function coverages(): HasMany
    {
        return $this->hasMany(PatientCoverage::class);
    }

    public function employerCoverages(): HasMany
    {
        return $this->hasMany(PatientEmployerCoverage::class);
    }

    public function deposits(): HasMany
    {
        return $this->hasMany(Deposit::class);
    }

    public function paymentPlans(): HasMany
    {
        return $this->hasMany(PaymentPlan::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function consents(): HasMany
    {
        return $this->hasMany(PatientConsent::class);
    }

    public function activeConsents(): HasMany
    {
        return $this->consents()->active();
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function upcomingAppointments(): HasMany
    {
        return $this->appointments()->upcoming()->whereIn('status', ['scheduled', 'confirmed']);
    }

    public function waitlistEntries(): HasMany
    {
        return $this->hasMany(WaitlistEntry::class);
    }

    public function vaccinationRecords(): HasMany
    {
        return $this->hasMany(VaccinationRecord::class);
    }

    public function vaccinationCertificates(): HasMany
    {
        return $this->hasMany(VaccinationCertificate::class);
    }

    public function dentalCharts(): HasMany
    {
        return $this->hasMany(DentalChart::class);
    }

    public function dentalChart(): HasOne
    {
        return $this->hasOne(DentalChart::class)->latestOfMany();
    }

    public function dentalTreatmentPlans(): HasMany
    {
        return $this->hasMany(DentalTreatmentPlan::class);
    }

    public function activeCoverages(): HasMany
    {
        return $this->coverages()->active();
    }

    public function primaryCoverage()
    {
        return $this->coverages()->primary()->first();
    }

    public function hasActiveInsurance(): bool
    {
        return $this->activeCoverages()->count() > 0;
    }

    public function sourceMergeRecords(): HasMany
    {
        return $this->hasMany(PatientMergeRecord::class, 'source_patient_id');
    }

    public function targetMergeRecords(): HasMany
    {
        return $this->hasMany(PatientMergeRecord::class, 'target_patient_id');
    }

    public function gender(): BelongsTo
    {
        return $this->belongsTo(Gender::class);
    }

    public function county(): BelongsTo
    {
        return $this->belongsTo(County::class);
    }

    public function sub_county(): BelongsTo
    {
        return $this->belongsTo(SubCounty::class, 'sub_county_id');
    }

    public function clinicalAttachments(): HasMany
    {
        return $this->hasMany(ClinicalAttachment::class);
    }

    public function activeAlerts(): HasMany
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

    public function activeAllergies(): HasMany
    {
        return $this->hasMany(PatientAllergy::class)->where('is_active', true);
    }

    public function activeChronicConditions(): HasMany
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

    public function getFullNameAttribute(): string
    {
        return trim($this->first_name.' '.$this->last_name);
    }

    public function routeNotificationForMail($notification): ?string
    {
        return $this->email;
    }

    public function routeNotificationForSms($notification): ?string
    {
        return $this->phone;
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
