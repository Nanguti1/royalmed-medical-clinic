<?php

namespace Database\Seeders;

use App\Models\ConsentTemplate;
use Illuminate\Database\Seeder;

class ConsentTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'code' => 'GEN_TREAT',
                'name' => 'General Treatment Consent',
                'category' => 'treatment',
                'content' => 'I hereby consent to receive medical treatment and care at Royalmed Clinic. I understand the nature of the proposed treatment, its risks, benefits, and alternatives. I agree to the procedures deemed necessary by the healthcare providers.',
                'description' => 'General consent for medical treatment',
                'requires_signature' => true,
                'requires_witness' => false,
                'is_active' => true,
                'validity_days' => 365,
                'minimum_age' => 18,
                'version' => '1.0',
            ],
            [
                'code' => 'SURG_PROC',
                'name' => 'Surgical Procedure Consent',
                'category' => 'surgery',
                'content' => 'I consent to undergo the surgical procedure described by my physician. I understand the procedure, its risks, benefits, and alternatives. I acknowledge that unforeseen conditions may necessitate additional procedures.',
                'description' => 'Consent for surgical procedures',
                'requires_signature' => true,
                'requires_witness' => true,
                'is_active' => true,
                'validity_days' => 180,
                'minimum_age' => 18,
                'version' => '1.0',
            ],
            [
                'code' => 'ANESTHESIA',
                'name' => 'Anesthesia Consent',
                'category' => 'anesthesia',
                'content' => 'I consent to the administration of anesthesia as deemed necessary by the anesthesiologist. I understand the risks associated with anesthesia including but not limited to allergic reactions, respiratory complications, and cardiac events.',
                'description' => 'Consent for anesthesia administration',
                'requires_signature' => true,
                'requires_witness' => false,
                'is_active' => true,
                'validity_days' => 180,
                'minimum_age' => 18,
                'version' => '1.0',
            ],
            [
                'code' => 'PHOTO_CONSENT',
                'name' => 'Photography and Imaging Consent',
                'category' => 'photography',
                'content' => 'I consent to the taking of photographs, videos, or other imaging of myself or my body parts for medical documentation, treatment planning, and educational purposes.',
                'description' => 'Consent for medical photography',
                'requires_signature' => true,
                'requires_witness' => false,
                'is_active' => true,
                'validity_days' => null,
                'minimum_age' => 18,
                'version' => '1.0',
            ],
            [
                'code' => 'DATA_SHARING',
                'name' => 'Data Sharing Consent',
                'category' => 'data_sharing',
                'content' => 'I consent to the sharing of my medical information with other healthcare providers involved in my care, insurance companies for billing purposes, and regulatory authorities as required by law.',
                'description' => 'Consent for sharing medical data',
                'requires_signature' => true,
                'requires_witness' => false,
                'is_active' => true,
                'validity_days' => null,
                'minimum_age' => 18,
                'version' => '1.0',
            ],
            [
                'code' => 'RESEARCH',
                'name' => 'Research Participation Consent',
                'category' => 'research',
                'content' => 'I voluntarily agree to participate in this research study. I understand that my participation is voluntary and I may withdraw at any time without affecting my medical care.',
                'description' => 'Consent for research participation',
                'requires_signature' => true,
                'requires_witness' => true,
                'is_active' => true,
                'validity_days' => null,
                'minimum_age' => 18,
                'version' => '1.0',
            ],
        ];

        foreach ($templates as $template) {
            ConsentTemplate::updateOrCreate(
                ['code' => $template['code']],
                array_merge($template, [
                    'effective_from' => now(),
                    'created_by' => 1,
                ])
            );
        }
    }
}
