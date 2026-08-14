<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Label - Royalmed Clinic</title>
    <style>
        @media print {
            body {
                font-family: 'Arial', sans-serif;
                font-size: 10px;
                width: 50mm;
                margin: 0;
                padding: 2mm;
            }
            .no-print {
                display: none !important;
            }
        }
        body {
            font-family: 'Arial', sans-serif;
            font-size: 10px;
            width: 50mm;
            margin: 20px auto;
            padding: 2mm;
            border: 1px solid #000;
        }
        .header {
            text-align: center;
            font-weight: bold;
            margin-bottom: 5px;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
        }
        .row {
            margin: 3px 0;
        }
        .row span:first-child {
            font-weight: bold;
        }
        .barcode {
            text-align: center;
            margin: 5px 0;
            font-family: 'Libre Barcode 39', monospace;
            font-size: 14px;
        }
        .qr {
            text-align: center;
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        {{ $labelType }}
    </div>

    @foreach ($fields as $label => $value)
    <div class="row">
        <span>{{ $label }}:</span>
        <span>{{ $value }}</span>
    </div>
    @endforeach

    @if ($barcode)
    <div class="barcode">
        *{{ $barcode }}*
    </div>
    @endif

    @if ($qrCode)
    <div class="qr">
        [QR: {{ $qrCode }}]
    </div>
    @endif

    <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="padding: 8px 16px; font-size: 12px;">Print Label</button>
    </div>
</body>
</html>
