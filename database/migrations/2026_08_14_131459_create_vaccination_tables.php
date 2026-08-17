<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vaccines', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('batch_number_format')->nullable();
            $table->enum('route', ['intramuscular', 'subcutaneous', 'oral', 'intranasal'])->default('intramuscular');
            $table->json('target_diseases')->nullable(); // diseases prevented
            $table->integer('doses_required')->default(1);
            $table->integer('min_age_months')->nullable();
            $table->integer('max_age_months')->nullable();
            $table->integer('interval_days')->nullable(); // days between doses
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('is_active');
        });

        Schema::create('vaccination_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('schedule_name');
            $table->text('description')->nullable();
            $table->enum('schedule_type', ['routine', 'catch_up', 'special'])->default('routine');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('is_active');
        });

        Schema::create('vaccination_schedule_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vaccination_schedule_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vaccine_id')->constrained()->restrictOnDelete();
            $table->integer('dose_number')->default(1);
            $table->integer('min_age_months')->nullable();
            $table->integer('max_age_months')->nullable();
            $table->integer('recommended_age_months')->nullable();
            $table->timestamps();

            $table->index(['vaccination_schedule_id', 'dose_number'], 'vsi_schedule_dose_idx');
        });

        Schema::create('vaccination_records', function (Blueprint $table) {
            $table->id();
            $table->string('record_number')->unique();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vaccine_id')->constrained()->restrictOnDelete();
            $table->foreignId('visit_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('administered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('administration_date')->useCurrent();
            $table->integer('dose_number')->default(1);
            $table->string('batch_number')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('site')->nullable(); // left_arm, right_arm, thigh
            $table->enum('route', ['intramuscular', 'subcutaneous', 'oral', 'intranasal'])->default('intramuscular');
            $table->decimal('dosage', 8, 3)->nullable();
            $table->string('dosage_unit')->nullable();
            $table->text('reactions')->nullable();
            $table->text('notes')->nullable();
            $table->date('next_due_date')->nullable();
            $table->enum('status', ['scheduled', 'administered', 'deferred', 'contraindicated'])->default('administered');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'vaccine_id']);
            $table->index(['patient_id', 'administration_date']);
            $table->index('next_due_date');
            $table->index('status');
        });

        Schema::create('vaccination_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vaccination_record_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->date('due_date');
            $table->enum('reminder_type', ['sms', 'email', 'whatsapp'])->default('sms');
            $table->boolean('is_sent')->default(false);
            $table->timestamp('scheduled_at');
            $table->timestamp('sent_at')->nullable();
            $table->text('message')->nullable();
            $table->string('status')->nullable(); // success, failed
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'due_date']);
            $table->index(['vaccination_record_id', 'is_sent']);
            $table->index('scheduled_at');
        });

        Schema::create('vaccination_certificates', function (Blueprint $table) {
            $table->id();
            $table->string('certificate_number')->unique();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vaccination_record_id')->constrained()->cascadeOnDelete();
            $table->date('issue_date')->useCurrent();
            $table->date('valid_from')->useCurrent();
            $table->date('valid_until')->nullable();
            $table->string('issuing_authority')->default('Royalmed Clinic');
            $table->string('issuer_name')->nullable();
            $table->string('issuer_license')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->enum('status', ['issued', 'revoked', 'expired'])->default('issued');
            $table->text('revocation_reason')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'status']);
            $table->index('valid_until');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vaccination_certificates');
        Schema::dropIfExists('vaccination_reminders');
        Schema::dropIfExists('vaccination_records');
        Schema::dropIfExists('vaccination_schedule_items');
        Schema::dropIfExists('vaccination_schedules');
        Schema::dropIfExists('vaccines');
    }
};
