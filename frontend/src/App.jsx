import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public & Auth Pages
import { LandingPage } from './pages/landing/LandingPage';
import { DoctorsDirectoryPage } from './pages/doctors/DoctorsDirectoryPage';
import { DoctorProfilePage } from './pages/doctors/DoctorProfilePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';

// Portal & Dashboard Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PatientAppointments } from './pages/patient/PatientAppointments';
import { PatientProfile } from './pages/patient/PatientProfile';
import { PatientDocuments } from './pages/patient/PatientDocuments';

// Doctor & Admin Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorSchedule } from './pages/doctor/DoctorSchedule';
import { DoctorPatients } from './pages/doctor/DoctorPatients';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminDoctors } from './pages/admin/AdminDoctors';
import { AdminAppointments } from './pages/admin/AdminAppointments';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Directory */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          {/* Authentication Routes - Modern Split-Screen */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/register" element={<Navigate to="/auth/register" replace />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Unified Medicare Dashboard & Portal */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<PatientDashboard />} />
            <Route path="/doctors" element={<DoctorsDirectoryPage />} />
            <Route path="/doctors/:id" element={<DoctorProfilePage />} />
            <Route path="/appointments" element={<PatientAppointments />} />
            <Route path="/profile" element={<PatientProfile />} />
            <Route path="/documents" element={<PatientDocuments />} />

            {/* Role-specific Aliases */}
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/appointments" element={<PatientAppointments />} />
            <Route path="/patient/profile" element={<PatientProfile />} />
            <Route path="/patient/documents" element={<PatientDocuments />} />

            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/schedule" element={<DoctorSchedule />} />
            <Route path="/doctor/patients" element={<DoctorPatients />} />

            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/doctors" element={<AdminDoctors />} />
            <Route path="/admin/appointments" element={<AdminAppointments />} />
          </Route>

          {/* Fallback to Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
