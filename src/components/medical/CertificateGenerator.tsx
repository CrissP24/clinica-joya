import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Download, Calendar } from 'lucide-react';
import { localStorageService, MedicalCertificate, Patient } from '@/services/localStorageService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CertificateGeneratorProps {
  patientId?: string;
  patientName?: string;
  onCertificateGenerated?: () => void;
}

const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({ 
  patientId, 
  patientName, 
  onCertificateGenerated 
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    patientId: patientId || '',
    patientName: patientName || '',
    type: '' as MedicalCertificate['type'],
    startDate: '',
    endDate: '',
    days: '',
    diagnosis: '',
    description: ''
  });

  React.useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = () => {
    const allPatients = localStorageService.getPatients();
    setPatients(allPatients);
  };

  const certificateTypes = [
    { value: 'incapacidad', label: 'Incapacidad Temporal' },
    { value: 'constancia', label: 'Constancia de Atención' },
    { value: 'reposo', label: 'Certificado de Reposo' },
    { value: 'certificado_medico', label: 'Certificado Médico General' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    const selectedPatient = patients.find(p => p.id === formData.patientId);
    if (!selectedPatient) return;
    
    try {
      const newCertificate = localStorageService.addCertificate({
        patientId: formData.patientId,
        patientName: selectedPatient.name,
        doctorId: user.id,
        doctorName: user.name,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        days: formData.days ? parseInt(formData.days) : undefined,
        diagnosis: formData.diagnosis,
        description: formData.description
      });

      toast({
        title: "Certificado generado",
        description: "El certificado médico se ha generado correctamente",
      });

      setIsDialogOpen(false);
      resetForm();
      onCertificateGenerated?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al generar el certificado",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: patientId || '',
      patientName: patientName || '',
      type: '' as MedicalCertificate['type'],
      startDate: '',
      endDate: '',
      days: '',
      diagnosis: '',
      description: ''
    });
  };

  const generatePDF = (certificate: MedicalCertificate) => {
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const patient = patients.find(p => p.id === certificate.patientId);
    if (!patient) return;

    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const certificateTitle = certificateTypes.find(t => t.value === certificate.type)?.label || certificate.type;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${certificateTitle}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            margin: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .clinic-name {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
          }
          .clinic-subtitle {
            font-size: 14px;
            color: #666;
          }
          .certificate-title {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin: 30px 0;
            color: #1e40af;
          }
          .content {
            margin: 30px 0;
            text-align: justify;
          }
          .patient-info {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .signature-section {
            margin-top: 50px;
            text-align: center;
          }
          .signature-line {
            border-bottom: 1px solid #333;
            width: 300px;
            margin: 0 auto 10px;
            height: 50px;
          }
          .footer {
            margin-top: 50px;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="clinic-name">CLÍNICA MEDICLINIC</div>
          <div class="clinic-subtitle">Consultorio Hoppe</div>
          <div class="clinic-subtitle">Tel: +593 99 715 8494 | Email: dracandyhoppe@gmail.com</div>
        </div>

        <div class="certificate-title">${certificateTitle.toUpperCase()}</div>

        <div class="content">
          <p>Por medio del presente certificado, yo <strong>${certificate.doctorName}</strong>, 
          médico colegiado, certifico que:</p>

          <div class="patient-info">
            <p><strong>Paciente:</strong> ${certificate.patientName}</p>
            <p><strong>Cédula:</strong> ${patient.cedula}</p>
            <p><strong>Fecha de Nacimiento:</strong> ${new Date(patient.dateOfBirth).toLocaleDateString('es-ES')}</p>
            <p><strong>Dirección:</strong> ${patient.address}</p>
          </div>

          <p><strong>Diagnóstico:</strong> ${certificate.diagnosis}</p>
          
          ${certificate.description ? `<p><strong>Descripción:</strong> ${certificate.description}</p>` : ''}
          
          ${certificate.startDate ? `<p><strong>Fecha de inicio:</strong> ${new Date(certificate.startDate).toLocaleDateString('es-ES')}</p>` : ''}
          
          ${certificate.endDate ? `<p><strong>Fecha de finalización:</strong> ${new Date(certificate.endDate).toLocaleDateString('es-ES')}</p>` : ''}
          
          ${certificate.days ? `<p><strong>Duración:</strong> ${certificate.days} días</p>` : ''}

          <p>Este certificado es válido para los fines que el paciente requiera y ha sido expedido 
          en ${currentDate}.</p>
        </div>

        <div class="signature-section">
          <p>Atentamente,</p>
          <div class="signature-line"></div>
          <p><strong>${certificate.doctorName}</strong></p>
          <p>Médico Colegiado</p>
          <p>Registro Profesional: ${user?.id}</p>
        </div>

        <div class="footer">
          <p>Este documento ha sido generado electrónicamente y es válido sin firma autógrafa.</p>
          <p>Clínica MedicClinic - ${currentDate}</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generar Certificado Médico
          </CardTitle>
          <CardDescription>
            Crea certificados médicos oficiales para tus pacientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="medical-gradient" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Certificado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Generar Certificado Médico</DialogTitle>
                <DialogDescription>
                  Completa la información para generar el certificado
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient">Paciente *</Label>
                    <Select value={formData.patientId} onValueChange={(value) => {
                      const patient = patients.find(p => p.id === value);
                      setFormData(prev => ({ 
                        ...prev, 
                        patientId: value,
                        patientName: patient?.name || ''
                      }));
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
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as MedicalCertificate['type'] }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {certificateTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnóstico *</Label>
                  <Input
                    id="diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                    placeholder="Ingresa el diagnóstico médico"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción adicional del certificado..."
                    rows={3}
                  />
                </div>

                {(formData.type === 'incapacidad' || formData.type === 'reposo') && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Fecha de Inicio</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endDate">Fecha de Fin</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="days">Días</Label>
                      <Input
                        id="days"
                        type="number"
                        value={formData.days}
                        onChange={(e) => setFormData(prev => ({ ...prev, days: e.target.value }))}
                        placeholder="Número de días"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="medical-gradient"
                    disabled={!formData.patientId || !formData.type || !formData.diagnosis}
                  >
                    Generar Certificado
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Certificados Generados
          </CardTitle>
          <CardDescription>
            Lista de certificados médicos emitidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {localStorageService.getCertificatesByDoctor(user?.id || '').length > 0 ? (
              localStorageService.getCertificatesByDoctor(user?.id || '')
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((certificate) => (
                  <div key={certificate.id} className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">
                          {certificateTypes.find(t => t.value === certificate.type)?.label || certificate.type}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          {new Date(certificate.createdAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Paciente:</strong> {certificate.patientName}</p>
                        <p><strong>Diagnóstico:</strong> {certificate.diagnosis}</p>
                        {certificate.startDate && (
                          <p><strong>Válido desde:</strong> {new Date(certificate.startDate).toLocaleDateString('es-ES')}</p>
                        )}
                        {certificate.endDate && (
                          <p><strong>Válido hasta:</strong> {new Date(certificate.endDate).toLocaleDateString('es-ES')}</p>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generatePDF(certificate)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar PDF
                    </Button>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No has generado certificados médicos aún</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateGenerator;
