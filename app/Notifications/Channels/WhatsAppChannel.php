<?php

namespace App\Notifications\Channels;

use App\Models\WhatsAppLog;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class WhatsAppChannel
{
    public function send($notifiable, Notification $notification): void
    {
        $message = $notification->toWhatsApp($notifiable);

        if (! $message) {
            return;
        }

        $gateway = config('notifications.whatsapp.gateway', 'log');

        match ($gateway) {
            'log' => $this->sendToLog($message),
            'database' => $this->sendToDatabase($notifiable, $message),
            'custom' => $this->sendToCustomGateway($message),
            default => $this->sendToLog($message),
        };
    }

    protected function sendToLog(array $message): void
    {
        Log::info('WhatsApp Notification', [
            'to' => $message['to'],
            'message' => $message['message'],
            'sent_at' => now()->toISOString(),
        ]);
    }

    protected function sendToDatabase($notifiable, array $message): void
    {
        WhatsAppLog::create([
            'recipient' => $message['to'],
            'message' => $message['message'],
            'status' => 'pending',
            'sent_at' => null,
            'gateway' => config('notifications.whatsapp.gateway'),
        ]);
    }

    protected function sendToCustomGateway(array $message): void
    {
        $gatewayClass = config('notifications.whatsapp.custom_gateway');

        if (! $gatewayClass || ! class_exists($gatewayClass)) {
            $this->sendToLog($message);

            return;
        }

        try {
            $gateway = app($gatewayClass);
            $gateway->send($message['to'], $message['message']);
        } catch (\Exception $e) {
            Log::error('WhatsApp Gateway Error', [
                'error' => $e->getMessage(),
                'to' => $message['to'],
            ]);
            $this->sendToLog($message);
        }
    }
}
