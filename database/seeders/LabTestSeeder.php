<?php

namespace Database\Seeders;

use App\Models\LabCategory;
use App\Models\LabTest;
use Illuminate\Database\Seeder;

class LabTestSeeder extends Seeder
{
    public function run(): void
    {
        $hematology = LabCategory::where('code', 'HEM')->first();
        $biochemistry = LabCategory::where('code', 'BIO')->first();
        $microbiology = LabCategory::where('code', 'MIC')->first();
        $parasitology = LabCategory::where('code', 'PAR')->first();
        $immunology = LabCategory::where('code', 'IMM')->first();
        $endocrinology = LabCategory::where('code', 'END')->first();

        $tests = [
            // Hematology
            ['code' => 'CBC', 'name' => 'Complete Blood Count', 'category_id' => $hematology?->id, 'sample_type' => 'Blood', 'price' => 500, 'turnaround_time_hours' => 2],
            ['code' => 'HGB', 'name' => 'Hemoglobin', 'category_id' => $hematology?->id, 'sample_type' => 'Blood', 'price' => 200, 'turnaround_time_hours' => 1],
            ['code' => 'WBC', 'name' => 'White Blood Cell Count', 'category_id' => $hematology?->id, 'sample_type' => 'Blood', 'price' => 250, 'turnaround_time_hours' => 1],
            ['code' => 'PLT', 'name' => 'Platelet Count', 'category_id' => $hematology?->id, 'sample_type' => 'Blood', 'price' => 300, 'turnaround_time_hours' => 1],
            ['code' => 'ESR', 'name' => 'Erythrocyte Sedimentation Rate', 'category_id' => $hematology?->id, 'sample_type' => 'Blood', 'price' => 200, 'turnaround_time_hours' => 2],
            ['code' => 'RET', 'name' => 'Reticulocyte Count', 'category_id' => $hematology?->id, 'sample_type' => 'Blood', 'price' => 350, 'turnaround_time_hours' => 2],
            ['code' => 'BTCT', 'name' => 'Bleeding Time & Clotting Time', 'category_id' => $hematology?->id, 'sample_type' => 'Blood', 'price' => 400, 'turnaround_time_hours' => 1],
            ['code' => 'PT', 'name' => 'Prothrombin Time', 'category_id' => $hematology?->id, 'sample_type' => 'Blood', 'price' => 450, 'turnaround_time_hours' => 2],
            ['code' => 'APTT', 'name' => 'Activated Partial Thromboplastin Time', 'category_id' => $hematology?->id, 'sample_type' => 'Blood', 'price' => 500, 'turnaround_time_hours' => 2],

            // Biochemistry
            ['code' => 'GLU', 'name' => 'Blood Glucose (Fasting)', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 150, 'turnaround_time_hours' => 1],
            ['code' => 'GLUR', 'name' => 'Blood Glucose (Random)', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 150, 'turnaround_time_hours' => 1],
            ['code' => 'HBA1C', 'name' => 'HbA1c', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 800, 'turnaround_time_hours' => 4],
            ['code' => 'UREA', 'name' => 'Blood Urea', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 250, 'turnaround_time_hours' => 2],
            ['code' => 'CREA', 'name' => 'Creatinine', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 300, 'turnaround_time_hours' => 2],
            ['code' => 'URIC', 'name' => 'Uric Acid', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 350, 'turnaround_time_hours' => 2],
            ['code' => 'BUN', 'name' => 'Blood Urea Nitrogen', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 250, 'turnaround_time_hours' => 2],
            ['code' => 'ALT', 'name' => 'ALT (SGPT)', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 300, 'turnaround_time_hours' => 2],
            ['code' => 'AST', 'name' => 'AST (SGOT)', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 300, 'turnaround_time_hours' => 2],
            ['code' => 'ALP', 'name' => 'Alkaline Phosphatase', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 350, 'turnaround_time_hours' => 2],
            ['code' => 'BIL', 'name' => 'Total Bilirubin', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 250, 'turnaround_time_hours' => 2],
            ['code' => 'BILD', 'name' => 'Direct Bilirubin', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 300, 'turnaround_time_hours' => 2],
            ['code' => 'PROT', 'name' => 'Total Protein', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 200, 'turnaround_time_hours' => 2],
            ['code' => 'ALB', 'name' => 'Albumin', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 250, 'turnaround_time_hours' => 2],
            ['code' => 'CHOL', 'name' => 'Total Cholesterol', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 350, 'turnaround_time_hours' => 2],
            ['code' => 'HDL', 'name' => 'HDL Cholesterol', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 400, 'turnaround_time_hours' => 2],
            ['code' => 'LDL', 'name' => 'LDL Cholesterol', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 400, 'turnaround_time_hours' => 2],
            ['code' => 'TRIG', 'name' => 'Triglycerides', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 350, 'turnaround_time_hours' => 2],
            ['code' => 'LIP', 'name' => 'Lipid Profile', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 1200, 'turnaround_time_hours' => 4],
            ['code' => 'ELEC', 'name' => 'Electrolytes', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 600, 'turnaround_time_hours' => 2],
            ['code' => 'SOD', 'name' => 'Sodium', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 200, 'turnaround_time_hours' => 1],
            ['code' => 'POT', 'name' => 'Potassium', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 200, 'turnaround_time_hours' => 1],
            ['code' => 'CHL', 'name' => 'Chloride', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 200, 'turnaround_time_hours' => 1],
            ['code' => 'CAL', 'name' => 'Calcium', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 250, 'turnaround_time_hours' => 2],
            ['code' => 'PHOS', 'name' => 'Phosphorus', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 250, 'turnaround_time_hours' => 2],
            ['code' => 'MAG', 'name' => 'Magnesium', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 300, 'turnaround_time_hours' => 2],
            ['code' => 'CK', 'name' => 'Creatine Kinase', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 400, 'turnaround_time_hours' => 2],
            ['code' => 'CKMB', 'name' => 'CK-MB', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 500, 'turnaround_time_hours' => 2],
            ['code' => 'TROP', 'name' => 'Troponin', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 800, 'turnaround_time_hours' => 1, 'is_critical' => true],
            ['code' => 'LDH', 'name' => 'Lactate Dehydrogenase', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 350, 'turnaround_time_hours' => 2],
            ['code' => 'AMY', 'name' => 'Amylase', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 400, 'turnaround_time_hours' => 2],
            ['code' => 'LIPASE', 'name' => 'Lipase', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 450, 'turnaround_time_hours' => 2],
            ['code' => 'CRP', 'name' => 'C-Reactive Protein', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 400, 'turnaround_time_hours' => 2],
            ['code' => 'CRPH', 'name' => 'CRP (High Sensitivity)', 'category_id' => $biochemistry?->id, 'sample_type' => 'Blood', 'price' => 500, 'turnaround_time_hours' => 4],

            // Microbiology
            ['code' => 'BC', 'name' => 'Blood Culture', 'category_id' => $microbiology?->id, 'sample_type' => 'Blood', 'price' => 1500, 'turnaround_time_hours' => 48],
            ['code' => 'UC', 'name' => 'Urine Culture', 'category_id' => $microbiology?->id, 'sample_type' => 'Urine', 'price' => 1000, 'turnaround_time_hours' => 24],
            ['code' => 'SC', 'name' => 'Stool Culture', 'category_id' => $microbiology?->id, 'sample_type' => 'Stool', 'price' => 1000, 'turnaround_time_hours' => 24],
            ['code' => 'TC', 'name' => 'Throat Culture', 'category_id' => $microbiology?->id, 'sample_type' => 'Swab', 'price' => 800, 'turnaround_time_hours' => 24],
            ['code' => 'WC', 'name' => 'Wound Culture', 'category_id' => $microbiology?->id, 'sample_type' => 'Swab', 'price' => 800, 'turnaround_time_hours' => 24],
            ['code' => 'GC', 'name' => 'Gram Stain', 'category_id' => $microbiology?->id, 'sample_type' => 'Various', 'price' => 300, 'turnaround_time_hours' => 1],
            ['code' => 'AFB', 'name' => 'AFB Stain', 'category_id' => $microbiology?->id, 'sample_type' => 'Sputum', 'price' => 400, 'turnaround_time_hours' => 2],
            ['code' => 'SMEAR', 'name' => 'Wet Mount', 'category_id' => $microbiology?->id, 'sample_type' => 'Various', 'price' => 200, 'turnaround_time_hours' => 1],

            // Parasitology
            ['code' => 'MPS', 'name' => 'Malaria Parasite Smear', 'category_id' => $parasitology?->id, 'sample_type' => 'Blood', 'price' => 300, 'turnaround_time_hours' => 2],
            ['code' => 'URINA', 'name' => 'Urine Analysis', 'category_id' => $parasitology?->id, 'sample_type' => 'Urine', 'price' => 250, 'turnaround_time_hours' => 1],
            ['code' => 'STOOL', 'name' => 'Stool Analysis', 'category_id' => $parasitology?->id, 'sample_type' => 'Stool', 'price' => 300, 'turnaround_time_hours' => 2],
            ['code' => 'OVA', 'name' => 'Ova and Parasites', 'category_id' => $parasitology?->id, 'sample_type' => 'Stool', 'price' => 350, 'turnaround_time_hours' => 2],

            // Immunology
            ['code' => 'HIV', 'name' => 'HIV Screening', 'category_id' => $immunology?->id, 'sample_type' => 'Blood', 'price' => 500, 'turnaround_time_hours' => 2],
            ['code' => 'HBSAG', 'name' => 'Hepatitis B Surface Antigen', 'category_id' => $immunology?->id, 'sample_type' => 'Blood', 'price' => 600, 'turnaround_time_hours' => 4],
            ['code' => 'HCV', 'name' => 'Hepatitis C Antibody', 'category_id' => $immunology?->id, 'sample_type' => 'Blood', 'price' => 600, 'turnaround_time_hours' => 4],
            ['code' => 'SYPH', 'name' => 'Syphilis Screening', 'category_id' => $immunology?->id, 'sample_type' => 'Blood', 'price' => 400, 'turnaround_time_hours' => 2],
            ['code' => 'VDRL', 'name' => 'VDRL', 'category_id' => $immunology?->id, 'sample_type' => 'Blood', 'price' => 450, 'turnaround_time_hours' => 2],
            ['code' => 'RPR', 'name' => 'RPR', 'category_id' => $immunology?->id, 'sample_type' => 'Blood', 'price' => 450, 'turnaround_time_hours' => 2],
            ['code' => 'TPPA', 'name' => 'TPPA', 'category_id' => $immunology?->id, 'sample_type' => 'Blood', 'price' => 600, 'turnaround_time_hours' => 4],
            ['code' => 'WIDAL', 'name' => 'Widal Test', 'category_id' => $immunology?->id, 'sample_type' => 'Blood', 'price' => 400, 'turnaround_time_hours' => 2],
            ['code' => 'BRUCEL', 'name' => 'Brucella Test', 'category_id' => $immunology?->id, 'sample_type' => 'Blood', 'price' => 500, 'turnaround_time_hours' => 4],
            ['code' => 'RF', 'name' => 'Rheumatoid Factor', 'category_id' => $immunology?->id, 'sample_type' => 'Blood', 'price' => 450, 'turnaround_time_hours' => 4],
            ['code' => 'ASO', 'name' => 'ASO Titer', 'category_id' => $immunology?->id, 'sample_type' => 'Blood', 'price' => 450, 'turnaround_time_hours' => 4],
            ['code' => 'ANA', 'name' => 'ANA', 'category_id' => $immunology?->id, 'sample_type' => 'Blood', 'price' => 600, 'turnaround_time_hours' => 4],
            ['code' => 'DNA', 'name' => 'Anti-DNA', 'category_id' => $immunology?->id, 'sample_type' => 'Blood', 'price' => 700, 'turnaround_time_hours' => 4],
            ['code' => 'PSA', 'name' => 'PSA', 'category_id' => $immunology?->id, 'sample_type' => 'Blood', 'price' => 800, 'turnaround_time_hours' => 4],
            ['code' => 'CEA', 'name' => 'CEA', 'category_id' => $immunology?->id, 'sample_type' => 'Blood', 'price' => 800, 'turnaround_time_hours' => 4],
            ['code' => 'CA125', 'name' => 'CA-125', 'category_id' => $immunology?->id, 'sample_type' => 'Blood', 'price' => 900, 'turnaround_time_hours' => 4],
            ['code' => 'CA19', 'name' => 'CA 19-9', 'category_id' => $immunology?->id, 'sample_type' => 'Blood', 'price' => 900, 'turnaround_time_hours' => 4],
            ['code' => 'AFP', 'name' => 'AFP', 'category_id' => $immunology?->id, 'sample_type' => 'Blood', 'price' => 800, 'turnaround_time_hours' => 4],

            // Endocrinology
            ['code' => 'TSH', 'name' => 'TSH', 'category_id' => $endocrinology?->id, 'sample_type' => 'Blood', 'price' => 500, 'turnaround_time_hours' => 4],
            ['code' => 'FT3', 'name' => 'Free T3', 'category_id' => $endocrinology?->id, 'sample_type' => 'Blood', 'price' => 600, 'turnaround_time_hours' => 4],
            ['code' => 'FT4', 'name' => 'Free T4', 'category_id' => $endocrinology?->id, 'sample_type' => 'Blood', 'price' => 600, 'turnaround_time_hours' => 4],
            ['code' => 'T3', 'name' => 'Total T3', 'category_id' => $endocrinology?->id, 'sample_type' => 'Blood', 'price' => 500, 'turnaround_time_hours' => 4],
            ['code' => 'T4', 'name' => 'Total T4', 'category_id' => $endocrinology?->id, 'sample_type' => 'Blood', 'price' => 500, 'turnaround_time_hours' => 4],
            ['code' => 'COR', 'name' => 'Cortisol', 'category_id' => $endocrinology?->id, 'sample_type' => 'Blood', 'price' => 700, 'turnaround_time_hours' => 4],
            ['code' => 'INS', 'name' => 'Insulin', 'category_id' => $endocrinology?->id, 'sample_type' => 'Blood', 'price' => 600, 'turnaround_time_hours' => 4],
            ['code' => 'CPEP', 'name' => 'C-Peptide', 'category_id' => $endocrinology?->id, 'sample_type' => 'Blood', 'price' => 700, 'turnaround_time_hours' => 4],
            ['code' => 'TESTO', 'name' => 'Testosterone', 'category_id' => $endocrinology?->id, 'sample_type' => 'Blood', 'price' => 700, 'turnaround_time_hours' => 4],
            ['code' => 'EST', 'name' => 'Estrogen', 'category_id' => $endocrinology?->id, 'sample_type' => 'Blood', 'price' => 700, 'turnaround_time_hours' => 4],
            ['code' => 'PROG', 'name' => 'Progesterone', 'category_id' => $endocrinology?->id, 'sample_type' => 'Blood', 'price' => 700, 'turnaround_time_hours' => 4],
            ['code' => 'FSH', 'name' => 'FSH', 'category_id' => $endocrinology?->id, 'sample_type' => 'Blood', 'price' => 600, 'turnaround_time_hours' => 4],
            ['code' => 'LH', 'name' => 'LH', 'category_id' => $endocrinology?->id, 'sample_type' => 'Blood', 'price' => 600, 'turnaround_time_hours' => 4],
            ['code' => 'PROL', 'name' => 'Prolactin', 'category_id' => $endocrinology?->id, 'sample_type' => 'Blood', 'price' => 600, 'turnaround_time_hours' => 4],
            ['code' => 'GH', 'name' => 'Growth Hormone', 'category_id' => $endocrinology?->id, 'sample_type' => 'Blood', 'price' => 800, 'turnaround_time_hours' => 4],
            ['code' => 'IGF1', 'name' => 'IGF-1', 'category_id' => $endocrinology?->id, 'sample_type' => 'Blood', 'price' => 800, 'turnaround_time_hours' => 4],
            ['code' => 'VITD', 'name' => 'Vitamin D', 'category_id' => $endocrinology?->id, 'sample_type' => 'Blood', 'price' => 1000, 'turnaround_time_hours' => 4],
            ['code' => 'VITB12', 'name' => 'Vitamin B12', 'category_id' => $endocrinology?->id, 'sample_type' => 'Blood', 'price' => 600, 'turnaround_time_hours' => 4],
            ['code' => 'FOLATE', 'name' => 'Folate', 'category_id' => $endocrinology?->id, 'sample_type' => 'Blood', 'price' => 500, 'turnaround_time_hours' => 4],
            ['code' => 'FER', 'name' => 'Ferritin', 'category_id' => $endocrinology?->id, 'sample_type' => 'Blood', 'price' => 600, 'turnaround_time_hours' => 4],
            ['code' => 'TRANS', 'name' => 'Transferrin', 'category_id' => $endocrinology?->id, 'sample_type' => 'Blood', 'price' => 500, 'turnaround_time_hours' => 4],
            ['code' => 'TIBC', 'name' => 'TIBC', 'category_id' => $endocrinology?->id, 'sample_type' => 'Blood', 'price' => 500, 'turnaround_time_hours' => 4],
        ];

        foreach ($tests as $test) {
            LabTest::firstOrCreate(
                ['code' => $test['code']],
                [
                    'name' => $test['name'],
                    'lab_category_id' => $test['category_id'],
                    'sample_type' => $test['sample_type'],
                    'price' => $test['price'],
                    'turnaround_time_hours' => $test['turnaround_time_hours'],
                    'is_critical' => $test['is_critical'] ?? false,
                ]
            );
        }
    }
}
