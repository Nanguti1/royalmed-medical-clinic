<?php

namespace App\Notifications;

use App\Models\Appointment;
use App\Notifications\Channels\SmsChannel;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected Appointment $appointment
    ) {}

    public function via($notifiable): array
    {
        $channels = ['database'];

        if (config('notifications.sms.enabled', false)) {
            $channels[] = SmsChannel::class;
        }

        if (config('notifications.email.enabled', true)) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toSms($notifiable): ?array
    {
        if (! $notifiable->phone) {
            return null;
        }

        $date = $this->appointment->appointment_date->format('l, F j, Y');
        $time = Carbon::parse($this->appointment->start_time)->format('g:i A');

        return [
            'to' => $this->formatPhoneNumber($notifiable->phone),
            'message' => "Reminder: You have an appointment at Royalmed Clinic on {$date} at {$time}. Please arrive 15 minutes early.",
        ];
    }

    public function toMail($notifiable)
    {
        $date = $this->appointment->appointment_date->format('l, F j, Y');
        $time = Carbon::parse($this->appointment->start_time)->format('g:i A');

        return (new MailMessage)
            ->subject('Appointment Reminder - Royalmed Clinic')
            ->greeting('Hello '.$notifiable->first_name)
            ->line('This is a reminder for your upcoming appointment.')
            ->line('**Date:** '.$date)
            ->line('**Time:** '.$time)
            ->line('Please arrive 15 minutes early.')
            ->line('If you need to reschedule, please contact us.')
            ->salutation('Best regards, Royalmed Clinic');
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'appointment_reminder',
            'appointment_id' => $this->appointment->id,
            'appointment_date' => $this->appointment->appointment_date->toDateString(),
            'appointment_time' => $this->appointment->start_time,
            'message' => 'You have an upcoming appointment reminder.',
        ];
    }

    protected function formatPhoneNumber(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with($phone, '0')) {
            $phone = '254'.substr($phone, 1);
        } elseif (str_starts_with($phone, '+254')) {
            $phone = substr($phone, 1);
        }

        return $phone;
    }
}
