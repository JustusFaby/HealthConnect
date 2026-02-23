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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-sm text-gray-500">Manage your clinic operations</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Stethoscope className="h-16 w-16" />}
          value={doctors.length}
          label="Doctors"
          color="from-primary-500 to-primary-700"
        />
        <StatCard
          icon={<Users className="h-16 w-16" />}
          value={patients.length}
          label="Active Patients"
          color="from-emerald-500 to-emerald-700"
        />
        <StatCard
          icon={<CalendarCheck className="h-16 w-16" />}
          value={appointments.length}
          label="Total Appointments"
          color="from-violet-500 to-purple-700"
        />
      </div>

      {/* Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add Doctor */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Plus className="h-5 w-5 text-primary-500" /> Add New Doctor
          </h3>
          <div className="space-y-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition"
            />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username (optional)"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition"
            />
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Specialization (e.g. Cardiology)"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Initial Password"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition"
            />
            <button
              onClick={handleAdd}
              disabled={busy}
              className="w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-3 text-sm font-semibold text-white shadow hover:shadow-lg transition-all disabled:opacity-50"
            >
              {busy ? 'Adding…' : 'Add Doctor'}
            </button>
          </div>
        </div>

        {/* Doctors list */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <UserCheck className="h-5 w-5 text-primary-500" /> Manage Doctors
          </h3>
          {doctors.length === 0 ? (
            <p className="text-sm text-gray-400">No doctors added yet</p>
          ) : (
            <ul className="max-h-80 space-y-3 overflow-y-auto">
              {doctors.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-500">
                      {t.subject} · {t.email}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteDoctor(t.id)}
                    className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Patients list */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Users className="h-5 w-5 text-emerald-500" /> Active Patients
          </h3>
          {patients.length === 0 ? (
            <p className="text-sm text-gray-400">No active patients</p>
          ) : (
            <ul className="max-h-80 space-y-3 overflow-y-auto">
              {patients.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.email}</p>
                  </div>
                  <button
                    onClick={() => deletePatient(s.id)}
                    className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
