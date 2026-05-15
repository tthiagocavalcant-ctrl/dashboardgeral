import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getAlertBg, getAlertColor, getMetricAlertStatus } from '@/lib/utils';
import type { MetricKey, MetricLimit } from '@/types';
import { METRIC_IS_LOWER_BETTER } from '@/types';
import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricBadgeProps {
  metric: MetricKey;
  value: number;
  formatted: string;
  limits: MetricLimit[];
}

export function MetricBadge({ metric, value, formatted, limits }: MetricBadgeProps) {
  const status = getMetricAlertStatus(metric, value, limits);
  const isLowerBetter = METRIC_IS_LOWER_BETTER[metric];
  const limit = limits.find((l) => l.metric === metric);

  const limitText = limit
    ? isLowerBetter
      ? limit.max_value != null ? `Máx: R$ ${limit.max_value}` : null
      : limit.min_value != null ? `Mín: ${limit.min_value}%` : null
    : null;

  const Icon =
    status === 'alert'
      ? AlertTriangle
      : status === 'warning'
        ? (isLowerBetter ? TrendingUp : TrendingDown)
        : status === 'ok'
          ? CheckCircle
          : null;

  const cell = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium font-mono',
        getAlertBg(status),
        getAlertColor(status),
      )}
    >
      {Icon && <Icon className="h-3 w-3 shrink-0" />}
      {formatted}
    </span>
  );

  if (status === 'no-limit' || !limitText) return cell;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{cell}</TooltipTrigger>
      <TooltipContent>
        <p>{limitText}</p>
        {status === 'alert' && <p className="text-red-400 font-medium">Fora do limite!</p>}
        {status === 'warning' && <p className="text-amber-400 font-medium">Próximo do limite</p>}
      </TooltipContent>
    </Tooltip>
  );
}
