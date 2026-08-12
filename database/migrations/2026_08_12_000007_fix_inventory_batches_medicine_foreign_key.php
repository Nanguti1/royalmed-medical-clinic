<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_batches', function (Blueprint $table) {
            // Drop the existing foreign key constraint
            $table->dropForeign(['medicine_id']);

            // Make nullable to preserve historical inventory data
            $table->foreignId('medicine_id')->nullable()->change();

            // Re-add with restrictive behavior to prevent medicine deletion when inventory batches exist
            $table->foreign('medicine_id')->references('id')->on('medicines')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('inventory_batches', function (Blueprint $table) {
            // Revert to original cascade behavior
            $table->dropForeign(['medicine_id']);
            $table->foreignId('medicine_id')->nullable(false)->change();
            $table->foreign('medicine_id')->references('id')->on('medicines')->cascadeOnDelete();
        });
    }
};
