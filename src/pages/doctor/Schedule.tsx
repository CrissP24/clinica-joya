import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Plus, Search, Edit, Trash2, User, MapPin, Phone, Mail, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { localStorageService, Appointment, Patient } from '@/services/localStorageService';
import { useToast } from '@/hooks/use-toast';

const DoctorSchedule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    patientId: '',
    date: '',
    time: '',
    reason: '',
    notes: '',
    status: 'pending' as 'pending' | 'completed' | 'cancelled'
  });

  // Schedule settings
  const [scheduleSettings, setScheduleSettings] = useState({
    workingHoursStart: '08:00',
    workingHoursEnd: '17:00',
    appointmentDuration: 30,
    breakTime: 15,
    maxAppointmentsPerDay: 20
  });

  useEffect(() => {
    loadData();
    loadScheduleSettings();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  const loadData = () => {
    const allAppointments = localStorageService.getAppointments();
    const allPatients = localStorageService.getPatients();
    
    // Filter appointments for current doctor
    const doctorAppointments = allAppointments.filter(appointment => appointment.doctorId === user?.id);
    
    setAppointments(doctorAppointments);
    setPatients(allPatients);
  };

  const loadScheduleSettings = () => {
    const savedSettings = localStorage.getItem('doctor_schedule_settings');
    if (savedSettings) {
      setScheduleSettings(JSON.parse(savedSettings));
    }
  };

  const saveScheduleSettings = () => {
    localStorage.setItem('doctor_schedule_settings', JSON.stringify(scheduleSettings));
    toast({
      title: "Configuración guardada",
      description: "La configuración de horarios ha sido guardada correctamente.",
    });
  };

  const filterAppointments = () => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(appointment => {
        const patient = patients.find(p => p.id === appointment.patientId);
        return (
          patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === statusFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(appointment => appointment.date === dateFilter);
    }

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });

    setFilteredAppointments(filtered);
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsViewDialogOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      patientId: appointment.patientId,
      date: appointment.date,
      time: appointment.time,
      reason: appointment.reason,
      notes: appointment.notes || '',
      status: appointment.status
    });
    setIsEditDialogOpen(true);
  };

  const handleAddAppointment = () => {
    setFormData({
      patientId: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      reason: '',
      notes: '',
      status: 'pending'
    });
    setIsAddDialogOpen(true);
  };

  const handleSaveAppointment = () => {
    if (!selectedAppointment) return;

    const updatedAppointment: Appointment = {
      ...selectedAppointment,
      ...formData,
      updatedAt: new Date().toISOString()
    };

    localStorageService.updateAppointment(selectedAppointment.id, updatedAppointment);
    loadData();
    setIsEditDialogOpen(false);
    setSelectedAppointment(null);
    toast({
      title: "Cita actualizada",
      description: "La cita médica ha sido actualizada correctamente.",
    });
  };

  const handleAddNewAppointment = () => {
    const newAppointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> = {
      patientId: formData.patientId,
      patientName: patients.find(p => p.id === formData.patientId)?.name || '',
      doctorId: user?.id || '',
      doctorName: user?.name || '',
      date: formData.date,
      time: formData.time,
      reason: formData.reason,
      notes: formData.notes || undefined,
      status: formData.status
    };

    localStorageService.addAppointment(newAppointment);
    loadData();
    setIsAddDialogOpen(false);
    toast({
      title: "Cita agregada",
      description: "La nueva cita médica ha sido programada correctamente.",
    });
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      localStorageService.deleteAppointment(appointmentId);
      loadData();
      toast({
        title: "Cita eliminada",
        description: "La cita médica ha sido eliminada del sistema.",
      });
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || 'Paciente no encontrado';
  };

  const getStatusBadge = (status: Appointment['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      pending: 'Pendiente',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };
    
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === today);
  };

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => apt.date >= today && apt.status === 'pending');
  };

  const getCompletedAppointments = () => {
    return appointments.filter(apt => apt.status === 'completed');
  };

  const generateTimeSlots = () => {
    const slots = [];
    const startHour = parseInt(scheduleSettings.workingHoursStart.split(':')[0]);
    const endHour = parseInt(scheduleSettings.workingHoursEnd.split(':')[0]);
    const duration = scheduleSettings.appointmentDuration;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += duration) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    
    return slots;
  };

  const isTimeSlotAvailable = (date: string, time: string) => {
    return !appointments.some(apt => apt.date === date && apt.time === time);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mi Agenda Médica</h1>
          <p className="text-muted-foreground">
            Gestiona tu horario y citas médicas
          </p>
        </div>
        <Button onClick={handleAddAppointment} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Cita
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Citas</p>
                <p className="text-2xl font-bold">{appointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Hoy</p>
                <p className="text-2xl font-bold">{getTodayAppointments().length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Próximas</p>
                <p className="text-2xl font-bold">{getUpcomingAppointments().length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Completadas</p>
                <p className="text-2xl font-bold">{getCompletedAppointments().length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Horarios</CardTitle>
          <CardDescription>
            Ajusta tu horario de trabajo y duración de citas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="work-start">Hora de Inicio</Label>
              <Input
                id="work-start"
                type="time"
                value={scheduleSettings.workingHoursStart}
                onChange={(e) => setScheduleSettings({ ...scheduleSettings, workingHoursStart: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="work-end">Hora de Fin</Label>
              <Input
                id="work-end"
                type="time"
                value={scheduleSettings.workingHoursEnd}
                onChange={(e) => setScheduleSettings({ ...scheduleSettings, workingHoursEnd: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="duration">Duración (min)</Label>
              <Input
                id="duration"
                type="number"
                value={scheduleSettings.appointmentDuration}
                onChange={(e) => setScheduleSettings({ ...scheduleSettings, appointmentDuration: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="break">Descanso (min)</Label>
              <Input
                id="break"
                type="number"
                value={scheduleSettings.breakTime}
                onChange={(e) => setScheduleSettings({ ...scheduleSettings, breakTime: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={saveScheduleSettings} className="w-full">
                Guardar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar citas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-48"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="completed">Completadas</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          {filteredAppointments.length} de {appointments.length} citas
        </div>
      </div>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Citas Médicas</CardTitle>
          <CardDescription>
            Todas las citas médicas programadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{getPatientName(appointment.patientId)}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {appointment.patientId.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(appointment.date).toLocaleDateString('es-ES')}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3" />
                        {appointment.time}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {appointment.reason}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(appointment.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAppointment(appointment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAppointment(appointment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Appointment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Cita Médica</DialogTitle>
            <DialogDescription>
              Información completa de la cita seleccionada
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Paciente</Label>
                  <p className="text-sm text-muted-foreground">
                    {getPatientName(selectedAppointment.patientId)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Fecha</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedAppointment.date).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Hora</Label>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.time}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estado</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedAppointment.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Creada</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedAppointment.createdAt).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Motivo de la Cita</Label>
                <p className="text-sm text-muted-foreground">{selectedAppointment.reason}</p>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <Label className="text-sm font-medium">Notas Adicionales</Label>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Cita Médica</DialogTitle>
            <DialogDescription>
              Modifica la información de la cita médica
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-patientId">Paciente</Label>
                <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} - {patient.cedula}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Estado</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-date">Fecha</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-time">Hora</Label>
                <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateTimeSlots().map((time) => (
                      <SelectItem 
                        key={time} 
                        value={time}
                        disabled={!isTimeSlotAvailable(formData.date, time)}
                      >
                        {time}
                        {!isTimeSlotAvailable(formData.date, time) && ' (Ocupado)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-reason">Motivo de la Cita</Label>
              <Input
                id="edit-reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Motivo de la consulta..."
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Notas Adicionales</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales sobre la cita..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAppointment}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Appointment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Cita</DialogTitle>
            <DialogDescription>
              Programa una nueva cita médica
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-patientId">Paciente *</Label>
                <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} - {patient.cedula}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="new-date">Fecha *</Label>
                <Input
                  id="new-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="new-time">Hora *</Label>
                <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateTimeSlots().map((time) => (
                      <SelectItem 
                        key={time} 
                        value={time}
                        disabled={!isTimeSlotAvailable(formData.date, time)}
                      >
                        {time}
                        {!isTimeSlotAvailable(formData.date, time) && ' (Ocupado)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="new-reason">Motivo de la Cita *</Label>
              <Input
                id="new-reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Motivo de la consulta..."
                required
              />
            </div>
            <div>
              <Label htmlFor="new-notes">Notas Adicionales</Label>
              <Textarea
                id="new-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales sobre la cita..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddNewAppointment}>
              Agregar Cita
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorSchedule;