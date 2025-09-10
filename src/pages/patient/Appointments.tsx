import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, MapPin, Phone, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { localStorageService, Appointment } from '@/services/localStorageService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppointmentScheduler from '@/components/medical/AppointmentScheduler';

const PatientAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showScheduler, setShowScheduler] = useState(false);

  useEffect(() => {
    if (user) {
      loadPatientAppointments();
    }
  }, [user]);

  const loadPatientAppointments = () => {
    if (!user) return;
    const patientAppointments = localStorageService.getAppointmentsByPatient(user.id);
    setAppointments(patientAppointments);
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

  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const upcomingAppointments = appointments
    .filter(apt => apt.date >= new Date().toISOString().split('T')[0] && apt.status !== 'cancelled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastAppointments = appointments
    .filter(apt => apt.date < new Date().toISOString().split('T')[0] || apt.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const nextAppointment = upcomingAppointments[0];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mis Citas Médicas</h1>
          <p className="text-muted-foreground">
            Gestiona tus citas médicas y agenda nuevas consultas
          </p>
        </div>
        <Button onClick={() => setShowScheduler(!showScheduler)}>
          <Calendar className="h-4 w-4 mr-2" />
          {showScheduler ? 'Ver Citas' : 'Nueva Cita'}
        </Button>
      </div>

      {/* Next Appointment Alert */}
      {nextAppointment && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Próxima cita:</strong> {new Date(nextAppointment.date).toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} a las {nextAppointment.time} con {nextAppointment.doctorName}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Citas
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
            <p className="text-xs text-muted-foreground">
              Todas las citas
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Próximas
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              Por venir
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completadas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(apt => apt.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Realizadas
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Canceladas
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(apt => apt.status === 'cancelled').length}
            </div>
            <p className="text-xs text-muted-foreground">
              No realizadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Scheduler */}
      {showScheduler && (
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Agendar Nueva Cita
            </CardTitle>
            <CardDescription>
              Selecciona fecha y hora para tu próxima consulta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentScheduler 
              patientId={user?.id}
              patientName={user?.name}
              onAppointmentScheduled={() => {
                loadPatientAppointments();
                setShowScheduler(false);
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximas Citas
            </CardTitle>
            <CardDescription>
              Citas programadas y pendientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{appointment.doctorName}</h3>
                      {getStatusBadge(appointment.status)}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        {getStatusIcon(appointment.status)}
                        {appointment.specialty}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(appointment.date).toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.time}</span>
                      </div>
                      {appointment.reason && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          <span>{appointment.reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historial de Citas
            </CardTitle>
            <CardDescription>
              Citas anteriores y completadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastAppointments.slice(0, 10).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg bg-secondary/30">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{appointment.doctorName}</h3>
                      {getStatusBadge(appointment.status)}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        {getStatusIcon(appointment.status)}
                        {appointment.specialty}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(appointment.date).toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.time}</span>
                      </div>
                      {appointment.reason && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          <span>{appointment.reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Appointments */}
      {appointments.length === 0 && (
        <Card className="medical-card">
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No tienes citas médicas</h3>
            <p className="text-muted-foreground mb-4">
              Agenda tu primera cita médica para comenzar tu historial
            </p>
            <Button onClick={() => setShowScheduler(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              Agendar Cita
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientAppointments;
