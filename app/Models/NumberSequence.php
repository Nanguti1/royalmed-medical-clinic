<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NumberSequence extends Model
{
    use HasFactory;

    protected $fillable = ['type', 'date', 'sequence'];

    protected $casts = [
        'date' => 'date',
        'sequence' => 'integer',
    ];

    /**
     * Get or create a sequence record for the given type and date.
     */
    public static function forTypeAndDate(string $type, string $date): self
    {
        return self::lockForUpdate()
            ->firstOrCreate(
                ['type' => $type, 'date' => $date],
                ['sequence' => 0]
            );
    }

    /**
     * Increment the sequence atomically and return the new value.
     */
    public function incrementSequence(): int
    {
        $this->increment('sequence');
        $this->refresh();

        return $this->sequence;
    }
}
