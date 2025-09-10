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
  Stethoscope,
  Bell,
  BarChart3
} from 'lucide-react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

const menuItems = {
  admin: [
    { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
    { title: 'Usuarios', url: '/admin/users', icon: Users },
    { title: 'Pacientes', url: '/admin/patients', icon: UserCheck },
    { title: 'Citas Médicas', url: '/admin/appointments', icon: Calendar },
    { title: 'Historiales', url: '/admin/records', icon: ClipboardList },
    { title: 'Certificados', url: '/admin/certificates', icon: FileText },
    { title: 'Reportes', url: '/admin/reports', icon: BarChart3 },
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
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const currentPath = location.pathname;

  if (!user) return null;

  const isCollapsed = state === "collapsed";
  const items = menuItems[user.role as UserRole] || [];

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-blue-100 text-black font-medium border-r-2 border-blue-600" 
      : "text-black hover:bg-blue-50 hover:text-blue-800 transition-colors duration-200";

  return (
    <Sidebar className={`${isCollapsed ? "w-14" : "w-60"} sidebar-visible`} collapsible="icon">
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
                Consultorio Hoppe
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
        
        <div className="mt-auto p-4 space-y-2">
          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full medical-transition relative"
                size={isCollapsed ? "icon" : "default"}
              >
                <Bell className="h-4 w-4" />
                {!isCollapsed && <span className="ml-2">Notificaciones</span>}
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Notificaciones</h4>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Marcar todas como leídas
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {notifications.length > 0 ? (
                      notifications
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 10)
                        .map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              notification.isRead 
                                ? 'bg-background hover:bg-secondary' 
                                : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                            }`}
                            onClick={() => !notification.isRead && markAsRead(notification.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-sm">{notification.title}</h5>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {new Date(notification.createdAt).toLocaleString('es-ES')}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                              )}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No tienes notificaciones</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>

          {/* Logout */}
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