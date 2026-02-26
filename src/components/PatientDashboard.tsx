import { useState } from 'react';
import { useApp } from '../context/AppContext';
import StatCard from './StatCard';
import Modal from './Modal';
import ChatPanel from './ChatPanel';
import type { Doctor, Slot } from '../types';
import {
  CalendarCheck,
  Stethoscope,
  LogOut,
  Calendar,
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

export default function PatientDashboard() {
  const {
    logout,
    currentUser,
    doctors,
    appointments,
    slots,
    bookAppointment,
    showNotification,
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const myAppointments = appointments.filter(
    (a) => a.patientId === currentUser?.id
  );
  const upcomingAppts = myAppointments
    .filter((a) => new Date(a.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const openBooking = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedSlot(null);
    setMessage('');
    setModalOpen(true);
  };

  const doctorSlots = (doctorId: string) =>
    slots.filter(
      (s) =>
        s.doctorId === doctorId &&
        !s.isBooked &&
        new Date(s.date) >= new Date(new Date().setHours(0, 0, 0, 0))
    );

  const handleBook = async () => {
    if (!selectedSlot || !selectedDoctor) {
      showNotification('Please select a time slot', 'error');
      return;
    }
    setBusy(true);
    try {
      await bookAppointment(selectedDoctor, selectedSlot, message);
      setModalOpen(false);
    } catch {
      showNotification('Booking failed', 'error');
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
          <h1 className="text-2xl font-bold text-slate-900">Patient Dashboard</h1>
          <p className="text-slate-500">Welcome back, {currentUser?.name}</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          <StatCard
            icon={<CalendarCheck className="h-6 w-6" />}
            value={myAppointments.length}
            label="My Appointments"
            color="bg-teal-500"
          />
          <StatCard
            icon={<Stethoscope className="h-6 w-6" />}
            value={doctors.length}
            label="Available Doctors"
            color="bg-emerald-500"
          />
        </div>

        {/* Grid */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Doctors */}
          <div className="rounded-xl bg-white border border-slate-200 p-6">
            <h3 className="mb-5 flex items-center gap-2 text-base font-semibold text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                <Stethoscope className="h-4 w-4 text-teal-600" />
              </div>
              Available Doctors
            </h3>
            {doctors.length === 0 ? (
              <p className="text-sm text-slate-400">No doctors available</p>
            ) : (
              <div className="space-y-3">
                {doctors.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold text-sm">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.subject}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => openBooking(t)}
                      className="flex items-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 px-3 py-2 text-xs font-medium text-white transition"
                    >
                      <Calendar className="h-3.5 w-3.5" /> Book
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Appointments */}
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
                  <li key={a.id} className="rounded-lg bg-slate-50 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold text-xs">
                        {a.doctorName.charAt(0)}
                      </div>
                      <p className="font-medium text-slate-900">Dr. {a.doctorName}</p>
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
        </div>

        {/* Chat */}
        <ChatPanel />
      </main>

      {/* Booking Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Book Appointment"
      >
        {selectedDoctor && (
          <div className="space-y-5">
            {/* Doctor info */}
            <div className="flex items-center gap-4 rounded-lg bg-teal-50 p-4">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-lg">
                {selectedDoctor.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  Dr. {selectedDoctor.name}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedDoctor.subject}
                </p>
              </div>
            </div>

            {/* Slots */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Available Slots
              </label>
              {doctorSlots(selectedDoctor.id).length === 0 ? (
                <p className="text-sm text-slate-400">No available slots</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {doctorSlots(selectedDoctor.id).map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-lg border-2 px-3 py-2 text-xs font-medium transition ${
                        selectedSlot?.id === slot.id
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {formatDate(slot.date)}
                      <br />
                      {formatTime(slot.time)} · {slot.duration}min
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your symptoms or reason for visit…"
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBook}
                disabled={busy || !selectedSlot}
                className="rounded-lg bg-teal-600 hover:bg-teal-700 px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50"
              >
                {busy ? 'Booking…' : 'Book Appointment'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
