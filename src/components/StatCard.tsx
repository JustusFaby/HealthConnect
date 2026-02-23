import { type ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  value: number;
  label: string;
  color?: string;
}

export default function StatCard({
  icon,
  value,
  label,
  color = 'from-primary-500 to-primary-700',
}: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-6 text-white shadow-lg`}
    >
      <div className="absolute -right-2 -top-2 opacity-10">{icon}</div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm font-medium opacity-90">{label}</p>
    </div>
  );
}
