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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Dashboard</h2>
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
          label="My Appointments"
          color="from-primary-500 to-primary-700"
        />
        <StatCard
          icon={<Stethoscope className="h-16 w-16" />}
          value={doctors.length}
          label="Available Doctors"
          color="from-emerald-500 to-emerald-700"
        />
      </div>

      {/* Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Doctors */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Stethoscope className="h-5 w-5 text-primary-500" /> Available
            Doctors
          </h3>
          {doctors.length === 0 ? (
            <p className="text-sm text-gray-400">No doctors available</p>
          ) : (
            <div className="space-y-4">
              {doctors.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-xl bg-gradient-to-r from-gray-50 to-white p-5 ring-1 ring-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-bold text-lg">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.subject}</p>
                      <p className="text-xs text-gray-400">{t.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openBooking(t)}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2.5 text-xs font-semibold text-white shadow hover:shadow-lg transition-all"
                  >
                    <Calendar className="h-3.5 w-3.5" /> Book
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Appointments */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <CalendarCheck className="h-5 w-5 text-violet-500" /> My
            Appointments
          </h3>
          {upcomingAppts.length === 0 ? (
            <p className="text-sm text-gray-400">No upcoming appointments</p>
          ) : (
            <ul className="max-h-96 space-y-3 overflow-y-auto">
              {upcomingAppts.map((a) => (
                <li key={a.id} className="rounded-xl bg-gray-50 p-4">
                  <p className="font-semibold text-gray-800">
                    {a.doctorName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(a.date)} · {formatTime(a.time)} · {a.duration}
                    min
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
      </div>

      {/* Chat */}
      <ChatPanel />

      {/* Booking Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Book Appointment"
      >
        {selectedDoctor && (
          <div className="space-y-5">
            {/* Doctor info */}
            <div className="flex items-center gap-4 rounded-xl bg-primary-50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-200 text-primary-700 font-bold text-lg">
                {selectedDoctor.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {selectedDoctor.name}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedDoctor.subject}
                </p>
              </div>
            </div>

            {/* Slots */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Available Slots
              </label>
              {doctorSlots(selectedDoctor.id).length === 0 ? (
                <p className="text-sm text-gray-400">No available slots</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {doctorSlots(selectedDoctor.id).map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-xl border-2 px-3 py-2 text-xs font-medium transition ${
                        selectedSlot?.id === slot.id
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
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
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your symptoms or reason for visit…"
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBook}
                disabled={busy || !selectedSlot}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:shadow-lg transition-all disabled:opacity-50"
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
