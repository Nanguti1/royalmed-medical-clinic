import { Button } from '@/components/ui/button';
import { Download, FileText, Printer } from 'lucide-react';

interface ExportButtonsProps {
    onExportPDF?: () => void;
    onExportExcel?: () => void;
    onPrint?: () => void;
}

export function ExportButtons({ onExportPDF, onExportExcel, onPrint }: ExportButtonsProps) {
    return (
        <div className="flex gap-2">
            {onExportPDF && (
                <Button variant="outline" size="sm" onClick={onExportPDF}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export PDF
                </Button>
            )}
            {onExportExcel && (
                <Button variant="outline" size="sm" onClick={onExportExcel}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Excel
                </Button>
            )}
            {onPrint && (
                <Button variant="outline" size="sm" onClick={onPrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                </Button>
            )}
        </div>
    );
}
