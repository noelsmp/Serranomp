import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Login from './pages/Login';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import Rechnungen from './pages/Rechnungen';
import Dokumente from './pages/Dokumente';
import Profil from './pages/Profil';
import Datenschutz from './pages/Datenschutz';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPatienten from './pages/admin/AdminPatienten';
import AdminRechnungen from './pages/admin/AdminRechnungen';
import AdminDokumente from './pages/admin/AdminDokumente';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '12px', fontSize: '14px' },
            success: { iconTheme: { primary: '#15803d', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/datenschutz" element={<Datenschutz />} />

          {/* Patient Portal */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Navigate to="/dashboard" replace />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rechnungen"
            element={
              <ProtectedRoute>
                <Layout><Rechnungen /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dokumente"
            element={
              <ProtectedRoute>
                <Layout><Dokumente /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profil"
            element={
              <ProtectedRoute>
                <Layout><Profil /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mein-datenschutz"
            element={
              <ProtectedRoute>
                <Layout><Datenschutz /></Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Section */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout><AdminDashboard /></AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/patienten"
            element={
              <AdminRoute>
                <AdminLayout><AdminPatienten /></AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/rechnungen"
            element={
              <AdminRoute>
                <AdminLayout><AdminRechnungen /></AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/dokumente"
            element={
              <AdminRoute>
                <AdminLayout><AdminDokumente /></AdminLayout>
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
