<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('prescriptions', function (Blueprint $table) {
            if (! Schema::hasColumn('prescriptions', 'prescription_number')) {
                $table->string('prescription_number')->nullable()->after('id')->unique();
            }
            if (! Schema::hasColumn('prescriptions', 'finalized_at')) {
                $table->timestamp('finalized_at')->nullable()->after('prescription_number');
            }
        });
    }

    public function down(): void
    {
        Schema::table('prescriptions', function (Blueprint $table) {
            $table->dropColumn(['prescription_number', 'finalized_at']);
        });
    }
};
