<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('prescription_items', function (Blueprint $table) {
            if (! Schema::hasColumn('prescription_items', 'dispensed_quantity')) {
                $table->decimal('dispensed_quantity', 12, 2)->default(0)->after('quantity');
            }
            if (! Schema::hasColumn('prescription_items', 'dispensed_at')) {
                $table->timestamp('dispensed_at')->nullable()->after('dispensed_quantity');
            }
        });
    }

    public function down(): void
    {
        Schema::table('prescription_items', function (Blueprint $table) {
            $table->dropColumn(['dispensed_quantity', 'dispensed_at']);
        });
    }
};
