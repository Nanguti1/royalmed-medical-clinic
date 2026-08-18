<?php

namespace App\Http\Controllers;

use App\Models\ConsentTemplate;
use App\Models\Consultation;
use App\Models\Document;
use App\Models\Patient;
use App\Models\PatientConsent;
use App\Services\DocumentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    protected DocumentService $service;

    public function __construct(DocumentService $service)
    {
        $this->service = $service;
        $this->middleware('can:documents.view')->only(['index', 'show', 'versions', 'patientDocuments', 'consultationDocuments', 'consentTemplatesIndex', 'consentTemplatesEdit', 'patientConsents']);
        $this->middleware('can:documents.create')->only(['upload', 'consentTemplatesCreate']);
        $this->middleware('can:documents.update')->only(['consentTemplatesEdit', 'patientConsentsSign']);
    }

    public function index(Request $request): Response
    {
        $query = $request->input('search');
        $category = $request->input('category');

        $documents = Document::when($query, fn ($q) => $q->where('title', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%"))
            ->when($category, fn ($q) => $q->where('category', $category))
            ->orderBy('uploaded_at', 'desc')
            ->paginate(20);

        return Inertia::render('documents/index', [
            'documents' => $documents,
            'filters' => [
                'search' => $query,
                'category' => $category,
            ],
        ]);
    }

    public function upload(): Response
    {
        $patients = Patient::select('id', 'first_name', 'last_name', 'hospital_number')->get();

        return Inertia::render('documents/upload', [
            'patients' => $patients,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'nullable|exists:patients,id',
            'visit_id' => 'nullable|exists:visits,id',
            'consultation_id' => 'nullable|exists:consultations,id',
            'title' => 'required|string',
            'category' => 'in:general,medical,lab,radiology,consent,insurance,legal',
            'file' => 'required|file|max:10240',
            'description' => 'nullable|string',
            'is_sensitive' => 'boolean',
            'is_confidential' => 'boolean',
            'expires_at' => 'nullable|date',
        ]);

        $file = $request->file('file');
        $path = $file->store('documents', 'local');

        $document = $this->service->uploadDocument(array_merge($validated, [
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getClientOriginalExtension(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'uploaded_by' => auth()->id(),
        ]));

        return to_route('documents.show', $document)
            ->with('success', 'Document uploaded successfully.');
    }

    public function show(Document $document): Response
    {
        $this->service->logDocumentAccess($document, auth()->id(), 'view');

        $document->load(['patient', 'uploadedBy']);

        return Inertia::render('documents/show', [
            'document' => $document,
        ]);
    }

    public function versions(Document $document): Response
    {
        $this->service->logDocumentAccess($document, auth()->id(), 'view_versions');

        $versions = $document->versions()->with('uploadedBy')->orderBy('created_at', 'desc')->get();

        return Inertia::render('documents/versions', [
            'document' => $document,
            'versions' => $versions,
        ]);
    }

    public function patientDocuments(Patient $patient): Response
    {
        $documents = $this->service->getPatientDocuments($patient->id);

        return Inertia::render('documents/patients/index', [
            'patient' => $patient,
            'documents' => $documents,
        ]);
    }

    public function consultationDocuments(Consultation $consultation): Response
    {
        $documents = Document::where('consultation_id', $consultation->id)
            ->with(['patient', 'uploadedBy'])
            ->orderBy('uploaded_at', 'desc')
            ->get();

        return Inertia::render('documents/consultations/index', [
            'consultation' => $consultation->load('patient'),
            'documents' => $documents,
        ]);
    }

    public function consentTemplatesIndex(Request $request): Response
    {
        $query = $request->input('search');

        $templates = ConsentTemplate::when($query, fn ($q) => $q->where('name', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%"))
            ->orderBy('name')
            ->paginate(20);

        return Inertia::render('documents/consent-templates/index', [
            'templates' => $templates,
            'filters' => [
                'search' => $query,
            ],
        ]);
    }

    public function consentTemplatesCreate(): Response
    {
        return Inertia::render('documents/consent-templates/create');
    }

    public function consentTemplatesEdit(ConsentTemplate $template): Response
    {
        return Inertia::render('documents/consent-templates/edit', [
            'template' => $template,
        ]);
    }

    public function patientConsents(Patient $patient): Response
    {
        $consents = PatientConsent::with(['template', 'signedBy'])
            ->where('patient_id', $patient->id)
            ->orderBy('signed_at', 'desc')
            ->get();

        return Inertia::render('documents/patients/consents', [
            'patient' => $patient,
            'consents' => $consents,
        ]);
    }

    public function patientConsentsSign(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'consent_template_id' => 'required|exists:consent_templates,id',
            'signature_data' => 'required|string',
            'signature_method' => 'in:digital,written,verbal',
            'witness_name' => 'nullable|string',
            'witness_title' => 'nullable|string',
        ]);

        PatientConsent::create(array_merge($validated, [
            'patient_id' => $patient->id,
            'signed_at' => now(),
            'signed_by' => auth()->id(),
            'status' => 'signed',
        ]));

        return redirect()->route('documents.patients.consents', $patient)
            ->with('success', 'Consent signed successfully.');
    }
}
