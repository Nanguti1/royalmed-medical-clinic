<?php

namespace App\Models;

use Database\Factories\ConsentSignatureFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConsentSignature extends Model
{
    use HasFactory;

    protected static $factory = ConsentSignatureFactory::class;

    protected $fillable = [
        'patient_consent_id',
        'signer_type',
        'signer_id',
        'signer_name',
        'relationship',
        'signature_data',
        'signature_method',
        'ip_address',
        'notes',
    ];

    protected $casts = [
        'signed_at' => 'datetime',
    ];

    public const UPDATED_AT = null;

    public function patientConsent(): BelongsTo
    {
        return $this->belongsTo(PatientConsent::class);
    }

    public function signer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'signer_id');
    }

    public function scopeBySignerType($query, string $signerType)
    {
        return $query->where('signer_type', $signerType);
    }

    public function isDigital(): bool
    {
        return $this->signature_method === 'digital';
    }

    public function isHandwritten(): bool
    {
        return $this->signature_method === 'handwritten';
    }

    public function isTyped(): bool
    {
        return $this->signature_method === 'typed';
    }
}
