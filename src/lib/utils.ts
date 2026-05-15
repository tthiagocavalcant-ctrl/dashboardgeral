import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AlertStatus, MetricKey, MetricLimit } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function formatDate(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');
}

export function getMetricAlertStatus(
  metric: MetricKey,
  value: number,
  limits: MetricLimit[],
): AlertStatus {
  const limit = limits.find((l) => l.metric === metric);
  if (!limit) return 'no-limit';

  const WARNING_MARGIN = 0.1; // 10% from limit

  if (metric === 'ctr') {
    // Lower CTR = worse; we check min_value
    if (!limit.min_value) return 'no-limit';
    if (value < limit.min_value) return 'alert';
    if (value < limit.min_value * (1 + WARNING_MARGIN)) return 'warning';
    return 'ok';
  } else {
    // Higher cost = worse; we check max_value
    if (!limit.max_value) return 'no-limit';
    if (value > limit.max_value) return 'alert';
    if (value > limit.max_value * (1 - WARNING_MARGIN)) return 'warning';
    return 'ok';
  }
}

export function getAlertColor(status: AlertStatus): string {
  switch (status) {
    case 'ok': return 'text-emerald-400';
    case 'warning': return 'text-amber-400';
    case 'alert': return 'text-red-400';
    case 'no-limit': return 'text-gray-400';
  }
}

export function getAlertBg(status: AlertStatus): string {
  switch (status) {
    case 'ok': return 'bg-emerald-500/10 border-emerald-500/20';
    case 'warning': return 'bg-amber-500/10 border-amber-500/20';
    case 'alert': return 'bg-red-500/10 border-red-500/20';
    case 'no-limit': return 'bg-gray-500/10 border-gray-500/20';
  }
}

export function getDateRange(preset: string, since?: string, until?: string) {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  switch (preset) {
    case 'today':
      return { since: fmt(today), until: fmt(today) };
    case 'last_7d': {
      const d = new Date(today);
      d.setDate(d.getDate() - 6);
      return { since: fmt(d), until: fmt(today) };
    }
    case 'last_14d': {
      const d = new Date(today);
      d.setDate(d.getDate() - 13);
      return { since: fmt(d), until: fmt(today) };
    }
    case 'last_30d': {
      const d = new Date(today);
      d.setDate(d.getDate() - 29);
      return { since: fmt(d), until: fmt(today) };
    }
    case 'custom':
      return { since: since ?? fmt(today), until: until ?? fmt(today) };
    default:
      return { since: fmt(today), until: fmt(today) };
  }
}
