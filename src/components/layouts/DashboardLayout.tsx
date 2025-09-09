import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MedicalSidebar } from '@/components/medical/Sidebar';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is accessing correct role area
  const currentPath = location.pathname;
  const userRoleArea = `/${user.role}`;
  
  if (!currentPath.startsWith(userRoleArea) && currentPath !== '/') {
    return <Navigate to={userRoleArea} replace />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <MedicalSidebar />
        <SidebarInset>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;