import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Heart, FileText, User, Clock, Download, Bell } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { localStorageService, Appointment, MedicalRecord, MedicalCertificate, LaboratoryExam } from '@/services/localStorageService';
import AppointmentScheduler from '@/components/medical/AppointmentScheduler';
import ClinicalHistory from '@/components/medical/ClinicalHistory';

const PatientDashboard = () => {
  const { user } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [exams, setExams] = useState<LaboratoryExam[]>([]);

  useEffect(() => {
    if (user) {
      loadPatientData();
    }
  }, [user]);

  const loadPatientData = () => {
    if (!user) return;
    
    const patientAppointments = localStorageService.getAppointmentsByPatient(user.id);
    const patientRecords = localStorageService.getRecordsByPatient(user.id);
    const patientCertificates = localStorageService.getCertificatesByPatient(user.id);
    const patientExams = localStorageService.getExamsByPatient(user.id);
    
    setAppointments(patientAppointments);
    setRecords(patientRecords);
    setCertificates(patientCertificates);
    setExams(patientExams);
  };

  const upcomingAppointments = appointments
    .filter(apt => apt.date >= new Date().toISOString().split('T')[0] && apt.status !== 'cancelled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const nextAppointment = upcomingAppointments[0];
  const lastRecord = records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const healthStats = [
    {
      title: 'Próxima Cita',
      value: nextAppointment ? new Date(nextAppointment.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Sin citas',
      change: nextAppointment ? `${nextAppointment.time} - ${nextAppointment.doctorName}` : 'No programada',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      title: 'Última Consulta',
      value: lastRecord ? new Date(lastRecord.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Sin consultas',
      change: lastRecord ? lastRecord.doctorName : 'No registrada',
      icon: Heart,
      color: 'text-green-600'
    },
    {
      title: 'Certificados',
      value: certificates.length.toString(),
      change: 'Disponibles',
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      title: 'Notificaciones',
      value: unreadCount.toString(),
      change: 'Sin leer',
      icon: Bell,
      color: 'text-orange-600'
    }
  ];

  const downloadCertificate = (certificate: MedicalCertificate) => {
    // This would generate and download a PDF certificate
    // For now, we'll just show a toast
    console.log('Downloading certificate:', certificate);
  };

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
        <h1 className="text-3xl font-bold mb-2">Mi Panel de Salud</h1>
        <p className="text-muted-foreground">
          Bienvenido/a, {user?.name} • {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {healthStats.map((stat) => (
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
      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Citas
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="certificates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Certificados
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-6">
          <AppointmentScheduler 
            patientId={user?.id}
            patientName={user?.name}
            onAppointmentScheduled={loadPatientData}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {user && (
            <ClinicalHistory 
              patient={{
                id: user.id,
                name: user.name,
                email: user.email || '',
                phone: user.phone || '',
                cedula: user.cedula || '',
                dateOfBirth: '',
                address: '',
                emergencyContact: '',
                emergencyPhone: '',
                createdAt: '',
                updatedAt: ''
              }}
              onRecordAdded={loadPatientData}
            />
          )}
        </TabsContent>

        <TabsContent value="certificates" className="space-y-6">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Certificados Médicos Disponibles
              </CardTitle>
              <CardDescription>
                Documentos médicos para descargar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certificates.length > 0 ? (
                  certificates
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((certificate) => (
                      <div key={certificate.id} className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{certificate.type}</h3>
                            <Badge variant="outline">
                              {new Date(certificate.createdAt).toLocaleDateString('es-ES')}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Diagnóstico:</strong> {certificate.diagnosis}</p>
                            <p><strong>Descripción:</strong> {certificate.description}</p>
                            <p><strong>Doctor:</strong> {certificate.doctorName}</p>
                            {certificate.startDate && (
                              <p><strong>Válido desde:</strong> {new Date(certificate.startDate).toLocaleDateString('es-ES')}</p>
                            )}
                            {certificate.endDate && (
                              <p><strong>Válido hasta:</strong> {new Date(certificate.endDate).toLocaleDateString('es-ES')}</p>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadCertificate(certificate)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Descargar PDF
                        </Button>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tienes certificados médicos disponibles</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Tus datos personales y de contacto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Nombre Completo</h4>
                    <p className="text-sm">{user?.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Email</h4>
                    <p className="text-sm">{user?.email}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Teléfono</h4>
                    <p className="text-sm">{user?.phone || 'No registrado'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Cédula</h4>
                    <p className="text-sm">{user?.cedula || 'No registrada'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDashboard;