<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class HealthController extends Controller
{
    /**
     * Health check endpoint.
     *
     * @return Response
     */
    public function __invoke()
    {
        $status = 'healthy';
        $checks = [];

        // Database connectivity check
        try {
            DB::connection()->getPdo();
            $checks['database'] = [
                'status' => 'ok',
                'message' => 'Database connection successful',
            ];
        } catch (\Exception $e) {
            $status = 'unhealthy';
            $checks['database'] = [
                'status' => 'error',
                'message' => 'Database connection failed',
            ];
        }

        // Storage availability check
        try {
            Storage::disk('local')->put('health_check.txt', 'test');
            Storage::disk('local')->delete('health_check.txt');
            $checks['storage'] = [
                'status' => 'ok',
                'message' => 'Storage read/write successful',
            ];
        } catch (\Exception $e) {
            $status = 'unhealthy';
            $checks['storage'] = [
                'status' => 'error',
                'message' => 'Storage operation failed',
            ];
        }

        // Application configuration check
        try {
            $checks['config'] = [
                'status' => 'ok',
                'message' => 'Application configuration loaded',
                'app_env' => config('app.env'),
                'app_debug' => config('app.debug') ? 'enabled' : 'disabled',
            ];

            // Warn if debug mode is enabled in production
            if (config('app.env') === 'production' && config('app.debug')) {
                $status = 'degraded';
                $checks['config']['message'] = 'WARNING: Debug mode enabled in production';
            }
        } catch (\Exception $e) {
            $status = 'unhealthy';
            $checks['config'] = [
                'status' => 'error',
                'message' => 'Configuration check failed',
            ];
        }

        return response()->json([
            'status' => $status,
            'timestamp' => now()->toIso8601String(),
            'checks' => $checks,
        ]);
    }
}
