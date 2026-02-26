import { useApp } from '../context/AppContext';
import { CheckCircle, XCircle } from 'lucide-react';

export default function Notification() {
  const { notification } = useApp();
  if (!notification) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-4 text-white shadow-lg animate-in slide-in-from-top-2 transition-all duration-300 ${
        notification.type === 'success'
          ? 'bg-teal-600'
          : 'bg-red-600'
      }`}
    >
      {notification.type === 'success' ? (
        <CheckCircle className="h-5 w-5" />
      ) : (
        <XCircle className="h-5 w-5" />
      )}
      <span className="font-medium">{notification.message}</span>
    </div>
  );
}
