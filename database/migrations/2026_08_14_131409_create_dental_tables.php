<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dental_charts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('dentist_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('visit_id')->nullable()->constrained()->nullOnDelete();
            $table->date('chart_date')->useCurrent();
            $table->text('chief_complaint')->nullable();
            $table->text('medical_history')->nullable();
            $table->text('dental_history')->nullable();
            $table->json('oral_hygiene')->nullable(); // brushing habits, flossing, etc.
            $table->json('periodontal_status')->nullable(); // overall periodontal assessment
            $table->text('findings')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'chart_date']);
            $table->index('dentist_id');
        });

        Schema::create('dental_teeth', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dental_chart_id')->constrained()->cascadeOnDelete();
            $table->string('tooth_number'); // FDI or Universal numbering system
            $table->string('tooth_name')->nullable(); // Central Incisor, Molar, etc.
            $table->json('conditions')->nullable(); // array of conditions: caries, missing, filled, etc.
            $table->json('restorations')->nullable(); // existing restorations
            $table->json('mobility')->nullable(); // mobility grade
            $table->boolean('is_extracted')->default(false);
            $table->date('extraction_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['dental_chart_id', 'tooth_number']);
            $table->index('tooth_number');
        });

        Schema::create('dental_procedures', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('category', ['scaling', 'filling', 'extraction', 'root_canal', 'crown', 'bridge', 'denture', 'implant', 'orthodontics', 'other'])->default('other');
            $table->decimal('base_cost', 10, 2)->default(0);
            $table->integer('duration_minutes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('category');
            $table->index('is_active');
        });

        Schema::create('dental_treatment_plans', function (Blueprint $table) {
            $table->id();
            $table->string('plan_number')->unique();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('dentist_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('dental_chart_id')->nullable()->constrained()->nullOnDelete();
            $table->date('plan_date')->useCurrent();
            $table->enum('status', ['draft', 'active', 'completed', 'cancelled'])->default('draft');
            $table->decimal('estimated_cost', 10, 2)->default(0);
            $table->decimal('actual_cost', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'status']);
            $table->index('dentist_id');
        });

        Schema::create('dental_treatment_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('treatment_plan_id')->constrained('dental_treatment_plans')->cascadeOnDelete();
            $table->foreignId('dental_procedure_id')->constrained('dental_procedures')->restrictOnDelete();
            $table->string('tooth_number')->nullable();
            $table->string('tooth_surface')->nullable(); // mesial, distal, occlusal, etc.
            $table->text('description')->nullable();
            $table->decimal('cost', 10, 2)->default(0);
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->date('scheduled_date')->nullable();
            $table->date('completed_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['treatment_plan_id', 'status']);
            $table->index('tooth_number');
        });

        Schema::create('dental_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('dentist_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('visit_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('treatment_plan_id')->nullable()->constrained('dental_treatment_plans')->nullOnDelete();
            $table->date('note_date')->useCurrent();
            $table->text('clinical_notes');
            $table->text('treatment_performed')->nullable();
            $table->text('prescriptions')->nullable();
            $table->text('follow_up_instructions')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'note_date']);
            $table->index('dentist_id');
        });

        Schema::create('dental_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('dental_chart_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('dental_note_id')->nullable()->constrained('dental_notes')->nullOnDelete();
            $table->string('attachment_type')->default('xray'); // xray, photo_before, photo_after, scan
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type');
            $table->integer('file_size');
            $table->string('mime_type');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'attachment_type']);
            $table->index('dental_chart_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dental_attachments');
        Schema::dropIfExists('dental_notes');
        Schema::dropIfExists('dental_treatment_items');
        Schema::dropIfExists('dental_treatment_plans');
        Schema::dropIfExists('dental_procedures');
        Schema::dropIfExists('dental_teeth');
        Schema::dropIfExists('dental_charts');
    }
};
