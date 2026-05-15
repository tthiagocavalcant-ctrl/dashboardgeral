import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MetricBadge } from '@/components/MetricBadge';
import type { CampaignMetrics, MetricLimit } from '@/types';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { getMetricAlertStatus } from '@/lib/utils';

interface CampaignTableProps {
  campaigns: CampaignMetrics[];
  limits: MetricLimit[];
  resultLabel: string;
  loading?: boolean;
  error?: string | null;
}

function hasCriticalAlert(campaign: CampaignMetrics, limits: MetricLimit[]): boolean {
  return (
    getMetricAlertStatus('cpl', campaign.cost_per_result, limits) === 'alert' ||
    getMetricAlertStatus('ctr', campaign.ctr, limits) === 'alert' ||
    getMetricAlertStatus('cpc', campaign.cpc, limits) === 'alert' ||
    getMetricAlertStatus('cpm', campaign.cpm, limits) === 'alert'
  );
}

function hasWarning(campaign: CampaignMetrics, limits: MetricLimit[]): boolean {
  return (
    getMetricAlertStatus('cpl', campaign.cost_per_result, limits) === 'warning' ||
    getMetricAlertStatus('ctr', campaign.ctr, limits) === 'warning' ||
    getMetricAlertStatus('cpc', campaign.cpc, limits) === 'warning' ||
    getMetricAlertStatus('cpm', campaign.cpm, limits) === 'warning'
  );
}

export function CampaignTable({ campaigns, limits, resultLabel, loading, error }: CampaignTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="h-10 w-10 text-red-400 mb-3" />
        <p className="text-gray-300 font-medium">Erro ao carregar campanhas</p>
        <p className="text-sm text-gray-500 mt-1 max-w-md">{error}</p>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <TrendingUp className="h-10 w-10 text-gray-700 mb-3" />
        <p className="text-gray-400 font-medium">Nenhuma campanha ativa</p>
        <p className="text-sm text-gray-600 mt-1">Não foram encontradas campanhas ativas para este período.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#2a2a38] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-8"></TableHead>
            <TableHead>Campanha</TableHead>
            <TableHead className="text-right">{resultLabel}</TableHead>
            <TableHead className="text-right">Custo/{resultLabel}</TableHead>
            <TableHead className="text-right">Gasto</TableHead>
            <TableHead className="text-right">CTR</TableHead>
            <TableHead className="text-right">CPC</TableHead>
            <TableHead className="text-right">CPM</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((c) => {
            const critical = hasCriticalAlert(c, limits);
            const warning = !critical && hasWarning(c, limits);

            return (
              <TableRow key={c.campaign_id}>
                <TableCell className="w-8 pr-0">
                  {critical && (
                    <span className="flex h-2 w-2 rounded-full bg-red-500 mx-auto" />
                  )}
                  {warning && (
                    <span className="flex h-2 w-2 rounded-full bg-amber-500 mx-auto" />
                  )}
                </TableCell>

                <TableCell>
                  <div className="max-w-[280px]">
                    <p className="text-sm text-white font-medium truncate">{c.campaign_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant={c.status === 'ACTIVE' ? 'success' : 'outline'} className="text-[10px]">
                        {c.status === 'ACTIVE' ? 'Ativa' : c.status}
                      </Badge>
                      <span className="text-xs text-gray-600 truncate">{c.objective}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <span className="text-sm font-mono text-gray-300">
                    {formatNumber(c.results)}
                  </span>
                </TableCell>

                <TableCell className="text-right">
                  <MetricBadge
                    metric="cpl"
                    value={c.cost_per_result}
                    formatted={c.cost_per_result > 0 ? formatCurrency(c.cost_per_result) : '—'}
                    limits={limits}
                  />
                </TableCell>

                <TableCell className="text-right">
                  <MetricBadge
                    metric="spend"
                    value={c.spend}
                    formatted={formatCurrency(c.spend)}
                    limits={limits}
                  />
                </TableCell>

                <TableCell className="text-right">
                  <MetricBadge
                    metric="ctr"
                    value={c.ctr}
                    formatted={formatPercent(c.ctr)}
                    limits={limits}
                  />
                </TableCell>

                <TableCell className="text-right">
                  <MetricBadge
                    metric="cpc"
                    value={c.cpc}
                    formatted={formatCurrency(c.cpc)}
                    limits={limits}
                  />
                </TableCell>

                <TableCell className="text-right">
                  <MetricBadge
                    metric="cpm"
                    value={c.cpm}
                    formatted={formatCurrency(c.cpm)}
                    limits={limits}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
