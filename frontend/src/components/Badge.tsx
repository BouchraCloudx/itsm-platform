interface BadgeProps {
  label: string;
  variant: 'status' | 'priority';
}

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-slate-100 text-slate-600',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

export default function Badge({ label, variant }: BadgeProps) {
  const colors = variant === 'status' ? statusColors : priorityColors;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[label] || 'bg-slate-100 text-slate-600'}`}>
      {label}
    </span>
  );
}
