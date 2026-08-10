<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClinicalNote extends Model
{
    use HasFactory;

    protected $fillable = ['visit_id', 'author_id', 'note', 'note_type'];

    protected $casts = [];

    public function visit()
    {
        return $this->belongsTo(Visit::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
