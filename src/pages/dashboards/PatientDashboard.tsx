import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Heart, FileText, User, Clock, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const PatientDashboard = () => {
  const { user } = useAuth();

  const healthStats = [
    {
      title: 'Próxima Cita',
      value: '15 Mar',
      change: '10:30 AM',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      title: 'Última Consulta',
      value: '8 Mar',
      change: 'Dr. Rodríguez',
      icon: Heart,
      color: 'text-green-600'
    },
    {
      title: 'Certificados',
      value: '3',
      change: 'Disponibles',
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      title: 'Perfil',
      value: '100%',
      change: 'Completo',
      icon: User,
      color: 'text-orange-600'
    }
  ];

  const upcomingAppointments = [
    {
      id: 1,
      doctor: 'Dr. Carlos Rodríguez',
      date: '15 Mar 2024',
      time: '10:30 AM',
      type: 'Consulta General',
      status: 'confirmed'
    },
    {
      id: 2,
      doctor: 'Dr. Ana García',
      date: '22 Mar 2024',
      time: '3:00 PM',
      type: 'Control Rutinario',
      status: 'pending'
    }
  ];

  const recentHistory = [
    {
      id: 1,
      date: '8 Mar 2024',
      doctor: 'Dr. Carlos Rodríguez',
      diagnosis: 'Control de Rutina',
      prescription: 'Vitamina D, Complejo B'
    },
    {
      id: 2,
      date: '15 Feb 2024',
      doctor: 'Dr. Ana García',
      diagnosis: 'Hipertensión Controlada',
      prescription: 'Losartán 50mg'
    },
    {
      id: 3,
      date: '20 Ene 2024',
      doctor: 'Dr. Carlos Rodríguez',
      diagnosis: 'Examen Preventivo',
      prescription: 'Ninguna'
    }
  ];

  const availableCertificates = [
    { id: 1, type: 'Certificado Médico', date: '8 Mar 2024', doctor: 'Dr. Rodríguez' },
    { id: 2, type: 'Constancia de Atención', date: '15 Feb 2024', doctor: 'Dr. García' },
    { id: 3, type: 'Incapacidad Temporal', date: '20 Ene 2024', doctor: 'Dr. Rodríguez' }
  ];

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
              Tus citas médicas programadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <div>
                    <p className="font-medium text-sm">{appointment.doctor}</p>
                    <p className="text-xs text-muted-foreground">{appointment.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{appointment.date}</p>
                    <p className="text-xs text-muted-foreground">{appointment.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4 medical-gradient">
              Agendar Nueva Cita
            </Button>
          </CardContent>
        </Card>

        {/* Available Certificates */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Certificados Disponibles
            </CardTitle>
            <CardDescription>
              Documentos médicos para descargar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableCertificates.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <div>
                    <p className="font-medium text-sm">{cert.type}</p>
                    <p className="text-xs text-muted-foreground">{cert.doctor} • {cert.date}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical History */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Historial Médico Reciente
          </CardTitle>
          <CardDescription>
            Últimas consultas y tratamientos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentHistory.map((record) => (
              <div key={record.id} className="border-l-4 border-primary pl-4 py-2">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-sm">{record.diagnosis}</p>
                    <p className="text-xs text-muted-foreground">{record.doctor}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{record.date}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Prescripción:</strong> {record.prescription}
                </p>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            Ver Historial Completo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDashboard;