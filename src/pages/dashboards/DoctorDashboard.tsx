import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, FileText, Activity, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const DoctorDashboard = () => {
  const { user } = useAuth();

  const todayStats = [
    {
      title: 'Citas Programadas',
      value: '8',
      change: 'Hoy',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      title: 'Pacientes Atendidos',
      value: '5',
      change: 'Completadas',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Citas Pendientes',
      value: '3',
      change: 'Restantes',
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      title: 'Certificados Emitidos',
      value: '4',
      change: 'Hoy',
      icon: FileText,
      color: 'text-purple-600'
    }
  ];

  const upcomingAppointments = [
    {
      id: 1,
      patient: 'Ana María Rodríguez',
      time: '14:30',
      type: 'Consulta General',
      status: 'confirmed'
    },
    {
      id: 2,
      patient: 'Carlos González',
      time: '15:00',
      type: 'Control Rutinario',
      status: 'confirmed'
    },
    {
      id: 3,
      patient: 'María López',
      time: '15:30',
      type: 'Consulta Especializada',
      status: 'pending'
    },
    {
      id: 4,
      patient: 'José Martínez',
      time: '16:00',
      type: 'Revisión Tratamiento',
      status: 'confirmed'
    }
  ];

  const recentPatients = [
    { id: 1, name: 'Elena Vásquez', lastVisit: '2 días', diagnosis: 'Hipertensión' },
    { id: 2, name: 'Roberto Díaz', lastVisit: '1 semana', diagnosis: 'Diabetes Tipo 2' },
    { id: 3, name: 'Carmen Silva', lastVisit: '3 días', diagnosis: 'Control Rutinario' },
  ];

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
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{appointment.patient}</p>
                    <p className="text-xs text-muted-foreground">{appointment.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{appointment.time}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Ver Agenda Completa
            </Button>
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
              {recentPatients.map((patient) => (
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
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Ver Todos los Pacientes
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Acciones Rápidas
          </CardTitle>
          <CardDescription>
            Funciones más utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="medical-gradient h-auto p-4 flex-col space-y-2">
              <FileText className="h-6 w-6" />
              <span>Nueva Historia Clínica</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <Calendar className="h-6 w-6" />
              <span>Agendar Cita</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <FileText className="h-6 w-6" />
              <span>Emitir Certificado</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDashboard;