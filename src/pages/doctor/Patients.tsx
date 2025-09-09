import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Search, Heart, FileText, Calendar, Eye, Stethoscope } from 'lucide-react';
import { localStorageService, Patient, MedicalRecord } from '@/services/localStorageService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ClinicalHistory from '@/components/medical/ClinicalHistory';
import { DiagnosisForm } from '@/components/medical/DiagnosisForm';

const DoctorPatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [isDiagnosisDialogOpen, setIsDiagnosisDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientRecords, setPatientRecords] = useState<MedicalRecord[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const [patientFormData, setPatientFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cedula: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    bloodType: '',
    allergies: '',
    chronicDiseases: ''
  });

  const [recordFormData, setRecordFormData] = useState({
    reason: '',
    symptoms: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      oxygenSaturation: '',
      weight: '',
      height: ''
    },
    diagnosis: '',
    cie10Code: '',
    treatment: '',
    prescriptions: '',
    notes: ''
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = () => {
    const allPatients = localStorageService.getPatients();
    setPatients(allPatients);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cedula.includes(searchTerm) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      localStorageService.addPatient(patientFormData);
      toast({
        title: "Paciente registrado",
        description: "El nuevo paciente se ha registrado correctamente",
      });
      
      loadPatients();
      setIsPatientDialogOpen(false);
      resetPatientForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al registrar el paciente",
        variant: "destructive",
      });
    }
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient || !user) return;
    
    try {
      localStorageService.addMedicalRecord({
        patientId: selectedPatient.id,
        doctorId: user.id,
        doctorName: user.name,
        date: new Date().toISOString().split('T')[0],
        ...recordFormData
      });
      
      toast({
        title: "Historia clínica guardada",
        description: "La consulta se ha registrado correctamente",
      });
      
      setIsRecordDialogOpen(false);
      resetRecordForm();
      viewPatientHistory(selectedPatient);
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al guardar la historia clínica",
        variant: "destructive",
      });
    }
  };

  const resetPatientForm = () => {
    setPatientFormData({
      name: '',
      email: '',
      phone: '',
      cedula: '',
      dateOfBirth: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      bloodType: '',
      allergies: '',
      chronicDiseases: ''
    });
  };

  const resetRecordForm = () => {
    setRecordFormData({
      reason: '',
      symptoms: '',
      vitalSigns: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        oxygenSaturation: '',
        weight: '',
        height: ''
      },
      diagnosis: '',
      cie10Code: '',
      treatment: '',
      prescriptions: '',
      notes: ''
    });
  };

  const viewPatientHistory = (patient: Patient) => {
    const records = localStorageService.getRecordsByPatient(patient.id);
    setPatientRecords(records);
    setSelectedPatient(patient);
  };

  const startNewRecord = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsRecordDialogOpen(true);
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mis Pacientes</h1>
          <p className="text-muted-foreground">
            Gestiona tus pacientes y sus historiales médicos
          </p>
        </div>
        
        <Dialog open={isPatientDialogOpen} onOpenChange={setIsPatientDialogOpen}>
          <DialogTrigger asChild>
            <Button className="medical-gradient" onClick={resetPatientForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Paciente</DialogTitle>
              <DialogDescription>
                Completa la información del nuevo paciente
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    value={patientFormData.name}
                    onChange={(e) => setPatientFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cedula">Cédula *</Label>
                  <Input
                    id="cedula"
                    value={patientFormData.cedula}
                    onChange={(e) => setPatientFormData(prev => ({ ...prev, cedula: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={patientFormData.email}
                    onChange={(e) => setPatientFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    value={patientFormData.phone}
                    onChange={(e) => setPatientFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Fecha de Nacimiento *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={patientFormData.dateOfBirth}
                    onChange={(e) => setPatientFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Tipo de Sangre</Label>
                  <Input
                    id="bloodType"
                    value={patientFormData.bloodType}
                    onChange={(e) => setPatientFormData(prev => ({ ...prev, bloodType: e.target.value }))}
                    placeholder="Ej: O+, A-, B+, AB-"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={patientFormData.address}
                  onChange={(e) => setPatientFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                  <Input
                    id="emergencyContact"
                    value={patientFormData.emergencyContact}
                    onChange={(e) => setPatientFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
                  <Input
                    id="emergencyPhone"
                    value={patientFormData.emergencyPhone}
                    onChange={(e) => setPatientFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="allergies">Alergias</Label>
                <Textarea
                  id="allergies"
                  value={patientFormData.allergies}
                  onChange={(e) => setPatientFormData(prev => ({ ...prev, allergies: e.target.value }))}
                  placeholder="Describe alergias conocidas..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chronicDiseases">Enfermedades Crónicas</Label>
                <Textarea
                  id="chronicDiseases"
                  value={patientFormData.chronicDiseases}
                  onChange={(e) => setPatientFormData(prev => ({ ...prev, chronicDiseases: e.target.value }))}
                  placeholder="Describe enfermedades crónicas..."
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsPatientDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="medical-gradient">
                  Registrar Paciente
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Pacientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por nombre, cédula o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Patients List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Pacientes ({filteredPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="p-4 border rounded-lg bg-secondary/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{patient.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {calculateAge(patient.dateOfBirth)} años • {patient.cedula}
                      </p>
                    </div>
                    {patient.bloodType && (
                      <Badge variant="outline">{patient.bloodType}</Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>📞 {patient.phone}</p>
                    {patient.email && <p>📧 {patient.email}</p>}
                    {patient.chronicDiseases && (
                      <p className="text-orange-600">⚠️ {patient.chronicDiseases}</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 mt-3">
                    <Button size="sm" onClick={() => viewPatientHistory(patient)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Historia
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => startNewRecord(patient)}>
                      <FileText className="h-4 w-4 mr-1" />
                      Nueva Consulta
                    </Button>
                    <Button 
                      size="sm" 
                      className="medical-gradient" 
                      onClick={() => {
                        setSelectedPatient(patient);
                        setIsDiagnosisDialogOpen(true);
                      }}
                    >
                      <Stethoscope className="h-4 w-4 mr-1" />
                      Diagnóstico
                    </Button>
                  </div>
                </div>
              ))}
              
              {filteredPatients.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron pacientes</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Patient History */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Historia Clínica
              {selectedPatient && (
                <span className="text-sm font-normal text-muted-foreground">
                  - {selectedPatient.name}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPatient ? (
              <ClinicalHistory 
                patient={selectedPatient} 
                onRecordAdded={() => {
                  const records = localStorageService.getRecordsByPatient(selectedPatient.id);
                  setPatientRecords(records);
                }}
              />
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Selecciona un paciente para ver su historia clínica
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Medical Record Dialog */}
      <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Consulta Médica</DialogTitle>
            <DialogDescription>
              {selectedPatient && `Paciente: ${selectedPatient.name}`}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleRecordSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo de Consulta *</Label>
                <Input
                  id="reason"
                  value={recordFormData.reason}
                  onChange={(e) => setRecordFormData(prev => ({ ...prev, reason: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cie10Code">Código CIE-10</Label>
                <Input
                  id="cie10Code"
                  value={recordFormData.cie10Code}
                  onChange={(e) => setRecordFormData(prev => ({ ...prev, cie10Code: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="symptoms">Cuadro Clínico</Label>
              <Textarea
                id="symptoms"
                value={recordFormData.symptoms}
                onChange={(e) => setRecordFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                placeholder="Describe los síntomas y hallazgos clínicos..."
              />
            </div>
            
            {/* Vital Signs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Signos Vitales</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodPressure">Presión Arterial</Label>
                  <Input
                    id="bloodPressure"
                    value={recordFormData.vitalSigns.bloodPressure}
                    onChange={(e) => setRecordFormData(prev => ({ 
                      ...prev, 
                      vitalSigns: { ...prev.vitalSigns, bloodPressure: e.target.value }
                    }))}
                    placeholder="120/80"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="heartRate">Frecuencia Cardíaca</Label>
                  <Input
                    id="heartRate"
                    value={recordFormData.vitalSigns.heartRate}
                    onChange={(e) => setRecordFormData(prev => ({ 
                      ...prev, 
                      vitalSigns: { ...prev.vitalSigns, heartRate: e.target.value }
                    }))}
                    placeholder="bpm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperatura</Label>
                  <Input
                    id="temperature"
                    value={recordFormData.vitalSigns.temperature}
                    onChange={(e) => setRecordFormData(prev => ({ 
                      ...prev, 
                      vitalSigns: { ...prev.vitalSigns, temperature: e.target.value }
                    }))}
                    placeholder="°C"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="oxygenSaturation">Saturación O2</Label>
                  <Input
                    id="oxygenSaturation"
                    value={recordFormData.vitalSigns.oxygenSaturation}
                    onChange={(e) => setRecordFormData(prev => ({ 
                      ...prev, 
                      vitalSigns: { ...prev.vitalSigns, oxygenSaturation: e.target.value }
                    }))}
                    placeholder="%"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso</Label>
                  <Input
                    id="weight"
                    value={recordFormData.vitalSigns.weight}
                    onChange={(e) => setRecordFormData(prev => ({ 
                      ...prev, 
                      vitalSigns: { ...prev.vitalSigns, weight: e.target.value }
                    }))}
                    placeholder="kg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="height">Altura</Label>
                  <Input
                    id="height"
                    value={recordFormData.vitalSigns.height}
                    onChange={(e) => setRecordFormData(prev => ({ 
                      ...prev, 
                      vitalSigns: { ...prev.vitalSigns, height: e.target.value }
                    }))}
                    placeholder="cm"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnóstico *</Label>
              <Textarea
                id="diagnosis"
                value={recordFormData.diagnosis}
                onChange={(e) => setRecordFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                required
                placeholder="Describe el diagnóstico..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="treatment">Tratamiento</Label>
              <Textarea
                id="treatment"
                value={recordFormData.treatment}
                onChange={(e) => setRecordFormData(prev => ({ ...prev, treatment: e.target.value }))}
                placeholder="Describe el tratamiento recomendado..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prescriptions">Prescripciones</Label>
              <Textarea
                id="prescriptions"
                value={recordFormData.prescriptions}
                onChange={(e) => setRecordFormData(prev => ({ ...prev, prescriptions: e.target.value }))}
                placeholder="Medicamentos y dosis..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                value={recordFormData.notes}
                onChange={(e) => setRecordFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observaciones adicionales..."
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsRecordDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="medical-gradient">
                Guardar Consulta
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diagnosis Form Dialog */}
      <Dialog open={isDiagnosisDialogOpen} onOpenChange={setIsDiagnosisDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Diagnóstico Médico</DialogTitle>
            <DialogDescription>
              {selectedPatient && `Paciente: ${selectedPatient.name}`}
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <DiagnosisForm
              patientId={selectedPatient.id}
              patientName={selectedPatient.name}
              onDiagnosisAdded={() => {
                setIsDiagnosisDialogOpen(false);
                const records = localStorageService.getRecordsByPatient(selectedPatient.id);
                setPatientRecords(records);
                toast({
                  title: "Diagnóstico registrado",
                  description: "El diagnóstico se ha registrado correctamente",
                });
              }}
              onCancel={() => setIsDiagnosisDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorPatients;