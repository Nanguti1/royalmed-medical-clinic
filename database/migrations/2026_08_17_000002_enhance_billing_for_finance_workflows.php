<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Create new tables first before adding foreign keys to existing tables

        // Discounts (create before credit_notes which references it)
        Schema::create('discounts', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('type')->default('percentage'); // percentage, fixed
            $table->decimal('value', 12, 2);
            $table->decimal('max_discount_amount', 12, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->date('valid_from')->nullable();
            $table->date('valid_to')->nullable();
            $table->string('applicable_to')->default('all'); // all, services, medicines, lab_tests
            $table->text('description')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['code', 'is_active']);
            $table->index(['is_active', 'valid_from', 'valid_to']);
        });

        // Enhance payment_methods for card payments
        Schema::table('payment_methods', function (Blueprint $table) {
            $table->string('type')->default('cash')->after('name'); // cash, card, mpesa, bank_transfer, cheque, mobile_money
            $table->boolean('is_active')->default(true)->after('details');
            $table->index(['type', 'is_active']);
        });

        // Add card payment details to payments
        Schema::table('payments', function (Blueprint $table) {
            $table->string('card_last_four')->nullable()->after('reference');
            $table->string('card_type')->nullable()->after('card_last_four'); // visa, mastercard, etc
            $table->string('transaction_id')->nullable()->after('card_type');
            $table->boolean('is_deposit')->default(false)->after('transaction_id');
            $table->foreignId('deposit_payment_id')->nullable()->after('is_deposit')->constrained('payments')->nullOnDelete();
            $table->decimal('refund_amount', 12, 2)->default(0)->after('deposit_payment_id');
            $table->index(['is_deposit']);
            $table->index(['deposit_payment_id']);
        });

        // Add billing enhancements to invoices
        Schema::table('invoices', function (Blueprint $table) {
            $table->decimal('discount_amount', 12, 2)->default(0)->after('due_amount');
            $table->decimal('tax_amount', 12, 2)->default(0)->after('discount_amount');
            $table->foreignId('discount_id')->nullable()->after('tax_amount')->constrained('discounts')->nullOnDelete();
            $table->foreignId('patient_coverage_id')->nullable()->after('discount_id')->constrained('patient_coverages')->nullOnDelete();
            $table->foreignId('insurance_claim_id')->nullable()->after('patient_coverage_id')->constrained('insurance_claims')->nullOnDelete();
            $table->boolean('is_insurance_claim')->default(false)->after('insurance_claim_id');
            $table->text('notes')->nullable()->after('is_insurance_claim');
            $table->index(['is_insurance_claim']);
            $table->index(['patient_coverage_id']);
            $table->index(['insurance_claim_id']);
        });

        // Credit notes
        Schema::create('credit_notes', function (Blueprint $table) {
            $table->id();
            $table->string('credit_note_number')->unique();
            $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();
            $table->foreignId('payment_id')->nullable()->constrained('payments')->nullOnDelete();
            $table->string('reason'); // refund, return, discount, adjustment, cancellation
            $table->decimal('amount', 12, 2);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2);
            $table->text('description')->nullable();
            $table->string('status')->default('issued'); // issued, applied, voided
            $table->date('issued_date');
            $table->date('applied_date')->nullable();
            $table->foreignId('issued_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['credit_note_number']);
            $table->index(['invoice_id']);
            $table->index(['status']);
            $table->index(['issued_date']);
        });

        // Refunds
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->string('refund_number')->unique();
            $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->foreignId('credit_note_id')->nullable()->constrained('credit_notes')->nullOnDelete();
            $table->string('reason'); // overpayment, service_cancellation, return, error, other
            $table->decimal('amount', 12, 2);
            $table->string('status')->default('pending'); // pending, approved, processed, rejected
            $table->date('requested_date');
            $table->date('approved_date')->nullable();
            $table->date('processed_date')->nullable();
            $table->string('refund_method')->nullable(); // original, cash, bank_transfer
            $table->string('bank_name')->nullable();
            $table->string('bank_account')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->foreignId('requested_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['refund_number']);
            $table->index(['payment_id']);
            $table->index(['status']);
            $table->index(['requested_date']);
        });

        // Payment plans
        Schema::create('payment_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->string('status')->default('active'); // active, completed, cancelled, defaulted
            $table->decimal('total_amount', 12, 2);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->decimal('remaining_amount', 12, 2);
            $table->integer('installment_count')->default(1);
            $table->integer('completed_installments')->default(0);
            $table->string('frequency')->default('monthly'); // weekly, biweekly, monthly
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->date('next_payment_date')->nullable();
            $table->decimal('installment_amount', 12, 2);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['invoice_id']);
            $table->index(['patient_id', 'status']);
            $table->index(['status', 'next_payment_date']);
        });

        // Payment plan installments
        Schema::create('payment_plan_installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_plan_id')->constrained('payment_plans')->cascadeOnDelete();
            $table->integer('installment_number');
            $table->decimal('amount', 12, 2);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->date('due_date');
            $table->date('paid_date')->nullable();
            $table->string('status')->default('pending'); // pending, paid, overdue, waived
            $table->foreignId('payment_id')->nullable()->constrained('payments')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['payment_plan_id']);
            $table->index(['due_date', 'status']);
        });

        // Deposit payments
        Schema::create('deposits', function (Blueprint $table) {
            $table->id();
            $table->string('deposit_number')->unique();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->decimal('used_amount', 12, 2)->default(0);
            $table->decimal('remaining_amount', 12, 2);
            $table->string('status')->default('active'); // active, exhausted, refunded, expired
            $table->date('deposit_date');
            $table->date('expiry_date')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['deposit_number']);
            $table->index(['patient_id', 'status']);
            $table->index(['status', 'expiry_date']);
        });

        // Deposit allocations
        Schema::create('deposit_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deposit_id')->constrained('deposits')->cascadeOnDelete();
            $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->timestamp('allocated_at');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['deposit_id']);
            $table->index(['payment_id']);
            $table->index(['invoice_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('deposit_allocations');
        Schema::dropIfExists('deposits');
        Schema::dropIfExists('payment_plan_installments');
        Schema::dropIfExists('payment_plans');
        Schema::dropIfExists('refunds');
        Schema::dropIfExists('credit_notes');
        Schema::dropIfExists('discounts');

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropForeign(['discount_id']);
            $table->dropForeign(['patient_coverage_id']);
            $table->dropForeign(['insurance_claim_id']);
            $table->dropColumn(['discount_amount', 'tax_amount', 'discount_id', 'patient_coverage_id', 'insurance_claim_id', 'is_insurance_claim', 'notes']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['deposit_payment_id']);
            $table->dropColumn(['card_last_four', 'card_type', 'transaction_id', 'is_deposit', 'deposit_payment_id', 'refund_amount']);
        });

        Schema::table('payment_methods', function (Blueprint $table) {
            $table->dropColumn(['type', 'is_active']);
        });
    }
};
