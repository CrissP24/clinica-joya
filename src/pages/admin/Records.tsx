import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Eye, FileText, User, Stethoscope, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { localStorageService, MedicalRecord, Patient, SystemUser } from '@/services/localStorageService';
import { useToast } from '@/hooks/use-toast';

const AdminRecords = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<SystemUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm]);

  const loadData = () => {
    const allRecords = localStorageService.getMedicalRecords();
    const allPatients = localStorageService.getPatients();
    const allDoctors = localStorageService.getSystemUsers().filter(u => u.role === 'doctor');
    
    setRecords(allRecords);
    setPatients(allPatients);
    setDoctors(allDoctors);
  };

  const filterRecords = () => {
    const filtered = records.filter(record => {
      const patient = patients.find(p => p.id === record.patientId);
      const doctor = doctors.find(d => d.id === record.doctorId);
      return (
        patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.symptoms.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredRecords(filtered);
  };

  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || 'Paciente no encontrado';
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor?.name || 'Doctor no encontrado';
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Historiales Médicos</h1>
          <p className="text-muted-foreground">
            Administra todos los historiales médicos del sistema
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Registros</p>
                <p className="text-2xl font-bold">{records.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Pacientes Únicos</p>
                <p className="text-2xl font-bold">
                  {new Set(records.map(r => r.patientId)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Doctores Activos</p>
                <p className="text-2xl font-bold">
                  {new Set(records.map(r => r.doctorId)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Este Mes</p>
                <p className="text-2xl font-bold">
                  {records.filter(r => {
                    const recordDate = new Date(r.createdAt);
                    const now = new Date();
                    return recordDate.getMonth() === now.getMonth() && 
                           recordDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
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
        <div className="text-sm text-muted-foreground">
          {filteredRecords.length} de {records.length} registros
        </div>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Historiales Médicos</CardTitle>
          <CardDescription>
            Todos los historiales médicos registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Diagnóstico</TableHead>
                <TableHead>Urgencia</TableHead>
                <TableHead>Fecha</TableHead>
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
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Stethoscope className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{getDoctorName(record.doctorId)}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {record.doctorId.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {record.diagnosis}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getUrgencyBadge(record.urgency)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(record.createdAt).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewRecord(record)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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
                  <Label className="text-sm font-medium">Doctor</Label>
                  <p className="text-sm text-muted-foreground">
                    {getDoctorName(selectedRecord.doctorId)}
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
              
              {selectedRecord.cie10Code && (
                <div>
                  <Label className="text-sm font-medium">Código CIE-10</Label>
                  <p className="text-sm text-muted-foreground">{selectedRecord.cie10Code}</p>
                </div>
              )}
              
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
    </div>
  );
};

export default AdminRecords;
