import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Stethoscope, FileText, Heart, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { localStorageService, MedicalRecord } from '@/services/localStorageService';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';

interface DiagnosisFormProps {
  patientId: string;
  patientName: string;
  onDiagnosisAdded?: () => void;
  onCancel?: () => void;
}

interface DiagnosisData {
  reason: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  vitalSigns: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
    height: string;
  };
  personalHistory: string;
  familyHistory: string;
  allergies: string;
  observations: string;
  followUpDate: Date | null;
  urgency: 'low' | 'medium' | 'high';
}

const commonDiagnoses = [
  'Hipertensión arterial',
  'Diabetes mellitus tipo 2',
  'Gripe común',
  'Resfriado',
  'Dolor de cabeza',
  'Dolor abdominal',
  'Ansiedad',
  'Depresión',
  'Artritis',
  'Asma',
  'Bronquitis',
  'Gastritis',
  'Migraña',
  'Insomnio',
  'Fatiga crónica',
  'Alergia estacional',
  'Dermatitis',
  'Infección urinaria',
  'Sinusitis',
  'Otros'
];

const commonSymptoms = [
  'Dolor de cabeza',
  'Fiebre',
  'Tos',
  'Dificultad para respirar',
  'Dolor abdominal',
  'Náuseas',
  'Vómitos',
  'Diarrea',
  'Fatiga',
  'Dolor muscular',
  'Dolor articular',
  'Mareos',
  'Insomnio',
  'Ansiedad',
  'Depresión',
  'Pérdida de apetito',
  'Pérdida de peso',
  'Aumento de peso',
  'Sed excesiva',
  'Micción frecuente'
];

const commonTreatments = [
  'Reposo',
  'Hidratación',
  'Analgésicos',
  'Antibióticos',
  'Antiinflamatorios',
  'Antihistamínicos',
  'Antipiréticos',
  'Expectorantes',
  'Broncodilatadores',
  'Antihipertensivos',
  'Antidiabéticos',
  'Ansiolíticos',
  'Antidepresivos',
  'Terapia física',
  'Cambios en la dieta',
  'Ejercicio moderado',
  'Seguimiento médico',
  'Otros'
];

