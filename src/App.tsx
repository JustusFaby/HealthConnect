import { useApp } from './context/AppContext';
import Notification from './components/Notification';
import AuthContainer from './components/AuthContainer';
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import PatientDashboard from './components/PatientDashboard';
import { Loader2, Activity } from 'lucide-react';

function AppContent() {
  const { currentRole, loading } = useApp();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Notification />

      {!currentRole && <AuthContainer />}

      {currentRole && (
        <div className="min-h-screen">
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
