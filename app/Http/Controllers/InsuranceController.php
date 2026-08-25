<?php

namespace App\Http\Controllers;

use App\Models\InsuranceClaim;
use App\Models\InsuranceScheme;
use App\Models\Insurer;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\PatientCoverage;
use App\Models\Preauthorization;
use App\Services\InsuranceService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InsuranceController extends Controller
{
    protected InsuranceService $service;

    public function __construct(InsuranceService $service)
    {
        $this->service = $service;
        $this->middleware('can:insurance.view')->only(['insurersIndex', 'insurersEdit', 'schemesIndex', 'schemesEdit', 'patientCoverage', 'claimsIndex', 'claimsShow', 'claimsEdit', 'preauthorizationsIndex', 'preauthorizationsApprovePage', 'claimsAgingReport']);
        $this->middleware('can:insurance.create')->only(['insurersCreate', 'insurersStore', 'schemesCreate', 'schemesStore', 'patientCoverageCreate', 'claimsCreate', 'preauthorizationsCreate', 'preauthorizationsStore']);
        $this->middleware('can:insurance.update')->only(['insurersEdit', 'insurersUpdate', 'schemesEdit', 'schemesUpdate', 'claimsEdit', 'claimsResubmit', 'preauthorizationsApprove']);
        $this->middleware('can:insurance.delete')->only(['insurersDestroy', 'schemesDestroy']);
    }

    public function insurersIndex(Request $request): Response
    {
        $query = $request->input('search');
        $type = $request->input('type');

        $insurers = Insurer::when($query, fn ($q) => $q->where('name', 'like', "%{$query}%")
            ->orWhere('code', 'like', "%{$query}%"))
            ->when($type, fn ($q) => $q->where('type', $type))
            ->orderBy('name')
            ->paginate(20);

        return Inertia::render('insurers/index', [
            'insurers' => $insurers,
            'filters' => [
                'search' => $query,
                'type' => $type,
            ],
        ]);
    }

    public function insurersCreate(): Response
    {
        return Inertia::render('insurers/create');
    }

    public function insurersEdit(Insurer $insurer): Response
    {
        return Inertia::render('insurers/edit', [
            'insurer' => $insurer,
        ]);
    }

    public function insurersStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:insurers,code',
            'type' => 'required|in:private,public,government',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'is_active' => 'boolean',
        ]);

        Insurer::create($validated);

        return to_route('insurance.insurers.index')
            ->with('success', 'Insurer created successfully.');
    }

    public function insurersUpdate(Request $request, Insurer $insurer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:insurers,code,'.$insurer->id,
            'type' => 'required|in:private,public,government',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'is_active' => 'boolean',
        ]);

        $insurer->update($validated);

        return to_route('insurance.insurers.index')
            ->with('success', 'Insurer updated successfully.');
    }

    public function insurersDestroy(Insurer $insurer)
    {
        $insurer->delete();

        return to_route('insurance.insurers.index')
            ->with('success', 'Insurer deleted successfully.');
    }

    public function schemesIndex(Request $request): Response
    {
        $query = $request->input('search');
        $insurerId = $request->input('insurer_id');

        $schemes = InsuranceScheme::with('insurer')
            ->when($query, fn ($q) => $q->where('name', 'like', "%{$query}%")
                ->orWhere('code', 'like', "%{$query}%"))
            ->when($insurerId, fn ($q) => $q->where('insurer_id', $insurerId))
            ->orderBy('name')
            ->paginate(20);

        return Inertia::render('insurance-schemes/index', [
            'schemes' => $schemes,
            'filters' => [
                'search' => $query,
                'insurer_id' => $insurerId,
            ],
        ]);
    }

    public function schemesCreate(): Response
    {
        $insurers = Insurer::select('id', 'name')->get();

        return Inertia::render('insurance-schemes/create', [
            'insurers' => $insurers,
        ]);
    }

    public function schemesEdit(InsuranceScheme $scheme): Response
    {
        $scheme->load('insurer');
        $insurers = Insurer::select('id', 'name')->get();

        return Inertia::render('insurance-schemes/edit', [
            'scheme' => $scheme,
            'insurers' => $insurers,
        ]);
    }

    public function schemesStore(Request $request)
    {
        $validated = $request->validate([
            'insurer_id' => 'required|exists:insurers,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:insurance_schemes,code',
            'description' => 'nullable|string',
            'coverage_type' => 'required|in:individual,family,corporate',
            'max_benefit_amount' => 'nullable|numeric',
            'co_payment_percentage' => 'nullable|numeric|min:0|max:100',
            'is_active' => 'boolean',
        ]);

        InsuranceScheme::create($validated);

        return to_route('insurance.schemes.index')
            ->with('success', 'Insurance scheme created successfully.');
    }

    public function schemesUpdate(Request $request, InsuranceScheme $scheme)
    {
        $validated = $request->validate([
            'insurer_id' => 'required|exists:insurers,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:insurance_schemes,code,'.$scheme->id,
            'description' => 'nullable|string',
            'coverage_type' => 'required|in:individual,family,corporate',
            'max_benefit_amount' => 'nullable|numeric',
            'co_payment_percentage' => 'nullable|numeric|min:0|max:100',
            'is_active' => 'boolean',
        ]);

        $scheme->update($validated);

        return to_route('insurance.schemes.index')
            ->with('success', 'Insurance scheme updated successfully.');
    }

    public function schemesDestroy(InsuranceScheme $scheme)
    {
        $scheme->delete();

        return to_route('insurance.schemes.index')
            ->with('success', 'Insurance scheme deleted successfully.');
    }

    public function patientCoverage(Patient $patient): Response
    {
        $coverage = PatientCoverage::with(['insurer', 'scheme'])
            ->where('patient_id', $patient->id)
            ->active()
            ->get();

        return Inertia::render('insurance/patients/coverage', [
            'patient' => $patient,
            'coverage' => $coverage,
        ]);
    }

    public function patientCoverageCreate(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'insurer_id' => 'required|exists:insurers,id',
            'insurance_scheme_id' => 'required|exists:insurance_schemes,id',
            'policy_number' => 'required|string',
            'policy_type' => 'in:individual,family,corporate',
            'effective_date' => 'required|date',
            'expiry_date' => 'required|date|after:effective_date',
            'is_primary' => 'boolean',
        ]);

        PatientCoverage::create(array_merge($validated, [
            'patient_id' => $patient->id,
            'status' => 'active',
            'created_by' => auth()->id(),
        ]));

        return to_route('insurance.patients.coverage', $patient)
            ->with('success', 'Patient coverage added successfully.');
    }

    public function claimsIndex(Request $request): Response
    {
        $query = $request->input('search');
        $status = $request->input('status');
        $insurerId = $request->input('insurer_id');

        $claims = InsuranceClaim::with(['patient', 'insurer', 'invoice'])
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($insurerId, fn ($q) => $q->where('insurer_id', $insurerId))
            ->when($query, fn ($q) => $q->whereHas('patient', fn ($p) => $p->where('first_name', 'like', "%{$query}%")
                ->orWhere('last_name', 'like', "%{$query}%")
                ->orWhere('hospital_number', 'like', "%{$query}%")))
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('billing/claims/index', [
            'claims' => $claims,
            'filters' => [
                'search' => $query,
                'status' => $status,
                'insurer_id' => $insurerId,
            ],
        ]);
    }

    public function claimsCreate(Invoice $invoice): Response
    {
        $invoice->load(['patient', 'patientCoverage', 'items']);

        return Inertia::render('billing/claims/create', [
            'invoice' => $invoice,
        ]);
    }

    public function claimsShow(InsuranceClaim $claim): Response
    {
        $claim->load(['patient', 'insurer', 'invoice', 'items']);

        return Inertia::render('billing/claims/show', [
            'claim' => $claim,
        ]);
    }

    public function claimsEdit(InsuranceClaim $claim): Response
    {
        $claim->load(['patient', 'insurer', 'invoice', 'items']);

        return Inertia::render('billing/claims/edit', [
            'claim' => $claim,
        ]);
    }

    public function claimsResubmit(Request $request, InsuranceClaim $claim)
    {
        $validated = $request->validate([
            'corrected_data' => 'required|array',
        ]);

        $this->service->resubmitClaim($claim, $validated['corrected_data'], auth()->id());

        return to_route('billing.claims.show', $claim)
            ->with('success', 'Claim resubmitted successfully.');
    }

    public function claimsAgingReport(): Response
    {
        $report = $this->service->getClaimAgingReport();

        return Inertia::render('billing/claims/aging-report', [
            'report' => $report,
        ]);
    }

    public function preauthorizationsIndex(Request $request): Response
    {
        $query = $request->input('search');
        $status = $request->input('status');

        $preauths = Preauthorization::with(['patient', 'insurer', 'scheme'])
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($query, fn ($q) => $q->whereHas('patient', fn ($p) => $p->where('first_name', 'like', "%{$query}%")
                ->orWhere('last_name', 'like', "%{$query}%")
                ->orWhere('hospital_number', 'like', "%{$query}%")))
            ->orderBy('request_date', 'desc')
            ->paginate(20);

        return Inertia::render('billing/preauthorizations/index', [
            'preauthorizations' => $preauths,
            'filters' => [
                'search' => $query,
                'status' => $status,
            ],
        ]);
    }

    public function preauthorizationsCreate(): Response
    {
        $patients = Patient::select('id', 'first_name', 'last_name', 'hospital_number')->get();
        $schemes = InsuranceScheme::with('insurer')->get();

        return Inertia::render('billing/preauthorizations/create', [
            'patients' => $patients,
            'schemes' => $schemes,
        ]);
    }

    public function preauthorizationsStore(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'insurance_scheme_id' => 'required|exists:insurance_schemes,id',
            'requested_amount' => 'required|numeric|min:0',
            'diagnosis' => 'required|string',
            'proposed_treatment' => 'required|string',
            'service_code' => 'nullable|string',
            'urgency' => 'required|in:routine,urgent,emergency',
            'notes' => 'nullable|string',
        ]);

        // Map form fields to model fields
        $data = [
            'patient_id' => $validated['patient_id'],
            'insurance_scheme_id' => $validated['insurance_scheme_id'],
            'authorized_amount' => $validated['requested_amount'],
            'diagnosis' => $validated['diagnosis'],
            'requested_services' => $validated['proposed_treatment'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
            'created_by' => auth()->id(),
        ];

        $this->service->createPreauthorization($data);

        return to_route('billing.preauthorizations.index')
            ->with('success', 'Preauthorization request created successfully.');
    }

    public function preauthorizationsApprovePage(Preauthorization $preauth): Response
    {
        $preauth->load(['patient', 'insurer', 'scheme']);

        return Inertia::render('billing/preauthorizations/approve', [
            'preauth' => $preauth,
        ]);
    }

    public function preauthorizationsApprove(Request $request, Preauthorization $preauth)
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
            'authorized_amount' => 'required_if:action,approve|numeric',
            'notes' => 'nullable|string',
        ]);

        if ($validated['action'] === 'approve') {
            $this->service->approvePreauthorization($preauth, $validated['authorized_amount'], $validated['notes'], auth()->id());
        } else {
            $this->service->rejectPreauthorization($preauth, $validated['notes'] ?? 'Rejected', auth()->id());
        }

        return to_route('billing.preauthorizations.index')
            ->with('success', 'Preauthorization processed successfully.');
    }
}
