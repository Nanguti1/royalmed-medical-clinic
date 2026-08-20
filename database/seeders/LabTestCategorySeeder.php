<?php

namespace Database\Seeders;

use App\Models\LabCategory;
use Illuminate\Database\Seeder;

class LabTestCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['code' => 'HEM', 'name' => 'Hematology'],
            ['code' => 'BIO', 'name' => 'Biochemistry'],
            ['code' => 'MIC', 'name' => 'Microbiology'],
            ['code' => 'PAR', 'name' => 'Parasitology'],
            ['code' => 'IMM', 'name' => 'Immunology'],
            ['code' => 'END', 'name' => 'Endocrinology'],
            ['code' => 'TOX', 'name' => 'Toxicology'],
            ['code' => 'URG', 'name' => 'Urgent Care'],
        ];

        foreach ($categories as $category) {
            LabCategory::firstOrCreate(
                ['code' => $category['code']],
                ['name' => $category['name']]
            );
        }
    }
}
