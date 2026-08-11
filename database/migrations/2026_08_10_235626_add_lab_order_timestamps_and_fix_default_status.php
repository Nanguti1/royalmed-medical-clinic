<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lab_orders', function (Blueprint $table) {
            // Add timestamp columns for state tracking
            $table->timestamp('in_progress_at')->nullable()->after('status');
            $table->timestamp('completed_at')->nullable()->after('in_progress_at');

            // Change default status from 'requested' to 'ordered'
            // Note: This only affects new records, existing records keep their current status
            $table->string('status')->default('ordered')->change();
        });
    }

    public function down(): void
    {
        Schema::table('lab_orders', function (Blueprint $table) {
            $table->dropColumn(['in_progress_at', 'completed_at']);
            $table->string('status')->default('requested')->change();
        });
    }
};
