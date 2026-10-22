import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Protected Route Guards
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import UserProtectedRoute from './components/auth/UserProtectedRoute';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import UserLayout from './components/layout/UserLayout';

// Landing Gateway
import LandingGateway from './pages/LandingGateway';

// Separate Login Pages
import AdminLogin from './pages/auth/AdminLogin';
import UserLogin from './pages/auth/UserLogin';

// Admin (Doctor) Pages
import Dashboard from './pages/Dashboard';
import AdminPatients from './pages/admin/AdminPatients';
import AdminPatientHistory from './pages/admin/AdminPatientHistory';
import VisitWorkspace from './pages/VisitWorkspace';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// User (Receptionist) Pages
import UserPatients from './pages/user/UserPatients';

// Error Boundary Guard
import ErrorBoundary from './components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
            {/* Root: Simple landing page with links to Doctor and Receptionist portals */}
            <Route path="/" element={<LandingGateway />} />

            {/* Admin Portal (Doctor Role) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="patients" element={<AdminPatients />} />
              <Route path="patient-history" element={<AdminPatientHistory />} />
              <Route path="workspace" element={<VisitWorkspace />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* User Portal (Receptionist Role / System Controller) */}
            <Route path="/user/login" element={<UserLogin />} />
            <Route
              path="/user"
              element={
                <UserProtectedRoute>
                  <UserLayout />
                </UserProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/user/workspace" replace />} />
              <Route path="workspace" element={<VisitWorkspace />} />
              <Route path="dashboard" element={<Navigate to="/user/workspace" replace />} />
              <Route path="patients" element={<UserPatients />} />
            </Route>

            {/* Fallback to Root Landing Gateway */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}
