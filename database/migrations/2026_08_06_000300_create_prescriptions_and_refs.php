<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('medicine_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('medicine_forms', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('medicine_strengths', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('value')->nullable();
            $table->timestamps();
        });

        Schema::create('dosage_units', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('abbreviation')->nullable();
            $table->timestamps();
        });

        Schema::create('frequencies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('times_per_day')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('duration_units', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('abbreviation')->nullable();
            $table->timestamps();
        });

        Schema::create('medicines', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('generic_name')->nullable();
            $table->foreignId('medicine_category_id')->nullable()->constrained('medicine_categories')->nullOnDelete();
            $table->foreignId('medicine_form_id')->nullable()->constrained('medicine_forms')->nullOnDelete();
            $table->foreignId('strength_id')->nullable()->constrained('medicine_strengths')->nullOnDelete();
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('reorder_level', 12, 2)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['name', 'strength_id']);
        });

        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visit_id')->constrained('visits')->cascadeOnDelete();
            $table->foreignId('prescribed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['visit_id']);
        });

        Schema::create('prescription_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prescription_id')->constrained('prescriptions')->cascadeOnDelete();
            $table->foreignId('medicine_id')->constrained('medicines')->cascadeOnDelete();
            $table->foreignId('dosage_unit_id')->nullable()->constrained('dosage_units')->nullOnDelete();
            $table->foreignId('frequency_id')->nullable()->constrained('frequencies')->nullOnDelete();
            $table->foreignId('route_id')->nullable()->constrained('routes')->nullOnDelete();
            $table->foreignId('duration_unit_id')->nullable()->constrained('duration_units')->nullOnDelete();
            $table->decimal('duration_quantity', 8, 2)->nullable();
            $table->decimal('quantity', 12, 2)->default(0);
            $table->text('instructions')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('prescription_items');
        Schema::dropIfExists('prescriptions');
        Schema::dropIfExists('medicines');
        Schema::dropIfExists('duration_units');
        Schema::dropIfExists('routes');
        Schema::dropIfExists('frequencies');
        Schema::dropIfExists('dosage_units');
        Schema::dropIfExists('medicine_strengths');
        Schema::dropIfExists('medicine_forms');
        Schema::dropIfExists('medicine_categories');
    }
};
