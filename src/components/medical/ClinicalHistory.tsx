import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Heart, Microscope, Plus, Download, Eye, Stethoscope } from 'lucide-react';
import { localStorageService, MedicalRecord, LaboratoryExam, Patient } from '@/services/localStorageService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DiagnosisForm } from './DiagnosisForm';

interface ClinicalHistoryProps {
  patient: Patient;
  onRecordAdded?: () => void;
}

const ClinicalHistory: React.FC<ClinicalHistoryProps> = ({ patient, onRecordAdded }) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [exams, setExams] = useState<LaboratoryExam[]>([]);
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false);
  const [isDiagnosisDialogOpen, setIsDiagnosisDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<LaboratoryExam | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const [examFormData, setExamFormData] = useState({
    examType: '',
    examName: '',
    date: new Date().toISOString().split('T')[0],
    results: '',
    notes: '',
    file: null as File | null
  });

  React.useEffect(() => {
    loadData();
  }, [patient.id]);

  const loadData = () => {
    const patientRecords = localStorageService.getRecordsByPatient(patient.id);
    const patientExams = localStorageService.getExamsByPatient(patient.id);
    setRecords(patientRecords);
    setExams(patientExams);
  };

  const handleExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      let fileData = '';
      let fileName = '';
      let fileType = '';

      if (examFormData.file) {
        fileData = await convertFileToBase64(examFormData.file);
        fileName = examFormData.file.name;
        fileType = examFormData.file.type;
      }

      localStorageService.addLaboratoryExam({
        patientId: patient.id,
        patientName: patient.name,
        doctorId: user.id,
        doctorName: user.name,
        examType: examFormData.examType,
        examName: examFormData.examName,
        date: examFormData.date,
        results: examFormData.results,
        fileData,
        fileName,
        fileType,
        notes: examFormData.notes
      });

      toast({
        title: "Examen registrado",
        description: "El examen de laboratorio se ha registrado correctamente",
      });

      setIsExamDialogOpen(false);
      resetExamForm();
      loadData();
      onRecordAdded?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al registrar el examen",
        variant: "destructive",
      });
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      };
      reader.onerror = error => reject(error);
    });
  };

  const resetExamForm = () => {
    setExamFormData({
      examType: '',
      examName: '',
      date: new Date().toISOString().split('T')[0],
      results: '',
      notes: '',
      file: null
    });
  };

  const downloadExamFile = (exam: LaboratoryExam) => {
    if (!exam.fileData || !exam.fileName) return;

    const link = document.createElement('a');
    link.href = `data:${exam.fileType};base64,${exam.fileData}`;
    link.download = exam.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'elevado': return 'bg-yellow-100 text-yellow-800';
      case 'bajo': return 'bg-blue-100 text-blue-800';
      case 'anormal': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="records" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="records" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Historial Clínico
          </TabsTrigger>
          <TabsTrigger value="exams" className="flex items-center gap-2">
            <Microscope className="h-4 w-4" />
            Exámenes de Laboratorio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Consultas Médicas</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{records.length} consultas</Badge>
              <Dialog open={isDiagnosisDialogOpen} onOpenChange={setIsDiagnosisDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="medical-gradient">
                    <Stethoscope className="h-4 w-4 mr-1" />
                    Nuevo Diagnóstico
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Registrar Diagnóstico Médico</DialogTitle>
                    <DialogDescription>
                      Paciente: {patient.name}
                    </DialogDescription>
                  </DialogHeader>
                  <DiagnosisForm
                    patientId={patient.id}
                    patientName={patient.name}
                    onDiagnosisAdded={() => {
                      setIsDiagnosisDialogOpen(false);
                      loadData();
                      onRecordAdded?.();
                      toast({
                        title: "Diagnóstico registrado",
                        description: "El diagnóstico se ha registrado correctamente",
                      });
                    }}
                    onCancel={() => setIsDiagnosisDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {records.length > 0 ? (
              records
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((record) => (
                  <Card key={record.id} className="medical-card">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{record.reason}</CardTitle>
                          <CardDescription>
                            {new Date(record.date).toLocaleDateString('es-ES')} • Dr. {record.doctorName}
                          </CardDescription>
                        </div>
                        {record.cie10Code && (
                          <Badge variant="secondary">{record.cie10Code}</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {record.symptoms && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Síntomas:</h4>
                          <p className="text-sm">{record.symptoms}</p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Diagnóstico:</h4>
                        <p className="text-sm">{record.diagnosis}</p>
                      </div>

                      {record.vitalSigns && Object.values(record.vitalSigns).some(v => v) && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Signos Vitales:</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {record.vitalSigns.bloodPressure && (
                              <span>PA: {record.vitalSigns.bloodPressure}</span>
                            )}
                            {record.vitalSigns.heartRate && (
                              <span>FC: {record.vitalSigns.heartRate} bpm</span>
                            )}
                            {record.vitalSigns.temperature && (
                              <span>Temp: {record.vitalSigns.temperature}°C</span>
                            )}
                            {record.vitalSigns.oxygenSaturation && (
                              <span>SpO2: {record.vitalSigns.oxygenSaturation}%</span>
                            )}
                            {record.vitalSigns.weight && (
                              <span>Peso: {record.vitalSigns.weight} kg</span>
                            )}
                            {record.vitalSigns.height && (
                              <span>Altura: {record.vitalSigns.height} cm</span>
                            )}
                          </div>
                        </div>
                      )}

                      {record.treatment && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Tratamiento:</h4>
                          <p className="text-sm">{record.treatment}</p>
                        </div>
                      )}

                      {record.prescriptions && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Prescripciones:</h4>
                          <p className="text-sm">{record.prescriptions}</p>
                        </div>
                      )}

                      {record.personalHistory && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Antecedentes Personales:</h4>
                          <p className="text-sm">{record.personalHistory}</p>
                        </div>
                      )}

                      {record.familyHistory && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Antecedentes Familiares:</h4>
                          <p className="text-sm">{record.familyHistory}</p>
                        </div>
                      )}

                      {record.allergies && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Alergias:</h4>
                          <p className="text-sm">{record.allergies}</p>
                        </div>
                      )}

                      {record.observations && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Observaciones:</h4>
                          <p className="text-sm">{record.observations}</p>
                        </div>
                      )}

                      {record.followUpDate && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Fecha de Seguimiento:</h4>
                          <p className="text-sm">{new Date(record.followUpDate).toLocaleDateString('es-ES')}</p>
                        </div>
                      )}

                      {record.urgency && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Nivel de Urgencia:</h4>
                          <Badge 
                            className={
                              record.urgency === 'high' ? 'bg-red-100 text-red-800' :
                              record.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }
                          >
                            {record.urgency === 'high' ? 'Alta' :
                             record.urgency === 'medium' ? 'Media' : 'Baja'}
                          </Badge>
                        </div>
                      )}

                      {record.notes && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Notas:</h4>
                          <p className="text-sm">{record.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay consultas registradas para este paciente</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Exámenes de Laboratorio</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{exams.length} exámenes</Badge>
              <Dialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="medical-gradient" onClick={resetExamForm}>
                    <Plus className="h-4 w-4 mr-1" />
                    Nuevo Examen
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Registrar Examen de Laboratorio</DialogTitle>
                    <DialogDescription>
                      Paciente: {patient.name}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleExamSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="examType">Tipo de Examen *</Label>
                        <Input
                          id="examType"
                          value={examFormData.examType}
                          onChange={(e) => setExamFormData(prev => ({ ...prev, examType: e.target.value }))}
                          placeholder="Ej: Hematología, Bioquímica, Microbiología"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="examName">Nombre del Examen *</Label>
                        <Input
                          id="examName"
                          value={examFormData.examName}
                          onChange={(e) => setExamFormData(prev => ({ ...prev, examName: e.target.value }))}
                          placeholder="Ej: Hemograma Completo, Glicemia"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="examDate">Fecha del Examen</Label>
                      <Input
                        id="examDate"
                        type="date"
                        value={examFormData.date}
                        onChange={(e) => setExamFormData(prev => ({ ...prev, date: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="results">Resultados *</Label>
                      <Textarea
                        id="results"
                        value={examFormData.results}
                        onChange={(e) => setExamFormData(prev => ({ ...prev, results: e.target.value }))}
                        placeholder="Ingresa los resultados del examen..."
                        rows={4}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="examFile">Archivo Adjunto (Opcional)</Label>
                      <Input
                        id="examFile"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => setExamFormData(prev => ({ 
                          ...prev, 
                          file: e.target.files?.[0] || null 
                        }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Formatos permitidos: PDF, JPG, PNG, DOC, DOCX
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="examNotes">Notas Adicionales</Label>
                      <Textarea
                        id="examNotes"
                        value={examFormData.notes}
                        onChange={(e) => setExamFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Observaciones adicionales..."
                        rows={2}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsExamDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="medical-gradient">
                        Registrar Examen
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {exams.length > 0 ? (
              exams
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((exam) => (
                  <Card key={exam.id} className="medical-card">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{exam.examName}</CardTitle>
                          <CardDescription>
                            {new Date(exam.date).toLocaleDateString('es-ES')} • {exam.examType}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {exam.fileName && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadExamFile(exam)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Descargar
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Resultados:</h4>
                        <div className="text-sm whitespace-pre-line bg-muted/50 p-3 rounded">
                          {exam.results}
                        </div>
                      </div>

                      {exam.notes && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Notas:</h4>
                          <p className="text-sm">{exam.notes}</p>
                        </div>
                      )}

                      {exam.fileName && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>Archivo: {exam.fileName}</span>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Dr. {exam.doctorName}
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Microscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay exámenes de laboratorio registrados</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClinicalHistory;
