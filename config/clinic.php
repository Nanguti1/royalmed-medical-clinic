<?php

return [
    'name' => env('CLINIC_NAME', 'Royalmed Medical Clinic'),
    'location' => env('CLINIC_LOCATION', 'Gatundu Town, Kiambu County'),
    'phone' => env('CLINIC_PHONE', '+254 700 000 000'),
    'email' => env('CLINIC_EMAIL', 'info@royalmed.co.ke'),
    'consultation_fee' => env('CONSULTATION_FEE', 500),
    'tax_rate' => env('TAX_RATE', 0.16),
    'low_stock_threshold' => env('LOW_STOCK_THRESHOLD', 10),
    'expiry_warning_days' => env('EXPIRY_WARNING_DAYS', 30),
];
