<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('prescription_items', function (Blueprint $table) {
            // Drop the existing foreign key constraint
            $table->dropForeign(['prescription_id']);

            // Make nullable to preserve historical data
            $table->foreignId('prescription_id')->nullable()->change();

            // Re-add with restrictive behavior to prevent prescription deletion when items exist
            $table->foreign('prescription_id')->references('id')->on('prescriptions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('prescription_items', function (Blueprint $table) {
            // Revert to original cascade behavior
            $table->dropForeign(['prescription_id']);
            $table->foreignId('prescription_id')->nullable(false)->change();
            $table->foreign('prescription_id')->references('id')->on('prescriptions')->cascadeOnDelete();
        });
    }
};
