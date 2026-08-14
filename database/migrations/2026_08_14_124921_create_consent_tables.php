<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consent_templates', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('category'); // treatment, surgery, anesthesia, research, data_sharing, photography, etc.
            $table->text('content');
            $table->text('description')->nullable();
            $table->boolean('requires_signature')->default(true);
            $table->boolean('requires_witness')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('validity_days')->nullable(); // null = indefinite
            $table->integer('minimum_age')->default(18);
            $table->string('version')->default('1.0');
            $table->timestamp('effective_from')->useCurrent();
            $table->timestamp('effective_to')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category', 'is_active']);
            $table->index('code');
        });

        Schema::create('patient_consents', function (Blueprint $table) {
            $table->id();
            $table->string('consent_number')->unique();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('consent_template_id')->constrained()->cascadeOnDelete();
            $table->foreignId('visit_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('consultation_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('status', ['draft', 'signed', 'revoked', 'expired'])->default('draft');
            $table->timestamp('signed_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->text('revocation_reason')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('signed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('revoked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['patient_id', 'status']);
            $table->index(['consent_template_id', 'status']);
            $table->index(['visit_id', 'status']);
            $table->index('expires_at');
        });

        Schema::create('consent_signatures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_consent_id')->constrained()->cascadeOnDelete();
            $table->enum('signer_type', ['patient', 'guardian', 'witness', 'provider']);
            $table->foreignId('signer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('signer_name');
            $table->string('relationship')->nullable(); // for guardians: parent, spouse, etc.
            $table->text('signature_data')->nullable(); // Base64 or signature metadata
            $table->string('signature_method')->default('digital'); // digital, handwritten, typed
            $table->timestamp('signed_at')->useCurrent();
            $table->string('ip_address')->nullable();
            $table->text('notes')->nullable();

            $table->index(['patient_consent_id', 'signer_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consent_signatures');
        Schema::dropIfExists('patient_consents');
        Schema::dropIfExists('consent_templates');
    }
};
