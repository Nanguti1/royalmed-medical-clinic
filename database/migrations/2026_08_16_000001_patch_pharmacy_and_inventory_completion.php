<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Patch medicines table for controlled drug flags
        Schema::table('medicines', function (Blueprint $table) {
            if (! Schema::hasColumn('medicines', 'is_controlled')) {
                $table->boolean('is_controlled')->default(false)->after('reorder_level');
            }
            if (! Schema::hasColumn('medicines', 'controlled_schedule')) {
                $table->string('controlled_schedule')->nullable()->after('is_controlled');
            }
        });

        // 2. Create drug_interactions table
        if (! Schema::hasTable('drug_interactions')) {
            Schema::create('drug_interactions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('medicine_id_1')->constrained('medicines')->cascadeOnDelete();
                $table->foreignId('medicine_id_2')->constrained('medicines')->cascadeOnDelete();
                $table->string('severity')->default('moderate'); // major, moderate, minor
                $table->text('description')->nullable();
                $table->text('recommendation')->nullable();
                $table->timestamps();
                $table->unique(['medicine_id_1', 'medicine_id_2']);
            });
        }

        // 3. Create controlled_drug_register table
        if (! Schema::hasTable('controlled_drug_register')) {
            Schema::create('controlled_drug_register', function (Blueprint $table) {
                $table->id();
                $table->foreignId('medicine_id')->constrained('medicines')->cascadeOnDelete();
                $table->foreignId('inventory_batch_id')->nullable()->constrained('inventory_batches')->nullOnDelete();
                $table->foreignId('patient_id')->nullable()->constrained('patients')->nullOnDelete();
                $table->foreignId('prescription_id')->nullable()->constrained('prescriptions')->nullOnDelete();
                $table->decimal('quantity', 12, 2);
                $table->string('transaction_type'); // dispense, receipt, adjustment, return
                $table->decimal('balance_after', 12, 2)->default(0);
                $table->string('prescriber_name')->nullable();
                $table->foreignId('dispensed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('witness_by')->nullable()->constrained('users')->nullOnDelete();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // 4. Create stock_adjustments table
        if (! Schema::hasTable('stock_adjustments')) {
            Schema::create('stock_adjustments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('medicine_id')->constrained('medicines')->cascadeOnDelete();
                $table->foreignId('inventory_batch_id')->nullable()->constrained('inventory_batches')->nullOnDelete();
                $table->string('adjustment_type'); // addition, subtraction, write_off, expiry, damage, return
                $table->decimal('quantity', 12, 2);
                $table->string('reason');
                $table->string('status')->default('approved'); // pending, approved, rejected
                $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('approved_at')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // 5. Create stock_transfers table
        if (! Schema::hasTable('stock_transfers')) {
            Schema::create('stock_transfers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('medicine_id')->constrained('medicines')->cascadeOnDelete();
                $table->foreignId('inventory_batch_id')->nullable()->constrained('inventory_batches')->nullOnDelete();
                $table->string('from_location')->default('Main Store');
                $table->string('to_location')->default('OPD Pharmacy');
                $table->decimal('quantity', 12, 2);
                $table->string('status')->default('completed'); // pending, completed, cancelled
                $table->foreignId('transferred_by')->nullable()->constrained('users')->nullOnDelete();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // 6. Create purchase_orders table
        if (! Schema::hasTable('purchase_orders')) {
            Schema::create('purchase_orders', function (Blueprint $table) {
                $table->id();
                $table->string('po_number')->unique();
                $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnDelete();
                $table->date('order_date')->useCurrent();
                $table->string('status')->default('submitted'); // draft, submitted, received, cancelled
                $table->decimal('total_amount', 12, 2)->default(0);
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // 7. Create purchase_order_items table
        if (! Schema::hasTable('purchase_order_items')) {
            Schema::create('purchase_order_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('purchase_order_id')->constrained('purchase_orders')->cascadeOnDelete();
                $table->foreignId('medicine_id')->constrained('medicines')->cascadeOnDelete();
                $table->decimal('quantity_ordered', 12, 2);
                $table->decimal('quantity_received', 12, 2)->default(0);
                $table->decimal('unit_price', 12, 2)->default(0);
                $table->decimal('total_price', 12, 2)->default(0);
                $table->timestamps();
            });
        }

        // 8. Create goods_received_notes table
        if (! Schema::hasTable('goods_received_notes')) {
            Schema::create('goods_received_notes', function (Blueprint $table) {
                $table->id();
                $table->string('grn_number')->unique();
                $table->foreignId('purchase_order_id')->nullable()->constrained('purchase_orders')->nullOnDelete();
                $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnDelete();
                $table->date('received_date')->useCurrent();
                $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
                $table->string('delivery_note_number')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('goods_received_notes');
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
        Schema::dropIfExists('stock_transfers');
        Schema::dropIfExists('stock_adjustments');
        Schema::dropIfExists('controlled_drug_register');
        Schema::dropIfExists('drug_interactions');
        Schema::table('medicines', function (Blueprint $table) {
            $table->dropColumn(['is_controlled', 'controlled_schedule']);
        });
    }
};
