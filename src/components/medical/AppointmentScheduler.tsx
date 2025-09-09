import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, Plus, CheckCircle, XCircle, User, CalendarDays } from 'lucide-react';
import { localStorageService, Appointment, SystemUser } from '@/services/localStorageService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';

interface AppointmentSchedulerProps {
  patientId?: string;
  patientName?: string;
  onAppointmentScheduled?: () => void;
}

const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({ 
  patientId, 
  patientName, 
  onAppointmentScheduled 
}) => {
  const [doctors, setDoctors] = useState<SystemUser[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState({
    patientId: patientId || user?.id || '',
    patientName: patientName || user?.name || '',
    doctorId: '',
    doctorName: '',
    date: '',
    time: '',
    type: '',
    reason: '',
    notes: ''
  });

  const appointmentTypes = [
    'Consulta General',
    'Control Rutinario',
    'Consulta Especializada',
    'Revisión Tratamiento',
    'Examen Preventivo',
    'Seguimiento',
    'Urgencia'
  ];

  useEffect(() => {
    loadDoctors();
    loadAppointments();
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const loadDoctors = () => {
    const allDoctors = localStorageService.getSystemUsers().filter(u => u.role === 'doctor' && u.isActive);
    setDoctors(allDoctors);
  };

  const loadAppointments = () => {
    const currentPatientId = patientId || user?.id;
    if (currentPatientId) {
      const patientAppointments = localStorageService.getAppointmentsByPatient(currentPatientId);
      setAppointments(patientAppointments);
    }
  };

  const loadAvailableSlots = () => {
    if (!selectedDoctor || !selectedDate) return;
    
    const slots = localStorageService.getAvailableTimeSlots(selectedDoctor, selectedDate);
    setAvailableSlots(slots);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user && !patientId) return;
    
    const doctor = doctors.find(d => d.id === selectedDoctor);
    if (!doctor) return;
    
    try {
      const newAppointment = localStorageService.addAppointment({
        ...formData,
        doctorId: selectedDoctor,
        doctorName: doctor.name,
        date: selectedDate,
        time: selectedTime,
        status: 'pending'
      });

      // Add notification for doctor
      addNotification({
        userId: selectedDoctor,
        type: 'appointment',
        title: 'Nueva Cita Programada',
        message: `Tienes una nueva cita con ${formData.patientName} el ${new Date(selectedDate).toLocaleDateString('es-ES')} a las ${selectedTime}`,
        isRead: false
      });

      toast({
        title: "Cita programada",
        description: "Tu cita se ha programado correctamente. El doctor la confirmará pronto.",
      });

      setIsDialogOpen(false);
      resetForm();
      loadAppointments();
      onAppointmentScheduled?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al programar la cita",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: patientId || user?.id || '',
      patientName: patientName || user?.name || '',
      doctorId: '',
      doctorName: '',
      date: '',
      time: '',
      type: '',
      reason: '',
      notes: ''
    });
    setSelectedDoctor('');
    setSelectedDate('');
    setSelectedTime('');
    setAvailableSlots([]);
  };

  const cancelAppointment = (appointmentId: string) => {
    localStorageService.updateAppointment(appointmentId, { status: 'cancelled' });
    
    toast({
      title: "Cita cancelada",
      description: "Tu cita ha sido cancelada correctamente",
    });

    loadAppointments();
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

  const upcomingAppointments = appointments
    .filter(apt => apt.date >= new Date().toISOString().split('T')[0] && apt.status !== 'cancelled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const pastAppointments = appointments
    .filter(apt => apt.date < new Date().toISOString().split('T')[0] || apt.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="medical-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Próximas Citas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(apt => apt.date >= new Date().toISOString().split('T')[0] && apt.status !== 'cancelled').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Citas programadas
            </p>
          </CardContent>
        </Card>
        
        <Card className="medical-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(apt => apt.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Por confirmar
            </p>
          </CardContent>
        </Card>
        
        <Card className="medical-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(apt => apt.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Consultas realizadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule New Appointment */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Programar Nueva Cita
          </CardTitle>
          <CardDescription>
            Selecciona un doctor y horario disponible para tu consulta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="medical-gradient" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Cita
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Programar Nueva Cita</DialogTitle>
                <DialogDescription>
                  Completa la información para programar tu cita médica
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor">Doctor *</Label>
                    <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map(doctor => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name} - {doctor.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Consulta *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {appointmentTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                {availableSlots.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="time">Horario Disponible *</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar horario" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSlots.map(time => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {selectedDoctor && selectedDate && availableSlots.length === 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      No hay horarios disponibles para este doctor en la fecha seleccionada.
                      Por favor, selecciona otra fecha.
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo de la Cita *</Label>
                  <Input
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Describe el motivo de tu consulta"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas Adicionales</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Información adicional que consideres importante..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="medical-gradient"
                    disabled={!selectedDoctor || !selectedDate || !selectedTime || !formData.type || !formData.reason}
                  >
                    Programar Cita
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Próximas Citas
          </CardTitle>
          <CardDescription>
            Tus citas programadas y confirmadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-lg">{appointment.time}</span>
                      <h3 className="font-semibold">{appointment.doctorName}</h3>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Fecha:</strong> {new Date(appointment.date).toLocaleDateString('es-ES')}</p>
                      <p><strong>Tipo:</strong> {appointment.type}</p>
                      <p><strong>Motivo:</strong> {appointment.reason}</p>
                      {appointment.notes && (
                        <p><strong>Notas:</strong> {appointment.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {appointment.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => cancelAppointment(appointment.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    )}
                    
                    {appointment.status === 'confirmed' && (
                      <div className="text-sm text-green-600 font-medium">
                        ✓ Confirmada
                      </div>
                    )}
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

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Historial de Citas
            </CardTitle>
            <CardDescription>
              Tus consultas anteriores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <div key={appointment.id} className="p-4 border rounded-lg bg-background">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium">{appointment.time}</span>
                    <h3 className="font-semibold">{appointment.doctorName}</h3>
                    {getStatusBadge(appointment.status)}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Fecha:</strong> {new Date(appointment.date).toLocaleDateString('es-ES')}</p>
                    <p><strong>Tipo:</strong> {appointment.type}</p>
                    <p><strong>Motivo:</strong> {appointment.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AppointmentScheduler;
