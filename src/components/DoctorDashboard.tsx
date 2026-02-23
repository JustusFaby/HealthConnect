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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h2>
          <p className="text-sm text-gray-500">
            Welcome back, {currentUser?.name}
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          icon={<CalendarCheck className="h-16 w-16" />}
          value={myAppointments.length}
          label="Total Appointments"
          color="from-primary-500 to-primary-700"
        />
        <StatCard
          icon={<Clock className="h-16 w-16" />}
          value={availableSlots.length}
          label="Available Slots"
          color="from-emerald-500 to-emerald-700"
        />
      </div>

      {/* Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Add Slot */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Plus className="h-5 w-5 text-primary-500" /> Add Time Slot
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
            <button
              onClick={handleAddSlot}
              disabled={busy}
              className="w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-3 text-sm font-semibold text-white shadow hover:shadow-lg transition-all disabled:opacity-50"
            >
              {busy ? 'Adding…' : 'Add Slot'}
            </button>
          </div>
        </div>

        {/* Appointments */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <CalendarCheck className="h-5 w-5 text-violet-500" /> My Appointments
          </h3>
          {upcomingAppts.length === 0 ? (
            <p className="text-sm text-gray-400">No upcoming appointments</p>
          ) : (
            <ul className="max-h-96 space-y-3 overflow-y-auto">
              {upcomingAppts.map((a) => (
                <li
                  key={a.id}
                  className="rounded-xl bg-gray-50 p-4"
                >
                  <p className="font-semibold text-gray-800">
                    {a.patientName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(a.date)} · {formatTime(a.time)} · {a.duration}min
                  </p>
                  {a.message && (
                    <p className="mt-1 text-xs italic text-gray-400">
                      "{a.message}"
                    </p>
                  )}
                  <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-medium text-emerald-700">
                    {a.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Slots */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Clock className="h-5 w-5 text-emerald-500" /> Available Slots
          </h3>
          {availableSlots.length === 0 ? (
            <p className="text-sm text-gray-400">No available slots</p>
          ) : (
            <ul className="max-h-96 space-y-3 overflow-y-auto">
              {availableSlots.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {formatDate(s.date)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTime(s.time)} · {s.duration}min
                    </p>
                  </div>
                  <button
                    onClick={() => deleteSlot(s.id)}
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

      {/* Chat */}
      <ChatPanel />
    </div>
  );
}