export function DiagnosisForm({ patientId, patientName, onDiagnosisAdded, onCancel }: DiagnosisFormProps) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const [formData, setFormData] = useState<DiagnosisData>({
    reason: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: ''
    },
    personalHistory: '',
    familyHistory: '',
    allergies: '',
    observations: '',
    followUpDate: null,
    urgency: 'medium'
  });

  const handleInputChange = (field: keyof DiagnosisData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVitalSignChange = (field: keyof DiagnosisData['vitalSigns'], value: string) => {
    setFormData(prev => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      const newRecord: Omit<MedicalRecord, 'id' | 'createdAt'> = {
        patientId,
        patientName,
        doctorId: user.id,
        doctorName: user.name,
        date: date.toISOString().split('T')[0],
        reason: formData.reason,
        symptoms: formData.symptoms,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        vitalSigns: formData.vitalSigns,
        personalHistory: formData.personalHistory,
        familyHistory: formData.familyHistory,
        allergies: formData.allergies,
        observations: formData.observations,
        followUpDate: formData.followUpDate?.toISOString().split('T')[0] || null,
        urgency: formData.urgency
      };

      localStorageService.addMedicalRecord(newRecord);

      // Add notification
      addNotification({
        userId: patientId,
        type: 'medical_record',
        title: 'Nuevo Diagnóstico Registrado',
        message: `El Dr. ${user.name} ha registrado un nuevo diagnóstico para ${patientName}`,
        isRead: false
      });

      // Reset form
      setFormData({
        reason: '',
        symptoms: '',
        diagnosis: '',
        treatment: '',
        vitalSigns: {
          bloodPressure: '',
          heartRate: '',
          temperature: '',
          weight: '',
          height: ''
        },
        personalHistory: '',
        familyHistory: '',
        allergies: '',
        observations: '',
        followUpDate: null,
        urgency: 'medium'
      });

      onDiagnosisAdded?.();
    } catch (error) {
      console.error('Error saving diagnosis:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Activity className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            Formulario de Diagnóstico Médico
          </CardTitle>
          <CardDescription>
            Registro completo de consulta médica para {patientName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Fecha de Consulta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha de Consulta</Label>
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => {
                        if (newDate) {
                          setDate(newDate);
                          setShowCalendar(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">Nivel de Urgencia</Label>
                <Select value={formData.urgency} onValueChange={(value: 'low' | 'medium' | 'high') => 
                  setFormData(prev => ({ ...prev, urgency: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Baja
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-yellow-600" />
                        Media
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        Alta
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Motivo de Consulta */}
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo de Consulta</Label>
              <Textarea
                id="reason"
                placeholder="Describe el motivo principal de la consulta..."
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                className="min-h-[80px]"
                required
              />
            </div>

            {/* Síntomas */}
            <div className="space-y-2">
              <Label htmlFor="symptoms">Síntomas Presentados</Label>
              <div className="space-y-2">
                <Textarea
                  id="symptoms"
                  placeholder="Describe los síntomas que presenta el paciente..."
                  value={formData.symptoms}
                  onChange={(e) => handleInputChange('symptoms', e.target.value)}
                  className="min-h-[80px]"
                  required
                />
                <div className="flex flex-wrap gap-2">
                  {commonSymptoms.map((symptom) => (
                    <Badge
                      key={symptom}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => {
                        const currentSymptoms = formData.symptoms;
                        const newSymptoms = currentSymptoms 
                          ? `${currentSymptoms}, ${symptom}`
                          : symptom;
                        handleInputChange('symptoms', newSymptoms);
                      }}
                    >
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Diagnóstico */}
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnóstico</Label>
              <div className="space-y-2">
                <Input
                  id="diagnosis"
                  placeholder="Ingresa el diagnóstico médico..."
                  value={formData.diagnosis}
                  onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                  required
                />
                <div className="flex flex-wrap gap-2">
                  {commonDiagnoses.map((diagnosis) => (
                    <Badge
                      key={diagnosis}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleInputChange('diagnosis', diagnosis)}
                    >
                      {diagnosis}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Tratamiento */}
            <div className="space-y-2">
              <Label htmlFor="treatment">Tratamiento Prescrito</Label>
              <div className="space-y-2">
                <Textarea
                  id="treatment"
                  placeholder="Describe el tratamiento recomendado..."
                  value={formData.treatment}
                  onChange={(e) => handleInputChange('treatment', e.target.value)}
                  className="min-h-[80px]"
                  required
                />
                <div className="flex flex-wrap gap-2">
                  {commonTreatments.map((treatment) => (
                    <Badge
                      key={treatment}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => {
                        const currentTreatment = formData.treatment;
                        const newTreatment = currentTreatment 
                          ? `${currentTreatment}, ${treatment}`
                          : treatment;
                        handleInputChange('treatment', newTreatment);
                      }}
                    >
                      {treatment}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Signos Vitales */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold">Signos Vitales</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodPressure">Presión Arterial</Label>
                  <Input
                    id="bloodPressure"
                    placeholder="120/80"
                    value={formData.vitalSigns.bloodPressure}
                    onChange={(e) => handleVitalSignChange('bloodPressure', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heartRate">Frecuencia Cardíaca</Label>
                  <Input
                    id="heartRate"
                    placeholder="72 bpm"
                    value={formData.vitalSigns.heartRate}
                    onChange={(e) => handleVitalSignChange('heartRate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperatura</Label>
                  <Input
                    id="temperature"
                    placeholder="36.5°C"
                    value={formData.vitalSigns.temperature}
                    onChange={(e) => handleVitalSignChange('temperature', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso</Label>
                  <Input
                    id="weight"
                    placeholder="70 kg"
                    value={formData.vitalSigns.weight}
                    onChange={(e) => handleVitalSignChange('weight', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Estatura</Label>
                  <Input
                    id="height"
                    placeholder="170 cm"
                    value={formData.vitalSigns.height}
                    onChange={(e) => handleVitalSignChange('height', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Antecedentes */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Antecedentes</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="personalHistory">Antecedentes Personales</Label>
                  <Textarea
                    id="personalHistory"
                    placeholder="Enfermedades previas, cirugías, etc..."
                    value={formData.personalHistory}
                    onChange={(e) => handleInputChange('personalHistory', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="familyHistory">Antecedentes Familiares</Label>
                  <Textarea
                    id="familyHistory"
                    placeholder="Enfermedades hereditarias, etc..."
                    value={formData.familyHistory}
                    onChange={(e) => handleInputChange('familyHistory', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Alergias Conocidas</Label>
                <Input
                  id="allergies"
                  placeholder="Medicamentos, alimentos, etc..."
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Observaciones y Seguimiento */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="observations">Observaciones Adicionales</Label>
                <Textarea
                  id="observations"
                  placeholder="Observaciones importantes, recomendaciones, etc..."
                  value={formData.observations}
                  onChange={(e) => handleInputChange('observations', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="followUp">Fecha de Seguimiento (Opcional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.followUpDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.followUpDate ? format(formData.followUpDate, "PPP", { locale: es }) : "Seleccionar fecha de seguimiento"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.followUpDate || undefined}
                      onSelect={(newDate) => {
                        setFormData(prev => ({ ...prev, followUpDate: newDate || null }));
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-end gap-4 pt-6">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="medical-gradient"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Diagnóstico'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
