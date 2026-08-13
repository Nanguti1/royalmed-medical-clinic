<?php

namespace Database\Seeders;

use App\Models\Medicine;
use App\Models\MedicineCategory;
use App\Models\MedicineForm;
use App\Models\MedicineStrength;
use Illuminate\Database\Seeder;

class MedicineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Antibiotics' => MedicineCategory::where('name', 'Antibiotics')->first()?->id,
            'Analgesics' => MedicineCategory::where('name', 'Analgesics')->first()?->id,
            'Antihypertensives' => MedicineCategory::where('name', 'Antihypertensives')->first()?->id,
            'Antidiabetics' => MedicineCategory::where('name', 'Antidiabetics')->first()?->id,
            'Antihistamines' => MedicineCategory::where('name', 'Antihistamines')->first()?->id,
            'Antacids' => MedicineCategory::where('name', 'Antacids')->first()?->id,
            'Cardiovascular' => MedicineCategory::where('name', 'Cardiovascular')->first()?->id,
            'Respiratory' => MedicineCategory::where('name', 'Respiratory')->first()?->id,
            'Vitamins' => MedicineCategory::where('name', 'Vitamins')->first()?->id,
        ];

        $forms = [
            'Tablet' => MedicineForm::where('name', 'Tablet')->first()?->id,
            'Capsule' => MedicineForm::where('name', 'Capsule')->first()?->id,
            'Syrup' => MedicineForm::where('name', 'Syrup')->first()?->id,
            'Injection' => MedicineForm::where('name', 'Injection')->first()?->id,
            'Inhaler' => MedicineForm::where('name', 'Inhaler')->first()?->id,
        ];

        $strengths = [
            '500mg' => MedicineStrength::where('name', '500mg')->first()?->id,
            '400mg' => MedicineStrength::where('name', '400mg')->first()?->id,
            '20mg' => MedicineStrength::where('name', '20mg')->first()?->id,
            '10mg' => MedicineStrength::where('name', '10mg')->first()?->id,
            '5mg' => MedicineStrength::where('name', '5mg')->first()?->id,
            '40mg' => MedicineStrength::where('name', '40mg')->first()?->id,
            '50mg' => MedicineStrength::where('name', '50mg')->first()?->id,
            '80mg' => MedicineStrength::where('name', '80mg')->first()?->id,
            '75mg' => MedicineStrength::where('name', '75mg')->first()?->id,
            '25mg' => MedicineStrength::where('name', '25mg')->first()?->id,
            '12.5mg' => MedicineStrength::where('name', '12.5mg')->first()?->id,
            '100mg' => MedicineStrength::where('name', '100mg')->first()?->id,
            '150mg' => MedicineStrength::where('name', '150mg')->first()?->id,
            '200mg' => MedicineStrength::where('name', '200mg')->first()?->id,
            '300mg' => MedicineStrength::where('name', '300mg')->first()?->id,
            '600mg' => MedicineStrength::where('name', '600mg')->first()?->id,
            '1mg' => MedicineStrength::where('name', '1mg')->first()?->id,
            '2mg' => MedicineStrength::where('name', '2mg')->first()?->id,
            '4mg' => MedicineStrength::where('name', '4mg')->first()?->id,
            '8mg' => MedicineStrength::where('name', '8mg')->first()?->id,
        ];

        $medicines = [
            ['name' => 'Paracetamol 500mg', 'generic_name' => 'Acetaminophen', 'category' => 'Analgesics', 'form' => 'Tablet', 'strength' => '500mg', 'unit_price' => 50.00, 'reorder_level' => 100],
            ['name' => 'Amoxicillin 500mg', 'generic_name' => 'Amoxicillin', 'category' => 'Antibiotics', 'form' => 'Capsule', 'strength' => '500mg', 'unit_price' => 150.00, 'reorder_level' => 50],
            ['name' => 'Ibuprofen 400mg', 'generic_name' => 'Ibuprofen', 'category' => 'Analgesics', 'form' => 'Tablet', 'strength' => '400mg', 'unit_price' => 80.00, 'reorder_level' => 100],
            ['name' => 'Metformin 500mg', 'generic_name' => 'Metformin', 'category' => 'Antidiabetics', 'form' => 'Tablet', 'strength' => '500mg', 'unit_price' => 120.00, 'reorder_level' => 200],
            ['name' => 'Omeprazole 20mg', 'generic_name' => 'Omeprazole', 'category' => 'Antacids', 'form' => 'Capsule', 'strength' => '20mg', 'unit_price' => 90.00, 'reorder_level' => 80],
            ['name' => 'Ciprofloxacin 500mg', 'generic_name' => 'Ciprofloxacin', 'category' => 'Antibiotics', 'form' => 'Tablet', 'strength' => '500mg', 'unit_price' => 180.00, 'reorder_level' => 50],
            ['name' => 'Lisinopril 10mg', 'generic_name' => 'Lisinopril', 'category' => 'Antihypertensives', 'form' => 'Tablet', 'strength' => '10mg', 'unit_price' => 140.00, 'reorder_level' => 100],
            ['name' => 'Atorvastatin 20mg', 'generic_name' => 'Atorvastatin', 'category' => 'Cardiovascular', 'form' => 'Tablet', 'strength' => '20mg', 'unit_price' => 200.00, 'reorder_level' => 60],
            ['name' => 'Salbutamol Inhaler', 'generic_name' => 'Albuterol', 'category' => 'Respiratory', 'form' => 'Inhaler', 'strength' => '100mg', 'unit_price' => 250.00, 'reorder_level' => 30],
            ['name' => 'Cetirizine 10mg', 'generic_name' => 'Cetirizine', 'category' => 'Antihistamines', 'form' => 'Tablet', 'strength' => '10mg', 'unit_price' => 70.00, 'reorder_level' => 150],
            ['name' => 'Azithromycin 500mg', 'generic_name' => 'Azithromycin', 'category' => 'Antibiotics', 'form' => 'Tablet', 'strength' => '500mg', 'unit_price' => 220.00, 'reorder_level' => 40],
            ['name' => 'Pantoprazole 40mg', 'generic_name' => 'Pantoprazole', 'category' => 'Antacids', 'form' => 'Tablet', 'strength' => '40mg', 'unit_price' => 110.00, 'reorder_level' => 70],
            ['name' => 'Amlodipine 5mg', 'generic_name' => 'Amlodipine', 'category' => 'Antihypertensives', 'form' => 'Tablet', 'strength' => '5mg', 'unit_price' => 130.00, 'reorder_level' => 100],
            ['name' => 'Hydrochlorothiazide 25mg', 'generic_name' => 'Hydrochlorothiazide', 'category' => 'Antihypertensives', 'form' => 'Tablet', 'strength' => '25mg', 'unit_price' => 60.00, 'reorder_level' => 120],
            ['name' => 'Aspirin 75mg', 'generic_name' => 'Acetylsalicylic acid', 'category' => 'Cardiovascular', 'form' => 'Tablet', 'strength' => '75mg', 'unit_price' => 40.00, 'reorder_level' => 200],
            ['name' => 'Cephalexin 500mg', 'generic_name' => 'Cephalexin', 'category' => 'Antibiotics', 'form' => 'Capsule', 'strength' => '500mg', 'unit_price' => 160.00, 'reorder_level' => 50],
            ['name' => 'Prednisone 5mg', 'generic_name' => 'Prednisone', 'category' => 'Analgesics', 'form' => 'Tablet', 'strength' => '5mg', 'unit_price' => 85.00, 'reorder_level' => 80],
            ['name' => 'Losartan 50mg', 'generic_name' => 'Losartan', 'category' => 'Antihypertensives', 'form' => 'Tablet', 'strength' => '50mg', 'unit_price' => 145.00, 'reorder_level' => 90],
            ['name' => 'Furosemide 40mg', 'generic_name' => 'Furosemide', 'category' => 'Cardiovascular', 'form' => 'Tablet', 'strength' => '40mg', 'unit_price' => 55.00, 'reorder_level' => 100],
            ['name' => 'Vitamin C 500mg', 'generic_name' => 'Ascorbic acid', 'category' => 'Vitamins', 'form' => 'Tablet', 'strength' => '500mg', 'unit_price' => 35.00, 'reorder_level' => 300],
        ];

        foreach ($medicines as $medicine) {
            Medicine::firstOrCreate(
                ['name' => $medicine['name']],
                [
                    'name' => $medicine['name'],
                    'generic_name' => $medicine['generic_name'],
                    'medicine_category_id' => $categories[$medicine['category']] ?? null,
                    'medicine_form_id' => $forms[$medicine['form']] ?? null,
                    'medicine_strength_id' => $strengths[$medicine['strength']] ?? null,
                    'unit_price' => $medicine['unit_price'],
                    'reorder_level' => $medicine['reorder_level'],
                ]
            );
        }

        $this->command->info('Medicines seeded successfully.');
    }
}
