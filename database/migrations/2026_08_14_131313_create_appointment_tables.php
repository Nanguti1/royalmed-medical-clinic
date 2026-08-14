<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctor_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained('users')->cascadeOnDelete();
            $table->string('day_of_week'); // Monday, Tuesday, etc.
            $table->time('start_time');
            $table->time('end_time');
            $table->string('session_type')->default('regular'); // regular, extended, emergency
            $table->boolean('is_available')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['doctor_id', 'day_of_week', 'start_time']);
            $table->index('is_available');
        });

        Schema::create('dental_chair_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('chair_name');
            $table->string('chair_number')->unique();
            $table->foreignId('dentist_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('day_of_week');
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_available')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['chair_number', 'day_of_week', 'start_time']);
            $table->index('is_available');
        });

        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->string('appointment_number')->unique();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('doctor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('dental_chair_id')->nullable()->constrained('dental_chair_schedules')->nullOnDelete();
            $table->foreignId('visit_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('consultation_id')->nullable()->constrained()->nullOnDelete();
            $table->dateTime('appointment_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('appointment_type', ['consultation', 'follow_up', 'procedure', 'dental', 'laboratory', 'walk_in'])->default('consultation');
            $table->enum('status', ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'])->default('scheduled');
            $table->text('reason')->nullable();
            $table->text('notes')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->boolean('is_walk_in')->default(false);
            $table->boolean('is_follow_up')->default(false);
            $table->timestamp('checked_in_at')->nullable();
            $table->timestamp('checked_out_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['appointment_date', 'status']);
            $table->index(['doctor_id', 'appointment_date', 'start_time']);
            $table->index(['patient_id', 'appointment_date']);
            $table->index('status');
            $table->index('is_walk_in');
            $table->index('is_follow_up');
        });

        Schema::create('appointment_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained()->cascadeOnDelete();
            $table->enum('reminder_type', ['sms', 'email', 'whatsapp'])->default('sms');
            $table->boolean('is_sent')->default(false);
            $table->timestamp('scheduled_at');
            $table->timestamp('sent_at')->nullable();
            $table->text('message')->nullable();
            $table->string('status')->nullable(); // success, failed
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['appointment_id', 'is_sent']);
            $table->index('scheduled_at');
        });

        Schema::create('waitlist_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('doctor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('dental_chair_id')->nullable()->constrained('dental_chair_schedules')->nullOnDelete();
            $table->enum('appointment_type', ['consultation', 'follow_up', 'procedure', 'dental'])->default('consultation');
            $table->text('reason')->nullable();
            $table->text('notes')->nullable();
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->timestamp('requested_date')->useCurrent();
            $table->timestamp('contacted_at')->nullable();
            $table->enum('status', ['pending', 'contacted', 'scheduled', 'cancelled'])->default('pending');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['doctor_id', 'status']);
            $table->index(['dental_chair_id', 'status']);
            $table->index('priority');
            $table->index('requested_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waitlist_entries');
        Schema::dropIfExists('appointment_reminders');
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('dental_chair_schedules');
        Schema::dropIfExists('doctor_schedules');
    }
};
