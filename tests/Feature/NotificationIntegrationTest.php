<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\SmsLog;
use App\Models\WhatsAppLog;
use App\Notifications\AppointmentReminderNotification;
use App\Notifications\BillingNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class NotificationIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_appointment_reminder_notification(): void
    {
        $patient = Patient::factory()->create(['phone' => '0712345678', 'email' => 'test@example.com']);
        $appointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'appointment_date' => now()->addDays(2),
            'start_time' => '09:00',
        ]);

        Notification::fake();

        $patient->notify(new AppointmentReminderNotification($appointment));

        Notification::assertSentTo($patient, AppointmentReminderNotification::class);
    }

    public function test_billing_payment_due_notification(): void
    {
        $patient = Patient::factory()->create(['email' => 'test@example.com']);
        $invoice = Invoice::factory()->create([
            'due_date' => now()->addDays(3),
            'total_amount' => 5000,
        ]);

        Notification::fake();

        $patient->notify(new BillingNotification($invoice, 'payment_due'));

        Notification::assertSentTo($patient, BillingNotification::class);
    }

    public function test_billing_payment_received_notification(): void
    {
        $patient = Patient::factory()->create(['email' => 'test@example.com']);
        $invoice = Invoice::factory()->create([
            'total_amount' => 5000,
        ]);

        Notification::fake();

        $patient->notify(new BillingNotification($invoice, 'payment_received'));

        Notification::assertSentTo($patient, BillingNotification::class);
    }

    public function test_notification_database_channel(): void
    {
        $patient = Patient::factory()->create();
        $invoice = Invoice::factory()->create();

        Notification::fake();

        $patient->notify(new BillingNotification($invoice, 'payment_due'));

        Notification::assertSentTo($patient, BillingNotification::class, function ($notification, $channels) {
            return in_array('database', $channels);
        });
    }

    public function test_notification_mail_channel(): void
    {
        $patient = Patient::factory()->create(['email' => 'test@example.com']);
        $invoice = Invoice::factory()->create();

        Notification::fake();

        $patient->notify(new BillingNotification($invoice, 'payment_due'));

        Notification::assertSentTo($patient, BillingNotification::class, function ($notification, $channels) {
            return in_array('mail', $channels);
        });
    }

    public function test_sms_log_can_be_created(): void
    {
        $log = SmsLog::factory()->create([
            'recipient' => '254712345678',
            'message' => 'Test message',
            'status' => 'sent',
        ]);

        $this->assertDatabaseHas('sms_logs', [
            'recipient' => '254712345678',
            'status' => 'sent',
        ]);
    }

    public function test_whatsapp_log_can_be_created(): void
    {
        $log = WhatsAppLog::factory()->create([
            'recipient' => '254712345678',
            'message' => 'Test message',
            'status' => 'sent',
        ]);

        $this->assertDatabaseHas('whatsapp_logs', [
            'recipient' => '254712345678',
            'status' => 'sent',
        ]);
    }

    public function test_sms_log_mark_as_sent(): void
    {
        $log = SmsLog::factory()->create(['status' => 'pending']);

        $log->markAsSent();

        $this->assertEquals('sent', $log->fresh()->status);
        $this->assertNotNull($log->fresh()->sent_at);
    }

    public function test_sms_log_mark_as_failed(): void
    {
        $log = SmsLog::factory()->create(['status' => 'pending']);

        $log->markAsFailed('Network error');

        $this->assertEquals('failed', $log->fresh()->status);
        $this->assertEquals('Network error', $log->fresh()->error_message);
    }
}
