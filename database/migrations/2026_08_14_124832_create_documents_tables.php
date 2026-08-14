<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('document_number')->unique();
            $table->foreignId('patient_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('visit_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('consultation_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('lab_result_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->string('category')->default('general'); // clinical, lab, consent, dental, scanned, etc.
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type');
            $table->unsignedBigInteger('file_size');
            $table->string('mime_type');
            $table->text('description')->nullable();
            $table->boolean('is_sensitive')->default(false);
            $table->boolean('is_confidential')->default(false);
            $table->timestamp('uploaded_at')->useCurrent();
            $table->timestamp('expires_at')->nullable();
            $table->string('storage_location')->default('local');
            $table->text('metadata')->nullable(); // JSON metadata
            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'category']);
            $table->index(['visit_id', 'category']);
            $table->index(['uploaded_at', 'category']);
            $table->index('is_sensitive');
            $table->index('is_confidential');
        });

        Schema::create('document_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->cascadeOnDelete();
            $table->integer('version_number');
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type');
            $table->unsignedBigInteger('file_size');
            $table->string('mime_type');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('change_notes')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['document_id', 'version_number']);
            $table->index(['document_id', 'version_number']);
        });

        Schema::create('document_access_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action'); // viewed, downloaded, printed, shared
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->text('access_reason')->nullable();
            $table->timestamp('accessed_at')->useCurrent();

            $table->index(['document_id', 'accessed_at']);
            $table->index(['user_id', 'accessed_at']);
            $table->index('action');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_access_logs');
        Schema::dropIfExists('document_versions');
        Schema::dropIfExists('documents');
    }
};
