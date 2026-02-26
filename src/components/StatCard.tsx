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
  color = 'bg-teal-500',
}: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-white border border-slate-200 p-6">
      <div className={`absolute -right-4 -top-4 opacity-10 ${color.includes('teal') ? 'text-teal-500' : color.includes('emerald') ? 'text-emerald-500' : color.includes('violet') ? 'text-violet-500' : 'text-slate-500'}`}>
        {icon}
      </div>
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${color} mb-4`}>
        <span className="text-white [&>svg]:h-6 [&>svg]:w-6">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}
