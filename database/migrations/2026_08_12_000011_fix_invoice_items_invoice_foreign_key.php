<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoice_items', function (Blueprint $table) {
            // Drop the existing foreign key constraint
            $table->dropForeign(['invoice_id']);

            // Make nullable to preserve historical financial data
            $table->foreignId('invoice_id')->nullable()->change();

            // Re-add with restrictive behavior to prevent invoice deletion when items exist
            $table->foreign('invoice_id')->references('id')->on('invoices')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('invoice_items', function (Blueprint $table) {
            // Revert to original cascade behavior
            $table->dropForeign(['invoice_id']);
            $table->foreignId('invoice_id')->nullable(false)->change();
            $table->foreign('invoice_id')->references('id')->on('invoices')->cascadeOnDelete();
        });
    }
};
