<?php

namespace App\Notifications;

use App\Models\LabResult;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LabAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected LabResult $labResult,
        protected string $alertType
    ) {}

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $labOrder = $this->labResult->labOrder;
        $patient = $labOrder?->visit?->patient;
        $testName = $this->labResult->test?->name;
        $patientName = $patient ? ($patient->first_name.' '.$patient->last_name) : 'Unknown';

        $subject = match ($this->alertType) {
            'critical' => 'CRITICAL Lab Result Alert - '.$patientName,
            'abnormal' => 'Abnormal Lab Result - '.$patientName,
            'verified' => 'Lab Result Verified - '.$patientName,
            default => 'Lab Result Notification - Royalmed Clinic',
        };

        return (new MailMessage)
            ->subject($subject)
            ->greeting('Hello '.$notifiable->first_name)
            ->line('A lab result requires your attention.')
            ->line('**Patient:** '.$patientName)
            ->line('**Test:** '.$testName ?? 'Unknown')
            ->line('**Result:** '.$this->labResult->result_value)
            ->line('**Status:** '.ucfirst($this->labResult->verification_status ?? 'pending'))
            ->line(match ($this->alertType) {
                'critical' => '**ALERT: This is a CRITICAL result. Immediate action required.**',
                'abnormal' => '**Note: This result is outside normal range.**',
                'verified' => 'The result has been verified and is ready for review.',
                default => '',
            })
            ->action('View Result', url('/lab-results/'.$this->labResult->id))
            ->salutation('Best regards, Royalmed Clinic');
    }

    public function toArray($notifiable): array
    {
        $labOrder = $this->labResult->labOrder;
        $patient = $labOrder?->visit?->patient;
        $patientName = $patient ? ($patient->first_name.' '.$patient->last_name) : 'Unknown';

        return [
            'type' => 'lab_'.$this->alertType,
            'lab_result_id' => $this->labResult->id,
            'patient_id' => $patient?->id,
            'patient_name' => $patientName,
            'test_name' => $this->labResult->test?->name,
            'result_value' => $this->labResult->result_value,
            'is_critical' => $this->labResult->is_critical,
            'message' => 'Lab result alert for '.$patientName,
        ];
    }
}
