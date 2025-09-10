import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Eye, Download, FileText, User, Stethoscope, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { localStorageService, MedicalCertificate, Patient, SystemUser } from '@/services/localStorageService';
import { useToast } from '@/hooks/use-toast';

const AdminCertificates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<MedicalCertificate[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<SystemUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState<MedicalCertificate | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCertificates();
  }, [certificates, searchTerm]);

  const loadData = () => {
    const allCertificates = localStorageService.getCertificates();
    const allPatients = localStorageService.getPatients();
    const allDoctors = localStorageService.getSystemUsers().filter(u => u.role === 'doctor');
    
    setCertificates(allCertificates);
    setPatients(allPatients);
    setDoctors(allDoctors);
  };

  const filterCertificates = () => {
    const filtered = certificates.filter(certificate => {
      const patient = patients.find(p => p.id === certificate.patientId);
      const doctor = doctors.find(d => d.id === certificate.doctorId);
      return (
        patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        certificate.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        certificate.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredCertificates(filtered);
  };

  const handleViewCertificate = (certificate: MedicalCertificate) => {
    setSelectedCertificate(certificate);
    setIsViewDialogOpen(true);
  };

  const handleDownloadCertificate = (certificate: MedicalCertificate) => {
    // Create a simple text representation for download
    const content = `
CERTIFICADO MÉDICO
==================

Paciente: ${getPatientName(certificate.patientId)}
Doctor: ${getDoctorName(certificate.doctorId)}
Tipo: ${certificate.type}
Fecha: ${new Date(certificate.date).toLocaleDateString('es-ES')}
Válido hasta: ${new Date(certificate.validUntil).toLocaleDateString('es-ES')}

Motivo: ${certificate.reason}

${certificate.notes ? `Notas: ${certificate.notes}` : ''}

---
Clínica MediClinic - Consultorio Hoppe
Dr. Candy Maribel Hoppe Castro
+593 99 715 8494
dracandyhoppe@gmail.com
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificado-${certificate.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Certificado descargado",
      description: "El certificado médico ha sido descargado correctamente.",
    });
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || 'Paciente no encontrado';
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor?.name || 'Doctor no encontrado';
  };

  const getTypeBadge = (type: MedicalCertificate['type']) => {
    const styles = {
      'medical_leave': 'bg-red-100 text-red-800',
      'fitness': 'bg-green-100 text-green-800',
      'disability': 'bg-yellow-100 text-yellow-800',
      'general': 'bg-blue-100 text-blue-800'
    };
    
    const labels = {
      'medical_leave': 'Licencia Médica',
      'fitness': 'Aptitud Física',
      'disability': 'Incapacidad',
      'general': 'General'
    };
    
    return <Badge className={styles[type]}>{labels[type]}</Badge>;
  };

  const getValidityStatus = (validUntil: string) => {
    const validDate = new Date(validUntil);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((validDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return <Badge className="bg-red-100 text-red-800">Expirado</Badge>;
    } else if (daysUntilExpiry <= 7) {
      return <Badge className="bg-yellow-100 text-yellow-800">Por expirar</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Válido</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Certificados Médicos</h1>
          <p className="text-muted-foreground">
            Administra todos los certificados médicos del sistema
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
                <p className="text-sm font-medium">Total Certificados</p>
                <p className="text-2xl font-bold">{certificates.length}</p>
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
                  {new Set(certificates.map(c => c.patientId)).size}
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
                  {new Set(certificates.map(c => c.doctorId)).size}
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
                  {certificates.filter(c => {
                    const certDate = new Date(c.createdAt);
                    const now = new Date();
                    return certDate.getMonth() === now.getMonth() && 
                           certDate.getFullYear() === now.getFullYear();
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
            placeholder="Buscar certificados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredCertificates.length} de {certificates.length} certificados
        </div>
      </div>

      {/* Certificates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Certificados Médicos</CardTitle>
          <CardDescription>
            Todos los certificados médicos emitidos en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Válido Hasta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertificates.map((certificate) => (
                <TableRow key={certificate.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{getPatientName(certificate.patientId)}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {certificate.patientId.slice(0, 8)}...
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
                        <div className="font-medium">{getDoctorName(certificate.doctorId)}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {certificate.doctorId.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getTypeBadge(certificate.type)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(certificate.date).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(certificate.validUntil).toLocaleDateString('es-ES')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getValidityStatus(certificate.validUntil)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCertificate(certificate)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadCertificate(certificate)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Certificate Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Certificado Médico Completo</DialogTitle>
            <DialogDescription>
              Información detallada del certificado médico seleccionado
            </DialogDescription>
          </DialogHeader>
          {selectedCertificate && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Paciente</Label>
                  <p className="text-sm text-muted-foreground">
                    {getPatientName(selectedCertificate.patientId)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Doctor</Label>
                  <p className="text-sm text-muted-foreground">
                    {getDoctorName(selectedCertificate.doctorId)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tipo de Certificado</Label>
                  <div className="mt-1">
                    {getTypeBadge(selectedCertificate.type)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Fecha de Emisión</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedCertificate.date).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Válido Hasta</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedCertificate.validUntil).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estado</Label>
                  <div className="mt-1">
                    {getValidityStatus(selectedCertificate.validUntil)}
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Motivo del Certificado</Label>
                <p className="text-sm text-muted-foreground">{selectedCertificate.reason}</p>
              </div>
              
              {selectedCertificate.notes && (
                <div>
                  <Label className="text-sm font-medium">Notas Adicionales</Label>
                  <p className="text-sm text-muted-foreground">{selectedCertificate.notes}</p>
                </div>
              )}
              
              <div className="border-t pt-4">
                <Label className="text-sm font-medium">Información de la Clínica</Label>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p><strong>Clínica:</strong> MediClinic - Consultorio Hoppe</p>
                  <p><strong>Doctora:</strong> Dr. Candy Maribel Hoppe Castro</p>
                  <p><strong>Teléfono:</strong> +593 99 715 8494</p>
                  <p><strong>Email:</strong> dracandyhoppe@gmail.com</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={() => selectedCertificate && handleDownloadCertificate(selectedCertificate)}>
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCertificates;
