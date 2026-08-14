<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sms_logs', function (Blueprint $table) {
            $table->id();
            $table->string('recipient');
            $table->text('message');
            $table->enum('status', ['pending', 'sent', 'failed'])->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->string('gateway')->default('log');
            $table->text('error_message')->nullable();
            $table->timestamps();
        });

        Schema::table('sms_logs', function (Blueprint $table) {
            $table->index('status');
            $table->index('sent_at');
            $table->index('gateway');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sms_logs');
    }
};
