<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt - Royalmed Clinic</title>
    <style>
        @media print {
            body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                width: 80mm;
                margin: 0;
                padding: 5mm;
            }
            .no-print {
                display: none !important;
            }
        }
        body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 80mm;
            margin: 20px auto;
            padding: 5mm;
            border: 1px dashed #ccc;
        }
        .header {
            text-align: center;
            margin-bottom: 10px;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
        }
        .clinic-name {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
        }
        .divider {
            border-top: 1px dashed #000;
            margin: 10px 0;
        }
        .total {
            font-weight: bold;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            margin-top: 15px;
            border-top: 1px dashed #000;
            padding-top: 10px;
            font-size: 10px;
        }
        .barcode {
            text-align: center;
            margin: 10px 0;
            font-family: 'Libre Barcode 39', monospace;
            font-size: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="clinic-name">ROYALMED CLINIC</div>
        <div>Level 2 Hospital</div>
        <div>Nairobi, Kenya</div>
        <div>Tel: +254 XXX XXX XXX</div>
    </div>

    <div class="row">
        <span>Receipt #:</span>
        <span>{{ $receiptNumber }}</span>
    </div>
    <div class="row">
        <span>Date:</span>
        <span>{{ $paidAt }}</span>
    </div>
    <div class="row">
        <span>Patient:</span>
        <span>{{ $patientName }}</span>
    </div>
    <div class="row">
        <span>Invoice #:</span>
        <span>{{ $invoiceNumber }}</span>
    </div>

    <div class="divider"></div>

    <div class="row">
        <span>Description</span>
        <span>Amount</span>
    </div>
    <div class="divider"></div>

    @foreach ($items as $item)
    <div class="row">
        <span>{{ Str::limit($item['description'], 30) }}</span>
        <span>KES {{ number_format($item['total'], 2) }}</span>
    </div>
    @endforeach

    <div class="divider"></div>

    <div class="row">
        <span>Subtotal:</span>
        <span>KES {{ number_format($subtotal, 2) }}</span>
    </div>
    @if ($discountAmount > 0)
    <div class="row">
        <span>Discount:</span>
        <span>KES {{ number_format($discountAmount, 2) }}</span>
    </div>
    @endif
    <div class="row total">
        <span>TOTAL PAID:</span>
        <span>KES {{ number_format($amountPaid, 2) }}</span>
    </div>

    <div class="divider"></div>

    <div class="row">
        <span>Payment Method:</span>
        <span>{{ $paymentMethod }}</span>
    </div>
    @if ($mpesaRef)
    <div class="row">
        <span>M-Pesa Ref:</span>
        <span>{{ $mpesaRef }}</span>
    </div>
    @endif
    <div class="row">
        <span>Received By:</span>
        <span>{{ $receivedBy }}</span>
    </div>

    <div class="barcode">
        *{{ $receiptNumber }}*
    </div>

    <div class="footer">
        <div>Thank you for choosing Royalmed Clinic</div>
        <div>We wish you good health</div>
        <div>&copy; {{ date('Y') }} Royalmed Clinic</div>
    </div>

    <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px;">Print Receipt</button>
    </div>
</body>
</html>
