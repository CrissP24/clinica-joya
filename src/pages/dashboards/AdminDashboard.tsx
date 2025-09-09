import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, FileText, Activity, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Pacientes',
      value: '1,247',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Citas Hoy',
      value: '24',
      change: '+3',
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: 'Doctores Activos',
      value: '8',
      change: '+1',
      icon: Activity,
      color: 'text-purple-600'
    },
    {
      title: 'Certificados Emitidos',
      value: '156',
      change: '+8%',
      icon: FileText,
      color: 'text-orange-600'
    }
  ];

  const recentActivities = [
    { id: 1, action: 'Nuevo paciente registrado', user: 'María González', time: '10:30 AM' },
    { id: 2, action: 'Cita completada', user: 'Dr. Rodríguez', time: '11:15 AM' },
    { id: 3, action: 'Certificado emitido', user: 'Dr. García', time: '12:00 PM' },
    { id: 4, action: 'Cita reagendada', user: 'Carlos López', time: '1:30 PM' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
        <p className="text-muted-foreground">
          Bienvenido/a, {user?.name} • {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="medical-card medical-transition hover:medical-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> desde el mes pasado
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>
              Las últimas actividades del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <div>
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.user}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resumen Estadístico
            </CardTitle>
            <CardDescription>
              Métricas clave del consultorio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Ocupación promedio</span>
                <span className="font-medium">78%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-[78%]"></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Satisfacción pacientes</span>
                <span className="font-medium">94%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-[94%]"></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Tiempo promedio consulta</span>
                <span className="font-medium">25 min</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full w-[60%]"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;