import { useApp } from './context/AppContext';
import Notification from './components/Notification';
import AuthContainer from './components/AuthContainer';
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import PatientDashboard from './components/PatientDashboard';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { currentRole, loading } = useApp();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-primary-50">
      <Notification />

      {!currentRole && (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 px-4 py-12">
          <AuthContainer />
        </div>
      )}

      {currentRole && (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {currentRole === 'admin' && <AdminDashboard />}
          {currentRole === 'doctor' && <DoctorDashboard />}
          {currentRole === 'patient' && <PatientDashboard />}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
