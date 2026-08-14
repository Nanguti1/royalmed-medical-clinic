<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\DocumentAccessLog;
use App\Models\Patient;
use App\Services\DocumentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected DocumentService $documentService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->documentService = app(DocumentService::class);
        Storage::fake('local');
    }

    public function test_document_can_be_uploaded(): void
    {
        $patient = Patient::factory()->create();

        $file = UploadedFile::fake()->create('document.pdf', 1000);

        $document = $this->documentService->uploadDocument([
            'patient_id' => $patient->id,
            'title' => 'Test Document',
            'category' => 'clinical',
            'file_path' => $file->storeAs('documents', 'test.pdf'),
            'file_name' => 'test.pdf',
            'file_type' => 'pdf',
            'file_size' => 1000,
            'mime_type' => 'application/pdf',
            'uploaded_by' => 1,
        ]);

        $this->assertDatabaseHas('documents', [
            'patient_id' => $patient->id,
            'title' => 'Test Document',
            'category' => 'clinical',
        ]);

        $this->assertNotNull($document->document_number);
    }

    public function test_document_access_is_logged(): void
    {
        $document = Document::factory()->create();

        $this->documentService->logDocumentAccess(
            $document,
            1,
            'viewed',
            'Clinical review',
            '127.0.0.1',
            'Mozilla/5.0'
        );

        $this->assertDatabaseHas('document_access_logs', [
            'document_id' => $document->id,
            'user_id' => 1,
            'action' => 'viewed',
        ]);
    }

    public function test_document_version_can_be_created(): void
    {
        $document = Document::factory()->create();

        $version = $this->documentService->createDocumentVersion($document, [
            'file_path' => 'documents/v2.pdf',
            'file_name' => 'v2.pdf',
            'file_type' => 'pdf',
            'file_size' => 2000,
            'mime_type' => 'application/pdf',
        ], 'Updated content');

        $this->assertEquals(1, $version->version_number);
        $this->assertEquals('Updated content', $version->change_notes);
    }

    public function test_document_can_be_deleted(): void
    {
        Storage::fake('local');
        $filePath = Storage::disk('local')->put('documents/test.pdf', 'content');

        $document = Document::factory()->create([
            'file_path' => $filePath,
            'storage_location' => 'local',
        ]);

        $this->documentService->deleteDocument($document);

        $this->assertSoftDeleted('documents', ['id' => $document->id]);
        Storage::disk('local')->assertMissing($filePath);
    }

    public function test_document_expires_after_expiry_date(): void
    {
        $document = Document::factory()->create([
            'expires_at' => now()->subDay(),
        ]);

        $this->assertTrue($document->isExpired());
        $this->assertFalse($document->isAccessible());
    }

    public function test_sensitive_document_flags_work(): void
    {
        $document = Document::factory()->create([
            'is_sensitive' => true,
            'is_confidential' => false,
        ]);

        $this->assertTrue($document->is_sensitive);
        $this->assertFalse($document->is_confidential);
    }

    public function test_patient_documents_can_be_retrieved(): void
    {
        $patient = Patient::factory()->create();
        Document::factory()->count(3)->create(['patient_id' => $patient->id]);
        Document::factory()->count(2)->create(['patient_id' => Patient::factory()->create()->id]);

        $documents = $this->documentService->getPatientDocuments($patient->id);

        $this->assertCount(3, $documents);
    }

    public function test_documents_can_be_filtered_by_category(): void
    {
        $patient = Patient::factory()->create();
        Document::factory()->create(['patient_id' => $patient->id, 'category' => 'clinical']);
        Document::factory()->create(['patient_id' => $patient->id, 'category' => 'lab']);
        Document::factory()->create(['patient_id' => $patient->id, 'category' => 'clinical']);

        $documents = $this->documentService->getPatientDocuments($patient->id, 'clinical');

        $this->assertCount(2, $documents);
    }

    public function test_document_access_history_can_be_retrieved(): void
    {
        $document = Document::factory()->create();
        DocumentAccessLog::factory()->count(5)->create(['document_id' => $document->id]);
        DocumentAccessLog::factory()->count(2)->create(['document_id' => $document->id, 'accessed_at' => now()->subDays(40)]);

        $history = $this->documentService->getDocumentAccessHistory($document, 30);

        $this->assertCount(5, $history);
    }

    public function test_document_number_is_auto_generated(): void
    {
        $document = Document::factory()->create(['document_number' => null]);

        $this->assertNotNull($document->document_number);
        $this->assertStringStartsWith('DOC', $document->document_number);
    }

    public function test_document_soft_deletes_work(): void
    {
        $document = Document::factory()->create();

        $document->delete();

        $this->assertSoftDeleted('documents', ['id' => $document->id]);
    }

    public function test_document_scopes_work(): void
    {
        Document::factory()->create(['is_sensitive' => true]);
        Document::factory()->create(['is_sensitive' => false]);
        Document::factory()->create(['is_sensitive' => true]);

        $sensitive = Document::sensitive()->get();
        $this->assertCount(2, $sensitive);
    }
}
