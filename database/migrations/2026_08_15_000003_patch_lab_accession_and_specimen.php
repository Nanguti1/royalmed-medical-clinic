<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lab_orders', function (Blueprint $table) {
            $table->string('accession_number')->nullable()->unique()->after('notes');
        });

        Schema::table('lab_order_items', function (Blueprint $table) {
            $table->string('accession_number')->nullable()->after('sample_status');
            $table->string('specimen_label')->nullable()->after('accession_number');
            $table->timestamp('received_at')->nullable()->after('sample_collected_by');
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete()->after('received_at');
            $table->timestamp('processing_at')->nullable()->after('received_by');
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete()->after('processing_at');
            $table->timestamp('completed_at')->nullable()->after('processed_by');
            $table->foreignId('completed_by')->nullable()->constrained('users')->nullOnDelete()->after('completed_at');
        });

        Schema::table('lab_results', function (Blueprint $table) {
            $table->text('rejection_reason')->nullable()->after('verification_status');
        });
    }

    public function down(): void
    {
        Schema::table('lab_results', function (Blueprint $table) {
            $table->dropColumn('rejection_reason');
        });

        Schema::table('lab_order_items', function (Blueprint $table) {
            $table->dropForeign(['received_by']);
            $table->dropForeign(['processed_by']);
            $table->dropForeign(['completed_by']);
            $table->dropColumn(['accession_number', 'specimen_label', 'received_at', 'received_by', 'processing_at', 'processed_by', 'completed_at', 'completed_by']);
        });

        Schema::table('lab_orders', function (Blueprint $table) {
            $table->dropUnique(['accession_number']);
            $table->dropColumn('accession_number');
        });
    }
};
