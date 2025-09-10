import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Download, FileText, Plus, Search, User, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { localStorageService, MedicalCertificate, Patient } from '@/services/localStorageService';
import CertificateGenerator from '@/components/medical/CertificateGenerator';
import { useToast } from '@/hooks/use-toast';

const DoctorCertificates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [certificateForm, setCertificateForm] = useState({
    patientId: '',
    type: 'certificado_medico' as const,
    startDate: '',
    endDate: '',
    days: 1,
    diagnosis: '',
    description: ''
  });

  useEffect(() => {
    if (user?.id) {
      loadCertificates();
      loadPatients();
    }
  }, [user?.id]);

  const loadCertificates = () => {
    if (user?.id) {
      const doctorCertificates = localStorageService.getCertificatesByDoctor(user.id);
      setCertificates(doctorCertificates);
    }
  };

  const loadPatients = () => {
    const allPatients = localStorageService.getPatients();
    setPatients(allPatients);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return dateString;
    }
  };

  const handleCreateCertificate = () => {
    if (!certificateForm.patientId || !certificateForm.diagnosis || !certificateForm.description) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    const patient = patients.find(p => p.id === certificateForm.patientId);
    if (!patient) {
      toast({
        title: "Error",
        description: "Paciente no encontrado",
        variant: "destructive",
      });
      return;
    }

    const newCertificate: Omit<MedicalCertificate, 'id' | 'createdAt'> = {
      patientId: certificateForm.patientId,
      patientName: patient.name,
      doctorId: user!.id,
      doctorName: user!.name,
      type: certificateForm.type,
      startDate: certificateForm.startDate,
      endDate: certificateForm.endDate || undefined,
      days: certificateForm.days,
      diagnosis: certificateForm.diagnosis,
      description: certificateForm.description
    };

    localStorageService.addCertificate(newCertificate);
    loadCertificates();
    setIsCreateDialogOpen(false);
    resetForm();

    toast({
      title: "Certificado creado",
      description: "El certificado médico ha sido creado exitosamente",
    });
  };

  const resetForm = () => {
    setCertificateForm({
      patientId: '',
      type: 'certificado_medico',
      startDate: '',
      endDate: '',
      days: 1,
      diagnosis: '',
      description: ''
    });
  };

  const getTypeLabel = (type: string) => {
    const types = {
      'incapacidad': 'Incapacidad Médica',
      'constancia': 'Constancia Médica',
      'reposo': 'Reposo Médico',
      'certificado_medico': 'Certificado Médico'
    };
    return types[type as keyof typeof types] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'incapacidad': 'bg-red-100 text-red-800',
      'constancia': 'bg-blue-100 text-blue-800',
      'reposo': 'bg-yellow-100 text-yellow-800',
      'certificado_medico': 'bg-green-100 text-green-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || cert.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificados Médicos</h1>
          <p className="text-gray-600 mt-1">Gestiona los certificados médicos de tus pacientes</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="medical-gradient">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Certificado
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Certificado</DialogTitle>
              <DialogDescription>
                Genera un certificado médico para un paciente
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Paciente *</Label>
                  <Select value={certificateForm.patientId} onValueChange={(value) => {
                    setCertificateForm(prev => ({ ...prev, patientId: value }));
                  }}>
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
                  <Label htmlFor="type">Tipo de Certificado *</Label>
                  <Select value={certificateForm.type} onValueChange={(value: any) => 
                    setCertificateForm(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="certificado_medico">Certificado Médico</SelectItem>
                      <SelectItem value="incapacidad">Incapacidad Médica</SelectItem>
                      <SelectItem value="constancia">Constancia Médica</SelectItem>
                      <SelectItem value="reposo">Reposo Médico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha de Inicio *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={certificateForm.startDate}
                    onChange={(e) => setCertificateForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha de Fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={certificateForm.endDate}
                    onChange={(e) => setCertificateForm(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="days">Días</Label>
                  <Input
                    id="days"
                    type="number"
                    min="1"
                    value={certificateForm.days}
                    onChange={(e) => setCertificateForm(prev => ({ ...prev, days: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnóstico *</Label>
                <Input
                  id="diagnosis"
                  placeholder="Ej: Hipertensión arterial, Diabetes tipo 2..."
                  value={certificateForm.diagnosis}
                  onChange={(e) => setCertificateForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  placeholder="Descripción detallada del certificado..."
                  value={certificateForm.description}
                  onChange={(e) => setCertificateForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateCertificate} className="medical-gradient">
                Crear Certificado
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por paciente o diagnóstico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="certificado_medico">Certificado Médico</SelectItem>
                <SelectItem value="incapacidad">Incapacidad Médica</SelectItem>
                <SelectItem value="constancia">Constancia Médica</SelectItem>
                <SelectItem value="reposo">Reposo Médico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <div className="grid gap-4">
        {filteredCertificates.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay certificados</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterType !== 'all' 
                    ? 'No se encontraron certificados con los filtros aplicados'
                    : 'Aún no has creado ningún certificado médico'
                  }
                </p>
                {!searchTerm && filterType === 'all' && (
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="medical-gradient">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Certificado
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredCertificates.map(certificate => (
            <Card key={certificate.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getTypeColor(certificate.type)}>
                        {getTypeLabel(certificate.type)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDateTime(certificate.createdAt)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <User className="h-4 w-4" />
                          <span className="font-medium">Paciente:</span>
                        </div>
                        <p className="text-gray-900">{certificate.patientName}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">Período:</span>
                        </div>
                        <p className="text-gray-900">
                          {formatDate(certificate.startDate)}
                          {certificate.endDate && ` - ${formatDate(certificate.endDate)}`}
                          {certificate.days > 1 && ` (${certificate.days} días)`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">Diagnóstico:</span>
                      </div>
                      <p className="text-gray-900">{certificate.diagnosis}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <span className="font-medium">Descripción:</span>
                      </div>
                      <p className="text-gray-700 text-sm">{certificate.description}</p>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <CertificateGenerator
                      certificate={certificate}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
                        </Button>
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorCertificates;