<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->text('subjective')->nullable()->after('chief_complaint');
            $table->text('objective')->nullable()->after('subjective');
            $table->text('assessment')->nullable()->after('objective');
            $table->date('follow_up_date')->nullable()->after('notes');
            $table->text('follow_up_notes')->nullable()->after('follow_up_date');
            $table->string('follow_up_type')->nullable()->after('follow_up_notes');
        });

        Schema::table('consultation_templates', function (Blueprint $table) {
            $table->text('subjective')->nullable()->after('chief_complaint');
            $table->text('objective')->nullable()->after('subjective');
            $table->text('assessment')->nullable()->after('objective');
        });
    }

    public function down(): void
    {
        Schema::table('consultation_templates', function (Blueprint $table) {
            $table->dropColumn(['subjective', 'objective', 'assessment']);
        });

        Schema::table('consultations', function (Blueprint $table) {
            $table->dropColumn(['subjective', 'objective', 'assessment', 'follow_up_date', 'follow_up_notes', 'follow_up_type']);
        });
    }
};
