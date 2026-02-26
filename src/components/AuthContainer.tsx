import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Mail,
  Lock,
  User,
  Stethoscope,
  Heart,
  Activity,
  Shield,
  Clock,
  ChevronRight,
} from 'lucide-react';

export default function AuthContainer() {
  const { login, register, showNotification } = useApp();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'patient' | 'doctor'>('patient');
  const [regSubject, setRegSubject] = useState('');

  const [busy, setBusy] = useState(false);

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

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        {/* Accent circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xl font-semibold tracking-tight">HealthConnect</span>
          </div>
          
          {/* Main content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white leading-tight">
                Healthcare made
                <br />
                <span className="text-teal-400">simple.</span>
              </h1>
              <p className="mt-4 text-slate-400 text-lg max-w-md">
                Connect with qualified doctors, book appointments instantly, and manage your health journey all in one place.
              </p>
            </div>
            
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Instant Booking</p>
                  <p className="text-slate-500 text-sm">Book appointments in seconds</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Verified Doctors</p>
                  <p className="text-slate-500 text-sm">All practitioners are certified</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <p className="text-slate-600 text-sm">
            Trusted by 10,000+ patients worldwide
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-slate-900 text-xl font-semibold tracking-tight">HealthConnect</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              {activeTab === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="mt-2 text-slate-500">
              {activeTab === 'login' 
                ? 'Enter your credentials to access your account' 
                : 'Fill in your details to get started'}
            </p>
          </div>

          {/* Tab switch */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-8">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign up
            </button>
          </div>

          {activeTab === 'login' ? (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={busy}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {busy ? 'Signing in...' : 'Sign in'}
                {!busy && <ChevronRight className="w-4 h-4" />}
              </button>

              <p className="text-center text-xs text-slate-400 pt-2">
                Demo account: <span className="text-slate-600">admin@admin.com / admin123</span>
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Role selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">I want to join as</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegRole('patient')}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      regRole === 'patient'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${regRole === 'patient' ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span className={`text-sm font-medium ${regRole === 'patient' ? 'text-teal-700' : 'text-slate-600'}`}>Patient</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('doctor')}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      regRole === 'doctor'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Stethoscope className={`w-5 h-5 ${regRole === 'doctor' ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span className={`text-sm font-medium ${regRole === 'doctor' ? 'text-teal-700' : 'text-slate-600'}`}>Doctor</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                  />
                </div>
              </div>

              {regRole === 'doctor' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Specialization</label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={regSubject}
                      onChange={(e) => setRegSubject(e.target.value)}
                      placeholder="e.g. Cardiology, Dermatology"
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={handleRegister}
                disabled={busy}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {busy ? 'Creating account...' : `Create ${regRole} account`}
                {!busy && <ChevronRight className="w-4 h-4" />}
              </button>

              <p className="text-center text-xs text-slate-400">
                By signing up, you agree to our Terms of Service
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
