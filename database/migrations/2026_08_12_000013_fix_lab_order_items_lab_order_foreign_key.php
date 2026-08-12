<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lab_order_items', function (Blueprint $table) {
            // Drop the existing foreign key constraint
            $table->dropForeign(['lab_order_id']);

            // Make nullable to preserve historical lab data
            $table->foreignId('lab_order_id')->nullable()->change();

            // Re-add with restrictive behavior to prevent lab order deletion when items exist
            $table->foreign('lab_order_id')->references('id')->on('lab_orders')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('lab_order_items', function (Blueprint $table) {
            // Revert to original cascade behavior
            $table->dropForeign(['lab_order_id']);
            $table->foreignId('lab_order_id')->nullable(false)->change();
            $table->foreign('lab_order_id')->references('id')->on('lab_orders')->cascadeOnDelete();
        });
    }
};
