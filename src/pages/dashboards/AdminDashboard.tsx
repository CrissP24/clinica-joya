import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, FileText, Activity, TrendingUp, Clock, Bell, BarChart3, UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { localStorageService, SystemUser, Patient, Appointment, MedicalRecord, MedicalCertificate } from '@/services/localStorageService';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = () => {
    const allUsers = localStorageService.getSystemUsers();
    const allPatients = localStorageService.getPatients();
    const allAppointments = localStorageService.getAppointments();
    const allRecords = localStorageService.getMedicalRecords();
    const allCertificates = localStorageService.getCertificates();
    
    setSystemUsers(allUsers);
    setPatients(allPatients);
    setAppointments(allAppointments);
    setRecords(allRecords);
    setCertificates(allCertificates);
  };

  const todayAppointments = appointments.filter(apt => 
    apt.date === new Date().toISOString().split('T')[0]
  );

  const activeDoctors = systemUsers.filter(u => u.role === 'doctor' && u.isActive);
  const totalPatients = patients.length;
  const totalCertificates = certificates.length;

  const stats = [
    {
      title: 'Total Pacientes',
      value: totalPatients.toString(),
      change: 'Registrados',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Citas Hoy',
      value: todayAppointments.length.toString(),
      change: 'Programadas',
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: 'Doctores Activos',
      value: activeDoctors.length.toString(),
      change: 'En línea',
      icon: Activity,
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

  // Generate recent activities from actual data
  const recentActivities = [
    ...patients.slice(-3).map(patient => ({
      id: `patient-${patient.id}`,
      action: 'Nuevo paciente registrado',
      user: patient.name,
      time: new Date(patient.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    })),
    ...appointments.slice(-2).map(appointment => ({
      id: `appointment-${appointment.id}`,
      action: `Cita ${appointment.status === 'completed' ? 'completada' : 'programada'}`,
      user: appointment.doctorName,
      time: new Date(appointment.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    })),
    ...certificates.slice(-1).map(certificate => ({
      id: `certificate-${certificate.id}`,
      action: 'Certificado emitido',
      user: certificate.doctorName,
      time: new Date(certificate.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  // Calculate statistics
  const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;
  const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled').length;

  const getStatusBadge = (status: SystemUser['isActive']) => {
    return status ? (
      <Badge className="bg-green-100 text-green-800">Activo</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactivo</Badge>
    );
  };

  const getRoleBadge = (role: SystemUser['role']) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800',
      doctor: 'bg-blue-100 text-blue-800',
      patient: 'bg-green-100 text-green-800'
    };
    
    const labels = {
      admin: 'Administrador',
      doctor: 'Doctor',
      patient: 'Paciente'
    };
    
    return (
      <Badge className={styles[role]}>
        {labels[role]}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
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
        {stats.map((stat) => (
          <Card key={stat.title} className="medical-card medical-transition hover:medical-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> desde el mes pasado
              </p>
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
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Reportes
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Actividad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Actividad Reciente
                </CardTitle>
                <CardDescription>
                  Las últimas actividades del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                        <div>
                          <p className="font-medium text-sm">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.user}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {activity.time}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay actividad reciente</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statistics Summary */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Resumen Estadístico
                </CardTitle>
                <CardDescription>
                  Métricas clave del consultorio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Citas Completadas</span>
                    <span className="font-medium">{completedAppointments}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(completedAppointments / Math.max(appointments.length, 1)) * 100}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Citas Pendientes</span>
                    <span className="font-medium">{pendingAppointments}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(pendingAppointments / Math.max(appointments.length, 1)) * 100}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Citas Canceladas</span>
                    <span className="font-medium">{cancelledAppointments}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(cancelledAppointments / Math.max(appointments.length, 1)) * 100}%` }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestión de Usuarios
              </CardTitle>
              <CardDescription>
                Administra los usuarios del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemUsers.length > 0 ? (
                  systemUsers.map((systemUser) => (
                    <div key={systemUser.id} className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{systemUser.name}</h3>
                          {getRoleBadge(systemUser.role)}
                          {getStatusBadge(systemUser.isActive)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Email:</strong> {systemUser.email}</p>
                          <p><strong>Teléfono:</strong> {systemUser.phone || 'No registrado'}</p>
                          {systemUser.specialization && (
                            <p><strong>Especialización:</strong> {systemUser.specialization}</p>
                          )}
                          <p><strong>Registrado:</strong> {new Date(systemUser.createdAt).toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay usuarios registrados</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Estadísticas de Citas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total de Citas</span>
                    <span className="font-bold">{appointments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completadas</span>
                    <span className="text-green-600 font-medium">{completedAppointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pendientes</span>
                    <span className="text-yellow-600 font-medium">{pendingAppointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Canceladas</span>
                    <span className="text-red-600 font-medium">{cancelledAppointments}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Estadísticas Generales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Pacientes</span>
                    <span className="font-bold">{totalPatients}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Doctores Activos</span>
                    <span className="text-blue-600 font-medium">{activeDoctors.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Historiales Clínicos</span>
                    <span className="text-purple-600 font-medium">{records.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Certificados Emitidos</span>
                    <span className="text-orange-600 font-medium">{totalCertificates}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Actividad del Sistema
              </CardTitle>
              <CardDescription>
                Historial completo de actividades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">Usuario: {activity.user}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.time}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay actividad registrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;