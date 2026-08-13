<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('lab_order_items', function (Blueprint $table) {
            $table->string('sample_type')->nullable();
            $table->timestamp('sample_collected_at')->nullable();
            $table->foreignId('sample_collected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('sample_status', ['pending', 'collected', 'received', 'processing', 'completed'])->default('pending');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lab_order_items', function (Blueprint $table) {
            $table->dropForeign(['sample_collected_by']);
            $table->dropColumn(['sample_type', 'sample_collected_at', 'sample_collected_by', 'sample_status']);
        });
    }
};
