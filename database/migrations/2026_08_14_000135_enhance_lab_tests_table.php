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
        Schema::table('lab_tests', function (Blueprint $table) {
            $table->foreignId('lab_category_id')->nullable()->constrained('lab_categories')->nullOnDelete();
            $table->string('sample_type')->nullable();
            $table->text('sample_requirements')->nullable();
            $table->boolean('is_critical')->default(false);
            $table->integer('turnaround_time_hours')->default(24);
        });

        Schema::create('lab_test_reference_ranges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lab_test_id')->constrained('lab_tests')->cascadeOnDelete();
            $table->string('age_group')->nullable();
            $table->string('sex')->nullable();
            $table->decimal('min_value', 10, 2)->nullable();
            $table->decimal('max_value', 10, 2)->nullable();
            $table->string('min_operator')->default('>=');
            $table->string('max_operator')->default('<=');
            $table->text('text_range')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lab_test_reference_ranges');
        Schema::table('lab_tests', function (Blueprint $table) {
            $table->dropForeign(['lab_category_id']);
            $table->dropColumn(['lab_category_id', 'sample_type', 'sample_requirements', 'is_critical', 'turnaround_time_hours']);
        });
    }
};
