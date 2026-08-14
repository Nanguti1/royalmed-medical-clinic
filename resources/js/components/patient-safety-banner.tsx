import { AlertTriangle, Shield, Heart, CreditCard, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

type PatientSafetyBannerProps = {
    allergies?: Array<{ allergen: string; severity: string }>;
    chronicConditions?: Array<{ condition_name: string; status: string }>;
    alerts?: Array<{ alert_type: string; message: string; severity: string }>;
    insuranceStatus?: { status: string; scheme_name?: string; expiry_date?: string };
    outstandingBalance?: number;
};

export function PatientSafetyBanner({
    allergies = [],
    chronicConditions = [],
    alerts = [],
    insuranceStatus,
    outstandingBalance,
}: PatientSafetyBannerProps) {
    const hasCriticalAlerts = alerts.some(a => a.severity === 'critical');
    const hasSevereAllergies = allergies.some(a => a.severity === 'severe');
    const hasInsuranceIssue = insuranceStatus?.status === 'expired' || insuranceStatus?.status === 'inactive';
    const hasOutstandingBalance = outstandingBalance && outstandingBalance > 0;

    if (
        allergies.length === 0 &&
        chronicConditions.length === 0 &&
        alerts.length === 0 &&
        !hasInsuranceIssue &&
        !hasOutstandingBalance
    ) {
        return null;
    }

    return (
        <div className="space-y-2">
            {/* Critical Alerts */}
            {hasCriticalAlerts && (
                <Card className="border-l-4 border-l-red-500 bg-red-50">
                    <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 space-y-2">
                                <p className="font-semibold text-red-900">Critical Alerts</p>
                                {alerts
                                    .filter(a => a.severity === 'critical')
                                    .map((alert, index) => (
                                        <div key={index} className="text-sm text-red-800">
                                            <span className="font-medium">{alert.alert_type}:</span> {alert.message}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Safety Warning Banner */}
            {(hasSevereAllergies || chronicConditions.length > 0 || alerts.length > 0) && (
                <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
                    <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 space-y-2">
                                <p className="font-semibold text-yellow-900">Patient Safety Information</p>
                                
                                {hasSevereAllergies && (
                                    <div className="text-sm text-yellow-800">
                                        <span className="font-medium flex items-center gap-1">
                                            <Shield className="h-4 w-4" />
                                            Severe Allergies:
                                        </span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {allergies
                                                .filter(a => a.severity === 'severe')
                                                .map((allergy, index) => (
                                                    <Badge key={index} variant="destructive" className="text-xs">
                                                        {allergy.allergen}
                                                    </Badge>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {chronicConditions.length > 0 && (
                                    <div className="text-sm text-yellow-800">
                                        <span className="font-medium flex items-center gap-1">
                                            <Heart className="h-4 w-4" />
                                            Chronic Conditions:
                                        </span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {chronicConditions.map((condition, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {condition.condition_name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {alerts.filter(a => a.severity !== 'critical').length > 0 && (
                                    <div className="text-sm text-yellow-800">
                                        <span className="font-medium">Alerts:</span>
                                        {alerts
                                            .filter(a => a.severity !== 'critical')
                                            .map((alert, index) => (
                                                <div key={index} className="mt-1">
                                                    • {alert.alert_type}: {alert.message}
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Insurance Status */}
            {hasInsuranceIssue && (
                <Card className="border-l-4 border-l-orange-500 bg-orange-50">
                    <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                            <CreditCard className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-semibold text-orange-900">Insurance Issue</p>
                                <p className="text-sm text-orange-800">
                                    {insuranceStatus?.status === 'expired' 
                                        ? `Insurance expired on ${insuranceStatus.expiry_date}`
                                        : `Insurance is ${insuranceStatus?.status}`}
                                    {insuranceStatus?.scheme_name && ` (${insuranceStatus.scheme_name})`}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Outstanding Balance */}
            {hasOutstandingBalance && (
                <Card className="border-l-4 border-l-blue-500 bg-blue-50">
                    <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                            <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-semibold text-blue-900">Outstanding Balance</p>
                                <p className="text-sm text-blue-800">
                                    Patient has an outstanding balance of KES {outstandingBalance?.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
