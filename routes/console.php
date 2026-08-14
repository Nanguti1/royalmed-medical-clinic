<?php

use App\Console\Commands\CheckCriticalLabResults;
use App\Console\Commands\CheckExpiringStock;
use App\Console\Commands\CheckInsuranceExpiry;
use App\Console\Commands\CheckLowStock;
use App\Console\Commands\CheckMissedAppointments;
use App\Console\Commands\ProcessRecurringAppointments;
use App\Console\Commands\SendAppointmentReminders;
use App\Console\Commands\SendBillingNotifications;
use App\Console\Commands\SendMedicationReminders;
use App\Console\Commands\SendVaccinationReminders;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule automation commands
Schedule::command(SendAppointmentReminders::class)->hourly();
Schedule::command(SendVaccinationReminders::class)->daily();
Schedule::command(CheckMissedAppointments::class)->daily();
Schedule::command(CheckLowStock::class)->daily();
Schedule::command(CheckExpiringStock::class)->daily();
Schedule::command(SendMedicationReminders::class)->daily();
Schedule::command(CheckInsuranceExpiry::class)->daily();
Schedule::command(ProcessRecurringAppointments::class)->daily();
Schedule::command(SendBillingNotifications::class)->daily();
Schedule::command(CheckCriticalLabResults::class)->hourly();
