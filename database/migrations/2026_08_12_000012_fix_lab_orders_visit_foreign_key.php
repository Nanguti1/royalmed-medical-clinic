<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lab_orders', function (Blueprint $table) {
            // Drop the existing foreign key constraint
            $table->dropForeign(['visit_id']);

            // Make nullable to preserve historical lab data
            $table->foreignId('visit_id')->nullable()->change();

            // Re-add with restrictive behavior to prevent visit deletion when lab orders exist
            $table->foreign('visit_id')->references('id')->on('visits')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('lab_orders', function (Blueprint $table) {
            // Revert to original cascade behavior
            $table->dropForeign(['visit_id']);
            $table->foreignId('visit_id')->nullable(false)->change();
            $table->foreign('visit_id')->references('id')->on('visits')->cascadeOnDelete();
        });
    }
};
