import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: 'default' | 'green' | 'amber' | 'red' | 'indigo';
  icon?: React.ReactNode;
}

const colorClasses = {
  default: 'text-white',
  green: 'text-emerald-400',
  amber: 'text-amber-400',
  red: 'text-red-400',
  indigo: 'text-indigo-400',
};

export function KpiCard({ label, value, sub, color = 'default', icon }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
          {icon && <span className="text-gray-600">{icon}</span>}
        </div>
        <p className={cn('text-2xl font-semibold mt-1.5 font-mono', colorClasses[color])}>
          {value}
        </p>
        {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}
