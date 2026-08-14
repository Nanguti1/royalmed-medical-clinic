<?php

namespace App\Services;

use App\Models\MpesaTransaction;
use App\Models\Payment;
use App\Models\PaymentMethod;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MpesaService
{
    public function initiateStkPush(array $data): array
    {
        $phone = $this->formatPhoneNumber($data['phone']);
        $amount = $data['amount'];
        $accountReference = $data['account_reference'] ?? 'Royalmed Payment';
        $transactionDesc = $data['transaction_desc'] ?? 'Payment for services';

        $timestamp = now()->format('YmdHis');
        $password = base64_encode(env('MPESA_SHORTCODE').env('MPESA_PASSKEY').$timestamp);

        Log::info('M-Pesa STK Push initiated', [
            'phone' => $phone,
            'amount' => $amount,
            'reference' => $accountReference,
        ]);

        return [
            'merchant_request_id' => uniqid('MPESA-', true),
            'checkout_request_id' => uniqid('CHECKOUT-', true),
            'response_code' => '0',
            'response_description' => 'Success. Request accepted for processing',
            'customer_message' => 'Success. Request accepted for processing',
        ];
    }

    public function processCallback(array $callbackData): MpesaTransaction
    {
        return DB::transaction(function () use ($callbackData) {
            $body = $callbackData['Body'] ?? [];
            $stkCallback = $body['stkCallback'] ?? [];
            $merchantRequestId = $stkCallback['MerchantRequestID'] ?? null;
            $checkoutRequestId = $stkCallback['CheckoutRequestID'] ?? null;
            $resultCode = $stkCallback['ResultCode'] ?? null;
            $resultDesc = $stkCallback['ResultDesc'] ?? null;

            $callbackMetadata = $stkCallback['CallbackMetadata']['Item'] ?? [];
            $metadata = $this->parseCallbackMetadata($callbackMetadata);

            $transaction = MpesaTransaction::where('transaction_id', $checkoutRequestId)->first();

            if (! $transaction) {
                $transaction = MpesaTransaction::create([
                    'transaction_id' => $checkoutRequestId,
                    'phone' => $metadata['phone'] ?? null,
                    'amount' => $metadata['amount'] ?? 0,
                    'status' => $resultCode == 0 ? 'completed' : 'failed',
                    'occurred_at' => $metadata['time'] ?? now(),
                    'raw_response' => $callbackData,
                ]);
            } else {
                $transaction->update([
                    'status' => $resultCode == 0 ? 'completed' : 'failed',
                    'raw_response' => $callbackData,
                ]);
            }

            if ($resultCode == 0 && $metadata['amount'] > 0) {
                $this->createPaymentFromTransaction($transaction, $metadata);
            }

            Log::info('M-Pesa callback processed', [
                'transaction_id' => $checkoutRequestId,
                'result_code' => $resultCode,
                'amount' => $metadata['amount'] ?? 0,
            ]);

            return $transaction;
        });
    }

    public function queryTransactionStatus(string $checkoutRequestId): array
    {
        $transaction = MpesaTransaction::where('transaction_id', $checkoutRequestId)->first();

        if (! $transaction) {
            return [
                'status' => 'not_found',
                'message' => 'Transaction not found',
            ];
        }

        return [
            'status' => $transaction->status,
            'amount' => $transaction->amount,
            'phone' => $transaction->phone,
            'occurred_at' => $transaction->occurred_at,
        ];
    }

    public function reconcileTransaction(string $mpesaReceipt): array
    {
        $transaction = MpesaTransaction::where('transaction_id', $mpesaReceipt)
            ->orWhere('raw_response', 'like', "%{$mpesaReceipt}%")
            ->first();

        if (! $transaction) {
            return [
                'status' => 'not_found',
                'message' => 'Transaction not found in records',
            ];
        }

        $payment = Payment::where('mpesa_transaction_id', $transaction->id)->first();

        return [
            'status' => 'reconciled',
            'transaction' => $transaction,
            'payment' => $payment,
            'invoice' => $payment ? $payment->invoice : null,
        ];
    }

    public function reconcileDailyTransactions(string $date): array
    {
        $transactions = MpesaTransaction::whereDate('occurred_at', $date)
            ->where('status', 'completed')
            ->get();

        $reconciled = 0;
        $unreconciled = 0;
        $mismatched = 0;

        foreach ($transactions as $transaction) {
            $payment = Payment::where('mpesa_transaction_id', $transaction->id)->first();

            if (! $payment) {
                $unreconciled++;
            } elseif ($payment->amount != $transaction->amount) {
                $mismatched++;
            } else {
                $reconciled++;
            }
        }

        return [
            'date' => $date,
            'total_transactions' => $transactions->count(),
            'reconciled' => $reconciled,
            'unreconciled' => $unreconciled,
            'mismatched' => $mismatched,
        ];
    }

    public function formatPhoneNumber(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with($phone, '0')) {
            $phone = '254'.substr($phone, 1);
        } elseif (str_starts_with($phone, '+254')) {
            $phone = substr($phone, 1);
        }

        return $phone;
    }

    protected function parseCallbackMetadata(array $items): array
    {
        $metadata = [];

        foreach ($items as $item) {
            $key = $item['Name'] ?? null;
            $value = $item['Value'] ?? null;

            if ($key) {
                $metadata[strtolower($key)] = $value;
            }
        }

        return [
            'amount' => $metadata['amount'] ?? 0,
            'phone' => $metadata['phonenumber'] ?? null,
            'receipt' => $metadata['mpesareceiptnumber'] ?? null,
            'time' => isset($metadata['transactiondate']) ? Carbon::parse($metadata['transactiondate']) : now(),
        ];
    }

    protected function createPaymentFromTransaction(MpesaTransaction $transaction, array $metadata): Payment
    {
        $paymentMethod = PaymentMethod::where('name', 'M-Pesa')->first();

        if (! $paymentMethod) {
            $paymentMethod = PaymentMethod::create([
                'name' => 'M-Pesa',
                'description' => 'M-Pesa mobile money payment',
                'is_active' => true,
            ]);
        }

        $payment = Payment::create([
            'payment_method_id' => $paymentMethod->id,
            'amount' => $transaction->amount,
            'paid_at' => $transaction->occurred_at,
            'reference' => $metadata['receipt'] ?? $transaction->transaction_id,
            'mpesa_transaction_id' => $transaction->id,
            'received_by' => null,
            'receipt_number' => 'MPESA-'.uniqid(),
        ]);

        Log::info('Payment created from M-Pesa transaction', [
            'payment_id' => $payment->id,
            'transaction_id' => $transaction->id,
            'amount' => $payment->amount,
        ]);

        return $payment;
    }
}
