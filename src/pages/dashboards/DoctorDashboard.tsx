import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, FileText, Activity, Clock, CheckCircle, Bell } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { localStorageService, Appointment, MedicalRecord, MedicalCertificate, Patient } from '@/services/localStorageService';
import { Button } from '@/components/ui/button';
import CertificateGenerator from '@/components/medical/CertificateGenerator';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  const loadDoctorData = useCallback(() => {
    if (!user) return;
    
    const doctorAppointments = localStorageService.getAppointmentsByDoctor(user.id);
    const doctorRecords = localStorageService.getRecordsByDoctor(user.id);
    const doctorCertificates = localStorageService.getCertificatesByDoctor(user.id);
    const allPatients = localStorageService.getPatients();
    
    setAppointments(doctorAppointments);
    setRecords(doctorRecords);
    setCertificates(doctorCertificates);
    setPatients(allPatients);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDoctorData();
    }
  }, [user, loadDoctorData]);

  const todayAppointments = appointments.filter(apt => 
    apt.date === new Date().toISOString().split('T')[0] && 
    apt.status !== 'cancelled'
  );

  const completedToday = todayAppointments.filter(apt => apt.status === 'completed').length;
  const pendingToday = todayAppointments.filter(apt => apt.status === 'pending').length;
  const todayCertificates = certificates.filter(cert => 
    new Date(cert.createdAt).toDateString() === new Date().toDateString()
  ).length;

  const todayStats = [
    {
      title: 'Citas Programadas',
      value: todayAppointments.length.toString(),
      change: 'Hoy',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      title: 'Pacientes Atendidos',
      value: completedToday.toString(),
      change: 'Completadas',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Citas Pendientes',
      value: pendingToday.toString(),
      change: 'Restantes',
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      title: 'Notificaciones',
      value: unreadCount.toString(),
      change: 'Sin leer',
      icon: Bell,
      color: 'text-purple-600'
    }
  ];

  const upcomingAppointments = appointments
    .filter(apt => apt.date >= new Date().toISOString().split('T')[0] && apt.status !== 'cancelled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const recentPatients = records
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .map(record => {
      const patient = patients.find(p => p.id === record.patientId);
      return {
        id: record.patientId,
        name: patient?.name || 'Paciente desconocido',
        lastVisit: new Date(record.date).toLocaleDateString('es-ES'),
        diagnosis: record.diagnosis
      };
    });

  const getStatusBadge = (status: Appointment['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };
    
    return (
      <Badge className={styles[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Panel Médico</h1>
        <p className="text-muted-foreground">
          Bienvenido/a Dr. {user?.name} • {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {todayStats.map((stat) => (
          <Card key={stat.title} className="medical-card medical-transition hover:medical-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Citas
          </TabsTrigger>
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Pacientes
          </TabsTrigger>
          <TabsTrigger value="certificates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Certificados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Appointments */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Próximas Citas
                </CardTitle>
                <CardDescription>
                  Agenda para el resto del día
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{appointment.patientName}</p>
                          <p className="text-xs text-muted-foreground">{appointment.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{appointment.time}</p>
                          {getStatusBadge(appointment.status)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No tienes citas programadas</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Patients */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Pacientes Recientes
                </CardTitle>
                <CardDescription>
                  Historial de atenciones recientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentPatients.length > 0 ? (
                    recentPatients.map((patient) => (
                      <div key={patient.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                        <div>
                          <p className="font-medium text-sm">{patient.name}</p>
                          <p className="text-xs text-muted-foreground">{patient.diagnosis}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Última visita</p>
                          <p className="text-sm font-medium">{patient.lastVisit}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay pacientes recientes</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Todas las Citas
              </CardTitle>
              <CardDescription>
                Gestiona tu agenda médica completa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.length > 0 ? (
                  appointments
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium">{appointment.time}</span>
                            <h3 className="font-semibold">{appointment.patientName}</h3>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Fecha:</strong> {new Date(appointment.date).toLocaleDateString('es-ES')}</p>
                            <p><strong>Tipo:</strong> {appointment.type}</p>
                            <p><strong>Motivo:</strong> {appointment.reason}</p>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tienes citas programadas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Mis Pacientes
              </CardTitle>
              <CardDescription>
                Lista de todos tus pacientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {records.length > 0 ? (
                  records
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((record) => {
                      const patient = patients.find(p => p.id === record.patientId);
                      return (
                      <div key={record.id} className="p-4 border rounded-lg bg-secondary/50">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{patient?.name || 'Paciente desconocido'}</h3>
                          <span className="text-sm text-muted-foreground">
                            {new Date(record.date).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Motivo:</strong> {record.reason}</p>
                          <p><strong>Diagnóstico:</strong> {record.diagnosis}</p>
                          {record.treatment && (
                            <p><strong>Tratamiento:</strong> {record.treatment}</p>
                          )}
                        </div>
                      </div>
                      );
                    })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tienes pacientes registrados</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-6">
          <CertificateGenerator onCertificateGenerated={loadDoctorData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorDashboard;