<?php

namespace App\Services;

use App\Models\Document;
use App\Models\DocumentVersion;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DocumentService
{
    public function uploadDocument(array $data): Document
    {
        return DB::transaction(function () use ($data) {
            $document = Document::create([
                'patient_id' => $data['patient_id'] ?? null,
                'visit_id' => $data['visit_id'] ?? null,
                'consultation_id' => $data['consultation_id'] ?? null,
                'lab_result_id' => $data['lab_result_id'] ?? null,
                'uploaded_by' => $data['uploaded_by'] ?? auth()->id(),
                'title' => $data['title'],
                'category' => $data['category'] ?? 'general',
                'file_path' => $data['file_path'],
                'file_name' => $data['file_name'],
                'file_type' => $data['file_type'],
                'file_size' => $data['file_size'],
                'mime_type' => $data['mime_type'],
                'description' => $data['description'] ?? null,
                'is_sensitive' => $data['is_sensitive'] ?? false,
                'is_confidential' => $data['is_confidential'] ?? false,
                'expires_at' => $data['expires_at'] ?? null,
                'storage_location' => $data['storage_location'] ?? 'local',
                'metadata' => $data['metadata'] ?? null,
            ]);

            return $document;
        });
    }

    public function logDocumentAccess(Document $document, int $userId, string $action, ?string $reason = null, ?string $ipAddress = null, ?string $userAgent = null): void
    {
        $document->logAccess($userId, $action, $reason, $ipAddress, $userAgent);
    }

    public function createDocumentVersion(Document $document, array $fileData, ?string $changeNotes = null): DocumentVersion
    {
        return DB::transaction(function () use ($document, $fileData, $changeNotes) {
            return $document->createVersion([
                'file_path' => $fileData['file_path'],
                'file_name' => $fileData['file_name'],
                'file_type' => $fileData['file_type'],
                'file_size' => $fileData['file_size'],
                'mime_type' => $fileData['mime_type'],
                'uploaded_by' => auth()->id(),
                'change_notes' => $changeNotes,
            ]);
        });
    }

    public function deleteDocument(Document $document, ?int $userId = null): void
    {
        DB::transaction(function () use ($document) {
            $filePath = $document->file_path;
            $storage = $document->storage_location;

            $document->delete();

            Storage::disk($storage)->delete($filePath);
        });
    }

    public function getPatientDocuments(int $patientId, ?string $category = null)
    {
        $query = Document::forPatient($patientId)->active();

        if ($category) {
            $query->byCategory($category);
        }

        return $query->orderBy('uploaded_at', 'desc')->get();
    }

    public function getDocumentAccessHistory(Document $document, int $days = 30)
    {
        return $document->accessLogs()
            ->where('accessed_at', '>=', now()->subDays($days))
            ->orderBy('accessed_at', 'desc')
            ->get();
    }
}
