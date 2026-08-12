<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('queue_entries', function (Blueprint $table) {
            // Drop the existing foreign key constraint
            $table->dropForeign(['visit_id']);

            // Re-add with restrictive behavior to prevent visit deletion when queue entries exist
            $table->foreign('visit_id')->references('id')->on('visits')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('queue_entries', function (Blueprint $table) {
            // Revert to original cascade behavior
            $table->dropForeign(['visit_id']);
            $table->foreign('visit_id')->references('id')->on('visits')->cascadeOnDelete();
        });
    }
};
