import { Head, usePage } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PermissionGuard } from '@/components/permission-guard';
import {
  Users,
  Activity,
  Stethoscope,
  Calendar,
  DollarSign,
  Smartphone,
  FileText,
  FlaskConical,
  Pill,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Plus,
} from 'lucide-react';
import type { DashboardStats } from '@/types/dashboard';

export default function Dashboard() {
  const { auth } = usePage().props;
  const dashboard = usePage<DashboardStats>().props;

  const { get, setData, processing } = useForm({
    date: dashboard.date || new Date().toISOString().split('T')[0],
  });

  const handleDateChange = (newDate: string) => {
    setData('date', newDate);
    get('/dashboard');
  };

  const getPatientName = (name: string) => name;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success/10 text-success-foreground border-success/20">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-warning/10 text-warning-foreground border-warning/20">Partial</Badge>;
      case 'unpaid':
        return <Badge className="bg-destructive/10 text-destructive-foreground border-destructive/20">Unpaid</Badge>;
      case 'completed':
        return <Badge className="bg-success/10 text-success-foreground border-success/20">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-primary/10 text-primary-foreground border-primary/20">In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning-foreground border-warning/20">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-muted text-muted-foreground border-border">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Head title="Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {auth.user?.name}
            </h1>
            <p className="text-muted-foreground">
              Royalmed Medical Clinic Operations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dashboard.date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <PermissionGuard permission="patients.view" fallback={null}>
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Patients Today</CardTitle>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboard.patients.total_today}</div>
                <p className="text-xs text-muted-foreground">Registered patients</p>
              </CardContent>
            </Card>
          </PermissionGuard>

          <PermissionGuard permission="visits.view" fallback={null}>
            <Card className="border-l-4 border-l-cyan-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                <div className="h-8 w-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-cyan-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboard.visits.total}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboard.visits.waiting} waiting • {dashboard.visits.in_consultation} in consultation
                </p>
              </CardContent>
            </Card>
          </PermissionGuard>

          <PermissionGuard permission="billing.view" fallback={null}>
            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Number(dashboard.payments.total_collected).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  KES {Number(dashboard.payments.cash_total).toFixed(2)} cash • KES {Number(dashboard.payments.mpesa_total).toFixed(2)} M-Pesa
                </p>
              </CardContent>
            </Card>
          </PermissionGuard>

          <PermissionGuard permission="billing.view" fallback={null}>
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Number(dashboard.billing.outstanding).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboard.billing.unpaid} unpaid • {dashboard.billing.partially_paid} partial
                </p>
              </CardContent>
            </Card>
          </PermissionGuard>
        </div>

        {/* Alerts Row */}
        <div className="grid gap-4 md:grid-cols-3">
          <PermissionGuard permission="pharmacy.view" fallback={null}>
            <Card className={dashboard.pharmacy.low_stock > 0 || dashboard.pharmacy.expiring_soon > 0 ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-emerald-500'}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pharmacy Alerts</CardTitle>
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Pill className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dashboard.pharmacy.low_stock > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <span>{dashboard.pharmacy.low_stock} low stock items</span>
                    </div>
                  )}
                  {dashboard.pharmacy.expiring_soon > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-warning" />
                      <span>{dashboard.pharmacy.expiring_soon} expiring soon</span>
                    </div>
                  )}
                  {dashboard.pharmacy.expired > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span>{dashboard.pharmacy.expired} expired</span>
                    </div>
                  )}
                  {dashboard.pharmacy.low_stock === 0 && dashboard.pharmacy.expiring_soon === 0 && dashboard.pharmacy.expired === 0 && (
                    <p className="text-sm text-muted-foreground">No alerts</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </PermissionGuard>

          <PermissionGuard permission="laboratory.view" fallback={null}>
            <Card className="border-l-4 border-l-teal-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Laboratory</CardTitle>
                <div className="h-8 w-8 rounded-full bg-teal-500/10 flex items-center justify-center">
                  <FlaskConical className="h-4 w-4 text-teal-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ordered Today</span>
                    <span className="font-medium">{dashboard.laboratory.ordered_today}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">In Progress</span>
                    <span className="font-medium">{dashboard.laboratory.in_progress}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completed Today</span>
                    <span className="font-medium">{dashboard.laboratory.completed_today}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pending Results</span>
                    <span className="font-medium">{dashboard.laboratory.pending_results}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </PermissionGuard>

          <PermissionGuard permission="pharmacy.view" fallback={null}>
            <Card className="border-l-4 border-l-indigo-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
                <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-indigo-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Today</span>
                    <span className="font-medium">{dashboard.prescriptions.total_today}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pending Dispensing</span>
                    <span className="font-medium">{dashboard.prescriptions.pending_dispensing}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dispensed Today</span>
                    <span className="font-medium">{dashboard.prescriptions.dispensed_today}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </PermissionGuard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Waiting Queue */}
          <PermissionGuard permission="visits.view" fallback={null}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Waiting Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard.waitingQueue.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No patients waiting</p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.waitingQueue.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                            {entry.position}
                          </div>
                          <div>
                            <p className="font-medium">{entry.patient_name}</p>
                            <p className="text-xs text-muted-foreground">Waiting {entry.waiting_minutes} min</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`/visits/${entry.visit_id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </PermissionGuard>

          {/* Active Consultations */}
          <PermissionGuard permission="consultations.view" fallback={null}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Active Consultations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard.activeConsultations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No active consultations</p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.activeConsultations.map((consultation) => (
                      <div key={consultation.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Stethoscope className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{consultation.patient_name}</p>
                            <p className="text-xs text-muted-foreground">Started {consultation.start_time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(consultation.visit_status)}
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`/consultations/${consultation.consultation_id}`}>
                              <ArrowRight className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </PermissionGuard>
        </div>

        {/* Recent Patients */}
        <PermissionGuard permission="patients.view" fallback={null}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Patients
              </CardTitle>
            </CardHeader>
          <CardContent>
            {dashboard.recentPatients.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No patients registered today</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground">Patient</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Phone</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Time</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentPatients.map((patient) => (
                      <tr key={patient.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-3 font-medium">{patient.patient_name}</td>
                        <td className="p-3">{patient.phone || '—'}</td>
                        <td className="p-3">{getStatusBadge(patient.visit_status)}</td>
                        <td className="p-3">{patient.time_registered}</td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`/visits/${patient.visit_id}`}>
                              <ArrowRight className="h-4 w-4" />
                            </a>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </PermissionGuard>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <PermissionGuard permission="patients.create" fallback={null}>
                <Button asChild className="w-full justify-start">
                  <a href="/patients/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Register Patient
                  </a>
                </Button>
              </PermissionGuard>

              <PermissionGuard permission="visits.create" fallback={null}>
                <Button asChild className="w-full justify-start" variant="outline">
                  <a href="/visits/create">
                    <Plus className="mr-2 h-4 w-4" />
                    New Visit
                  </a>
                </Button>
              </PermissionGuard>

              <PermissionGuard permission="visits.view" fallback={null}>
                <Button asChild className="w-full justify-start" variant="outline">
                  <a href="/visits/queue">
                    <Users className="mr-2 h-4 w-4" />
                    Waiting Queue
                  </a>
                </Button>
              </PermissionGuard>

              <PermissionGuard permission="billing.view" fallback={null}>
                <Button asChild className="w-full justify-start" variant="outline">
                  <a href="/payments">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Payments
                  </a>
                </Button>
              </PermissionGuard>

              <PermissionGuard permission="consultations.view" fallback={null}>
                <Button asChild className="w-full justify-start" variant="outline">
                  <a href="/consultations">
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Consultations
                  </a>
                </Button>
              </PermissionGuard>

              <PermissionGuard permission="pharmacy.view" fallback={null}>
                <Button asChild className="w-full justify-start" variant="outline">
                  <a href="/pharmacy">
                    <Pill className="mr-2 h-4 w-4" />
                    Pharmacy
                  </a>
                </Button>
              </PermissionGuard>

              <PermissionGuard permission="laboratory.view" fallback={null}>
                <Button asChild className="w-full justify-start" variant="outline">
                  <a href="/laboratory">
                    <FlaskConical className="mr-2 h-4 w-4" />
                    Laboratory
                  </a>
                </Button>
              </PermissionGuard>

              <PermissionGuard permission="billing.view" fallback={null}>
                <Button asChild className="w-full justify-start" variant="outline">
                  <a href="/billing">
                    <FileText className="mr-2 h-4 w-4" />
                    Billing
                  </a>
                </Button>
              </PermissionGuard>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
