<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('visits', function (Blueprint $table) {
            $table->foreignId('started_by')->nullable()->after('started_at')->constrained('users')->nullOnDelete();
            $table->foreignId('completed_by')->nullable()->after('completed_at')->constrained('users')->nullOnDelete();
            $table->foreignId('cancelled_by')->nullable()->after('cancelled_at')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('visits', function (Blueprint $table) {
            $table->dropForeign(['cancelled_by']);
            $table->dropColumn('cancelled_by');
            $table->dropForeign(['completed_by']);
            $table->dropColumn('completed_by');
            $table->dropForeign(['started_by']);
            $table->dropColumn('started_by');
        });
    }
};
