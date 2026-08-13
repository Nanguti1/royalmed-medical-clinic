<?php

namespace App\Http\Controllers;

use App\Exceptions\InvoiceAlreadyPaidException;
use App\Exceptions\InvoiceCancelledException;
use App\Exceptions\OverpaymentException;
use App\Http\Requests\StorePaymentRequest;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Services\InvoiceStatusResolver;
use App\Services\PaymentReceiptService;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    protected PaymentService $paymentService;

    protected PaymentReceiptService $receiptService;

    public function __construct(PaymentService $paymentService, PaymentReceiptService $receiptService)
    {
        $this->paymentService = $paymentService;
        $this->receiptService = $receiptService;

        $this->middleware('permission:billing.view')->only(['index', 'show', 'receipt']);
        $this->middleware('permission:billing.create')->only(['create', 'store']);
    }

    public function index(Request $request): Response
    {
        $query = $request->input('search');
        $date = $request->input('date', now()->toDateString());

        $paymentsQuery = Payment::with(['invoice.visit.patient', 'method', 'mpesaTransaction', 'receivedBy'])
            ->whereDate('paid_at', $date);

        if ($query) {
            $paymentsQuery->where(function ($q) use ($query) {
                $q->where('reference', 'like', "%{$query}%")
                    ->orWhereHas('invoice', function ($q) use ($query) {
                        $q->where('invoice_number', 'like', "%{$query}%");
                    })
                    ->orWhereHas('invoice.visit.patient', function ($q) use ($query) {
                        $q->where('first_name', 'like', "%{$query}%")
                            ->orWhere('last_name', 'like', "%{$query}%");
                    });
            });
        }

        $payments = $paymentsQuery->orderBy('paid_at', 'desc')->paginate(20);

        // Calculate daily totals using application timezone
        $dailyTotals = Payment::whereDate('paid_at', $date)
            ->selectRaw('
                COALESCE(SUM(CASE WHEN LOWER(payment_methods.name) = "cash" THEN payments.amount ELSE 0 END), 0) as cash_total,
                COALESCE(SUM(CASE WHEN LOWER(payment_methods.name) = "mpesa" THEN payments.amount ELSE 0 END), 0) as mpesa_total,
                COALESCE(SUM(payments.amount), 0) as total_amount,
                COUNT(CASE WHEN LOWER(payment_methods.name) = "cash" THEN 1 END) as cash_count,
                COUNT(CASE WHEN LOWER(payment_methods.name) = "mpesa" THEN 1 END) as mpesa_count
            ')
            ->leftJoin('payment_methods', 'payments.payment_method_id', '=', 'payment_methods.id')
            ->first();

        return Inertia::render('payments/index', [
            'payments' => $payments,
            'search' => $query ?? '',
            'date' => $date,
            'dailyTotals' => $dailyTotals,
        ]);
    }

    public function create(Invoice $invoice): Response
    {
        $invoice->load(['visit.patient', 'items', 'status', 'payments.receivedBy', 'payments.method', 'payments.mpesaTransaction']);

        // Check if invoice is cancelled
        if ($invoice->isCancelled()) {
            return redirect()->route('billing.show', $invoice)
                ->with('error', 'Cannot record payment against a cancelled invoice.');
        }

        // Check if invoice is already paid
        if ($invoice->isPaid()) {
            return redirect()->route('billing.show', $invoice)
                ->with('info', 'This invoice is already paid in full.');
        }

        $paymentMethods = PaymentMethod::all();

        // Calculate outstanding balance using resolver
        $statusResolver = app(InvoiceStatusResolver::class);
        $outstandingBalance = $statusResolver->calculateOutstandingBalance($invoice);

        return Inertia::render('payments/create', [
            'invoice' => $invoice,
            'paymentMethods' => $paymentMethods,
            'outstandingBalance' => $outstandingBalance,
        ]);
    }

    public function store(StorePaymentRequest $request)
    {
        $data = $request->validated();

        // Default paid_at to now if not provided
        if (empty($data['paid_at'])) {
            $data['paid_at'] = now();
        }

        try {
            $payment = $this->paymentService->record($data, $request->user()->id);

            return redirect()->route('payments.show', $payment)
                ->with('success', 'Payment recorded successfully.');
        } catch (OverpaymentException $e) {
            return back()->withInput()->withErrors(['amount' => $e->getMessage()]);
        } catch (InvoiceAlreadyPaidException $e) {
            return back()->withInput()->withErrors(['invoice_id' => $e->getMessage()]);
        } catch (InvoiceCancelledException $e) {
            return back()->withInput()->withErrors(['invoice_id' => $e->getMessage()]);
        }
    }

    public function show(Payment $payment): Response
    {
        $payment->load(['invoice.visit.patient', 'invoice.items', 'method', 'mpesaTransaction', 'receivedBy']);

        // Calculate remaining balance for the invoice
        $statusResolver = app(InvoiceStatusResolver::class);
        $remainingBalance = $statusResolver->calculateOutstandingBalance($payment->invoice);

        return Inertia::render('payments/show', [
            'payment' => $payment,
            'remainingBalance' => $remainingBalance,
        ]);
    }

    public function receipt(Payment $payment): Response
    {
        $receiptData = $this->receiptService->getReceiptData($payment);

        return Inertia::render('payments/receipt', [
            'receipt' => $receiptData,
        ]);
    }
}
