import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { localStorageService, MedicalCertificate } from '@/services/localStorageService';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PatientCertificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);

  useEffect(() => {
    if (user) {
      loadPatientCertificates();
    }
  }, [user]);

  const loadPatientCertificates = () => {
    if (!user) return;
    const patientCertificates = localStorageService.getCertificatesByPatient(user.id);
    setCertificates(patientCertificates);
  };

  const getStatusBadge = (certificate: MedicalCertificate) => {
    const now = new Date();
    const endDate = certificate.endDate ? new Date(certificate.endDate) : null;
    
    if (endDate && endDate < now) {
      return <Badge className="bg-red-100 text-red-800">Expirado</Badge>;
    } else if (endDate && endDate > now) {
      return <Badge className="bg-green-100 text-green-800">Válido</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Válido</Badge>;
    }
  };

  const downloadCertificate = (certificate: MedicalCertificate) => {
    // This would generate and download a PDF certificate
    console.log('Downloading certificate:', certificate);
    
    // For demo purposes, we'll create a simple text file
    const content = `
CERTIFICADO MÉDICO
==================

Tipo: ${certificate.type}
Paciente: ${user?.name}
Doctor: ${certificate.doctorName}
Fecha de emisión: ${new Date(certificate.createdAt).toLocaleDateString('es-ES')}
${certificate.startDate ? `Válido desde: ${new Date(certificate.startDate).toLocaleDateString('es-ES')}` : ''}
${certificate.endDate ? `Válido hasta: ${new Date(certificate.endDate).toLocaleDateString('es-ES')}` : ''}

Diagnóstico: ${certificate.diagnosis}
Descripción: ${certificate.description}

${certificate.notes ? `Notas adicionales: ${certificate.notes}` : ''}

---
Consultorio Hoppe
Certificado generado el ${new Date().toLocaleDateString('es-ES')}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificado-${certificate.type.toLowerCase().replace(/\s+/g, '-')}-${new Date(certificate.createdAt).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const validCertificates = certificates.filter(cert => {
    if (!cert.endDate) return true;
    return new Date(cert.endDate) > new Date();
  });

  const expiredCertificates = certificates.filter(cert => {
    if (!cert.endDate) return false;
    return new Date(cert.endDate) <= new Date();
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Mis Certificados Médicos</h1>
        <p className="text-muted-foreground">
          Documentos médicos oficiales para descargar
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Certificados
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificates.length}</div>
            <p className="text-xs text-muted-foreground">
              Documentos emitidos
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Válidos
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validCertificates.length}</div>
            <p className="text-xs text-muted-foreground">
              En vigencia
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expirados
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredCertificates.length}</div>
            <p className="text-xs text-muted-foreground">
              Vencidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expired Certificates Alert */}
      {expiredCertificates.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Tienes {expiredCertificates.length} certificado(s) expirado(s). 
            Contacta a tu médico si necesitas renovarlos.
          </AlertDescription>
        </Alert>
      )}

      {/* Valid Certificates */}
      {validCertificates.length > 0 && (
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Certificados Válidos
            </CardTitle>
            <CardDescription>
              Documentos médicos en vigencia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {validCertificates
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((certificate) => (
                  <div key={certificate.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{certificate.type}</h3>
                        {getStatusBadge(certificate)}
                        <Badge variant="outline">
                          {new Date(certificate.createdAt).toLocaleDateString('es-ES')}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Diagnóstico:</strong> {certificate.diagnosis}</p>
                        <p><strong>Descripción:</strong> {certificate.description}</p>
                        <p><strong>Doctor:</strong> {certificate.doctorName}</p>
                        {certificate.startDate && (
                          <p><strong>Válido desde:</strong> {new Date(certificate.startDate).toLocaleDateString('es-ES')}</p>
                        )}
                        {certificate.endDate && (
                          <p><strong>Válido hasta:</strong> {new Date(certificate.endDate).toLocaleDateString('es-ES')}</p>
                        )}
                        {certificate.notes && (
                          <p><strong>Notas:</strong> {certificate.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadCertificate(certificate)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar PDF
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expired Certificates */}
      {expiredCertificates.length > 0 && (
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Certificados Expirados
            </CardTitle>
            <CardDescription>
              Documentos médicos vencidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expiredCertificates
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((certificate) => (
                  <div key={certificate.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{certificate.type}</h3>
                        {getStatusBadge(certificate)}
                        <Badge variant="outline">
                          {new Date(certificate.createdAt).toLocaleDateString('es-ES')}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Diagnóstico:</strong> {certificate.diagnosis}</p>
                        <p><strong>Descripción:</strong> {certificate.description}</p>
                        <p><strong>Doctor:</strong> {certificate.doctorName}</p>
                        {certificate.startDate && (
                          <p><strong>Válido desde:</strong> {new Date(certificate.startDate).toLocaleDateString('es-ES')}</p>
                        )}
                        {certificate.endDate && (
                          <p><strong>Válido hasta:</strong> {new Date(certificate.endDate).toLocaleDateString('es-ES')}</p>
                        )}
                        {certificate.notes && (
                          <p><strong>Notas:</strong> {certificate.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadCertificate(certificate)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar PDF
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Certificates */}
      {certificates.length === 0 && (
        <Card className="medical-card">
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No tienes certificados médicos</h3>
            <p className="text-muted-foreground mb-4">
              Los certificados médicos aparecerán aquí una vez que tu doctor los emita
            </p>
            <p className="text-sm text-muted-foreground">
              Contacta a tu médico si necesitas un certificado específico
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientCertificates;
