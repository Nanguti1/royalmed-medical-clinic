<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sensitive_data_access_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('record_type'); // patient, clinical_note, document, billing, report
            $table->unsignedBigInteger('record_id');
            $table->string('action'); // viewed, accessed, modified, exported
            $table->string('context')->nullable(); // profile, diagnosis, lab_result, invoice, etc.
            $table->text('access_reason')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('accessed_at')->useCurrent();

            $table->index(['record_type', 'record_id', 'accessed_at']);
            $table->index(['user_id', 'accessed_at']);
            $table->index('action');
        });

        Schema::create('login_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('session_id')->unique();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->string('device_type')->nullable();
            $table->string('browser')->nullable();
            $table->string('platform')->nullable();
            $table->json('location')->nullable();
            $table->timestamp('login_at')->useCurrent();
            $table->timestamp('logout_at')->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->enum('status', ['active', 'expired', 'logged_out', 'terminated'])->default('active');
            $table->text('termination_reason')->nullable();

            $table->index(['user_id', 'login_at']);
            $table->index('session_id');
            $table->index('status');
            $table->index('login_at');
        });

        Schema::create('retention_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('record_type'); // patient_records, lab_results, prescriptions, billing, documents
            $table->string('retention_period'); // 7_years, 10_years, 25_years, permanent
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['record_type', 'is_active']);
        });

        Schema::create('record_archives', function (Blueprint $table) {
            $table->id();
            $table->string('archive_number')->unique();
            $table->string('record_type');
            $table->unsignedBigInteger('record_id');
            $table->foreignId('retention_schedule_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('archive_status', ['archived', 'restored', 'purged'])->default('archived');
            $table->timestamp('archived_at')->useCurrent();
            $table->timestamp('restore_eligible_at')->nullable();
            $table->timestamp('purge_eligible_at')->nullable();
            $table->timestamp('restored_at')->nullable();
            $table->timestamp('purged_at')->nullable();
            $table->text('archive_reason')->nullable();
            $table->foreignId('archived_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('restored_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('purged_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('metadata')->nullable();

            $table->index(['record_type', 'record_id']);
            $table->index(['archive_status', 'archived_at']);
            $table->index('restore_eligible_at');
            $table->index('purge_eligible_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('record_archives');
        Schema::dropIfExists('retention_schedules');
        Schema::dropIfExists('login_sessions');
        Schema::dropIfExists('sensitive_data_access_logs');
    }
};
