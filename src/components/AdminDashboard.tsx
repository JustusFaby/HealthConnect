import { useState } from 'react';
import { useApp } from '../context/AppContext';
import StatCard from './StatCard';
import {
  Users,
  UserCheck,
  CalendarCheck,
  LogOut,
  Plus,
  Trash2,
  Stethoscope,
  Activity,
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    logout,
    doctors,
    patients,
    appointments,
    addDoctor,
    deleteDoctor,
    deletePatient,
    showNotification,
  } = useApp();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleAdd = async () => {
    if (!name || !email || !subject || !password) {
      showNotification('Fill in name, email, specialization, and password', 'error');
      return;
    }
    if (password.length < 6) {
      showNotification('Password must be at least 6 characters', 'error');
      return;
    }
    setBusy(true);
    try {
      await addDoctor(name, username, email, subject, password);
      setName(''); setUsername(''); setEmail(''); setSubject(''); setPassword('');
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'Failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-teal-500 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-white text-lg font-semibold">HealthConnect</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500">Manage your clinic operations</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <StatCard
            icon={<Stethoscope className="h-6 w-6" />}
            value={doctors.length}
            label="Doctors"
            color="bg-teal-500"
          />
          <StatCard
            icon={<Users className="h-6 w-6" />}
            value={patients.length}
            label="Active Patients"
            color="bg-emerald-500"
          />
          <StatCard
            icon={<CalendarCheck className="h-6 w-6" />}
            value={appointments.length}
            label="Total Appointments"
            color="bg-violet-500"
          />
        </div>

        {/* Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Add Doctor */}
          <div className="rounded-xl bg-white border border-slate-200 p-6">
            <h3 className="mb-5 flex items-center gap-2 text-base font-semibold text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                <Plus className="h-4 w-4 text-teal-600" />
              </div>
              Add New Doctor
            </h3>
            <div className="space-y-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition"
              />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username (optional)"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition"
              />
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Specialization (e.g. Cardiology)"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Initial Password"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition"
              />
              <button
                onClick={handleAdd}
                disabled={busy}
                className="w-full rounded-lg bg-teal-600 hover:bg-teal-700 py-2.5 text-sm font-medium text-white transition disabled:opacity-50"
              >
                {busy ? 'Adding…' : 'Add Doctor'}
              </button>
            </div>
          </div>

          {/* Doctors list */}
          <div className="rounded-xl bg-white border border-slate-200 p-6">
            <h3 className="mb-5 flex items-center gap-2 text-base font-semibold text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-teal-600" />
              </div>
              Manage Doctors
            </h3>
            {doctors.length === 0 ? (
              <p className="text-sm text-slate-400">No doctors added yet</p>
            ) : (
              <ul className="max-h-80 space-y-3 overflow-y-auto">
                {doctors.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold text-sm">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{t.name}</p>
                        <p className="text-xs text-slate-500">
                          {t.subject} · {t.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteDoctor(t.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Patients list */}
          <div className="rounded-xl bg-white border border-slate-200 p-6 lg:col-span-2">
            <h3 className="mb-5 flex items-center gap-2 text-base font-semibold text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Users className="h-4 w-4 text-emerald-600" />
              </div>
              Active Patients
            </h3>
            {patients.length === 0 ? (
              <p className="text-sm text-slate-400">No active patients</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {patients.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold text-sm">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deletePatient(s.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
