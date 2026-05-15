import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Pencil, DollarSign, MousePointerClick, Target, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Layout } from '@/components/Layout';
import { DateRangePicker } from '@/components/DateRangePicker';
import { CampaignTable } from '@/components/CampaignTable';
import { KpiCard } from '@/components/KpiCard';
import { AddClientModal } from '@/components/AddClientModal';
import { useClient } from '@/hooks/useClients';
import { useCampaigns } from '@/hooks/useCampaigns';
import type { DateRange } from '@/types';
import { RESULT_TYPE_LABELS } from '@/types';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>({ preset: 'last_7d' });
  const [editOpen, setEditOpen] = useState(false);

  const { data: client, isLoading: clientLoading } = useClient(id ?? '');
  const {
    data: campaigns,
    isLoading: campaignsLoading,
    error: campaignsError,
    refetch,
    isFetching,
  } = useCampaigns(client, dateRange);

  if (clientLoading) {
    return (
      <Layout>
        <div className="p-8 space-y-4">
          <Skeleton className="h-14 w-80" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (!client) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-300 font-medium">Cliente não encontrado.</p>
            <Button className="mt-4" onClick={() => navigate('/')}>Voltar ao painel</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const limits = client.metric_limits ?? [];
  const resultLabel = RESULT_TYPE_LABELS[client.result_type];

  // Aggregate totals
  const totals = (campaigns ?? []).reduce(
    (acc, c) => ({
      spend: acc.spend + c.spend,
      results: acc.results + c.results,
      impressions: acc.impressions + c.impressions,
      clicks: acc.clicks + c.clicks,
    }),
    { spend: 0, results: 0, impressions: 0, clicks: 0 },
  );

  const avgCtr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const avgCpl = totals.results > 0 ? totals.spend / totals.results : 0;
  const avgCpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
  const avgCpm = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0;

  const activeCampaigns = (campaigns ?? []).filter((c) => c.status === 'ACTIVE').length;

  return (
    <Layout>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="border-b border-[#1e1e2a] bg-[#0d0d15]/50 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center justify-between gap-4 px-8 h-14">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-semibold text-white truncate">{client.name}</h1>
                  <span className="text-gray-600 text-sm shrink-0">·</span>
                  <span className="text-sm text-gray-500 truncate">{client.company}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isFetching}
                title="Atualizar dados"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="gap-1.5"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>
          </div>
        </div>

        <div className="p-8 flex-1">
          {/* Client info bar */}
          <div className="flex items-center gap-3 mb-6 text-sm text-gray-500">
            {client.niche && (
              <>
                <span className="px-2 py-0.5 rounded bg-[#1e1e2a] text-gray-400 text-xs">{client.niche}</span>
                <span>·</span>
              </>
            )}
            <span>Resultado: <span className="text-gray-300">{resultLabel}</span></span>
            <span>·</span>
            <span>Conta: <span className="text-gray-300 font-mono">act_{client.ad_account_id}</span></span>
            {campaigns && (
              <>
                <span>·</span>
                <span>
                  <span className="text-emerald-400">{activeCampaigns}</span> campanha{activeCampaigns !== 1 ? 's' : ''} ativa{activeCampaigns !== 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>

          {/* KPI cards */}
          {campaignsLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
              <KpiCard
                label="Gasto total"
                value={formatCurrency(totals.spend)}
                sub={`${activeCampaigns} camp. ativas`}
                color="indigo"
                icon={<DollarSign className="h-4 w-4" />}
              />
              <KpiCard
                label={resultLabel}
                value={formatNumber(totals.results)}
                sub="total de resultados"
                color="green"
                icon={<Target className="h-4 w-4" />}
              />
              <KpiCard
                label={`Custo / ${resultLabel}`}
                value={avgCpl > 0 ? formatCurrency(avgCpl) : '—'}
                color="default"
                icon={<DollarSign className="h-4 w-4" />}
              />
              <KpiCard
                label="CTR médio"
                value={formatPercent(avgCtr)}
                color="default"
                icon={<MousePointerClick className="h-4 w-4" />}
              />
              <KpiCard
                label="CPC médio"
                value={avgCpc > 0 ? formatCurrency(avgCpc) : '—'}
                color="default"
                icon={<MousePointerClick className="h-4 w-4" />}
              />
              <KpiCard
                label="CPM médio"
                value={avgCpm > 0 ? formatCurrency(avgCpm) : '—'}
                sub={`${formatNumber(totals.impressions)} impressões`}
                color="default"
                icon={<BarChart2 className="h-4 w-4" />}
              />
            </div>
          )}

          {/* Alert legend */}
          {limits.length > 0 && (
            <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Métrica fora do limite
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Próximo do limite (10%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500/50" />
                Dentro do limite
              </span>
            </div>
          )}

          {/* Campaigns table */}
          <CampaignTable
            campaigns={campaigns ?? []}
            limits={limits}
            resultLabel={resultLabel}
            loading={campaignsLoading}
            error={campaignsError instanceof Error ? campaignsError.message : null}
          />
        </div>
      </div>

      <AddClientModal
        open={editOpen}
        onOpenChange={setEditOpen}
        editClient={client}
      />
    </Layout>
  );
}
