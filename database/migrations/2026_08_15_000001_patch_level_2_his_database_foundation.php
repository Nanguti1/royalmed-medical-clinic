<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->string('hospital_number')->nullable()->unique()->after('id');
            $table->string('photo_path')->nullable()->after('email');
            $table->string('occupation')->nullable()->after('photo_path');
            $table->string('employer')->nullable()->after('occupation');
            $table->string('marital_status')->nullable()->after('employer');
            $table->string('preferred_language')->nullable()->after('marital_status');
            $table->string('religion')->nullable()->after('preferred_language');
            $table->string('blood_group')->nullable()->after('religion');
            $table->index(['last_name', 'first_name'], 'patients_name_index');
            $table->index('date_of_birth', 'patients_date_of_birth_index');
        });

        Schema::create('patient_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->string('type')->default('phone');
            $table->string('value');
            $table->string('label')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->boolean('consent_to_contact')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['patient_id', 'type']);
            $table->index('value');
        });

        Schema::create('patient_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->string('type')->default('home');
            $table->text('address_line');
            $table->foreignId('county_id')->nullable()->constrained('counties')->nullOnDelete();
            $table->foreignId('sub_county_id')->nullable()->constrained('sub_counties')->nullOnDelete();
            $table->string('town')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['patient_id', 'type']);
        });

        Schema::create('patient_allergies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->string('allergen');
            $table->string('allergen_type')->nullable();
            $table->string('reaction')->nullable();
            $table->string('severity')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('recorded_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['patient_id', 'is_active']);
        });

        Schema::create('patient_chronic_conditions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->string('condition_name');
            $table->string('code')->nullable();
            $table->string('coding_system')->nullable();
            $table->date('diagnosed_on')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['patient_id', 'is_active']);
        });

        Schema::create('patient_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->string('type')->default('clinical');
            $table->string('title');
            $table->text('message')->nullable();
            $table->string('severity')->default('medium');
            $table->boolean('is_active')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['patient_id', 'is_active', 'severity']);
        });

        Schema::create('patient_relationships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('related_patient_id')->nullable()->constrained('patients')->nullOnDelete();
            $table->string('relationship');
            $table->string('name')->nullable();
            $table->string('phone')->nullable();
            $table->boolean('is_next_of_kin')->default(false);
            $table->boolean('is_emergency_contact')->default(false);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['patient_id', 'relationship']);
        });

        Schema::create('patient_merge_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('source_patient_id')->nullable()->constrained('patients')->nullOnDelete();
            $table->foreignId('target_patient_id')->constrained('patients')->restrictOnDelete();
            $table->json('merged_patient_snapshot')->nullable();
            $table->text('reason');
            $table->foreignId('merged_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('merged_at');
            $table->timestamps();
            $table->index(['source_patient_id', 'target_patient_id']);
        });

        Schema::table('vital_signs', function (Blueprint $table) {
            $table->decimal('oxygen_saturation', 5, 2)->nullable()->after('respiratory_rate');
            $table->decimal('bmi', 5, 2)->nullable()->after('height_cm');
            $table->unsignedTinyInteger('pain_score')->nullable()->after('bmi');
            $table->unsignedTinyInteger('news_score')->nullable()->after('pain_score');
            $table->string('chief_complaint')->nullable()->after('news_score');
            $table->text('nurse_notes')->nullable()->after('chief_complaint');
        });

        Schema::table('queue_entries', function (Blueprint $table) {
            $table->dropForeign(['visit_id']);
            $table->dropUnique(['visit_id']);
            $table->string('department')->default('consultation')->after('visit_id');
            $table->string('queue_number')->nullable()->after('department');
            $table->string('priority')->default('normal')->after('position');
            $table->timestamp('started_at')->nullable()->after('called_at');
            $table->timestamp('completed_at')->nullable()->after('served_at');
            $table->integer('waiting_minutes')->nullable()->after('completed_at');
            $table->index(['department', 'status', 'priority'], 'queue_entries_worklist_index');
            $table->unique(['department', 'queue_number'], 'queue_entries_department_number_unique');
            $table->foreign('visit_id')->references('id')->on('visits')->cascadeOnDelete();
        });

        Schema::table('diagnoses', function (Blueprint $table) {
            $table->string('coding_system')->default('ICD-10')->after('code');
            $table->string('diagnosis_type')->default('primary')->after('description');
            $table->string('certainty')->default('confirmed')->after('diagnosis_type');
            $table->unsignedSmallInteger('rank')->default(1)->after('certainty');
            $table->index(['code', 'coding_system'], 'diagnoses_code_system_index');
            $table->index(['consultation_id', 'diagnosis_type'], 'diagnoses_consultation_type_index');
        });

        Schema::create('consultation_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('specialty')->nullable();
            $table->text('chief_complaint')->nullable();
            $table->text('history')->nullable();
            $table->text('examination')->nullable();
            $table->text('plan')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['specialty', 'is_active']);
        });

        Schema::create('clinical_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('visit_id')->nullable()->constrained('visits')->nullOnDelete();
            $table->foreignId('consultation_id')->nullable()->constrained('consultations')->nullOnDelete();
            $table->string('title');
            $table->string('file_path');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->string('attachment_type')->default('clinical');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['patient_id', 'attachment_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clinical_attachments');
        Schema::dropIfExists('consultation_templates');

        Schema::table('diagnoses', function (Blueprint $table) {
            $table->dropIndex('diagnoses_code_system_index');
            $table->dropIndex('diagnoses_consultation_type_index');
            $table->dropColumn(['coding_system', 'diagnosis_type', 'certainty', 'rank']);
        });

        Schema::table('queue_entries', function (Blueprint $table) {
            $table->dropForeign(['visit_id']);
            $table->dropUnique('queue_entries_department_number_unique');
            $table->dropIndex('queue_entries_worklist_index');
            $table->dropColumn(['department', 'queue_number', 'priority', 'started_at', 'completed_at', 'waiting_minutes']);
            $table->unique(['visit_id']);
            $table->foreign('visit_id')->references('id')->on('visits')->cascadeOnDelete();
        });

        Schema::table('vital_signs', function (Blueprint $table) {
            $table->dropColumn(['oxygen_saturation', 'bmi', 'pain_score', 'news_score', 'chief_complaint', 'nurse_notes']);
        });

        Schema::dropIfExists('patient_merge_records');
        Schema::dropIfExists('patient_relationships');
        Schema::dropIfExists('patient_alerts');
        Schema::dropIfExists('patient_chronic_conditions');
        Schema::dropIfExists('patient_allergies');
        Schema::dropIfExists('patient_addresses');
        Schema::dropIfExists('patient_contacts');

        Schema::table('patients', function (Blueprint $table) {
            $table->dropIndex('patients_name_index');
            $table->dropIndex('patients_date_of_birth_index');
            $table->dropUnique(['hospital_number']);
            $table->dropColumn(['hospital_number', 'photo_path', 'occupation', 'employer', 'marital_status', 'preferred_language', 'religion', 'blood_group']);
        });
    }
};
