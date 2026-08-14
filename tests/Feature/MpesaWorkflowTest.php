<?php

namespace Tests\Feature;

use App\Models\MpesaTransaction;
use App\Models\Payment;
use App\Services\MpesaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MpesaWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected MpesaService $mpesaService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->mpesaService = app(MpesaService::class);
    }

    public function test_stk_push_initiation(): void
    {
        $result = $this->mpesaService->initiateStkPush([
            'phone' => '0712345678',
            'amount' => 1000,
            'account_reference' => 'INV-001',
        ]);

        $this->assertArrayHasKey('merchant_request_id', $result);
        $this->assertArrayHasKey('checkout_request_id', $result);
        $this->assertEquals('0', $result['response_code']);
    }

    public function test_callback_processing(): void
    {
        $callbackData = [
            'Body' => [
                'stkCallback' => [
                    'MerchantRequestID' => 'MERCHANT-123',
                    'CheckoutRequestID' => 'CHECKOUT-456',
                    'ResultCode' => 0,
                    'ResultDesc' => 'Success',
                    'CallbackMetadata' => [
                        'Item' => [
                            ['Name' => 'Amount', 'Value' => 1000],
                            ['Name' => 'MpesaReceiptNumber', 'Value' => 'ABC123'],
                            ['Name' => 'TransactionDate', 'Value' => '20240101120000'],
                            ['Name' => 'PhoneNumber', 'Value' => '254712345678'],
                        ],
                    ],
                ],
            ],
        ];

        $transaction = $this->mpesaService->processCallback($callbackData);

        $this->assertDatabaseHas('mpesa_transactions', [
            'transaction_id' => 'CHECKOUT-456',
            'status' => 'completed',
            'amount' => 1000,
        ]);
    }

    public function test_transaction_status_query(): void
    {
        $transaction = MpesaTransaction::factory()->create([
            'transaction_id' => 'CHECKOUT-789',
            'status' => 'completed',
            'amount' => 500,
        ]);

        $status = $this->mpesaService->queryTransactionStatus('CHECKOUT-789');

        $this->assertEquals('completed', $status['status']);
        $this->assertEquals(500, $status['amount']);
    }

    public function test_transaction_reconciliation(): void
    {
        $transaction = MpesaTransaction::factory()->create([
            'transaction_id' => 'ABC123',
            'status' => 'completed',
        ]);

        $payment = Payment::factory()->create([
            'mpesa_transaction_id' => $transaction->id,
        ]);

        $result = $this->mpesaService->reconcileTransaction('ABC123');

        $this->assertEquals('reconciled', $result['status']);
        $this->assertNotNull($result['payment']);
    }

    public function test_daily_reconciliation(): void
    {
        MpesaTransaction::factory()->count(3)->create([
            'status' => 'completed',
            'occurred_at' => now(),
        ]);

        $reconciliation = $this->mpesaService->reconcileDailyTransactions(now()->toDateString());

        $this->assertEquals(3, $reconciliation['total_transactions']);
    }

    public function test_phone_number_formatting(): void
    {
        $this->assertEquals('254712345678', $this->mpesaService->formatPhoneNumber('0712345678'));
        $this->assertEquals('254712345678', $this->mpesaService->formatPhoneNumber('+254712345678'));
    }
}
