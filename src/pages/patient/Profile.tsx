import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { localStorageService } from '@/services/localStorageService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const PatientProfile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cedula: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    dateOfBirth: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        cedula: user.cedula || '',
        address: user.address || '',
        emergencyContact: user.emergencyContact || '',
        emergencyPhone: user.emergencyPhone || '',
        dateOfBirth: user.dateOfBirth || '',
        notes: user.notes || ''
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update user data in localStorage
      const updatedUser = {
        ...user,
        ...formData,
        updatedAt: new Date().toISOString()
      };
      
      localStorageService.updateUser(updatedUser);
      updateUser(updatedUser);
      
      toast({
        title: "Perfil actualizado",
        description: "Tu información personal ha sido actualizada correctamente.",
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        cedula: user.cedula || '',
        address: user.address || '',
        emergencyContact: user.emergencyContact || '',
        emergencyPhone: user.emergencyPhone || '',
        dateOfBirth: user.dateOfBirth || '',
        notes: user.notes || ''
      });
    }
    setIsEditing(false);
  };

  const getPatientStats = () => {
    if (!user) return [];
    
    const appointments = localStorageService.getAppointmentsByPatient(user.id);
    const records = localStorageService.getRecordsByPatient(user.id);
    const certificates = localStorageService.getCertificatesByPatient(user.id);
    
    return [
      {
        title: 'Citas Médicas',
        value: appointments.length.toString(),
        description: 'Total de citas',
        icon: Calendar,
        color: 'text-blue-600'
      },
      {
        title: 'Consultas',
        value: records.length.toString(),
        description: 'Historial médico',
        icon: User,
        color: 'text-green-600'
      },
      {
        title: 'Certificados',
        value: certificates.length.toString(),
        description: 'Documentos médicos',
        icon: User,
        color: 'text-purple-600'
      }
    ];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mi Perfil</h1>
          <p className="text-muted-foreground">
            Gestiona tu información personal y de contacto
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button 
                onClick={handleSave} 
                disabled={loading}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button 
                onClick={handleCancel} 
                variant="outline" 
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)} 
              size="sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {getPatientStats().map((stat) => (
          <Card key={stat.title} className="medical-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
            <CardDescription>
              Datos básicos y de identificación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre Completo</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Tu nombre completo"
                  />
                ) : (
                  <p className="text-sm mt-1">{user?.name || 'No especificado'}</p>
                )}
              </div>
              <div>
                <Label htmlFor="cedula">Cédula</Label>
                {isEditing ? (
                  <Input
                    id="cedula"
                    value={formData.cedula}
                    onChange={(e) => handleInputChange('cedula', e.target.value)}
                    placeholder="Número de cédula"
                  />
                ) : (
                  <p className="text-sm mt-1">{user?.cedula || 'No especificada'}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
              {isEditing ? (
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              ) : (
                <p className="text-sm mt-1">
                  {user?.dateOfBirth 
                    ? new Date(user.dateOfBirth).toLocaleDateString('es-ES')
                    : 'No especificada'
                  }
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
              {isEditing ? (
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Tu dirección completa"
                  rows={3}
                />
              ) : (
                <p className="text-sm mt-1">{user?.address || 'No especificada'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Información de Contacto
            </CardTitle>
            <CardDescription>
              Datos para comunicación y emergencias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="tu@email.com"
                />
              ) : (
                <p className="text-sm mt-1">{user?.email || 'No especificado'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Número de teléfono"
                />
              ) : (
                <p className="text-sm mt-1">{user?.phone || 'No especificado'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
              {isEditing ? (
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="Nombre del contacto de emergencia"
                />
              ) : (
                <p className="text-sm mt-1">{user?.emergencyContact || 'No especificado'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
              {isEditing ? (
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  placeholder="Teléfono del contacto de emergencia"
                />
              ) : (
                <p className="text-sm mt-1">{user?.emergencyPhone || 'No especificado'}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Notes */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Notas Adicionales
          </CardTitle>
          <CardDescription>
            Información médica adicional o comentarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Alergias, medicamentos, condiciones especiales, etc."
              rows={4}
            />
          ) : (
            <p className="text-sm">
              {user?.notes || 'No hay notas adicionales registradas'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información de Cuenta
          </CardTitle>
          <CardDescription>
            Datos del sistema y actividad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Rol</Label>
              <p className="text-sm mt-1 capitalize">{user?.role}</p>
            </div>
            <div>
              <Label>ID de Usuario</Label>
              <p className="text-sm mt-1 font-mono">{user?.id}</p>
            </div>
            <div>
              <Label>Cuenta creada</Label>
              <p className="text-sm mt-1">
                {user?.createdAt 
                  ? new Date(user.createdAt).toLocaleDateString('es-ES')
                  : 'No disponible'
                }
              </p>
            </div>
            <div>
              <Label>Última actualización</Label>
              <p className="text-sm mt-1">
                {user?.updatedAt 
                  ? new Date(user.updatedAt).toLocaleDateString('es-ES')
                  : 'No disponible'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientProfile;
