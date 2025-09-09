import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  UserCheck,
  Heart,
  ClipboardList,
  Activity,
  LogOut,
  Stethoscope
} from 'lucide-react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const menuItems = {
  admin: [
    { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
    { title: 'Usuarios', url: '/admin/users', icon: Users },
    { title: 'Citas Médicas', url: '/admin/appointments', icon: Calendar },
    { title: 'Reportes', url: '/admin/reports', icon: FileText },
    { title: 'Configuración', url: '/admin/settings', icon: Settings },
  ],
  doctor: [
    { title: 'Dashboard', url: '/doctor', icon: LayoutDashboard },
    { title: 'Mis Pacientes', url: '/doctor/patients', icon: Users },
    { title: 'Citas Médicas', url: '/doctor/appointments', icon: Calendar },
    { title: 'Historiales', url: '/doctor/records', icon: ClipboardList },
    { title: 'Certificados', url: '/doctor/certificates', icon: FileText },
    { title: 'Agenda', url: '/doctor/schedule', icon: Activity },
  ],
  patient: [
    { title: 'Dashboard', url: '/patient', icon: LayoutDashboard },
    { title: 'Mi Historia', url: '/patient/history', icon: Heart },
    { title: 'Mis Citas', url: '/patient/appointments', icon: Calendar },
    { title: 'Certificados', url: '/patient/certificates', icon: FileText },
    { title: 'Perfil', url: '/patient/profile', icon: UserCheck },
  ]
};

export function MedicalSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;

  if (!user) return null;

  const isCollapsed = state === "collapsed";
  const items = menuItems[user.role as UserRole] || [];

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium medical-shadow" 
      : "hover:bg-secondary medical-transition";

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />
      
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
            <Stethoscope className="h-6 w-6 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-sm">MediClinic</h2>
              <p className="text-xs text-muted-foreground">
                {user.role === 'admin' ? 'Administrador' : 
                 user.role === 'doctor' ? 'Doctor' : 'Paciente'}
              </p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {user.role === 'admin' ? 'Administración' :
             user.role === 'doctor' ? 'Área Médica' : 'Mi Área'}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <div className="mt-auto p-4">
          <Button 
            variant="outline" 
            onClick={logout} 
            className="w-full medical-transition"
            size={isCollapsed ? "icon" : "default"}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Cerrar Sesión</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}