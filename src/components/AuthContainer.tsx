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

  // Modern full-page background and card, with all logic above
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 px-4 py-12">
      <div className="w-full max-w-2xl mx-auto">
        {/* Logo and Title */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-400 to-primary-700 shadow-2xl border-4 border-white">
            <span className="text-4xl font-extrabold text-white drop-shadow-lg">H</span>
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">HealthConnect</h1>
          <p className="mt-3 text-lg text-primary-100 font-medium drop-shadow">Book appointments with top doctors</p>
        </div>
        {/* Card */}
        <div className="overflow-hidden rounded-3xl bg-white/90 shadow-2xl ring-1 ring-gray-200 backdrop-blur-lg">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-6 text-center text-lg font-bold transition-colors ${activeTab === 'login'
                ? 'border-b-4 border-primary-500 text-primary-700 bg-white'
                : 'text-gray-400 hover:text-primary-600 bg-gradient-to-r from-primary-50 to-white'
              }`}
            >
              <LogIn className="mx-auto mb-1 h-5 w-5" />
              Login
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-6 text-center text-lg font-bold transition-colors ${activeTab === 'register'
                ? 'border-b-4 border-primary-500 text-primary-700 bg-white'
                : 'text-gray-400 hover:text-primary-600 bg-gradient-to-r from-primary-50 to-white'
              }`}
            >
              <UserPlus className="mx-auto mb-1 h-5 w-5" />
              Register
            </button>
          </div>
          {/* Forms */}
          <div className="p-12 md:p-16">
            {activeTab === 'login' ? (
              <div className="space-y-7">
                <button
                  onClick={handleGoogle}
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-4 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition disabled:opacity-50"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-gray-400">
                      or sign in with email
                    </span>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-base font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full rounded-xl border border-gray-200 py-4 pl-12 pr-4 text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-base font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      className="w-full rounded-xl border border-gray-200 py-4 pl-12 pr-4 text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition"
                    />
                  </div>
                </div>
                <button
                  onClick={handleLogin}
                  disabled={busy}
                  className="w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-base font-semibold text-white shadow-md hover:shadow-lg hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50"
                >
                  {busy ? 'Signing in…' : 'Sign In'}
                </button>
                <p className="text-center text-xs text-gray-400">
                  Demo: admin@admin.com / admin123
                </p>
              </div>
            ) : (
              <div className="space-y-7">
                {regRole === 'patient' && (
                  <>
                    <button
                      onClick={handleGoogle}
                      disabled={busy}
                      className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-4 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      <GoogleIcon />
                      Continue with Google
                    </button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-gray-400">
                          or register with email
                        </span>
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <label className="mb-2 block text-base font-medium text-gray-700">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRegRole('patient')}
                      className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-base font-medium transition ${regRole === 'patient'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <Heart className="h-5 w-5" /> Patient
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('doctor')}
                      className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-base font-medium transition ${regRole === 'doctor'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <Stethoscope className="h-5 w-5" /> Doctor
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-base font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-gray-200 py-4 pl-12 pr-4 text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition"
                    />
                  </div>
                </div>
                {regRole === 'doctor' && (
                  <div>
                    <label className="mb-1.5 block text-base font-medium text-gray-700">
                      Specialization
                    </label>
                    <div className="relative">
                      <Stethoscope className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={regSubject}
                        onChange={(e) => setRegSubject(e.target.value)}
                        placeholder="e.g. Cardiology, Dermatology"
                        className="w-full rounded-xl border border-gray-200 py-4 pl-12 pr-4 text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-base font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full rounded-xl border border-gray-200 py-4 pl-12 pr-4 text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-base font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                      className="w-full rounded-xl border border-gray-200 py-4 pl-12 pr-4 text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition"
                    />
                  </div>
                </div>
                <button
                  onClick={handleRegister}
                  disabled={busy}
                  className="w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-base font-semibold text-white shadow-md hover:shadow-lg hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50"
                >
                  {busy ? 'Registering…' : `Register as ${regRole === 'doctor' ? 'Doctor' : 'Patient'}`}
                </button>
                <p className="text-center text-xs text-gray-400">
                  A verification email will be sent to confirm your account
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
      // Save the selected role (and subject for doctors) so routeUser
      // can read them after the OAuth redirect.
      if (activeTab === 'register') {
        localStorage.setItem('hc_oauth_role', regRole);
        if (regRole === 'doctor' && regSubject) {
          localStorage.setItem('hc_oauth_subject', regSubject.trim());
        } else {
          localStorage.removeItem('hc_oauth_subject');
        }
      } else {
        // Login tab – clear any stale registration data
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

  return (
    <div className="mx-auto max-w-md">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg">
          <span className="text-2xl font-bold text-white">H</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white">HealthConnect</h1>
        <p className="mt-2 text-sm text-gray-300">
          Book appointments with top doctors
        </p>
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-100">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-4 text-center text-sm font-semibold transition-colors ${activeTab === 'login'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            <LogIn className="mx-auto mb-1 h-4 w-4" />
            Login
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-4 text-center text-sm font-semibold transition-colors ${activeTab === 'register'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            <UserPlus className="mx-auto mb-1 h-4 w-4" />
            Register
          </button>
        </div>

        {/* Forms */}
        <div className="p-8">
          {activeTab === 'login' ? (
            <div className="space-y-5">
              {/* Google Sign In */}
              <button
                onClick={handleGoogle}
                disabled={busy}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition disabled:opacity-50"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-gray-400">
                    or sign in with email
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition"
                  />
                </div>
              </div>
              <button
                onClick={handleLogin}
                disabled={busy}
                className="w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50"
              >
                {busy ? 'Signing in…' : 'Sign In'}
              </button>
              <p className="text-center text-xs text-gray-400">
                Demo: admin@admin.com / admin123
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Google Sign Up — only for patients */}
              {regRole === 'patient' && (
                <>
                  <button
                    onClick={handleGoogle}
                    disabled={busy}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-gray-400">
                        or register with email
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Role Picker */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegRole('patient')}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${regRole === 'patient'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                  >
                    <Heart className="h-4 w-4" /> Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('doctor')}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${regRole === 'doctor'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                  >
                    <Stethoscope className="h-4 w-4" /> Doctor
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition"
                  />
                </div>
              </div>

              {regRole === 'doctor' && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Specialization
                  </label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={regSubject}
                      onChange={(e) => setRegSubject(e.target.value)}
                      placeholder="e.g. Cardiology, Dermatology"
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition"
                  />
                </div>
              </div>
              <button
                onClick={handleRegister}
                disabled={busy}
                className="w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50"
              >
                {busy ? 'Registering…' : `Register as ${regRole === 'doctor' ? 'Doctor' : 'Patient'}`}
              </button>
              <p className="text-center text-xs text-gray-400">
                A verification email will be sent to confirm your account
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
