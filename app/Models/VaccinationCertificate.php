<?php

namespace App\Models;

use Database\Factories\VaccinationCertificateFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class VaccinationCertificate extends Model
{
    use HasFactory, SoftDeletes;

    protected static $factory = VaccinationCertificateFactory::class;

    protected $fillable = [
        'certificate_number',
        'patient_id',
        'vaccination_record_id',
        'issue_date',
        'valid_from',
        'valid_until',
        'issuing_authority',
        'issuer_name',
        'issuer_license',
        'file_path',
        'file_name',
        'status',
        'revocation_reason',
        'created_by',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'valid_from' => 'date',
        'valid_until' => 'date',
    ];

    protected static function booted()
    {
        static::creating(function ($certificate) {
            if (empty($certificate->certificate_number)) {
                $certificate->certificate_number = 'VCT'.str_pad(static::max('id') + 1, 8, '0', STR_PAD_LEFT);
            }
        });
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function vaccinationRecord(): BelongsTo
    {
        return $this->belongsTo(VaccinationRecord::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeIssued($query)
    {
        return $query->where('status', 'issued');
    }

    public function scopeRevoked($query)
    {
        return $query->where('status', 'revoked');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'expired');
    }

    public function scopeValid($query)
    {
        return $query->where('status', 'issued')
            ->where('valid_from', '<=', now())
            ->where(function ($q) {
                $q->whereNull('valid_until')->orWhere('valid_until', '>=', now());
            });
    }

    public function isIssued(): bool
    {
        return $this->status === 'issued';
    }

    public function isRevoked(): bool
    {
        return $this->status === 'revoked';
    }

    public function isExpired(): bool
    {
        return $this->status === 'expired' || ($this->valid_until && $this->valid_until < now());
    }

    public function isValid(): bool
    {
        return $this->isIssued() && ! $this->isExpired();
    }

    public function revoke(string $reason): void
    {
        $this->status = 'revoked';
        $this->revocation_reason = $reason;
        $this->save();
    }

    public function markAsExpired(): void
    {
        $this->status = 'expired';
        $this->save();
    }
}
