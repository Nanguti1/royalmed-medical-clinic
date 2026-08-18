<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->date('invoice_date')->nullable()->after('invoice_number');
        });

        // Update existing records to use issued_at as invoice_date, or current date if null
        DB::statement('UPDATE invoices SET invoice_date = COALESCE(DATE(issued_at), CURRENT_DATE) WHERE invoice_date IS NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn('invoice_date');
        });
    }
};
