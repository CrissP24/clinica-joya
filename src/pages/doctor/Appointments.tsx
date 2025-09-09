import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, Plus, CheckCircle, XCircle, RefreshCw, Eye } from 'lucide-react';
import { localStorageService, Appointment, Patient } from '@/services/localStorageService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    patientId: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    type: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    loadAppointments();
    loadPatients();
  }, []);

  const loadAppointments = () => {
    if (!user) return;
    const doctorAppointments = localStorageService.getAppointmentsByDoctor(user.id);
    setAppointments(doctorAppointments);
  };

  const loadPatients = () => {
    const allPatients = localStorageService.getPatients();
    setPatients(allPatients);
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = appointment.date === selectedDate;
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesDate && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    const selectedPatient = patients.find(p => p.id === formData.patientId);
    if (!selectedPatient) return;
    
    try {
      if (editingAppointment) {
        localStorageService.updateAppointment(editingAppointment.id, {
          ...formData,
          patientName: selectedPatient.name,
          status: editingAppointment.status
        });
        toast({
          title: "Cita actualizada",
          description: "La cita se ha actualizado correctamente",
        });
      } else {
        localStorageService.addAppointment({
          ...formData,
          patientName: selectedPatient.name,
          doctorId: user.id,
          doctorName: user.name,
          status: 'pending'
        });
        toast({
          title: "Cita programada",
          description: "La nueva cita se ha programado correctamente",
        });
      }
      
      loadAppointments();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al guardar la cita",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      type: '',
      reason: '',
      notes: ''
    });
    setEditingAppointment(null);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patientId: appointment.patientId,
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      reason: appointment.reason,
      notes: appointment.notes || ''
    });
    setIsDialogOpen(true);
  };

  const updateAppointmentStatus = (appointmentId: string, newStatus: Appointment['status']) => {
    localStorageService.updateAppointment(appointmentId, { status: newStatus });
    loadAppointments();
    
    const statusLabels = {
      pending: 'pendiente',
      confirmed: 'confirmada',
      completed: 'completada',
      cancelled: 'cancelada'
    };
    
    toast({
      title: "Estado actualizado",
      description: `La cita ha sido marcada como ${statusLabels[newStatus]}`,
    });
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

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const appointmentTypes = [
    'Consulta General',
    'Control Rutinario',
    'Consulta Especializada',
    'Revisión Tratamiento',
    'Examen Preventivo',
    'Seguimiento',
    'Urgencia'
  ];

  const todayAppointments = appointments.filter(apt => 
    apt.date === new Date().toISOString().split('T')[0] && 
    apt.status !== 'cancelled'
  );

  const upcomingAppointments = appointments.filter(apt => 
    apt.date > new Date().toISOString().split('T')[0] && 
    apt.status !== 'cancelled'
  ).slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Agenda Médica</h1>
          <p className="text-muted-foreground">
            Gestiona tus citas y horarios médicos
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="medical-gradient" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? 'Editar Cita' : 'Programar Nueva Cita'}
              </DialogTitle>
              <DialogDescription>
                {editingAppointment 
                  ? 'Modifica los datos de la cita seleccionada'
                  : 'Completa la información para programar una nueva cita'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientId">Paciente *</Label>
                  <Select value={formData.patientId} onValueChange={(value) => setFormData(prev => ({ ...prev, patientId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} - {patient.cedula}
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
                
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Hora *</Label>
                  <Select value={formData.time} onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeSlots().map(time => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo de la Cita *</Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Describe el motivo de la consulta"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Información adicional sobre la cita..."
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="medical-gradient">
                  {editingAppointment ? 'Actualizar' : 'Programar'} Cita
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="medical-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Citas Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {todayAppointments.filter(apt => apt.status === 'completed').length} completadas
            </p>
          </CardContent>
        </Card>
        
        <Card className="medical-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Próximas Citas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              En los próximos días
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
      </div>

      {/* Filters */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtrar Citas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFilter">Fecha</Label>
              <Input
                id="dateFilter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="statusFilter">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="confirmed">Confirmadas</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Citas del {new Date(selectedDate).toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </CardTitle>
          <CardDescription>
            {filteredAppointments.length} citas programadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAppointments
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-lg">{appointment.time}</span>
                      <h3 className="font-semibold">{appointment.patientName}</h3>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Tipo:</strong> {appointment.type}</p>
                      <p><strong>Motivo:</strong> {appointment.reason}</p>
                      {appointment.notes && (
                        <p><strong>Notas:</strong> {appointment.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {appointment.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {appointment.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completar
                      </Button>
                    )}
                    
                    {appointment.status === 'cancelled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateAppointmentStatus(appointment.id, 'pending')}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Reactivar
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(appointment)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            
            {filteredAppointments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay citas programadas para esta fecha</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorAppointments;