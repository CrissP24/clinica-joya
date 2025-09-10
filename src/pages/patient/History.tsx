import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, User, FileText, Download, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { localStorageService, MedicalRecord } from '@/services/localStorageService';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const PatientHistory = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    if (user) {
      loadPatientRecords();
    }
  }, [user]);

  const loadPatientRecords = () => {
    if (!user) return;
    const patientRecords = localStorageService.getRecordsByPatient(user.id);
    setRecords(patientRecords);
  };

  const getStatusBadge = (status: MedicalRecord['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    const labels = {
      active: 'Activo',
      inactive: 'Inactivo',
      pending: 'Pendiente'
    };
    
    return (
      <Badge className={styles[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const downloadRecord = (record: MedicalRecord) => {
    // This would generate and download a PDF record
    console.log('Downloading record:', record);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Mi Historia Clínica</h1>
        <p className="text-muted-foreground">
          Historial completo de consultas y tratamientos médicos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Consultas
            </CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
            <p className="text-xs text-muted-foreground">
              Registros médicos
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Última Consulta
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.length > 0 
                ? new Date(records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Fecha más reciente
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tratamientos Activos
            </CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter(r => r.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              En curso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Records List */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Historial de Consultas
          </CardTitle>
          <CardDescription>
            Registro completo de todas tus consultas médicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {records.length > 0 ? (
              records
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{record.diagnosis}</h3>
                        {getStatusBadge(record.status)}
                        <Badge variant="outline">
                          {new Date(record.date).toLocaleDateString('es-ES')}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Doctor:</strong> {record.doctorName}</p>
                        <p><strong>Especialidad:</strong> {record.specialty}</p>
                        <p><strong>Descripción:</strong> {record.description}</p>
                        {record.treatment && (
                          <p><strong>Tratamiento:</strong> {record.treatment}</p>
                        )}
                        {record.medications && record.medications.length > 0 && (
                          <p><strong>Medicamentos:</strong> {record.medications.join(', ')}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedRecord(record)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalles
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalles de la Consulta</DialogTitle>
                            <DialogDescription>
                              Información completa del registro médico
                            </DialogDescription>
                          </DialogHeader>
                          {selectedRecord && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium text-sm text-muted-foreground">Fecha</h4>
                                  <p className="text-sm">{new Date(selectedRecord.date).toLocaleDateString('es-ES')}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm text-muted-foreground">Doctor</h4>
                                  <p className="text-sm">{selectedRecord.doctorName}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm text-muted-foreground">Especialidad</h4>
                                  <p className="text-sm">{selectedRecord.specialty}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm text-muted-foreground">Estado</h4>
                                  <div className="text-sm">{getStatusBadge(selectedRecord.status)}</div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground">Diagnóstico</h4>
                                <p className="text-sm">{selectedRecord.diagnosis}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground">Descripción</h4>
                                <p className="text-sm">{selectedRecord.description}</p>
                              </div>
                              {selectedRecord.treatment && (
                                <div>
                                  <h4 className="font-medium text-sm text-muted-foreground">Tratamiento</h4>
                                  <p className="text-sm">{selectedRecord.treatment}</p>
                                </div>
                              )}
                              {selectedRecord.medications && selectedRecord.medications.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-sm text-muted-foreground">Medicamentos</h4>
                                  <p className="text-sm">{selectedRecord.medications.join(', ')}</p>
                                </div>
                              )}
                              {selectedRecord.notes && (
                                <div>
                                  <h4 className="font-medium text-sm text-muted-foreground">Notas Adicionales</h4>
                                  <p className="text-sm">{selectedRecord.notes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadRecord(record)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tienes registros médicos disponibles</p>
                <p className="text-sm">Las consultas aparecerán aquí una vez que tengas citas médicas</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientHistory;
