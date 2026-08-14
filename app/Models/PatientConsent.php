<?php

namespace App\Models;

use Database\Factories\PatientConsentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PatientConsent extends Model
{
    use HasFactory;

    protected static $factory = PatientConsentFactory::class;

    protected $fillable = [
        'consent_number',
        'patient_id',
        'consent_template_id',
        'visit_id',
        'consultation_id',
        'status',
        'signed_at',
        'revoked_at',
        'expires_at',
        'revocation_reason',
        'notes',
        'signed_by',
        'revoked_by',
        'created_by',
    ];

    protected $casts = [
        'signed_at' => 'datetime',
        'revoked_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function ($consent) {
            if (empty($consent->consent_number)) {
                $consent->consent_number = 'CON'.str_pad(static::max('id') + 1, 8, '0', STR_PAD_LEFT);
            }
        });
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function consentTemplate(): BelongsTo
    {
        return $this->belongsTo(ConsentTemplate::class);
    }

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    public function signedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'signed_by');
    }

    public function revokedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revoked_by');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function signatures(): HasMany
    {
        return $this->hasMany(ConsentSignature::class);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeSigned($query)
    {
        return $query->where('status', 'signed');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'signed')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'signed')
            ->where('expires_at', '<', now());
    }

    public function isSigned(): bool
    {
        return $this->status === 'signed';
    }

    public function isRevoked(): bool
    {
        return $this->status === 'revoked';
    }

    public function isExpired(): bool
    {
        return $this->status === 'expired' || ($this->expires_at && $this->expires_at < now());
    }

    public function isValid(): bool
    {
        return $this->status === 'signed' && ! $this->isExpired();
    }

    public function sign(?int $userId = null): void
    {
        if ($this->status !== 'draft') {
            throw new \RuntimeException('Only draft consents can be signed');
        }

        $this->status = 'signed';
        $this->signed_at = now();
        $this->signed_by = $userId ?? auth()->id();

        if ($this->consentTemplate->validity_days) {
            $this->expires_at = now()->addDays($this->consentTemplate->validity_days);
        }

        $this->save();
    }

    public function revoke(string $reason, ?int $userId = null): void
    {
        if (! $this->isSigned()) {
            throw new \RuntimeException('Only signed consents can be revoked');
        }

        $this->status = 'revoked';
        $this->revoked_at = now();
        $this->revocation_reason = $reason;
        $this->revoked_by = $userId ?? auth()->id();
        $this->save();
    }

    public function markAsExpired(): void
    {
        if (! $this->isSigned()) {
            throw new \RuntimeException('Only signed consents can expire');
        }

        $this->status = 'expired';
        $this->save();
    }

    public function addSignature(array $data): ConsentSignature
    {
        return $this->signatures()->create($data);
    }

    public function hasAllRequiredSignatures(): bool
    {
        $template = $this->consentTemplate;

        if (! $template->requires_signature) {
            return true;
        }

        $patientSignature = $this->signatures()->where('signer_type', 'patient')->exists();
        if (! $patientSignature) {
            return false;
        }

        if ($template->requires_witness) {
            return $this->signatures()->where('signer_type', 'witness')->exists();
        }

        return true;
    }
}
