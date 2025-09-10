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
import { Search, Plus, Eye, Edit, FileText, User, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { localStorageService, MedicalRecord, Patient } from '@/services/localStorageService';
import { useToast } from '@/hooks/use-toast';

const DoctorRecords = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    patientId: '',
    reason: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    date: new Date().toISOString().split('T')[0],
    urgency: 'low' as 'low' | 'medium' | 'high',
    cie10Code: '',
    vitalSigns: '',
    personalHistory: '',
    familyHistory: '',
    allergies: '',
    observations: '',
    followUpDate: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, urgencyFilter]);

  const loadData = () => {
    const allRecords = localStorageService.getMedicalRecords();
    const allPatients = localStorageService.getPatients();
    
    // Filter records for current doctor
    const doctorRecords = allRecords.filter(record => record.doctorId === user?.id);
    
    setRecords(doctorRecords);
    setPatients(allPatients);
  };

  const filterRecords = () => {
    let filtered = records;

    if (searchTerm) {
      filtered = filtered.filter(record => {
        const patient = patients.find(p => p.id === record.patientId);
        return (
          patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.symptoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.reason.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(record => record.urgency === urgencyFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredRecords(filtered);
  };

  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setFormData({
      patientId: record.patientId,
      reason: record.reason,
      symptoms: record.symptoms,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      date: record.date,
      urgency: record.urgency,
      cie10Code: record.cie10Code || '',
      vitalSigns: record.vitalSigns || '',
      personalHistory: record.personalHistory || '',
      familyHistory: record.familyHistory || '',
      allergies: record.allergies || '',
      observations: record.observations || '',
      followUpDate: record.followUpDate || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleAddRecord = () => {
    setFormData({
      patientId: '',
      reason: '',
      symptoms: '',
      diagnosis: '',
      treatment: '',
      date: new Date().toISOString().split('T')[0],
      urgency: 'low',
      cie10Code: '',
      vitalSigns: '',
      personalHistory: '',
      familyHistory: '',
      allergies: '',
      observations: '',
      followUpDate: ''
    });
    setIsAddDialogOpen(true);
  };

  const handleSaveRecord = () => {
    if (!selectedRecord) return;

    const updatedRecord: MedicalRecord = {
      ...selectedRecord,
      ...formData,
      updatedAt: new Date().toISOString()
    };

    localStorageService.updateMedicalRecord(selectedRecord.id, updatedRecord);
    loadData();
    setIsEditDialogOpen(false);
    setSelectedRecord(null);
    toast({
      title: "Historial actualizado",
      description: "El historial médico ha sido actualizado correctamente.",
    });
  };

  const handleAddNewRecord = () => {
    const newRecord: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      patientId: formData.patientId,
      doctorId: user?.id || '',
      doctorName: user?.name || '',
      reason: formData.reason,
      symptoms: formData.symptoms,
      diagnosis: formData.diagnosis,
      treatment: formData.treatment,
      date: formData.date,
      urgency: formData.urgency,
      cie10Code: formData.cie10Code || undefined,
      vitalSigns: formData.vitalSigns || undefined,
      personalHistory: formData.personalHistory || undefined,
      familyHistory: formData.familyHistory || undefined,
      allergies: formData.allergies || undefined,
      observations: formData.observations || undefined,
      followUpDate: formData.followUpDate || undefined
    };

    localStorageService.addMedicalRecord(newRecord);
    loadData();
    setIsAddDialogOpen(false);
    toast({
      title: "Historial agregado",
      description: "El nuevo historial médico ha sido registrado correctamente.",
    });
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || 'Paciente no encontrado';
  };

  const getUrgencyBadge = (urgency: MedicalRecord['urgency']) => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta'
    };
    
    return <Badge className={styles[urgency]}>{labels[urgency]}</Badge>;
  };

  const getUrgencyIcon = (urgency: MedicalRecord['urgency']) => {
    if (urgency === 'high') {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const todayRecords = records.filter(record => 
    record.date === new Date().toISOString().split('T')[0]
  );

  const highUrgencyRecords = records.filter(record => record.urgency === 'high');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Historiales Médicos</h1>
          <p className="text-muted-foreground">
            Gestiona los historiales médicos de tus pacientes
          </p>
        </div>
        <Button onClick={handleAddRecord} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Historial
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Historiales</p>
                <p className="text-2xl font-bold">{records.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Hoy</p>
                <p className="text-2xl font-bold">{todayRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Alta Urgencia</p>
                <p className="text-2xl font-bold">{highUrgencyRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Pacientes Únicos</p>
                <p className="text-2xl font-bold">
                  {new Set(records.map(r => r.patientId)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar historiales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por urgencia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las urgencias</SelectItem>
            <SelectItem value="low">Baja</SelectItem>
            <SelectItem value="medium">Media</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          {filteredRecords.length} de {records.length} historiales
        </div>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Historiales Médicos</CardTitle>
          <CardDescription>
            Todos los historiales médicos que has registrado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Diagnóstico</TableHead>
                <TableHead>Urgencia</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{getPatientName(record.patientId)}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {record.patientId.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(record.date).toLocaleDateString('es-ES')}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3" />
                        {new Date(record.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {record.reason}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {record.diagnosis}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getUrgencyIcon(record.urgency)}
                      {getUrgencyBadge(record.urgency)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewRecord(record)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditRecord(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Record Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Historial Médico Completo</DialogTitle>
            <DialogDescription>
              Información detallada del historial médico seleccionado
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Paciente</Label>
                  <p className="text-sm text-muted-foreground">
                    {getPatientName(selectedRecord.patientId)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Fecha de Consulta</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedRecord.date).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Urgencia</Label>
                  <div className="mt-1">
                    {getUrgencyBadge(selectedRecord.urgency)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Código CIE-10</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRecord.cie10Code || 'No especificado'}
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Motivo de Consulta</Label>
                <p className="text-sm text-muted-foreground">{selectedRecord.reason}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Síntomas</Label>
                <p className="text-sm text-muted-foreground">{selectedRecord.symptoms}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Diagnóstico</Label>
                <p className="text-sm text-muted-foreground">{selectedRecord.diagnosis}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Tratamiento</Label>
                <p className="text-sm text-muted-foreground">{selectedRecord.treatment}</p>
              </div>
              
              {selectedRecord.vitalSigns && (
                <div>
                  <Label className="text-sm font-medium">Signos Vitales</Label>
                  <p className="text-sm text-muted-foreground">{selectedRecord.vitalSigns}</p>
                </div>
              )}
              
              {selectedRecord.personalHistory && (
                <div>
                  <Label className="text-sm font-medium">Antecedentes Personales</Label>
                  <p className="text-sm text-muted-foreground">{selectedRecord.personalHistory}</p>
                </div>
              )}
              
              {selectedRecord.familyHistory && (
                <div>
                  <Label className="text-sm font-medium">Antecedentes Familiares</Label>
                  <p className="text-sm text-muted-foreground">{selectedRecord.familyHistory}</p>
                </div>
              )}
              
              {selectedRecord.allergies && (
                <div>
                  <Label className="text-sm font-medium">Alergias</Label>
                  <p className="text-sm text-muted-foreground">{selectedRecord.allergies}</p>
                </div>
              )}
              
              {selectedRecord.observations && (
                <div>
                  <Label className="text-sm font-medium">Observaciones</Label>
                  <p className="text-sm text-muted-foreground">{selectedRecord.observations}</p>
                </div>
              )}
              
              {selectedRecord.followUpDate && (
                <div>
                  <Label className="text-sm font-medium">Fecha de Seguimiento</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedRecord.followUpDate).toLocaleDateString('es-ES')}
                  </p>
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

      {/* Edit Record Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar Historial Médico</DialogTitle>
            <DialogDescription>
              Modifica la información del historial médico
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
                <Label htmlFor="edit-date">Fecha de Consulta</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-urgency">Urgencia</Label>
                <Select value={formData.urgency} onValueChange={(value: any) => setFormData({ ...formData, urgency: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar urgencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-cie10Code">Código CIE-10</Label>
                <Input
                  id="edit-cie10Code"
                  value={formData.cie10Code}
                  onChange={(e) => setFormData({ ...formData, cie10Code: e.target.value })}
                  placeholder="Ej: A00.0"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-reason">Motivo de Consulta</Label>
              <Input
                id="edit-reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Motivo de la consulta..."
              />
            </div>
            
            <div>
              <Label htmlFor="edit-symptoms">Síntomas</Label>
              <Textarea
                id="edit-symptoms"
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                placeholder="Descripción de los síntomas..."
              />
            </div>
            
            <div>
              <Label htmlFor="edit-diagnosis">Diagnóstico</Label>
              <Textarea
                id="edit-diagnosis"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                placeholder="Diagnóstico médico..."
              />
            </div>
            
            <div>
              <Label htmlFor="edit-treatment">Tratamiento</Label>
              <Textarea
                id="edit-treatment"
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                placeholder="Tratamiento prescrito..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-vitalSigns">Signos Vitales</Label>
                <Textarea
                  id="edit-vitalSigns"
                  value={formData.vitalSigns}
                  onChange={(e) => setFormData({ ...formData, vitalSigns: e.target.value })}
                  placeholder="Presión arterial, frecuencia cardíaca, etc..."
                />
              </div>
              <div>
                <Label htmlFor="edit-followUpDate">Fecha de Seguimiento</Label>
                <Input
                  id="edit-followUpDate"
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-observations">Observaciones</Label>
              <Textarea
                id="edit-observations"
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveRecord}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Record Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Historial</DialogTitle>
            <DialogDescription>
              Registra un nuevo historial médico para un paciente
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
                <Label htmlFor="new-date">Fecha de Consulta *</Label>
                <Input
                  id="new-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="new-urgency">Urgencia *</Label>
                <Select value={formData.urgency} onValueChange={(value: any) => setFormData({ ...formData, urgency: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar urgencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="new-cie10Code">Código CIE-10</Label>
                <Input
                  id="new-cie10Code"
                  value={formData.cie10Code}
                  onChange={(e) => setFormData({ ...formData, cie10Code: e.target.value })}
                  placeholder="Ej: A00.0"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="new-reason">Motivo de Consulta *</Label>
              <Input
                id="new-reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Motivo de la consulta..."
                required
              />
            </div>
            
            <div>
              <Label htmlFor="new-symptoms">Síntomas *</Label>
              <Textarea
                id="new-symptoms"
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                placeholder="Descripción de los síntomas..."
                required
              />
            </div>
            
            <div>
              <Label htmlFor="new-diagnosis">Diagnóstico *</Label>
              <Textarea
                id="new-diagnosis"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                placeholder="Diagnóstico médico..."
                required
              />
            </div>
            
            <div>
              <Label htmlFor="new-treatment">Tratamiento *</Label>
              <Textarea
                id="new-treatment"
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                placeholder="Tratamiento prescrito..."
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-vitalSigns">Signos Vitales</Label>
                <Textarea
                  id="new-vitalSigns"
                  value={formData.vitalSigns}
                  onChange={(e) => setFormData({ ...formData, vitalSigns: e.target.value })}
                  placeholder="Presión arterial, frecuencia cardíaca, etc..."
                />
              </div>
              <div>
                <Label htmlFor="new-followUpDate">Fecha de Seguimiento</Label>
                <Input
                  id="new-followUpDate"
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="new-observations">Observaciones</Label>
              <Textarea
                id="new-observations"
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddNewRecord}>
              Agregar Historial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorRecords;
