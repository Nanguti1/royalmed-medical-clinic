<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('visits', function (Blueprint $table) {
            // Drop the existing foreign key constraint
            $table->dropForeign(['patient_id']);

            // Re-add with restrictive behavior to prevent patient deletion when visits exist
            $table->foreign('patient_id')->references('id')->on('patients')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('visits', function (Blueprint $table) {
            // Revert to original cascade behavior
            $table->dropForeign(['patient_id']);
            $table->foreign('patient_id')->references('id')->on('patients')->cascadeOnDelete();
        });
    }
};
