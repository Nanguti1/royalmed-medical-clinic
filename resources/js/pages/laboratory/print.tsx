import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';

type User = {
    id: number;
    name: string;
};

type LabTest = {
    id: number;
    code?: string;
    name: string;
    standard_units?: string;
};

type LabResult = {
    id: number;
    result_value: string;
    units?: string;
    reference_range?: string;
    notes?: string;
    is_abnormal: boolean;
    is_critical: boolean;
    verification_status: string;
    rejection_reason?: string;
    recorded_at?: string;
    recorded_by?: User;
    verified_at?: string;
    verified_by?: User;
};

type LabOrderItem = {
    id: number;
    specimen_label?: string;
    accession_number?: string;
    sample_type?: string;
    sample_status?: string;
    test?: LabTest;
    result?: LabResult;
};

type Patient = {
    id: number;
    hospital_number?: string;
    first_name: string;
    last_name: string;
    other_names?: string;
    gender_id?: number;
    date_of_birth?: string;
    phone?: string;
};

type Visit = {
    id: number;
    patient?: Patient;
};

type LabOrder = {
    id: number;
    visit_id: number;
    accession_number?: string;
    priority?: string;
    status: string;
    created_at: string;
    visit?: Visit;
    ordered_by?: User;
    sample_collected_by?: User;
    items?: LabOrderItem[];
};

export default function LaboratoryPrint({ order }: { order: LabOrder }) {
    const patient = order.visit?.patient;
    const patientName = patient
        ? [patient.first_name, patient.other_names, patient.last_name].filter(Boolean).join(' ')
        : 'Unknown Patient';

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title={`Print Lab Report - Order #${order.id}`} />
            <div className="min-h-screen bg-background p-6 md:p-10 print:p-0">
                {/* Print Controls (Hidden during print) */}
                <div className="mb-6 flex items-center justify-between print:hidden">
                    <Button variant="outline" asChild>
                        <a href={`/laboratory/${order.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Order
                        </a>
                    </Button>
                    <Button onClick={handlePrint} className="bg-primary text-primary-foreground">
                        <Printer className="mr-2 h-4 w-4" /> Print Laboratory Report
                    </Button>
                </div>

                {/* Printable Document Sheet */}
                <div className="mx-auto max-w-4xl rounded-lg border bg-card p-8 text-card-foreground shadow-sm print:border-none print:p-0 print:shadow-none">
                    {/* Header */}
                    <div className="border-b pb-6 text-center">
                        <h1 className="text-2xl font-bold uppercase tracking-wider text-primary">Royalmed Medical Clinic</h1>
                        <p className="text-sm text-muted-foreground">Level 2 Hospital Information System • Laboratory Division</p>
                        <p className="text-xs text-muted-foreground">Phone: +254 700 000000 | Email: lab@royalmed.co.ke</p>
                    </div>

                    {/* Patient & Order Details Header Grid */}
                    <div className="my-6 grid grid-cols-2 gap-4 rounded-md bg-muted/40 p-4 text-sm print:bg-slate-50">
                        <div>
                            <p><span className="font-semibold">Patient Name:</span> {patientName}</p>
                            <p><span className="font-semibold">Hospital No:</span> {patient?.hospital_number || 'N/A'}</p>
                            <p><span className="font-semibold">DOB / Age:</span> {patient?.date_of_birth || 'N/A'}</p>
                            <p><span className="font-semibold">Phone:</span> {patient?.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <p><span className="font-semibold">Accession No:</span> {order.accession_number || `ACC-${order.id}`}</p>
                            <p><span className="font-semibold">Order ID:</span> #{order.id}</p>
                            <p><span className="font-semibold">Order Date:</span> {new Date(order.created_at).toLocaleString()}</p>
                            <p><span className="font-semibold">Ordered By:</span> {order.ordered_by?.name || 'Staff'}</p>
                        </div>
                    </div>

                    {/* Laboratory Results Table */}
                    <h2 className="mb-3 text-lg font-semibold tracking-tight border-b pb-1">Laboratory Test Results</h2>
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b bg-muted/60 print:bg-slate-100">
                                <th className="p-2 font-semibold">Test Name</th>
                                <th className="p-2 font-semibold">Specimen Label</th>
                                <th className="p-2 font-semibold">Result Value</th>
                                <th className="p-2 font-semibold">Units</th>
                                <th className="p-2 font-semibold">Reference Range</th>
                                <th className="p-2 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items && order.items.length > 0 ? (
                                order.items.map((item) => (
                                    <tr key={item.id} className="border-b">
                                        <td className="p-2 font-medium">
                                            {item.test?.name}
                                            {item.test?.code && <span className="text-xs text-muted-foreground block">{item.test.code}</span>}
                                        </td>
                                        <td className="p-2 text-xs font-mono">{item.specimen_label || 'N/A'}</td>
                                        <td className="p-2">
                                            {item.result ? (
                                                <span className={item.result.is_critical ? 'font-bold text-red-600' : item.result.is_abnormal ? 'font-semibold text-orange-600' : ''}>
                                                    {item.result.result_value}
                                                    {item.result.is_critical && ' (CRITICAL)'}
                                                    {item.result.is_abnormal && !item.result.is_critical && ' (ABNORMAL)'}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground italic">Pending</span>
                                            )}
                                        </td>
                                        <td className="p-2">{item.result?.units || item.test?.standard_units || '-'}</td>
                                        <td className="p-2">{item.result?.reference_range || '-'}</td>
                                        <td className="p-2 capitalize">
                                            {item.result ? item.result.verification_status : item.sample_status || 'Pending'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-muted-foreground">No tests in order.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Signatures & Verification Section */}
                    <div className="mt-12 grid grid-cols-2 gap-8 border-t pt-6 text-xs">
                        <div>
                            <p className="font-semibold text-sm mb-4">Laboratory Technician</p>
                            <p className="border-b border-dashed w-48 mb-1"></p>
                            <p>Recorded By: {order.items?.[0]?.result?.recorded_by?.name || 'Lab Staff'}</p>
                            <p>Date: {order.items?.[0]?.result?.recorded_at ? new Date(order.items[0].result.recorded_at).toLocaleString() : new Date().toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-sm mb-4">Verification Specialist / Pathologist</p>
                            <p className="border-b border-dashed w-48 mb-1"></p>
                            <p>Verified By: {order.items?.[0]?.result?.verified_by?.name || 'Pending Verification'}</p>
                            <p>Date: {order.items?.[0]?.result?.verified_at ? new Date(order.items[0].result.verified_at).toLocaleString() : 'N/A'}</p>
                        </div>
                    </div>

                    {/* Disclaimer Footer */}
                    <div className="mt-8 border-t pt-4 text-center text-[10px] text-muted-foreground">
                        <p>This report has been electronically generated and validated by Royalmed HIS Laboratory Module.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
