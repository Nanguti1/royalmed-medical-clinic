<?php

namespace App\Notifications;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BillingNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected Invoice $invoice,
        protected string $type
    ) {}

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $subject = match ($this->type) {
            'payment_due' => 'Payment Due - Invoice #'.$this->invoice->invoice_number,
            'payment_received' => 'Payment Received - Invoice #'.$this->invoice->invoice_number,
            'overdue' => 'Overdue Invoice - #'.$this->invoice->invoice_number,
            default => 'Billing Notification - Royalmed Clinic',
        };

        $mail = (new MailMessage)
            ->subject($subject)
            ->greeting('Hello '.$notifiable->first_name);

        return match ($this->type) {
            'payment_due' => $mail
                ->line('This is a reminder that payment for invoice #'.$this->invoice->invoice_number.' is due.')
                ->line('**Amount Due:** KES '.number_format($this->invoice->total_amount, 2))
                ->line('**Due Date:** '.$this->invoice->due_date->format('F j, Y'))
                ->line('Please make payment to avoid late fees.')
                ->action('View Invoice', url('/invoices/'.$this->invoice->id)),
            'payment_received' => $mail
                ->line('We have received your payment for invoice #'.$this->invoice->invoice_number)
                ->line('**Amount Paid:** KES '.number_format($this->invoice->total_amount, 2))
                ->line('Thank you for your payment.')
                ->action('View Invoice', url('/invoices/'.$this->invoice->id)),
            'overdue' => $mail
                ->line('Your invoice #'.$this->invoice->invoice_number.' is overdue.')
                ->line('**Amount Due:** KES '.number_format($this->invoice->total_amount, 2))
                ->line('**Due Date:** '.$this->invoice->due_date->format('F j, Y'))
                ->line('Please make payment as soon as possible.')
                ->action('View Invoice', url('/invoices/'.$this->invoice->id)),
            default => $mail->line('Billing notification regarding invoice #'.$this->invoice->invoice_number),
        };
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'billing_'.$this->type,
            'invoice_id' => $this->invoice->id,
            'invoice_number' => $this->invoice->invoice_number,
            'amount' => $this->invoice->total_amount,
            'due_date' => $this->invoice->due_date?->toDateString(),
            'message' => $this->getMessage(),
        ];
    }

    protected function getMessage(): string
    {
        return match ($this->type) {
            'payment_due' => 'Payment is due for invoice #'.$this->invoice->invoice_number,
            'payment_received' => 'Payment received for invoice #'.$this->invoice->invoice_number,
            'overdue' => 'Invoice #'.$this->invoice->invoice_number.' is overdue',
            default => 'Billing notification for invoice #'.$this->invoice->invoice_number,
        };
    }
}
