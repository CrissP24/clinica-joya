import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/dashboards/AdminDashboard";
import DoctorDashboard from "@/pages/dashboards/DoctorDashboard";
import PatientDashboard from "@/pages/dashboards/PatientDashboard";
import UsersManagement from "@/pages/admin/Users";
import AdminPatients from "@/pages/admin/Patients";
import AdminAppointments from "@/pages/admin/Appointments";
import AdminRecords from "@/pages/admin/Records";
import AdminCertificates from "@/pages/admin/Certificates";
import AdminReports from "@/pages/admin/Reports";
import AdminSettings from "@/pages/admin/Settings";
import DoctorPatients from "@/pages/doctor/Patients";
import DoctorAppointments from "@/pages/doctor/Appointments";
import DoctorRecords from "@/pages/doctor/Records";
import DoctorCertificates from "@/pages/doctor/Certificates";
import DoctorSchedule from "@/pages/doctor/Schedule";
import PatientHistory from "@/pages/patient/History";
import PatientAppointments from "@/pages/patient/Appointments";
import PatientCertificates from "@/pages/patient/Certificates";
import PatientProfile from "@/pages/patient/Profile";
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
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              {/* Admin Routes */}
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
              
              <Route path="/admin/patients" element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <AdminPatients />
                    </DashboardLayout>
                  </RoleRoute>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/appointments" element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <AdminAppointments />
                    </DashboardLayout>
                  </RoleRoute>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/records" element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <AdminRecords />
                    </DashboardLayout>
                  </RoleRoute>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/certificates" element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <AdminCertificates />
                    </DashboardLayout>
                  </RoleRoute>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/reports" element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <AdminReports />
                    </DashboardLayout>
                  </RoleRoute>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/settings" element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <AdminSettings />
                    </DashboardLayout>
                  </RoleRoute>
                </ProtectedRoute>
              } />
              
              {/* Doctor Routes */}
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
              
              <Route path="/doctor/records" element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['doctor']}>
                    <DashboardLayout>
                      <DoctorRecords />
                    </DashboardLayout>
                  </RoleRoute>
                </ProtectedRoute>
              } />
              
              <Route path="/doctor/certificates" element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['doctor']}>
                    <DashboardLayout>
                      <DoctorCertificates />
                    </DashboardLayout>
                  </RoleRoute>
                </ProtectedRoute>
              } />
              
              <Route path="/doctor/schedule" element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['doctor']}>
                    <DashboardLayout>
                      <DoctorSchedule />
                    </DashboardLayout>
                  </RoleRoute>
                </ProtectedRoute>
              } />
              
              {/* Patient Routes */}
              <Route path="/patient" element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['patient']}>
                    <DashboardLayout>
                      <PatientDashboard />
                    </DashboardLayout>
                  </RoleRoute>
                </ProtectedRoute>
              } />
              
              <Route path="/patient/history" element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['patient']}>
                    <DashboardLayout>
                      <PatientHistory />
                    </DashboardLayout>
                  </RoleRoute>
                </ProtectedRoute>
              } />
              
              <Route path="/patient/appointments" element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['patient']}>
                    <DashboardLayout>
                      <PatientAppointments />
                    </DashboardLayout>
                  </RoleRoute>
                </ProtectedRoute>
              } />
              
              <Route path="/patient/certificates" element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['patient']}>
                    <DashboardLayout>
                      <PatientCertificates />
                    </DashboardLayout>
                  </RoleRoute>
                </ProtectedRoute>
              } />
              
              <Route path="/patient/profile" element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['patient']}>
                    <DashboardLayout>
                      <PatientProfile />
                    </DashboardLayout>
                  </RoleRoute>
                </ProtectedRoute>
              } />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;