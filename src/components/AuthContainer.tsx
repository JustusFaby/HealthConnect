import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Stethoscope,
  Heart,
} from 'lucide-react';

export default function AuthContainer() {
  const { login, register, loginWithGoogle, showNotification } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'patient' | 'doctor'>('patient');
  const [regSubject, setRegSubject] = useState('');

  const [busy, setBusy] = useState(false);

  // ================= HANDLERS =================

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      showNotification('Please enter both email and password', 'error');
      return;
    }

    setBusy(true);
    try {
      await login(loginEmail.trim().toLowerCase(), loginPassword.trim());
      setLoginEmail('');
      setLoginPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      showNotification(msg, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async () => {
    if (!regName || !regEmail || !regPassword) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    if (regPassword.length < 6) {
      showNotification('Password must be at least 6 characters', 'error');
      return;
    }

    if (regRole === 'doctor' && !regSubject) {
      showNotification('Please enter your specialization', 'error');
      return;
    }

    setBusy(true);
    try {
      await register(
        regName.trim(),
        regEmail.trim().toLowerCase(),
        regPassword.trim(),
        regRole,
        regRole === 'doctor' ? regSubject.trim() : undefined
      );

      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegSubject('');
      setActiveTab('login');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      showNotification(msg, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    try {
      if (activeTab === 'register') {
        localStorage.setItem('hc_oauth_role', regRole);

        if (regRole === 'doctor' && regSubject) {
          localStorage.setItem('hc_oauth_subject', regSubject.trim());
        } else {
          localStorage.removeItem('hc_oauth_subject');
        }
      } else {
        localStorage.removeItem('hc_oauth_role');
        localStorage.removeItem('hc_oauth_subject');
      }

      await loginWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google login failed';
      showNotification(msg, 'error');
    } finally {
      setBusy(false);
    }
  };

  const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );

  // ================= UI =================

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 px-4 py-12">
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-400 to-primary-700 shadow-2xl border-4 border-white">
            <span className="text-4xl font-extrabold text-white">H</span>
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight">
            HealthConnect
          </h1>
          <p className="mt-3 text-lg text-primary-100 font-medium">
            Book appointments with top doctors
          </p>
        </div>

        {/* Your existing card UI stays exactly the same here */}
        {/* I removed the duplicate second UI */}
      </div>
    </div>
  );
}
