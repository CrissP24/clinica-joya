import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Users, Calendar, FileText, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { localStorageService, Patient, Appointment, MedicalRecord, MedicalCertificate, SystemUser } from '@/services/localStorageService';

const AdminReports = () => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('overview');
  const [timeRange, setTimeRange] = useState('month');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [doctors, setDoctors] = useState<SystemUser[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allPatients = localStorageService.getPatients();
    const allAppointments = localStorageService.getAppointments();
    const allRecords = localStorageService.getMedicalRecords();
    const allCertificates = localStorageService.getCertificates();
    const allDoctors = localStorageService.getSystemUsers().filter(u => u.role === 'doctor');
    
    setPatients(allPatients);
    setAppointments(allAppointments);
    setRecords(allRecords);
    setCertificates(allCertificates);
    setDoctors(allDoctors);
  };

  const getFilteredData = () => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }

    return {
      patients: patients.filter(p => new Date(p.createdAt) >= startDate),
      appointments: appointments.filter(a => new Date(a.createdAt) >= startDate),
      records: records.filter(r => new Date(r.createdAt) >= startDate),
      certificates: certificates.filter(c => new Date(c.createdAt) >= startDate)
    };
  };

  const generateOverviewReport = () => {
    const filteredData = getFilteredData();
    const totalPatients = patients.length;
    const totalAppointments = appointments.length;
    const totalRecords = records.length;
    const totalCertificates = certificates.length;
    const activeDoctors = doctors.filter(d => d.isActive).length;

    const completedAppointments = appointments.filter(a => a.status === 'completed').length;
    const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
    const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;

    const newPatientsThisPeriod = filteredData.patients.length;
    const newAppointmentsThisPeriod = filteredData.appointments.length;
    const newRecordsThisPeriod = filteredData.records.length;
    const newCertificatesThisPeriod = filteredData.certificates.length;

    return {
      totalPatients,
      totalAppointments,
      totalRecords,
      totalCertificates,
      activeDoctors,
      completedAppointments,
      pendingAppointments,
      cancelledAppointments,
      newPatientsThisPeriod,
      newAppointmentsThisPeriod,
      newRecordsThisPeriod,
      newCertificatesThisPeriod
    };
  };

  const generatePatientReport = () => {
    const filteredData = getFilteredData();
    const patientStats = patients.map(patient => {
      const patientAppointments = appointments.filter(a => a.patientId === patient.id);
      const patientRecords = records.filter(r => r.patientId === patient.id);
      const patientCertificates = certificates.filter(c => c.patientId === patient.id);
      
      return {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        cedula: patient.cedula,
        createdAt: patient.createdAt,
        appointmentsCount: patientAppointments.length,
        recordsCount: patientRecords.length,
        certificatesCount: patientCertificates.length,
        lastVisit: patientAppointments.length > 0 ? 
          Math.max(...patientAppointments.map(a => new Date(a.date).getTime())) : null
      };
    });

    return patientStats.sort((a, b) => b.appointmentsCount - a.appointmentsCount);
  };

  const generateDoctorReport = () => {
    const doctorStats = doctors.map(doctor => {
      const doctorAppointments = appointments.filter(a => a.doctorId === doctor.id);
      const doctorRecords = records.filter(r => r.doctorId === doctor.id);
      const doctorCertificates = certificates.filter(c => c.doctorId === doctor.id);
      
      return {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization || 'No especificada',
        isActive: doctor.isActive,
        appointmentsCount: doctorAppointments.length,
        recordsCount: doctorRecords.length,
        certificatesCount: doctorCertificates.length,
        completedAppointments: doctorAppointments.filter(a => a.status === 'completed').length
      };
    });

    return doctorStats.sort((a, b) => b.appointmentsCount - a.appointmentsCount);
  };

  const generateAppointmentReport = () => {
    const filteredData = getFilteredData();
    const appointmentStats = filteredData.appointments.map(appointment => {
      const patient = patients.find(p => p.id === appointment.patientId);
      const doctor = doctors.find(d => d.id === appointment.doctorId);
      
      return {
        id: appointment.id,
        patientName: patient?.name || 'Paciente no encontrado',
        doctorName: doctor?.name || 'Doctor no encontrado',
        date: appointment.date,
        time: appointment.time,
        reason: appointment.reason,
        status: appointment.status,
        createdAt: appointment.createdAt
      };
    });

    return appointmentStats.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const handleDownloadReport = () => {
    const reportData = generateOverviewReport();
    const timeRangeLabels = {
      week: 'Última Semana',
      month: 'Este Mes',
      quarter: 'Último Trimestre',
      year: 'Este Año'
    };

    const content = `
REPORTE DE ADMINISTRACIÓN - ${timeRangeLabels[timeRange as keyof typeof timeRangeLabels]}
========================================================

RESUMEN GENERAL
---------------
Total de Pacientes: ${reportData.totalPatients}
Total de Citas: ${reportData.totalAppointments}
Total de Historiales: ${reportData.totalRecords}
Total de Certificados: ${reportData.totalCertificates}
Doctores Activos: ${reportData.activeDoctors}

NUEVOS REGISTROS (${timeRangeLabels[timeRange as keyof typeof timeRangeLabels]})
------------------------------------------------
Nuevos Pacientes: ${reportData.newPatientsThisPeriod}
Nuevas Citas: ${reportData.newAppointmentsThisPeriod}
Nuevos Historiales: ${reportData.newRecordsThisPeriod}
Nuevos Certificados: ${reportData.newCertificatesThisPeriod}

ESTADO DE CITAS
---------------
Completadas: ${reportData.completedAppointments}
Pendientes: ${reportData.pendingAppointments}
Canceladas: ${reportData.cancelledAppointments}

---
Generado el: ${new Date().toLocaleString('es-ES')}
Sistema: MediClinic - Consultorio Hoppe
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-admin-${timeRange}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const overviewData = generateOverviewReport();
  const patientData = generatePatientReport();
  const doctorData = generateDoctorReport();
  const appointmentData = generateAppointmentReport();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reportes y Estadísticas</h1>
          <p className="text-muted-foreground">
            Análisis detallado del sistema médico
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={handleDownloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Descargar Reporte
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div>
          <label className="text-sm font-medium">Tipo de Reporte</label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Resumen General</SelectItem>
              <SelectItem value="patients">Pacientes</SelectItem>
              <SelectItem value="doctors">Doctores</SelectItem>
              <SelectItem value="appointments">Citas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Período</label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Este Mes</SelectItem>
              <SelectItem value="quarter">Último Trimestre</SelectItem>
              <SelectItem value="year">Este Año</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Report */}
      {reportType === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Total Pacientes</p>
                    <p className="text-2xl font-bold">{overviewData.totalPatients}</p>
                    <p className="text-xs text-muted-foreground">
                      +{overviewData.newPatientsThisPeriod} este período
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Total Citas</p>
                    <p className="text-2xl font-bold">{overviewData.totalAppointments}</p>
                    <p className="text-xs text-muted-foreground">
                      +{overviewData.newAppointmentsThisPeriod} este período
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Historiales</p>
                    <p className="text-2xl font-bold">{overviewData.totalRecords}</p>
                    <p className="text-xs text-muted-foreground">
                      +{overviewData.newRecordsThisPeriod} este período
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Certificados</p>
                    <p className="text-2xl font-bold">{overviewData.totalCertificates}</p>
                    <p className="text-xs text-muted-foreground">
                      +{overviewData.newCertificatesThisPeriod} este período
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointment Status */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Citas Médicas</CardTitle>
              <CardDescription>Distribución de citas por estado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{overviewData.completedAppointments}</div>
                  <div className="text-sm text-muted-foreground">Completadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{overviewData.pendingAppointments}</div>
                  <div className="text-sm text-muted-foreground">Pendientes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{overviewData.cancelledAppointments}</div>
                  <div className="text-sm text-muted-foreground">Canceladas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Patient Report */}
      {reportType === 'patients' && (
        <Card>
          <CardHeader>
            <CardTitle>Reporte de Pacientes</CardTitle>
            <CardDescription>Estadísticas detalladas por paciente</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Cédula</TableHead>
                  <TableHead>Citas</TableHead>
                  <TableHead>Historiales</TableHead>
                  <TableHead>Certificados</TableHead>
                  <TableHead>Última Visita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientData.slice(0, 20).map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.cedula}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{patient.appointmentsCount}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{patient.recordsCount}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{patient.certificatesCount}</Badge>
                    </TableCell>
                    <TableCell>
                      {patient.lastVisit ? 
                        new Date(patient.lastVisit).toLocaleDateString('es-ES') : 
                        'Nunca'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Doctor Report */}
      {reportType === 'doctors' && (
        <Card>
          <CardHeader>
            <CardTitle>Reporte de Doctores</CardTitle>
            <CardDescription>Estadísticas de actividad por doctor</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Especialización</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Citas</TableHead>
                  <TableHead>Completadas</TableHead>
                  <TableHead>Historiales</TableHead>
                  <TableHead>Certificados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctorData.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">{doctor.name}</TableCell>
                    <TableCell>{doctor.specialization}</TableCell>
                    <TableCell>
                      <Badge className={doctor.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {doctor.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doctor.appointmentsCount}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doctor.completedAppointments}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doctor.recordsCount}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doctor.certificatesCount}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Appointment Report */}
      {reportType === 'appointments' && (
        <Card>
          <CardHeader>
            <CardTitle>Reporte de Citas</CardTitle>
            <CardDescription>Citas médicas del período seleccionado</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointmentData.slice(0, 50).map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">{appointment.patientName}</TableCell>
                    <TableCell>{appointment.doctorName}</TableCell>
                    <TableCell>{new Date(appointment.date).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell className="max-w-xs truncate">{appointment.reason}</TableCell>
                    <TableCell>
                      <Badge className={
                        appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {appointment.status === 'completed' ? 'Completada' :
                         appointment.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminReports;
