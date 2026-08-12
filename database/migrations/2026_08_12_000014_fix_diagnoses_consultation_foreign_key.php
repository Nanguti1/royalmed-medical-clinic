<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('diagnoses', function (Blueprint $table) {
            // Drop the existing foreign key constraint
            $table->dropForeign(['consultation_id']);

            // Make nullable to preserve historical diagnosis data
            $table->foreignId('consultation_id')->nullable()->change();

            // Re-add with restrictive behavior to prevent consultation deletion when diagnoses exist
            $table->foreign('consultation_id')->references('id')->on('consultations')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('diagnoses', function (Blueprint $table) {
            // Revert to original cascade behavior
            $table->dropForeign(['consultation_id']);
            $table->foreignId('consultation_id')->nullable(false)->change();
            $table->foreign('consultation_id')->references('id')->on('consultations')->cascadeOnDelete();
        });
    }
};
