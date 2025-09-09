import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/dashboards/AdminDashboard";
import DoctorDashboard from "@/pages/dashboards/DoctorDashboard";
import PatientDashboard from "@/pages/dashboards/PatientDashboard";
import UsersManagement from "@/pages/admin/Users";
import DoctorPatients from "@/pages/doctor/Patients";
import DoctorAppointments from "@/pages/doctor/Appointments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Role-based Route Component
const RoleRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const { user } = useAuth();
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user?.role || 'login'}`} replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Dashboard Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <AdminDashboard />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <UsersManagement />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/doctor" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['doctor']}>
                  <DashboardLayout>
                    <DoctorDashboard />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/doctor/patients" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['doctor']}>
                  <DashboardLayout>
                    <DoctorPatients />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/doctor/appointments" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['doctor']}>
                  <DashboardLayout>
                    <DoctorAppointments />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            } />
            
            {/* Root redirect based on user role */}
            <Route path="/" element={
              <ProtectedRoute>
                <RoleBasedRedirect />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

// Component to redirect to appropriate dashboard based on user role
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={`/${user?.role || 'login'}`} replace />;
};

export default App;
