<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    // This migration was previously used to create Spatie permission tables.
    // The package's published migration (create_permission_tables.php) exists and should be used instead.
    public function up(): void
    {
        // intentionally left blank to avoid duplicate table creation
    }

    public function down(): void
    {
        // intentionally left blank
    }
};
