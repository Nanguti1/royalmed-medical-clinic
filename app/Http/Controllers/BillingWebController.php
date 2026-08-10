<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateInvoiceRequest;
use App\Models\Consultation;
use App\Models\Invoice;
use App\Models\Visit;
use App\Services\BillingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingWebController extends Controller
{
    protected BillingService $billingService;

    public function __construct(BillingService $billingService)
    {
        $this->billingService = $billingService;

        $this->middleware('permission:billing.view')->only(['index', 'show']);
        $this->middleware('permission:billing.create')->only(['create', 'store']);
    }

    public function index(Request $request): Response
    {
        $query = $request->input('search');
        $statusFilter = $request->input('status');

        $invoicesQuery = Invoice::with(['visit.patient', 'status']);

        if ($query) {
            $invoicesQuery->where(function ($q) use ($query) {
                $q->where('invoice_number', 'like', "%{$query}%")
                    ->orWhereHas('visit.patient', function ($q) use ($query) {
                        $q->where('first_name', 'like', "%{$query}%")
                            ->orWhere('last_name', 'like', "%{$query}%")
                            ->orWhere('phone', 'like', "%{$query}%");
                    });
            });
        }

        if ($statusFilter) {
            $invoicesQuery->whereHas('status', function ($q) use ($statusFilter) {
                $q->where('code', $statusFilter);
            });
        }

        $invoices = $invoicesQuery->orderBy('created_at', 'desc')->get();

        return Inertia::render('billing/index', [
            'invoices' => $invoices,
            'search' => $query ?? '',
            'status' => $statusFilter ?? '',
        ]);
    }

    public function create(Visit $visit): Response
    {
        // Check if visit already has an invoice
        if ($visit->invoice) {
            return redirect()->route('billing.show', $visit->invoice)
                ->with('info', 'This visit already has an invoice.');
        }

        $visit->load(['patient', 'consultation', 'prescriptions.items.medicine', 'labOrders.items.test']);

        $billableItems = $this->identifyBillableItems($visit);

        return Inertia::render('billing/create', [
            'visit' => $visit,
            'billableItems' => $billableItems,
        ]);
    }

    public function store(CreateInvoiceRequest $request)
    {
        $invoice = $this->billingService->createInvoice($request->validated());

        return redirect()->route('billing.show', $invoice)
            ->with('success', 'Invoice generated successfully.');
    }

    public function show(Invoice $invoice): Response
    {
        $invoice->load(['visit.patient', 'items', 'status', 'payments.method', 'payments.mpesaTransaction', 'payments.receivedBy']);

        return Inertia::render('billing/show', [
            'invoice' => $invoice,
        ]);
    }

    protected function identifyBillableItems(Visit $visit): array
    {
        $items = [];

        // Consultation fee (if consultation exists)
        if ($visit->consultation) {
            $consultationFee = config('clinic.consultation_fee', 500);
            $items[] = [
                'type' => 'consultation',
                'description' => 'Consultation Fee',
                'quantity' => 1,
                'unit_price' => $consultationFee,
                'reference_id' => $visit->consultation->id,
            ];
        }

        // Laboratory tests (completed or ordered)
        foreach ($visit->labOrders as $labOrder) {
            foreach ($labOrder->items as $item) {
                if ($item->test) {
                    $items[] = [
                        'type' => 'laboratory',
                        'description' => $item->test->name,
                        'quantity' => 1,
                        'unit_price' => $item->test->price ?? 0,
                        'reference_id' => $item->id,
                    ];
                }
            }
        }

        // Dispensed medicines (based on prescriptions - actual dispensing would be tracked separately in a real system)
        foreach ($visit->prescriptions as $prescription) {
            foreach ($prescription->items as $item) {
                if ($item->medicine) {
                    $items[] = [
                        'type' => 'pharmacy',
                        'description' => $item->medicine->name,
                        'quantity' => $item->quantity,
                        'unit_price' => $item->medicine->unit_price ?? 0,
                        'reference_id' => $item->id,
                    ];
                }
            }
        }

        return $items;
    }
}
