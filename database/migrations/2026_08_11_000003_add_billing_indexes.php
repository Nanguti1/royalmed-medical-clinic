<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Index for date-based queries (reconciliation, daily summaries)
            $table->index('paid_at', 'payments_paid_at_index');

            // Index for staff tracking
            $table->index('received_by', 'payments_received_by_index');

            // Index for M-Pesa transaction lookups
            $table->index('mpesa_transaction_id', 'payments_mpesa_transaction_id_index');
        });

        Schema::table('invoices', function (Blueprint $table) {
            // Index for status filtering
            $table->index('status_id', 'invoices_status_id_index');

            // Index for visit lookups (patient access via visit)
            $table->index('visit_id', 'invoices_visit_id_index');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('payments_paid_at_index');
            $table->dropIndex('payments_received_by_index');
            $table->dropIndex('payments_mpesa_transaction_id_index');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex('invoices_status_id_index');
            $table->dropIndex('invoices_visit_id_index');
        });
    }
};
