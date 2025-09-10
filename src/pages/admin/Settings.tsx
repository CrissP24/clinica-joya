import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Building, User, Bell, Shield, Database, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Clinic settings
  const [clinicSettings, setClinicSettings] = useState({
    name: 'MediClinic - Consultorio Hoppe',
    doctorName: 'Dr. Candy Maribel Hoppe Castro',
    phone: '+593 99 715 8494',
    email: 'dracandyhoppe@gmail.com',
    address: 'Dirección del consultorio',
    license: 'Licencia médica',
    ruc: 'RUC del consultorio'
  });

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    certificateExpiry: 30,
    maxAppointmentsPerDay: 20,
    workingHoursStart: '08:00',
    workingHoursEnd: '17:00'
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 30,
    passwordPolicy: 'medium',
    twoFactorAuth: false,
    loginAttempts: 5,
    dataRetention: 365
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    // Load settings from localStorage or use defaults
    const savedClinicSettings = localStorage.getItem('clinic_settings');
    const savedSystemSettings = localStorage.getItem('system_settings');
    const savedSecuritySettings = localStorage.getItem('security_settings');

    if (savedClinicSettings) {
      setClinicSettings(JSON.parse(savedClinicSettings));
    }
    if (savedSystemSettings) {
      setSystemSettings(JSON.parse(savedSystemSettings));
    }
    if (savedSecuritySettings) {
      setSecuritySettings(JSON.parse(savedSecuritySettings));
    }
  };

  const saveSettings = (type: 'clinic' | 'system' | 'security') => {
    try {
      switch (type) {
        case 'clinic':
          localStorage.setItem('clinic_settings', JSON.stringify(clinicSettings));
          break;
        case 'system':
          localStorage.setItem('system_settings', JSON.stringify(systemSettings));
          break;
        case 'security':
          localStorage.setItem('security_settings', JSON.stringify(securitySettings));
          break;
      }
      
      toast({
        title: "Configuración guardada",
        description: `La configuración de ${type === 'clinic' ? 'clínica' : type === 'system' ? 'sistema' : 'seguridad'} ha sido guardada correctamente.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const resetToDefaults = (type: 'clinic' | 'system' | 'security') => {
    if (confirm('¿Estás seguro de que quieres restaurar la configuración por defecto?')) {
      switch (type) {
        case 'clinic':
          setClinicSettings({
            name: 'MediClinic - Consultorio Hoppe',
            doctorName: 'Dr. Candy Maribel Hoppe Castro',
            phone: '+593 99 715 8494',
            email: 'dracandyhoppe@gmail.com',
            address: 'Dirección del consultorio',
            license: 'Licencia médica',
            ruc: 'RUC del consultorio'
          });
          break;
        case 'system':
          setSystemSettings({
            autoBackup: true,
            emailNotifications: true,
            smsNotifications: false,
            appointmentReminders: true,
            certificateExpiry: 30,
            maxAppointmentsPerDay: 20,
            workingHoursStart: '08:00',
            workingHoursEnd: '17:00'
          });
          break;
        case 'security':
          setSecuritySettings({
            sessionTimeout: 30,
            passwordPolicy: 'medium',
            twoFactorAuth: false,
            loginAttempts: 5,
            dataRetention: 365
          });
          break;
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
          <p className="text-muted-foreground">
            Administra la configuración general del sistema médico
          </p>
        </div>
      </div>

      <Tabs defaultValue="clinic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clinic" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Clínica
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        {/* Clinic Settings */}
        <TabsContent value="clinic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Información de la Clínica
              </CardTitle>
              <CardDescription>
                Configura la información básica de la clínica y el consultorio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clinic-name">Nombre de la Clínica</Label>
                  <Input
                    id="clinic-name"
                    value={clinicSettings.name}
                    onChange={(e) => setClinicSettings({ ...clinicSettings, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="doctor-name">Nombre del Doctor Principal</Label>
                  <Input
                    id="doctor-name"
                    value={clinicSettings.doctorName}
                    onChange={(e) => setClinicSettings({ ...clinicSettings, doctorName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="clinic-phone">Teléfono</Label>
                  <Input
                    id="clinic-phone"
                    value={clinicSettings.phone}
                    onChange={(e) => setClinicSettings({ ...clinicSettings, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="clinic-email">Email</Label>
                  <Input
                    id="clinic-email"
                    type="email"
                    value={clinicSettings.email}
                    onChange={(e) => setClinicSettings({ ...clinicSettings, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="clinic-license">Licencia Médica</Label>
                  <Input
                    id="clinic-license"
                    value={clinicSettings.license}
                    onChange={(e) => setClinicSettings({ ...clinicSettings, license: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="clinic-ruc">RUC</Label>
                  <Input
                    id="clinic-ruc"
                    value={clinicSettings.ruc}
                    onChange={(e) => setClinicSettings({ ...clinicSettings, ruc: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="clinic-address">Dirección</Label>
                <Textarea
                  id="clinic-address"
                  value={clinicSettings.address}
                  onChange={(e) => setClinicSettings({ ...clinicSettings, address: e.target.value })}
                  placeholder="Dirección completa del consultorio..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => saveSettings('clinic')}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Configuración
                </Button>
                <Button variant="outline" onClick={() => resetToDefaults('clinic')}>
                  Restaurar por Defecto
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración del Sistema
              </CardTitle>
              <CardDescription>
                Ajusta el comportamiento general del sistema médico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notifications */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notificaciones
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-backup">Respaldo Automático</Label>
                      <p className="text-sm text-muted-foreground">
                        Crear respaldos automáticos de los datos
                      </p>
                    </div>
                    <Switch
                      id="auto-backup"
                      checked={systemSettings.autoBackup}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, autoBackup: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Notificaciones por Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar notificaciones por correo electrónico
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={systemSettings.emailNotifications}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, emailNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms-notifications">Notificaciones por SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar notificaciones por mensaje de texto
                      </p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={systemSettings.smsNotifications}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, smsNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="appointment-reminders">Recordatorios de Citas</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar recordatorios automáticos de citas
                      </p>
                    </div>
                    <Switch
                      id="appointment-reminders"
                      checked={systemSettings.appointmentReminders}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, appointmentReminders: checked })}
                    />
                  </div>
                </div>
              </div>

              {/* Appointments */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Configuración de Citas</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max-appointments">Máximo de Citas por Día</Label>
                    <Input
                      id="max-appointments"
                      type="number"
                      value={systemSettings.maxAppointmentsPerDay}
                      onChange={(e) => setSystemSettings({ ...systemSettings, maxAppointmentsPerDay: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="certificate-expiry">Días de Validez de Certificados</Label>
                    <Input
                      id="certificate-expiry"
                      type="number"
                      value={systemSettings.certificateExpiry}
                      onChange={(e) => setSystemSettings({ ...systemSettings, certificateExpiry: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="work-start">Hora de Inicio</Label>
                    <Input
                      id="work-start"
                      type="time"
                      value={systemSettings.workingHoursStart}
                      onChange={(e) => setSystemSettings({ ...systemSettings, workingHoursStart: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="work-end">Hora de Fin</Label>
                    <Input
                      id="work-end"
                      type="time"
                      value={systemSettings.workingHoursEnd}
                      onChange={(e) => setSystemSettings({ ...systemSettings, workingHoursEnd: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => saveSettings('system')}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Configuración
                </Button>
                <Button variant="outline" onClick={() => resetToDefaults('system')}>
                  Restaurar por Defecto
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configuración de Seguridad
              </CardTitle>
              <CardDescription>
                Configura las políticas de seguridad y privacidad del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="session-timeout">Tiempo de Sesión (minutos)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-attempts">Intentos de Login Máximos</Label>
                    <Input
                      id="login-attempts"
                      type="number"
                      value={securitySettings.loginAttempts}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, loginAttempts: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="data-retention">Retención de Datos (días)</Label>
                    <Input
                      id="data-retention"
                      type="number"
                      value={securitySettings.dataRetention}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, dataRetention: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password-policy">Política de Contraseñas</Label>
                    <select
                      id="password-policy"
                      value={securitySettings.passwordPolicy}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, passwordPolicy: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor">Autenticación de Dos Factores</Label>
                    <p className="text-sm text-muted-foreground">
                      Requerir verificación adicional para el login
                    </p>
                  </div>
                  <Switch
                    id="two-factor"
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => saveSettings('security')}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Configuración
                </Button>
                <Button variant="outline" onClick={() => resetToDefaults('security')}>
                  Restaurar por Defecto
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
