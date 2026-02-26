import { useState } from 'react';
import { useApp } from '../context/AppContext';
import StatCard from './StatCard';
import ChatPanel from './ChatPanel';
import {
  CalendarCheck,
  Clock,
  LogOut,
  Plus,
  Trash2,
  Activity,
} from 'lucide-react';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString();
}
function formatTime(t: string) {
  return new Date(`1970-01-01T${t}`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DoctorDashboard() {
  const {
    logout,
    currentUser,
    appointments,
    slots,
    addSlot,
    deleteSlot,
    showNotification,
  } = useApp();

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [busy, setBusy] = useState(false);

  const myAppointments = appointments.filter(
    (a) => a.doctorId === currentUser?.id
  );
  const mySlots = slots.filter((s) => s.doctorId === currentUser?.id);
  const availableSlots = mySlots
    .filter((s) => !s.isBooked)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const upcomingAppts = myAppointments
    .filter((a) => new Date(a.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const today = new Date().toISOString().split('T')[0];

  const handleAddSlot = async () => {
    if (!date || !time) {
      showNotification('Please fill date & time', 'error');
      return;
    }
    setBusy(true);
    try {
      await addSlot(date, time, duration);
      setDate('');
      setTime('');
    } catch {
      showNotification('Failed to add slot', 'error');
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
          <h1 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h1>
          <p className="text-slate-500">Welcome back, {currentUser?.name}</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          <StatCard
            icon={<CalendarCheck className="h-6 w-6" />}
            value={myAppointments.length}
            label="Total Appointments"
            color="bg-teal-500"
          />
          <StatCard
            icon={<Clock className="h-6 w-6" />}
            value={availableSlots.length}
            label="Available Slots"
            color="bg-emerald-500"
          />
        </div>

        {/* Grid */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {/* Add Slot */}
          <div className="rounded-xl bg-white border border-slate-200 p-6">
            <h3 className="mb-5 flex items-center gap-2 text-base font-semibold text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                <Plus className="h-4 w-4 text-teal-600" />
              </div>
              Add Time Slot
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Date
                </label>
                <input
                  type="date"
                  min={today}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              <button
                onClick={handleAddSlot}
                disabled={busy}
                className="w-full rounded-lg bg-teal-600 hover:bg-teal-700 py-2.5 text-sm font-medium text-white transition disabled:opacity-50"
              >
                {busy ? 'Adding…' : 'Add Slot'}
              </button>
            </div>
          </div>

          {/* Appointments */}
          <div className="rounded-xl bg-white border border-slate-200 p-6">
            <h3 className="mb-5 flex items-center gap-2 text-base font-semibold text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                <CalendarCheck className="h-4 w-4 text-violet-600" />
              </div>
              My Appointments
            </h3>
            {upcomingAppts.length === 0 ? (
              <p className="text-sm text-slate-400">No upcoming appointments</p>
            ) : (
              <ul className="max-h-80 space-y-3 overflow-y-auto">
                {upcomingAppts.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-lg bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold text-xs">
                        {a.patientName.charAt(0)}
                      </div>
                      <p className="font-medium text-slate-900">{a.patientName}</p>
                    </div>
                    <p className="text-xs text-slate-500">
                      {formatDate(a.date)} · {formatTime(a.time)} · {a.duration}min
                    </p>
                    {a.message && (
                      <p className="mt-2 text-xs text-slate-400 italic">
                        "{a.message}"
                      </p>
                    )}
                    <span className="mt-2 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      {a.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Slots */}
          <div className="rounded-xl bg-white border border-slate-200 p-6">
            <h3 className="mb-5 flex items-center gap-2 text-base font-semibold text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Clock className="h-4 w-4 text-emerald-600" />
              </div>
              Available Slots
            </h3>
            {availableSlots.length === 0 ? (
              <p className="text-sm text-slate-400">No available slots</p>
            ) : (
              <ul className="max-h-80 space-y-3 overflow-y-auto">
                {availableSlots.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 p-4"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {formatDate(s.date)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatTime(s.time)} · {s.duration}min
                      </p>
                    </div>
                    <button
                      onClick={() => deleteSlot(s.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Chat */}
        <ChatPanel />
      </main>
    </div>
  );
}
