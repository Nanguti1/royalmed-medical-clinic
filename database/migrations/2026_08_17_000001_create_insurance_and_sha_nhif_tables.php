<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Insurers table - insurance companies and NHIF/SHA
        Schema::create('insurers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('type')->default('private'); // private, corporate, nhif, sha
            $table->string('contact_person')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('town')->nullable();
            $table->string('postal_code')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['code', 'is_active']);
            $table->index(['type', 'is_active']);
        });

        // Insurance schemes/plans
        Schema::create('insurance_schemes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('insurer_id')->constrained('insurers')->cascadeOnDelete();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('scheme_type')->default('outpatient'); // outpatient, inpatient, comprehensive, dental, optical
            $table->decimal('coverage_limit', 12, 2)->nullable();
            $table->decimal('co_payment_amount', 12, 2)->default(0);
            $table->decimal('co_payment_percentage', 5, 2)->default(0);
            $table->boolean('requires_preauthorization')->default(false);
            $table->boolean('is_active')->default(true);
            $table->date('effective_from')->nullable();
            $table->date('effective_to')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['insurer_id', 'is_active']);
            $table->index(['code', 'is_active']);
        });

        // Patient insurance coverage
        Schema::create('patient_coverages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('insurer_id')->constrained('insurers')->cascadeOnDelete();
            $table->foreignId('insurance_scheme_id')->nullable()->constrained('insurance_schemes')->nullOnDelete();
            $table->string('policy_number')->unique();
            $table->string('member_number')->nullable();
            $table->string('member_name')->nullable();
            $table->string('relationship')->default('self'); // self, spouse, child, parent, other
            $table->string('principal_name')->nullable();
            $table->string('principal_policy_number')->nullable();
            $table->date('effective_from');
            $table->date('effective_to')->nullable();
            $table->boolean('is_primary')->default(true);
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'is_active']);
            $table->index(['policy_number']);
            $table->index(['insurer_id', 'is_active']);
        });

        // Employer/corporate coverage
        Schema::create('employer_schemes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->foreignId('insurer_id')->nullable()->constrained('insurers')->nullOnDelete();
            $table->foreignId('insurance_scheme_id')->nullable()->constrained('insurance_schemes')->nullOnDelete();
            $table->string('account_number')->nullable();
            $table->decimal('credit_limit', 12, 2)->nullable();
            $table->decimal('current_balance', 12, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['name', 'is_active']);
        });

        // Patient employer coverage
        Schema::create('patient_employer_coverage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('employer_scheme_id')->constrained('employer_schemes')->cascadeOnDelete();
            $table->string('employee_number')->nullable();
            $table->string('department')->nullable();
            $table->date('effective_from');
            $table->date('effective_to')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'is_active']);
        });

        // Insurance claims
        Schema::create('insurance_claims', function (Blueprint $table) {
            $table->id();
            $table->string('claim_number')->unique();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('insurer_id')->constrained('insurers')->cascadeOnDelete();
            $table->foreignId('insurance_scheme_id')->nullable()->constrained('insurance_schemes')->nullOnDelete();
            $table->foreignId('patient_coverage_id')->nullable()->constrained('patient_coverages')->nullOnDelete();
            $table->foreignId('employer_scheme_id')->nullable()->constrained('employer_schemes')->nullOnDelete();
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->nullOnDelete();
            $table->string('status')->default('draft'); // draft, submitted, pending, approved, rejected, partially_paid, paid, resubmitted
            $table->decimal('claimed_amount', 12, 2)->default(0);
            $table->decimal('approved_amount', 12, 2)->default(0);
            $table->decimal('rejected_amount', 12, 2)->default(0);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->date('service_date_from')->nullable();
            $table->date('service_date_to')->nullable();
            $table->date('submission_date')->nullable();
            $table->date('approval_date')->nullable();
            $table->date('payment_date')->nullable();
            $table->string('authorization_number')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['claim_number']);
            $table->index(['patient_id', 'status']);
            $table->index(['insurer_id', 'status']);
            $table->index(['invoice_id']);
            $table->index(['submission_date']);
            $table->index(['status', 'submission_date']);
        });

        // Claim items (line items for a claim)
        Schema::create('claim_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('insurance_claim_id')->constrained('insurance_claims')->cascadeOnDelete();
            $table->foreignId('invoice_item_id')->nullable()->constrained('invoice_items')->nullOnDelete();
            $table->string('service_code')->nullable();
            $table->string('service_name');
            $table->text('description')->nullable();
            $table->decimal('quantity', 12, 2)->default(1);
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('claimed_amount', 12, 2)->default(0);
            $table->decimal('approved_amount', 12, 2)->default(0);
            $table->decimal('rejected_amount', 12, 2)->default(0);
            $table->string('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['insurance_claim_id']);
        });

        // Claim status history
        Schema::create('claim_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('insurance_claim_id')->constrained('insurance_claims')->cascadeOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->text('notes')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['insurance_claim_id']);
            $table->index(['to_status']);
        });

        // Preauthorizations
        Schema::create('preauthorizations', function (Blueprint $table) {
            $table->id();
            $table->string('authorization_number')->unique();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('insurer_id')->constrained('insurers')->cascadeOnDelete();
            $table->foreignId('insurance_scheme_id')->nullable()->constrained('insurance_schemes')->nullOnDelete();
            $table->foreignId('patient_coverage_id')->nullable()->constrained('patient_coverages')->nullOnDelete();
            $table->foreignId('visit_id')->nullable()->constrained('visits')->nullOnDelete();
            $table->string('status')->default('pending'); // pending, approved, rejected, expired, used
            $table->decimal('authorized_amount', 12, 2)->default(0);
            $table->decimal('used_amount', 12, 2)->default(0);
            $table->text('requested_services')->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('justification')->nullable();
            $table->date('request_date');
            $table->date('approval_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->date('usage_date')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['authorization_number']);
            $table->index(['patient_id', 'status']);
            $table->index(['insurer_id', 'status']);
            $table->index(['visit_id']);
            $table->index(['status', 'expiry_date']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('preauthorizations');
        Schema::dropIfExists('claim_status_history');
        Schema::dropIfExists('claim_items');
        Schema::dropIfExists('insurance_claims');
        Schema::dropIfExists('patient_employer_coverage');
        Schema::dropIfExists('employer_schemes');
        Schema::dropIfExists('patient_coverages');
        Schema::dropIfExists('insurance_schemes');
        Schema::dropIfExists('insurers');
    }
};
