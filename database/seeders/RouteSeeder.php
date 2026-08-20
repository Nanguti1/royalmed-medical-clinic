<?php

namespace Database\Seeders;

use App\Models\Route;
use Illuminate\Database\Seeder;

class RouteSeeder extends Seeder
{
    public function run(): void
    {
        $routes = [
            ['name' => 'Oral'],
            ['name' => 'Intravenous'],
            ['name' => 'Intramuscular'],
            ['name' => 'Subcutaneous'],
            ['name' => 'Topical'],
            ['name' => 'Inhalation'],
            ['name' => 'Nasal'],
            ['name' => 'Ophthalmic'],
            ['name' => 'Otic'],
            ['name' => 'Rectal'],
            ['name' => 'Vaginal'],
            ['name' => 'Transdermal'],
            ['name' => 'Sublingual'],
            ['name' => 'Buccal'],
            ['name' => 'Intradermal'],
            ['name' => 'Intra-articular'],
            ['name' => 'Intrathecal'],
            ['name' => 'Intravesical'],
            ['name' => 'Intra-arterial'],
            ['name' => 'Intraperitoneal'],
        ];

        foreach ($routes as $route) {
            Route::firstOrCreate(
                ['name' => $route['name']]
            );
        }
    }
}
